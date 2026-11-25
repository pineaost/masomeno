create table public.personal_fridge_ingredients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  name_key text generated always as (
    lower(regexp_replace(regexp_replace(normalize(btrim(name), NFD), U&'[\0300-\036F]', '', 'g'), '[[:space:]]+', ' ', 'g'))
  ) stored check (char_length(btrim(name_key)) > 0),
  status text default 'available' check (status in ('available', 'unavailable')),
  unique (user_id, name_key)
);

alter table public.personal_fridge_ingredients enable row level security;
revoke all on public.personal_fridge_ingredients from public, anon, authenticated;
grant select, delete on public.personal_fridge_ingredients to authenticated;
grant insert (name), update (name, status) on public.personal_fridge_ingredients to authenticated;

create policy personal_fridge_ingredients_owner on public.personal_fridge_ingredients for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
