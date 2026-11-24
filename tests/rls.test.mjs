import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { PGlite } from '@electric-sql/pglite';

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
