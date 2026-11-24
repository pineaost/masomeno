-- Before applying remotely, disable Before User Created in Supabase Auth Hooks.
-- The hosted Auth hook configuration is managed outside this database.
alter policy profiles_read_own on public.profiles
  using (id = (select auth.uid()));

alter policy profiles_update_own on public.profiles
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

alter policy preferences_read_own on public.user_preferences
  using (user_id = (select auth.uid()));

alter policy preferences_update_own on public.user_preferences
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

alter policy weight_measurements_own on public.weight_measurements
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

alter policy exercises_own on public.exercises
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

alter policy strength_entries_own on public.strength_entries
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

alter policy treadmill_sessions_own on public.treadmill_sessions
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create or replace function public.masomeno_initialize_account(initial_locale text default 'es')
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
begin
  if caller is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if initial_locale is null or initial_locale not in ('es', 'en', 'it') then
    raise exception 'Invalid locale' using errcode = '22023';
  end if;
  insert into public.profiles (id) values (caller) on conflict (id) do nothing;
  insert into public.user_preferences (user_id, locale)
    values (caller, initial_locale) on conflict (user_id) do nothing;
end;
$$;

-- Drop dependencies explicitly so unexpected dependencies abort the migration.
drop function public.masomeno_can_access();
drop function public.masomeno_before_user_created(jsonb);
drop table masomeno_private.allowed_users;
