create table public.food_categories (
  id text primary key,
  names jsonb not null check (names ?& array['es', 'en', 'it'])
);

create table public.foods (
  id text primary key,
  category_id text not null references public.food_categories(id),
  names jsonb not null check (names ?& array['es', 'en', 'it']),
  synonyms text[] not null default '{}'
);

create table public.food_references (
  id text primary key,
  food_id text not null references public.foods(id),
  preparation text not null check (preparation in ('raw', 'cooked', 'prepared')),
  reference_grams numeric not null default 100 check (reference_grams = 100),
  kcal_per_100g numeric check (kcal_per_100g between 0 and 900),
  protein_per_100g numeric check (protein_per_100g between 0 and 100),
  carbs_per_100g numeric check (carbs_per_100g between 0 and 100),
  fat_per_100g numeric check (fat_per_100g between 0 and 100),
  source_url text check (source_url like 'https://%'),
  source_description text,
  validation text not null default 'pending' check (validation in ('verified', 'pending')),
  portion_unit text check (portion_unit in ('egg', 'banana', 'tablespoon')),
  portion_grams numeric check (portion_grams > 0 and portion_grams <= 10000),
  check ((portion_unit is null) = (portion_grams is null)),
  check (validation <> 'verified' or (kcal_per_100g is not null and source_url is not null and source_description is not null))
);

create table public.calorie_goals (
  user_id uuid not null references auth.users(id) on delete cascade,
  effective_on date not null,
  kcal integer check (kcal between 1 and 10000),
  primary key (user_id, effective_on)
);

create table public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('firstMeal', 'lunch', 'snack', 'dinner', 'other')),
  consumed_at timestamptz not null check (consumed_at >= '1900-01-01T00:00:00Z'),
  name text check (char_length(btrim(name)) between 1 and 120),
  manual_kcal numeric check (manual_kcal between 0 and 100000 and manual_kcal = round(manual_kcal, 2)),
  check (manual_kcal is null or name is not null),
  unique (id, user_id)
);

create index meals_user_time on public.meals (user_id, consumed_at, id);

create table public.meal_components (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null,
  user_id uuid not null,
  food_reference_id text not null references public.food_references(id),
  position integer not null check (position between 1 and 30),
  amount numeric not null check (amount > 0 and amount = round(amount, 2)),
  unit text not null check (unit in ('g', 'egg', 'banana', 'tablespoon')),
  grams_per_unit numeric not null check (grams_per_unit > 0),
  kcal_per_100g numeric not null check (kcal_per_100g between 0 and 900),
  kcal numeric generated always as (round(amount * grams_per_unit * kcal_per_100g / 100, 2)) stored,
  check (amount * grams_per_unit <= 10000),
  check (unit <> 'g' or grams_per_unit = 1),
  foreign key (meal_id, user_id) references public.meals (id, user_id) on delete cascade,
  unique (meal_id, position)
);

alter table public.food_categories enable row level security;
alter table public.foods enable row level security;
alter table public.food_references enable row level security;
alter table public.calorie_goals enable row level security;
alter table public.meals enable row level security;
alter table public.meal_components enable row level security;

revoke all on public.food_categories, public.foods, public.food_references,
  public.calorie_goals, public.meals, public.meal_components from public, anon, authenticated;
grant select on public.food_categories, public.foods, public.food_references,
  public.calorie_goals, public.meals, public.meal_components to authenticated;
grant delete on public.meals to authenticated;

create policy food_categories_read on public.food_categories for select to authenticated using ((select auth.uid()) is not null);
create policy foods_read on public.foods for select to authenticated using ((select auth.uid()) is not null);
create policy food_references_read on public.food_references for select to authenticated using ((select auth.uid()) is not null);
create policy calorie_goals_owner on public.calorie_goals for select to authenticated using (user_id = (select auth.uid()));
create policy meals_owner on public.meals for select to authenticated using (user_id = (select auth.uid()));
create policy meals_owner_delete on public.meals for delete to authenticated using (user_id = (select auth.uid()));
create policy meal_components_owner on public.meal_components for select to authenticated using (user_id = (select auth.uid()));

