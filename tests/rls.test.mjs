import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { test } from 'node:test';
import { PGlite } from '@electric-sql/pglite';
import { recipeCaloriesPerServing, resolveRecipeDraft } from '../src/lib/recipe-composition.ts';

const alice = '00000000-0000-4000-a000-000000000001';
const bob = '00000000-0000-4000-a000-000000000002';
const guest = '00000000-0000-4000-a000-000000000003';

// Minimal Auth tables and role switching in an isolated, in-memory Postgres.
// No fixture is sent to a Supabase project or an identity provider.
const authFixture = `
  create role anon;
  create role authenticated;
  create role service_role;
  create role supabase_auth_admin;
  create schema auth;
  create table auth.users (id uuid primary key, email text, email_confirmed_at timestamptz);
  create table auth.identities (user_id uuid references auth.users, provider text, identity_data jsonb);
  create function auth.uid() returns uuid language sql stable
    as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid; $$;
  grant usage on schema auth to authenticated;
`;

test('el cambio abre el registro y conserva las cuentas y datos existentes', async (t) => {
  const db = await PGlite.create();
  t.after(() => db.close());
  const oldMigrations = ['20261124150000_accounts_and_invitations.sql', '20261124160000_weight_and_training.sql'];
  const apply = async (migration) => {
    await db.exec(await readFile(new URL(`../supabase/migrations/${migration}`, import.meta.url), 'utf8'));
  };
  const as = async (id) => {
    await db.exec('set role authenticated');
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
  };
  const initialize = (locale) => db.query('select public.masomeno_initialize_account($1)', [locale]);

  await db.exec(authFixture);
  for (const migration of oldMigrations) await apply(migration);
  // Reproduce the previous schema with an existing account and records before upgrading.
  await db.exec(`
    insert into masomeno_private.allowed_users (email) values ('alice@example.invalid');
    insert into auth.users values ('${alice}', 'alice@example.invalid', now());
    insert into auth.identities values ('${alice}', 'google', '{"email":"alice@example.invalid","email_verified":true}');
  `);
  await as(alice);
  await initialize('it');
  await db.query("update public.profiles set display_name = 'Perfil existente', weight_goal_kg = 72");
  await db.query("update public.user_preferences set weight_unit = 'lb', distance_unit = 'mi'");
  const weighIn = (await db.query(
    "insert into public.weight_measurements (weight_kg, measured_at) values (78.4, '2020-01-01T09:00:00Z') returning id",
  )).rows[0].id;
  const exercise = (await db.query("insert into public.exercises (name) values ('Press') returning id")).rows[0].id;
  const strength = (await db.query(
    "insert into public.strength_entries (exercise_id, load_kg, performed_on) values ($1, 80, '2020-01-01') returning id", [exercise],
  )).rows[0].id;
  const treadmill = (await db.query(
    "insert into public.treadmill_sessions (distance_km, duration_seconds, performed_on) values (5, 1500, '2020-01-01') returning id",
  )).rows[0].id;

  await db.exec('reset role');
  await apply('20261124170000_open_registration.sql');
  const { rows: [cleanup] } = await db.query(`
    select to_regclass('masomeno_private.allowed_users') as legacy_table,
      to_regprocedure('public.masomeno_before_user_created(jsonb)') as legacy_hook,
      to_regprocedure('public.masomeno_can_access()') as legacy_check,
      (select count(*)::int from auth.users) as accounts
  `);
  assert.deepEqual(cleanup, { legacy_table: null, legacy_hook: null, legacy_check: null, accounts: 1 });

  await as(alice);
  await initialize('es');
  assert.deepEqual((await db.query('select id, display_name, weight_goal_kg::int as goal from public.profiles')).rows,
    [{ id: alice, display_name: 'Perfil existente', goal: 72 }]);
  assert.deepEqual((await db.query('select locale, weight_unit, distance_unit from public.user_preferences')).rows,
    [{ locale: 'it', weight_unit: 'lb', distance_unit: 'mi' }]);
  const records = [['weight_measurements', weighIn], ['exercises', exercise], ['strength_entries', strength], ['treadmill_sessions', treadmill]];
  for (const [table, id] of records) assert.deepEqual((await db.query(`select id from public.${table}`)).rows, [{ id }]);
  await assert.rejects(db.query("update public.user_preferences set locale = 'unknown'"), { code: '23514' });
  await assert.rejects(db.query("update public.profiles set time_zone = 'Unknown/Zone'"), { code: '23514' });

  await db.exec(`
    reset role;
    insert into auth.users values ('${bob}', 'bob@example.invalid', now()), ('${guest}', 'new@example.invalid', now());
    insert into auth.identities values
      ('${bob}', 'email', '{"email":"bob@example.invalid","email_verified":true}'),
      ('${guest}', 'google', '{"email":"new@example.invalid","email_verified":true}');
  `);
  for (const id of [bob, guest]) {
    await as(id);
    await assert.rejects(initialize('xx'), { code: '22023' });
    await initialize('en');
    await initialize('es');
    assert.deepEqual((await db.query('select id, display_name from public.profiles')).rows, [{ id, display_name: null }]);
    assert.deepEqual((await db.query('select user_id, locale from public.user_preferences')).rows, [{ user_id: id, locale: 'en' }]);
    assert.equal((await db.query("update public.profiles set display_name = 'Ajeno' where id = $1", [alice])).affectedRows, 0);
    assert.equal((await db.query("update public.user_preferences set locale = 'es' where user_id = $1", [alice])).affectedRows, 0);
    await assert.rejects(db.query('insert into public.profiles (id) values ($1)', [alice]), { code: '42501' });
    await assert.rejects(db.query('update public.profiles set id = $1', [alice]), { code: '42501' });
  }
  await as(alice);
  assert.deepEqual((await db.query('select id from public.profiles')).rows, [{ id: alice }]);
  await as('');
  await assert.rejects(initialize('es'), { code: '42501' });
  await db.exec('set role anon');
  await assert.rejects(db.query('select * from public.profiles'), { code: '42501' });
  await assert.rejects(initialize('es'), { code: '42501' });
});

