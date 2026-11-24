alter table public.profiles
  add column weight_goal_kg numeric(7, 3) check (weight_goal_kg > 0 and weight_goal_kg <= 1000);
grant update (weight_goal_kg) on public.profiles to authenticated;

create table public.weight_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  weight_kg numeric(7, 3) not null check (weight_kg > 0 and weight_kg <= 1000),
  measured_at timestamptz not null check (measured_at >= timestamp with time zone '1900-01-01 00:00:00+00' and measured_at <= now()),
  condition text check (char_length(condition) between 1 and 100 and condition = btrim(condition)),
  created_at timestamptz not null default now()
);
create index weight_measurements_history on public.weight_measurements
  (user_id, measured_at desc, created_at desc, id desc);

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80 and name = btrim(name)),
  favorite_slot smallint check (favorite_slot between 1 and 4),
  unique (user_id, favorite_slot),
  unique (id, user_id)
);
create unique index exercises_unique_name on public.exercises (user_id, lower(name));

create table public.strength_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  exercise_id uuid not null,
  load_kg numeric(7, 3) not null check (load_kg >= 0 and load_kg <= 2000),
  performed_on date not null check (performed_on between date '1900-01-01' and current_date + 1),
  created_at timestamptz not null default now(),
  foreign key (exercise_id, user_id) references public.exercises (id, user_id) on delete cascade
);
create index strength_entries_history on public.strength_entries
  (user_id, exercise_id, performed_on desc, created_at desc, id desc);

create table public.treadmill_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  distance_km numeric(8, 4) not null check (distance_km > 0 and distance_km <= 500),
  duration_seconds integer not null check (duration_seconds between 1 and 86400),
  performed_on date not null check (performed_on between date '1900-01-01' and current_date + 1),
  created_at timestamptz not null default now()
);
create index treadmill_sessions_history on public.treadmill_sessions
  (user_id, performed_on desc, created_at desc, id desc);

alter table public.weight_measurements enable row level security;
revoke all on public.weight_measurements from public, anon, authenticated, service_role;
grant select, delete on public.weight_measurements to authenticated;
grant insert (weight_kg, measured_at, condition) on public.weight_measurements to authenticated;
grant update (weight_kg, measured_at, condition) on public.weight_measurements to authenticated;
create policy weight_measurements_own on public.weight_measurements
for all to authenticated
using (user_id = (select auth.uid()) and (select public.masomeno_can_access()))
with check (user_id = (select auth.uid()) and (select public.masomeno_can_access()));

alter table public.exercises enable row level security;
revoke all on public.exercises from public, anon, authenticated, service_role;
grant select, delete on public.exercises to authenticated;
grant insert (name, favorite_slot) on public.exercises to authenticated;
grant update (name, favorite_slot) on public.exercises to authenticated;
create policy exercises_own on public.exercises
for all to authenticated
using (user_id = (select auth.uid()) and (select public.masomeno_can_access()))
with check (user_id = (select auth.uid()) and (select public.masomeno_can_access()));

alter table public.strength_entries enable row level security;
revoke all on public.strength_entries from public, anon, authenticated, service_role;
grant select, delete on public.strength_entries to authenticated;
grant insert (exercise_id, load_kg, performed_on) on public.strength_entries to authenticated;
grant update (load_kg, performed_on) on public.strength_entries to authenticated;
create policy strength_entries_own on public.strength_entries
for all to authenticated
using (user_id = (select auth.uid()) and (select public.masomeno_can_access()))
with check (user_id = (select auth.uid()) and (select public.masomeno_can_access()));

alter table public.treadmill_sessions enable row level security;
revoke all on public.treadmill_sessions from public, anon, authenticated, service_role;
grant select, delete on public.treadmill_sessions to authenticated;
grant insert (distance_km, duration_seconds, performed_on) on public.treadmill_sessions to authenticated;
grant update (distance_km, duration_seconds, performed_on) on public.treadmill_sessions to authenticated;
create policy treadmill_sessions_own on public.treadmill_sessions
for all to authenticated
using (user_id = (select auth.uid()) and (select public.masomeno_can_access()))
with check (user_id = (select auth.uid()) and (select public.masomeno_can_access()));

