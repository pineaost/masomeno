create schema masomeno_private;
revoke all on schema masomeno_private from public, anon, authenticated, service_role;

create table masomeno_private.allowed_users (
  email text primary key
    check (email = lower(btrim(email)) and length(email) <= 320 and email ~ '^[^[:space:]@]+@[^[:space:]@]+$'),
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

alter table masomeno_private.allowed_users enable row level security;
revoke all on masomeno_private.allowed_users from public, anon, authenticated, service_role;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) between 1 and 100 and display_name = btrim(display_name)),
  birth_date date check (birth_date between date '1900-01-01' and current_date),
  height_cm numeric(5, 2) check (height_cm > 0 and height_cm <= 300),
  time_zone text not null default 'UTC' check (char_length(time_zone) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  locale text not null default 'es' check (locale in ('es', 'en', 'it')),
  weight_unit text not null default 'kg' check (weight_unit in ('kg', 'lb')),
  height_unit text not null default 'cm' check (height_unit in ('cm', 'feet')),
  distance_unit text not null default 'km' check (distance_unit in ('km', 'mi'))
);

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
revoke all on public.profiles, public.user_preferences from public, anon, authenticated, service_role;
grant select on public.profiles, public.user_preferences to authenticated;
grant update (display_name, birth_date, height_cm, time_zone) on public.profiles to authenticated;
grant update (locale, weight_unit, height_unit, distance_unit) on public.user_preferences to authenticated;

-- Supabase Auth invokes this hook before creating a new account.
create function public.masomeno_before_user_created(event jsonb)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select case when event #>> '{user,app_metadata,provider}' = 'google'
    and exists (
      select 1 from masomeno_private.allowed_users i
      where i.enabled and i.email = lower(btrim(event #>> '{user,email}'))
    )
    then '{}'::jsonb
    else jsonb_build_object('error', jsonb_build_object(
      'http_code', 403, 'message', 'MASOMENO_INVITE_REQUIRED'
    ))
  end;
$$;

revoke all on function public.masomeno_before_user_created(jsonb) from public, anon, authenticated, service_role;
grant usage on schema public to supabase_auth_admin;
grant execute on function public.masomeno_before_user_created(jsonb) to supabase_auth_admin;

-- Check the current Auth identity and live invitation, including for existing JWTs.
create function public.masomeno_can_access()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users u
    join masomeno_private.allowed_users i on i.email = lower(btrim(u.email)) and i.enabled
    join auth.identities identity on identity.user_id = u.id and identity.provider = 'google'
    where u.id = (select auth.uid())
      and u.email_confirmed_at is not null
      and lower(btrim(identity.identity_data ->> 'email')) = i.email
      and identity.identity_data -> 'email_verified' = 'true'::jsonb
  );
$$;

revoke all on function public.masomeno_can_access() from public, anon, authenticated, service_role;
grant execute on function public.masomeno_can_access() to authenticated;

create policy profiles_read_own on public.profiles
for select to authenticated
using (id = (select auth.uid()) and (select public.masomeno_can_access()));
create policy profiles_update_own on public.profiles
for update to authenticated
using (id = (select auth.uid()) and (select public.masomeno_can_access()))
with check (id = (select auth.uid()) and (select public.masomeno_can_access()));

create policy preferences_read_own on public.user_preferences
for select to authenticated
using (user_id = (select auth.uid()) and (select public.masomeno_can_access()));
create policy preferences_update_own on public.user_preferences
for update to authenticated
using (user_id = (select auth.uid()) and (select public.masomeno_can_access()))
with check (user_id = (select auth.uid()) and (select public.masomeno_can_access()));

create function masomeno_private.validate_profile()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (select 1 from pg_catalog.pg_timezone_names t where t.name = new.time_zone) then
    raise exception 'Unknown time zone' using errcode = '23514';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function masomeno_private.validate_profile() from public, anon, authenticated, service_role;
create trigger validate_profile before insert or update on public.profiles
for each row execute function masomeno_private.validate_profile();

-- Provision both rows atomically. Only the caller's Auth ID can be written.
create function public.masomeno_initialize_account(initial_locale text default 'es')
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
begin
  if caller is null or not public.masomeno_can_access() then
    raise exception 'Access restricted' using errcode = '42501';
  end if;
  if initial_locale is null or initial_locale not in ('es', 'en', 'it') then
    raise exception 'Invalid locale' using errcode = '22023';
  end if;
  insert into public.profiles (id) values (caller) on conflict (id) do nothing;
  insert into public.user_preferences (user_id, locale)
    values (caller, initial_locale) on conflict (user_id) do nothing;
end;
$$;

revoke all on function public.masomeno_initialize_account(text) from public, anon, authenticated, service_role;
grant execute on function public.masomeno_initialize_account(text) to authenticated;