test('peso, fuerza y cinta aíslan propietarios y aplican límites durante las operaciones', async (t) => {
  const db = await PGlite.create();
  t.after(() => db.close());
  const files = ['20261124150000_accounts_and_invitations.sql', '20261124160000_weight_and_training.sql', '20261124170000_open_registration.sql'];
  await db.exec(authFixture);
  for (const name of files) {
    const sql = await readFile(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8');
    await db.exec(sql);
  }

  await db.exec(`
    insert into auth.users values ('${alice}', 'alice@example.invalid', now()), ('${bob}', 'bob@example.invalid', now());
    insert into auth.identities values
      ('${alice}', 'google', '{"email":"alice@example.invalid","email_verified":true}'),
      ('${bob}', 'email', '{"email":"bob@example.invalid","email_verified":true}');
  `);
  const as = async (id) => {
    await db.exec('set role authenticated');
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
  };
  const insertExercise = async (name, slot = null) => (await db.query(
    'insert into public.exercises (name,favorite_slot) values ($1,$2) returning id,user_id', [name, slot],
  )).rows[0];
  const insertLift = (exercise, kg) => db.query(
    "insert into public.strength_entries (exercise_id,load_kg,performed_on) values ($1,$2,'2020-01-01') returning id,user_id",
    [exercise, kg],
  );
  const collections = [
    ['weight_measurements', 'weight_kg'],
    ['exercises', 'name'],
    ['strength_entries', 'load_kg'],
    ['treadmill_sessions', 'duration_seconds'],
  ];

  await db.exec('set role anon');
  for (const [table] of collections) await assert.rejects(db.query(`select id from public.${table}`), { code: '42501' });

  await as(alice);
  await db.query('select public.masomeno_initialize_account()');
  assert.equal((await db.query('update public.profiles set weight_goal_kg = 72.5')).affectedRows, 1);
  const weighIn = (await db.query(
    "insert into public.weight_measurements (weight_kg,measured_at) values (78.425,'2020-01-01T09:00:00Z') returning id,user_id",
  )).rows[0];
  const run = (await db.query(
    "insert into public.treadmill_sessions (distance_km,duration_seconds,performed_on) values (4.5,1500,'2020-01-01') returning id,user_id",
  )).rows[0];
  const favorite = await insertExercise('Press', 1);
  const lift = (await insertLift(favorite.id, 0)).rows[0];
  assert.ok([weighIn, run, favorite, lift].every(({ user_id }) => user_id === alice));
  assert.equal((await db.query("update public.weight_measurements set condition = 'En ayunas' where id = $1", [weighIn.id])).affectedRows, 1);
  assert.equal((await db.query('update public.strength_entries set load_kg = 30 where id = $1', [lift.id])).affectedRows, 1);
  assert.equal((await db.query('update public.treadmill_sessions set duration_seconds = 1600 where id = $1', [run.id])).affectedRows, 1);
  await assert.rejects(db.query('update public.weight_measurements set weight_kg = 0'), { code: '23514' });
  await assert.rejects(db.query('update public.strength_entries set load_kg = -1'), { code: '23514' });
  await assert.rejects(db.query('update public.treadmill_sessions set duration_seconds = 0'), { code: '23514' });
  for (const slot of [2, 3, 4]) await insertExercise(`Exercise ${slot}`, slot);
  await assert.rejects(insertExercise('Extra', 5), { code: '23514' });
  await assert.rejects(insertExercise('Extra', 2), { code: '23505' });
  await assert.rejects(insertExercise('PRESS'), { code: '23505' });

  await as(bob);
  const ownExercise = await insertExercise('Press', 1);
  assert.equal(ownExercise.user_id, bob);
  await assert.rejects(insertLift(favorite.id, 12), { code: '23503' });
  await assert.rejects(db.query(
    "insert into public.weight_measurements (user_id, weight_kg, measured_at) values ($1,70,'2020-01-01')", [alice],
  ), { code: '42501' });
  const targets = [weighIn, favorite, lift, run];
  for (const [index, [table, field]] of collections.entries()) {
    const id = targets[index].id;
    assert.deepEqual((await db.query(`select id from public.${table} where id = $1`, [id])).rows, []);
    assert.equal((await db.query(`update public.${table} set ${field} = ${field} where id = $1`, [id])).affectedRows, 0);
    assert.equal((await db.query(`delete from public.${table} where id = $1`, [id])).affectedRows, 0);
    await assert.rejects(db.query(`update public.${table} set user_id = $1`, [alice]), { code: '42501' });
  }

  await as(alice);
  assert.deepEqual((await db.query('select id from public.exercises where id = $1', [ownExercise.id])).rows, []);
  assert.equal((await db.query('delete from public.exercises where id = $1', [favorite.id])).affectedRows, 1);
  assert.deepEqual((await db.query('select id from public.strength_entries where id = $1', [lift.id])).rows, []);
  assert.equal((await db.query('delete from public.treadmill_sessions where id = $1', [run.id])).affectedRows, 1);
  assert.equal((await db.query('delete from public.weight_measurements where id = $1', [weighIn.id])).affectedRows, 1);

  await as('');
  for (const [table] of collections) assert.deepEqual((await db.query(`select id from public.${table}`)).rows, []);
  await assert.rejects(insertExercise('Without a session'), { code: '42501' });
});


test('alimentación conserva el historial, aísla cuentas y guarda las comidas de forma atómica', async (t) => {
  const db = await PGlite.create();
  t.after(() => db.close());
  const apply = async (name) => db.exec(await readFile(new URL('../supabase/migrations/' + name + '.sql', import.meta.url), 'utf8'));
  await db.exec(authFixture);
  for (const name of ['20261124150000_accounts_and_invitations', '20261124160000_weight_and_training',
    '20261124170000_open_registration', '20261124180000_food_diary', '20261124181000_seed_food_catalog']) await apply(name);
  await apply('20261124181000_seed_food_catalog');
  const rows = async (sql, values) => (await db.query(sql, values)).rows;
  const one = async (sql, values) => (await rows(sql, values))[0];
  assert.deepEqual(await one('select (select count(*)::int from public.food_categories) as categories, (select count(*)::int from public.foods) as foods, (select count(*)::int from public.food_references) as refs'), {
    categories: 6, foods: 31, refs: 31,
  });

  await db.query('insert into auth.users (id) values ($1), ($2)', [alice, bob]);
  const as = async (id) => {
    await db.exec('set role authenticated');
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
  };
  for (const id of [alice, bob]) {
    await as(id);
    await db.query('select public.masomeno_initialize_account()');
    await db.exec("update public.profiles set time_zone = 'UTC'; reset role");
  }

  await db.query("insert into public.calorie_goals values ($1, current_date - 1, 1800)", [alice]);
  await db.exec("insert into public.food_references (id, food_id, preparation) values ('tomato-pending', 'tomato', 'prepared')");
  await db.exec('set role anon');
  await assert.rejects(db.query('select * from public.foods'), { code: '42501' });
  await assert.rejects(db.query('select public.masomeno_set_calorie_goal(2100)'), { code: '42501' });

  await as(alice);
  assert.equal((await rows("select * from public.food_references where validation = 'verified' and kcal_per_100g is not null")).length, 31);
  await assert.rejects(db.query("update public.foods set synonyms = '{}'"), { code: '42501' });
  await assert.rejects(db.query("update public.calorie_goals set kcal = 1900"), { code: '42501' });
  await assert.rejects(db.query('select public.masomeno_set_calorie_goal(0)'), { code: '23514' });
  await db.query('select public.masomeno_set_calorie_goal(2100)');
  await db.query('select public.masomeno_set_calorie_goal(2200)');
  assert.deepEqual(await rows('select kcal from public.calorie_goals order by effective_on'), [{ kcal: 1800 }, { kcal: 2200 }]);

  const save = (id, name, kcal, lines, instant = '2020-01-02T03:00:00Z') =>
    one('select public.masomeno_save_meal($1,$2,$3,$4,$5,$6) as id', [id, 'lunch', instant, name, kcal, JSON.stringify(lines)]);
  const tomato = { referenceId: 'tomato-raw', amount: 125, unit: 'g' };
  const egg = { referenceId: 'egg-cooked', amount: 2, unit: 'egg' };
  const meal = await save(null, null, null, [tomato, egg]);
  assert.deepEqual(await rows('select amount::float, kcal::float from public.meal_components order by position'),
    [{ amount: 125, kcal: 22.5 }, { amount: 2, kcal: 155 }]);
  const before = await save(null, 'Antes de medianoche', 100, [], '2020-01-02T02:59:59Z');
  const manual = await save(null, 'Almuerzo del trabajo', 350.5, [], '2020-01-03T02:59:59Z');
  const after = await save(null, 'Día siguiente', 150, [], '2020-01-03T03:00:00Z');

  const totals = () => one(
    'select count(*)::int as meals, sum(coalesce(m.manual_kcal, (select sum(kcal) from public.meal_components where meal_id = m.id)))::float as kcal ' +
    'from public.meals m where consumed_at >= $1 and consumed_at < $2',
    ['2020-01-02T03:00:00Z', '2020-01-03T03:00:00Z'],
  );
  assert.deepEqual(await totals(), { meals: 2, kcal: 528 });
  await assert.rejects(save(meal.id, 'Cambio incompleto', null, [tomato, { ...egg, amount: 201 }]), { code: '23514' });
  await assert.rejects(save(null, null, null, [{ ...tomato, referenceId: 'tomato-pending' }]), { code: '22023' });
  await assert.rejects(save(null, null, null, [{ ...tomato, unit: 'egg' }]), { code: '22023' });
  await assert.rejects(save(null, 'Manual sin calorías', null, []), { code: '22023' });
  await assert.rejects(save(null, null, 200, []), { code: '23514' });
  assert.deepEqual(await one('select name from public.meals where id = $1', [meal.id]), { name: null });
  assert.deepEqual(await totals(), { meals: 2, kcal: 528 });

  const snapshot = (await one("select id from public.meal_components where food_reference_id = 'tomato-raw'")).id;
  await db.exec("reset role; update public.food_references set kcal_per_100g = 20 where id = 'tomato-raw'");
  await apply('20261124181000_seed_food_catalog');
  await as(alice);
  assert.equal((await one("select kcal_per_100g::float as kcal from public.food_references where id = 'tomato-raw'")).kcal, 20);
  await save(meal.id, null, null, [{ ...tomato, id: snapshot, amount: 100 }]);
  assert.deepEqual(await totals(), { meals: 2, kcal: 368.5 });
  await save(manual.id, 'Almuerzo corregido', 280, []);
  assert.deepEqual(await totals(), { meals: 2, kcal: 298 });

  await as(bob);
  assert.deepEqual(await rows('select id from public.meals'), []);
  assert.deepEqual(await rows('select id from public.meal_components'), []);
  assert.deepEqual(await rows('select kcal from public.calorie_goals'), []);
  assert.deepEqual(await save(meal.id, 'Ajena', 100, []), { id: null });
  assert.equal((await db.query('delete from public.meals where id = $1', [meal.id])).affectedRows, 0);
  await assert.rejects(db.query('insert into public.meals (user_id, category, consumed_at) values ($1, $2, now())', [alice, 'lunch']), { code: '42501' });
  await db.query('select public.masomeno_set_calorie_goal(2500)');

  await as(alice);
  assert.deepEqual(await rows('select kcal from public.calorie_goals order by effective_on'), [{ kcal: 1800 }, { kcal: 2200 }]);
  await db.query('select public.masomeno_set_calorie_goal(null)');
  assert.deepEqual(await rows('select kcal from public.calorie_goals order by effective_on'), [{ kcal: 1800 }, { kcal: null }]);
  assert.equal((await db.query('delete from public.meals where id = $1', [meal.id])).affectedRows, 1);
  assert.deepEqual(await rows('select id from public.meal_components'), []);
  assert.deepEqual(await totals(), { meals: 1, kcal: 280 });
  assert.equal((await rows('select id from public.meals where id in ($1, $2)', [before.id, after.id])).length, 2);
});

test('heladera aísla la disponibilidad, y el recetario vacío admite solo lecturas publicadas', async (t) => {
  const db = await PGlite.create();
  t.after(() => db.close());
  await db.exec(authFixture);
  for (const name of ['20261124150000_accounts_and_invitations', '20261124160000_weight_and_training',
    '20261124170000_open_registration', '20261124180000_food_diary', '20261124181000_seed_food_catalog',
    '20261124182000_fridge_and_recipe_catalog']) {
    await db.exec(await readFile(new URL('../supabase/migrations/' + name + '.sql', import.meta.url), 'utf8'));
  }

  await db.query('insert into auth.users (id) values ($1), ($2)', [alice, bob]);
  const as = async (id) => {
    await db.exec('set role authenticated');
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
  };
  const fridge = async () => (await db.query(
    'select food_id, status from public.fridge_ingredients order by food_id',
  )).rows;
  const mark = (food, status) => db.query('select public.masomeno_set_fridge_ingredient($1, $2)', [food, status]);
  const copyMeal = () => db.query('select public.masomeno_save_meal($1, $2, $3, $4, $5, $6) as id', [
    null, 'lunch', '2020-01-02T10:00:00Z', null, null, JSON.stringify([{ referenceId: 'egg-cooked', amount: 1, unit: 'egg' }]),
  ]);

  await db.exec('set role anon');
  for (const table of ['fridge_ingredients', 'recipes', 'recipe_ingredients']) {
    await assert.rejects(db.query('select * from public.' + table), { code: '42501' });
  }
  await assert.rejects(mark('egg', 'available'), { code: '42501' });
  await as('');
  await assert.rejects(mark('egg', 'available'), { code: '42501' });

  await as(alice);
  assert.deepEqual(await fridge(), []);
  await mark('egg', 'available');
  await mark('egg', 'available');
  await mark('tomato', 'unavailable');
  assert.deepEqual(await fridge(), [
    { food_id: 'egg', status: 'available' }, { food_id: 'tomato', status: 'unavailable' },
  ]);
  await assert.rejects(mark('unknown', 'available'), { code: '23503' });
  await assert.rejects(mark('egg', 'unknown'), { code: '23514' });

  const original = (await copyMeal()).rows[0].id;
  const repeated = (await copyMeal()).rows[0].id;
  assert.notEqual(original, repeated);
  assert.equal((await db.query('select kcal::float from public.meal_components')).rows.length, 2);
  await db.query('delete from public.meals where id = $1', [repeated]);
  assert.deepEqual((await db.query('select id from public.meals')).rows, [{ id: original }]);
  assert.equal((await fridge()).length, 2);

  await as(bob);
  assert.deepEqual(await fridge(), []);
  await mark('egg', 'unavailable');
  assert.deepEqual(await fridge(), [{ food_id: 'egg', status: 'unavailable' }]);
  assert.equal((await db.query('delete from public.fridge_ingredients where user_id = $1', [alice])).affectedRows, 0);
  await assert.rejects(db.query('update public.fridge_ingredients set user_id = $1', [alice]), { code: '42501' });

  await as(alice);
  await mark('egg', null);
  assert.deepEqual(await fridge(), [{ food_id: 'tomato', status: 'unavailable' }]);
  const recipes = async () => (await db.query('select id from public.recipes order by id')).rows;
  assert.deepEqual(await recipes(), []);
  await db.exec('reset role');
  const { rows: [draft, published] } = await db.query(
    "insert into public.recipes (names, intensity, published) values ($1, 'medium', false), ($1, 'hearty', true) returning id",
    [JSON.stringify({ es: 'Prueba', en: 'Fixture', it: 'Prova' })],
  );
  await db.query("insert into public.recipe_ingredients (recipe_id, food_id, position) values ($1, 'egg', 1), ($2, 'tomato', 1)",
    [draft.id, published.id]);
  await assert.rejects(db.query(
    "insert into public.recipes (names, intensity) values ($1, 'unknown')", [JSON.stringify({ es: 'X', en: 'X', it: 'X' })],
  ), { code: '23514' });
  for (const id of [alice, bob]) {
    await as(id);
    assert.deepEqual(await recipes(), [published]);
    assert.deepEqual((await db.query('select recipe_id,food_id from public.recipe_ingredients')).rows,
      [{ recipe_id: published.id, food_id: 'tomato' }]);
    await assert.rejects(db.query('update public.recipes set published = true'), { code: '42501' });
    await assert.rejects(db.query('delete from public.recipe_ingredients'), { code: '42501' });
  }
});

test('los ingredientes personales y las repeticiones respetan cuentas y registros anteriores', async (t) => {
  const db = await PGlite.create();
  t.after(() => db.close());
  await db.exec(authFixture);
  const apply = async (name) => db.exec(await readFile(new URL('../supabase/migrations/' + name + '.sql', import.meta.url), 'utf8'));
  for (const name of ['20261124150000_accounts_and_invitations', '20261124160000_weight_and_training',
    '20261124170000_open_registration']) await apply(name);
  await db.query('insert into auth.users (id) values ($1), ($2)', [alice, bob]);

  const as = async (id) => {
    await db.exec('set role authenticated');
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
  };
  await as(alice);
  const exercise = (await db.query("insert into public.exercises(name) values ('Press') returning id")).rows[0].id;
  const old = (await db.query("insert into public.strength_entries(exercise_id,load_kg,performed_on) values ($1,40,'2020-01-02') returning id", [exercise])).rows[0].id;
  await db.exec('reset role');
  await apply('20261124183000_personal_fridge_ingredients');
  await apply('20261124184000_strength_repetitions');

  await db.exec('set role anon');
  await assert.rejects(db.query('select * from public.personal_fridge_ingredients'), { code: '42501' });
  await as(alice);
  assert.deepEqual((await db.query('select repetitions from public.strength_entries where id=$1', [old])).rows, [{ repetitions: null }]);
  await db.query('update public.strength_entries set repetitions=8 where id=$1', [old]);
  assert.deepEqual((await db.query('select repetitions from public.strength_entries where id=$1', [old])).rows, [{ repetitions: 8 }]);
  await assert.rejects(db.query('update public.strength_entries set repetitions=0 where id=$1', [old]), { code: '23514' });

  const add = (name) => db.query('insert into public.personal_fridge_ingredients (name) values ($1) returning id,name,status', [name]);
  const personal = (await add('Almendras  tostadas')).rows[0];
  assert.equal(personal.status, 'available');
  await assert.rejects(add(' alméndras tostadas '), { code: '23505' });
  await db.query("update public.personal_fridge_ingredients set name='Almendras', status=null where id=$1", [personal.id]);

  await as(bob);
  assert.deepEqual((await db.query('select name from public.personal_fridge_ingredients')).rows, []);
  assert.equal((await db.query('delete from public.personal_fridge_ingredients where id=$1', [personal.id])).affectedRows, 0);
  assert.equal((await db.query('update public.strength_entries set repetitions=4 where id=$1', [old])).affectedRows, 0);
  await assert.rejects(db.query('insert into public.personal_fridge_ingredients (name,user_id) values ($1,$2)', ['Pera', alice]), { code: '42501' });
  await add('Almendras');

  await as(alice);
  assert.deepEqual((await db.query('select name,status from public.personal_fridge_ingredients')).rows, [{ name: 'Almendras', status: null }]);
  assert.equal((await db.query('delete from public.personal_fridge_ingredients where id=$1', [personal.id])).affectedRows, 1);
  assert.deepEqual((await db.query('select name from public.personal_fridge_ingredients')).rows, []);
});

test('la ampliación del catálogo y las preparaciones conservan el historial y el aislamiento', async (t) => {
  const db = await PGlite.create();
  t.after(() => db.close());
  await db.exec(authFixture);
  const directory = new URL('../supabase/migrations/', import.meta.url);
  const apply = async (name) => db.exec(await readFile(new URL(name + '.sql', directory), 'utf8'));
  const rows = async (sql, args) => (await db.query(sql, args)).rows;
  const as = async (id) => {
    await db.exec('set role authenticated');
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
  };
  for (const name of [
    '20261124150000_accounts_and_invitations', '20261124160000_weight_and_training',
    '20261124170000_open_registration', '20261124180000_food_diary', '20261124181000_seed_food_catalog',
    '20261124182000_fridge_and_recipe_catalog', '20261124183000_personal_fridge_ingredients',
    '20261124184000_strength_repetitions',
  ]) await apply(name);

  await db.query('insert into auth.users (id) values ($1), ($2)', [alice, bob]);
  const flatMeal = (referenceId, amount, unit) => rows(
    "select public.masomeno_save_meal(null, 'lunch', '2020-01-02T10:00Z', null, null, $1) as id",
    [JSON.stringify([{ referenceId, amount, unit }])],
  );
  await as(alice);
  const [legacy] = await flatMeal('egg-cooked', 1, 'egg');
  await db.exec('reset role');
  await apply('20261124185000_nutrition_and_recipe_composition');
  const seed = '20261124190000_expand_food_catalog';
  await apply(seed);
  await apply(seed);

  assert.deepEqual(await rows('select count(*)::int as count from public.foods'), [{ count: 65 }]);
  assert.deepEqual(await rows('select count(*)::int as count from public.food_references'), [{ count: 84 }]);
  assert.deepEqual(await rows("select id, kcal_per_100g::int as kcal from public.food_references where id in ('white-rice-raw', 'white-rice-cooked') order by id"),
    [{ id: 'white-rice-cooked', kcal: 130 }, { id: 'white-rice-raw', kcal: 365 }]);
  assert.deepEqual(await rows('select id from public.recipes'), []);
  assert.deepEqual(await rows('select kcal::float from public.meal_components where meal_id = $1', [legacy.id]), [{ kcal: 77.5 }]);
  assert.deepEqual(await rows("select id, source_ref from public.food_references where id in ('cod-cooked','hake-vepez-raw') order by id"),
    [{ id: 'cod-cooked', source_ref: '171956' }, { id: 'hake-vepez-raw', source_ref: 'Vepez / filete interfoliado' }]);

  const [draft, published] = await rows(
    "insert into public.recipes (names, intensity, published) values ($1, 'medium', false), ($1, 'hearty', true) returning id",
    [JSON.stringify({ es: 'Prueba', en: 'Fixture', it: 'Prova' })],
  );
  const slot = (recipeId, food, ref) => db.query(
    'insert into public.recipe_ingredients (recipe_id, position, food_id, food_reference_id, grams) values ($1, 1, $2, $3, 200)',
    [recipeId, food, ref],
  );
  await assert.rejects(slot(draft.id, 'egg', 'white-rice-cooked'), { code: '23503' });
  for (const { id } of [draft, published]) {
    await slot(id, 'white-rice', 'white-rice-cooked');
    await db.query(
      "insert into public.recipe_ingredient_alternatives values ($1, 1, 1, 'brown-rice', 'brown-rice-cooked', 180)", [id],
    );
  }

  const groups = [
    { name: 'Arroz', servings: 1, ingredients: [{ referenceId: 'white-rice-cooked', grams: 200 }] },
    { name: 'Ensalada', servings: 0.5, ingredients: [
      { referenceId: 'carrot-raw', grams: 100 }, { referenceId: 'olive-oil-prepared', grams: 5 },
    ] },
  ];
  const save = (input) => rows(
    "select public.masomeno_save_preparations('lunch', '2020-01-02T10:00Z', 'Almuerzo', $1) as id", [JSON.stringify(input)],
  );
  await db.exec('set role anon');
  await assert.rejects(save(groups), { code: '42501' });
  await as(alice);
  assert.deepEqual(await rows('select recipe_id from public.recipe_ingredient_alternatives'), [{ recipe_id: published.id }]);
  await assert.rejects(db.query('delete from public.recipe_ingredient_alternatives'), { code: '42501' });
  await assert.rejects(db.query('update public.food_references set kcal_per_100g = 1'), { code: '42501' });
  await assert.rejects(save([...groups, { name: 'Desconocido', servings: 1, ingredients: [
    { referenceId: 'kabocha-raw', grams: 50 },
  ] }]), { code: '22023' });
  assert.deepEqual(await rows('select id from public.meals'), [legacy]);
  const [pizza] = await flatMeal('pizza-slice-cheese-thin', 2, 'slice');
  assert.deepEqual(await rows('select kcal::float from public.meal_components where meal_id = $1', [pizza.id]), [{ kcal: 457.52 }]);
  const [meal] = await save(groups);
  const mealSnapshot = () => rows('select preparations from public.meals where id = $1', [meal.id]);
  const before = await mealSnapshot();
  assert.deepEqual(before[0].preparations.map(({ name, servings, kcal }) => ({ name, servings, kcal })),
    [{ name: 'Arroz', servings: 1, kcal: 260 }, { name: 'Ensalada', servings: 0.5, kcal: 85.2 }]);
  assert.deepEqual(await rows('select sum(kcal)::float as kcal from public.meal_components where meal_id = $1', [meal.id]),
    [{ kcal: 345.2 }]);

  await db.exec("reset role; update public.food_references set kcal_per_100g = 135 where id = 'white-rice-cooked'");
  await db.exec("update public.recipes set names = '{\"es\":\"Editada\",\"en\":\"Edited\",\"it\":\"Modificata\"}'; delete from public.recipe_ingredients");
  await apply(seed);
  await as(bob);
  assert.deepEqual(await mealSnapshot(), []);
  assert.deepEqual(await rows('select id from public.meal_components where meal_id = $1', [meal.id]), []);
  assert.equal((await db.query('delete from public.meals where id = $1', [meal.id])).affectedRows, 0);
  await as(alice);
  assert.deepEqual(await mealSnapshot(), before);
  assert.deepEqual(await rows("select kcal_per_100g::int as kcal from public.food_references where id = 'white-rice-cooked'"), [{ kcal: 135 }]);

  const components = await rows(
    'select id, food_reference_id as "referenceId", amount::float, unit from public.meal_components where meal_id = $1 order by position',
    [meal.id],
  );
  const edit = (lines) => rows("select public.masomeno_save_meal($1, 'lunch', '2020-01-02T10:00Z', 'Renombrada', null, $2)",
    [meal.id, JSON.stringify(lines)]);
  await edit(components);
  assert.deepEqual(await mealSnapshot(), before);
  await edit(components.slice(0, 1));
  assert.deepEqual(await mealSnapshot(), [{ preparations: null }]);
  assert.deepEqual(await rows('select kcal::float from public.meal_components where meal_id = $1', [meal.id]), [{ kcal: 260 }]);
});

test('guarda porciones y estimaciones, mantiene la fecha y el objetivo históricos, y aísla las cuentas', async (t) => {
  const db = await PGlite.create();
  t.after(() => db.close());
  await db.exec(authFixture);
  const apply = async (name) => db.exec(await readFile(new URL('../supabase/migrations/' + name + '.sql', import.meta.url), 'utf8'));
  for (const migration of [
    '20261124150000_accounts_and_invitations', '20261124160000_weight_and_training',
    '20261124170000_open_registration', '20261124180000_food_diary', '20261124181000_seed_food_catalog',
    '20261124182000_fridge_and_recipe_catalog', '20261124183000_personal_fridge_ingredients',
    '20261124184000_strength_repetitions', '20261124185000_nutrition_and_recipe_composition',
    '20261124190000_expand_food_catalog',
  ]) await apply(migration);
  await db.query('insert into auth.users (id) values ($1), ($2)', [alice, bob]);
  const as = async (id) => {
    await db.exec('set role authenticated');
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
  };
  for (const id of [alice, bob]) {
    await as(id);
    await db.query('select public.masomeno_initialize_account()');
  }
  await db.query("update public.profiles set time_zone = 'Europe/Rome'");
  await db.exec('reset role');
  await apply('20261124191000_daily_food_and_time_zone');

  const rows = async (sql, args) => (await db.query(sql, args)).rows;
  await as(bob);
  assert.deepEqual(await rows('select time_zone, time_zone_selected from public.profiles'),
    [{ time_zone: 'Europe/Rome', time_zone_selected: true }]);
  await as(alice);
  assert.deepEqual(await rows('select time_zone, time_zone_selected from public.profiles'),
    [{ time_zone: 'UTC', time_zone_selected: false }]);
  await db.query("update public.profiles set time_zone = 'America/Argentina/Buenos_Aires', time_zone_selected = true where not time_zone_selected");

  const data = [
    { referenceId: 'strip-steak-cooked', amount: 0.5, unit: 'steak' },
    { referenceId: 'kabocha-roasted', amount: 1, unit: 'cup' },
    { referenceId: 'banana-raw', amount: 2, unit: 'bananaSmall' },
  ];
  const save = (lineItems, time) => rows("select public.masomeno_save_meal(null,'dinner',$1,null,null,$2) as id",
    [time, JSON.stringify(lineItems)]);
  const [historical] = await save(data, '2020-11-25T01:36:00Z');
  await assert.rejects(save([{ referenceId: 'sushi-maki', amount: 100, unit: 'g' }], '2020-11-25T02:00:00Z'), { code: '22023' });
  assert.deepEqual(await rows('select grams_per_unit::float as grams, kcal::float from public.meal_components order by position'), [
    { grams: 119, kcal: 132.69 }, { grams: 205, kcal: 102.5 }, { grams: 101, kcal: 179.78 },
  ]);
  assert.equal((await rows("select id from public.meals where (consumed_at at time zone 'America/Argentina/Buenos_Aires')::date = '2020-11-24'"))[0].id,
    historical.id);

  const groups = [{ name: 'Acompañamiento', servings: 1, ingredients: [{ referenceId: 'kabocha-roasted', grams: 200 }] }];
  const [nextDay] = await rows("select public.masomeno_save_preparations('lunch','2020-11-25T03:10Z',null,$1) as id", [JSON.stringify(groups)]);
  assert.deepEqual(await rows("select preparations->0->'isEstimate' as estimated from public.meals where id = $1", [nextDay.id]),
    [{ estimated: true }]);

  await db.exec('reset role');
  await db.query('insert into public.calorie_goals (user_id,effective_on,kcal) values ($1,$2,$3),($1,$4,$5)', [
    alice, '2020-11-24', 1800, '2020-11-25', 2100,
  ]);
  await as(alice);
  const goalOn = (day) => rows('select kcal from public.calorie_goals where effective_on <= $1 order by effective_on desc limit 1', [day]);
  assert.deepEqual(await goalOn('2020-11-24'), [{ kcal: 1800 }]);
  assert.deepEqual(await goalOn('2020-11-25'), [{ kcal: 2100 }]);
  await rows("select public.masomeno_save_meal($1,'dinner','2020-11-25T01:36Z','Actualizada',250,'[]')", [historical.id]);
  assert.deepEqual(await rows('select name,manual_kcal::int as kcal from public.meals where id = $1', [historical.id]),
    [{ name: 'Actualizada', kcal: 250 }]);
  assert.equal((await rows('select count(*)::int as count from public.meal_components where meal_id = $1', [nextDay.id]))[0].count, 1);
  await as(bob);
  assert.deepEqual(await rows('select id from public.meals'), []);
  assert.deepEqual(await goalOn('2020-11-25'), []);
});

test('el primer recetario es idempotente y los consumos combinados admiten cambios sin recalcular referencias', async (t) => {
  const db = await PGlite.create();
  t.after(() => db.close());
  await db.exec(authFixture);
  const directory = new URL('../supabase/migrations/', import.meta.url);
  const seed = '20261125101000_seed_first_recipe_book.sql';
  const apply = async (migration) => db.exec(await readFile(new URL(migration, directory), 'utf8'));
  for (const migration of (await readdir(directory)).filter((file) => file.endsWith('.sql') && file <= seed).sort()) {
    await apply(migration);
  }
  await apply(seed);
  const rows = async (sql, args) => (await db.query(sql, args)).rows;
  const refs = new Map((await rows('select * from public.food_references')).map((ref) => [ref.id, ref]));
  const recipes = await rows(`
    select r.*, jsonb_agg(i order by i.position) as ingredients
    from public.recipes r join public.recipe_ingredients i on i.recipe_id = r.id
    where r.published group by r.id order by r.id
  `);
  assert.equal(recipes.length, 14);
  const intensities = { light: 0, medium: 0, hearty: 0, extraHearty: 0 };
  for (const recipe of recipes) {
    intensities[recipe.intensity]++;
    for (const locale of ['es', 'en', 'it']) assert.ok(recipe.names[locale] && recipe.instructions[locale]);
    assert.ok(recipeCaloriesPerServing(recipe.ingredients, recipe.base_servings, refs) > 0);
    assert.ok(recipe.ingredients.every(({ food_reference_id }) => refs.get(food_reference_id).kcal_per_100g > 0));
  }
  assert.deepEqual(intensities, { light: 3, medium: 4, hearty: 4, extraHearty: 3 });
  assert.equal((await rows('select count(*)::int as count from public.recipe_ingredient_alternatives'))[0].count, 10);
  await db.query('insert into auth.users (id) values ($1), ($2)', [alice, bob]);
  const as = async (id) => {
    await db.exec('set role authenticated');
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
  };
  await as(alice);
  await db.query('select public.masomeno_initialize_account()');
  assert.equal((await rows('select id from public.recipes')).length, 14);
  await assert.rejects(db.query("update public.recipes set published = false"), { code: '42501' });
  await assert.rejects(db.query("update public.recipe_ingredient_alternatives set grams = 5"), { code: '42501' });

  const mealSql = "select public.masomeno_save_preparations('lunch','2020-11-25T03:10Z','Combinada',$1) as id";
  const groups = [
    { name: 'Pizza', servings: 2, ingredients: [{ referenceId: 'pizza-slice-cheese-thin', grams: 172 }] },
    { name: 'Revuelto', servings: 1, ingredients: [{ referenceId: 'round-squash-raw', grams: 150 }, { referenceId: 'egg-raw', grams: 50 }] },
  ];
  const [meal] = await rows(mealSql, [JSON.stringify(groups)]);
  const snapshot = async () => (await rows('select preparations from public.meals where id = $1', [meal.id]))[0]?.preparations;
  const total = async () => (await rows('select sum(kcal)::float as kcal from public.meal_components where meal_id = $1', [meal.id]))[0].kcal;
  const before = await snapshot();
  assert.equal(before[0].kcal, 457.52);
  assert.equal(before[1].fat, null);
  assert.equal(await total(), 548.52);
  await db.exec('reset role');
  await db.query("update public.food_references set kcal_per_100g = 300 where id = 'pizza-slice-cheese-thin'");
  await db.query('update public.recipe_ingredients set grams = 100 where recipe_id = $1', [recipes[11].id]);
  await apply(seed);
  assert.deepEqual(await rows('select grams::int as grams from public.recipe_ingredients where recipe_id = $1', [recipes[11].id]), [{ grams: 100 }]);

  const resize = (expected, portions) => rows(
    "select public.masomeno_resize_preparations($1,'dinner','2020-11-25T03:10Z','Editada',$2,$3) as id",
    [meal.id, JSON.stringify(expected), JSON.stringify(portions)],
  );
  await as(bob);
  assert.deepEqual(await resize(before, [1, 0]), [{ id: null }]);
  assert.equal(await snapshot(), undefined);
  await as(alice);
  assert.deepEqual(await snapshot(), before);
  await assert.rejects(resize(before, [0, 0]), { code: '22023' });
  assert.equal(await total(), 548.52);
  assert.deepEqual(await resize(before, [1, 0]), [meal]);
  assert.deepEqual(await resize(before, [2, 1]), [{ id: null }]);
  assert.equal(await total(), 228.76);
  const after = await snapshot();
  assert.equal(after.length, 1);
  assert.equal(after[0].kcal, 228.76);
  assert.equal(after[0].ingredients[0].per100g.kcal, 266);
  assert.equal(after[0].ingredients[0].grams, 86);
  assert.deepEqual(after[0].ingredients[0].sourceRef, before[0].ingredients[0].sourceRef);

  await db.exec('reset role');
  await apply('20261125110000_mixed_meals_and_household_measures.sql');
  await as(alice);
  assert.deepEqual(await snapshot(), after);
  const [parent] = await rows(`
    select r.*, jsonb_agg(i order by i.position) as ingredients
    from public.recipes r join public.recipe_ingredients i on i.recipe_id = r.id
    where r.id = $1 group by r.id
  `, [recipes[8].id]);
  const part = { recipeId: parent.id, part: 'carrot-egg-salad', servings: 0.5, choices: {}, quantities: {} };
  const salad = resolveRecipeDraft({ ...parent, alternatives: [] }, part, refs);
  assert.deepEqual(salad.map(({ referenceId }) => referenceId), ['carrot-raw', 'egg-cooked', 'olive-oil-prepared']);
  const dinner = [
    { name: 'Bife', role: 'main', servings: 1, measureUnit: 'steakMedium', ingredients: [{ referenceId: 'strip-steak-cooked', grams: 180 }] },
    { name: 'Ensalada', role: 'side', servings: 0.5, ingredients: salad },
  ];
  const save = (value) => rows(mealSql, [JSON.stringify(value)]);
  await assert.rejects(save([{ ...dinner[0], servings: 2 }]), { code: '22023' });
  await assert.rejects(save([{ ...dinner[0], role: 'extra' }]), { code: '22023' });
  assert.equal((await rows('select id from public.meals')).length, 1);
  const [mixed] = await save(dinner);
  const mixedSnapshot = async () => (await rows('select preparations from public.meals where id = $1', [mixed.id]))[0]?.preparations;
  const original = await mixedSnapshot();
  assert.deepEqual(original.map(({ kcal, role, measureGrams }) => ({ kcal, role, measureGrams })), [
    { kcal: 401.4, role: 'main', measureGrams: 180 }, { kcal: 90.19, role: 'side', measureGrams: undefined },
  ]);
  assert.equal((await rows('select sum(kcal)::float as kcal from public.meal_components where meal_id = $1', [mixed.id]))[0].kcal, 491.59);
  assert.deepEqual((await rows(`select id from public.foods where 'fish' = any(synonyms) order by id`)).map(({ id }) => id),
    ['cod', 'hake', 'salmon', 'tuna']);
  assert.deepEqual(await rows(`
    select id, portion_grams::float as unit, (additional_portions->>'handful')::float as handful
    from public.food_references where id in ('almonds-raw','walnuts-raw') order by id
  `), [{ id: 'almonds-raw', unit: 1.2, handful: 28.35 }, { id: 'walnuts-raw', unit: 4.05, handful: 28.35 }]);

  await db.exec('reset role');
  await db.query(`update public.food_references set additional_portions = additional_portions || '{"steakMedium":190}',
    kcal_per_100g = 300 where id = 'strip-steak-cooked'`);
  const resizeMixed = () => rows(
    "select public.masomeno_resize_preparations($1,'lunch','2020-11-25T03:10Z',null,$2,'[1.5,0.5]') as id",
    [mixed.id, JSON.stringify(original)],
  );
  await as(bob);
  assert.deepEqual(await resizeMixed(), [{ id: null }]);
  assert.equal(await mixedSnapshot(), undefined);
  await as(alice);
  assert.deepEqual(await mixedSnapshot(), original);
  assert.deepEqual(await resizeMixed(), [mixed]);
  const edited = await mixedSnapshot();
  assert.equal(edited[0].ingredients[0].grams, 270);
  assert.equal(edited[0].kcal, 602.1);
  assert.equal(edited[0].measureGrams, 180);
  assert.equal(edited[1].kcal, 90.19);
});