-- A day's changes replace that day's value. Earlier days retain their effective goal.
create function public.masomeno_set_calorie_goal(goal_kcal integer)
returns date
language plpgsql security definer set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  day date;
begin
  select (statement_timestamp() at time zone p.time_zone)::date into day
    from public.profiles p where p.id = owner_id;
  if not found then raise exception 'Missing account' using errcode = '42501'; end if;

  insert into public.calorie_goals (user_id, effective_on, kcal) values (owner_id, day, goal_kcal)
    on conflict (user_id, effective_on) do update set kcal = excluded.kcal;
  return day;
end;
$$;

-- Meal and lines change atomically. Existing line estimates keep their original nutrition and portion weight.
create function public.masomeno_save_meal(
  meal_id uuid, meal_category text, meal_time timestamptz, meal_name text, estimated_kcal numeric, lines jsonb
)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  saved_id uuid;
  line jsonb;
  old_lines jsonb;
  old_line jsonb;
  ref public.food_references%rowtype;
  quantity numeric;
  portion text;
  grams_per_portion numeric;
  energy numeric;
  line_position integer := 0;
begin
  if owner_id is null then raise exception 'Missing account' using errcode = '42501'; end if;
  if meal_time is null or meal_time > statement_timestamp() or jsonb_typeof(lines) is distinct from 'array' then
    raise exception 'Invalid meal' using errcode = '22023';
  end if;
  if jsonb_array_length(lines) > 30 or (estimated_kcal is null) = (jsonb_array_length(lines) = 0) then
    raise exception 'Invalid meal components' using errcode = '22023';
  end if;

  if meal_id is null then
    insert into public.meals (user_id, category, consumed_at, name, manual_kcal)
      values (owner_id, meal_category, meal_time, nullif(btrim(meal_name), ''), estimated_kcal)
      returning id into saved_id;
  else
    update public.meals m set category = meal_category, consumed_at = meal_time,
      name = nullif(btrim(meal_name), ''), manual_kcal = estimated_kcal
      where m.id = meal_id and m.user_id = owner_id
      returning m.id into saved_id;
    if not found then return null; end if;
  end if;

  select jsonb_object_agg(c.id, to_jsonb(c)) into old_lines
    from public.meal_components c where (c.meal_id, c.user_id) = (saved_id, owner_id);
  delete from public.meal_components c where (c.meal_id, c.user_id) = (saved_id, owner_id);

  for line in select value from jsonb_array_elements(lines) loop
    line_position := line_position + 1;
    quantity := (line->>'amount')::numeric;
    portion := line->>'unit';
    old_line := old_lines -> (line->>'id');
    if old_line->>'food_reference_id' is distinct from line->>'referenceId' then old_line := null; end if;

    select * into ref from public.food_references r where r.id = line->>'referenceId';
    if not found or (ref.validation <> 'verified' and old_line is null) then
      raise exception 'Unverified food reference' using errcode = '22023';
    end if;

    energy := coalesce((old_line->>'kcal_per_100g')::numeric, ref.kcal_per_100g);
    grams_per_portion := case
      when portion = 'g' then 1
      when portion = old_line->>'unit' then (old_line->>'grams_per_unit')::numeric
      when portion = ref.portion_unit then ref.portion_grams
      else null
    end;
    if quantity is null or portion is null or grams_per_portion is null then
      raise exception 'Invalid quantity or unit' using errcode = '22023';
    end if;

    insert into public.meal_components
      (id, meal_id, user_id, food_reference_id, position, amount, unit, grams_per_unit, kcal_per_100g)
      values (coalesce((old_line->>'id')::uuid, gen_random_uuid()),
        saved_id, owner_id, ref.id, line_position, quantity, portion, grams_per_portion, energy);
  end loop;

  return saved_id;
end;
$$;

revoke all on function public.masomeno_set_calorie_goal(integer) from public, anon, authenticated;
revoke all on function public.masomeno_save_meal(uuid, text, timestamptz, text, numeric, jsonb) from public, anon, authenticated;
grant execute on function public.masomeno_set_calorie_goal(integer) to authenticated;
grant execute on function public.masomeno_save_meal(uuid, text, timestamptz, text, numeric, jsonb) to authenticated;
