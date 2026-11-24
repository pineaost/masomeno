create table public.fridge_ingredients (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  food_id text not null references public.foods(id) on delete cascade,
  status text not null check (status in ('available', 'unavailable')),
  primary key (user_id, food_id)
);

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  names jsonb not null check (jsonb_typeof(names) = 'object' and names ?& array['es', 'en', 'it']),
  intensity text not null check (intensity in ('light', 'medium', 'hearty', 'extraHearty')),
  kcal_per_serving numeric check (kcal_per_serving between 0 and 10000),
  preparation_minutes integer check (preparation_minutes between 1 and 1440),
  base_servings integer not null default 1 check (base_servings between 1 and 100),
  instructions jsonb not null default '{}' check (jsonb_typeof(instructions) = 'object'),
  published boolean not null default false
);

create table public.recipe_ingredients (
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  food_id text not null references public.foods(id),
  position integer not null check (position > 0),
  is_main boolean not null default false,
  grams numeric check (grams > 0 and grams <= 100000),
  primary key (recipe_id, position)
);

alter table public.fridge_ingredients enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_ingredients enable row level security;

revoke all on public.fridge_ingredients, public.recipes, public.recipe_ingredients from public, anon, authenticated;
grant select, delete on public.fridge_ingredients to authenticated;
grant insert (food_id, status), update (status) on public.fridge_ingredients to authenticated;
grant select on public.recipes, public.recipe_ingredients to authenticated;

create policy fridge_ingredients_owner on public.fridge_ingredients for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy recipes_published on public.recipes for select to authenticated
  using (published and (select auth.uid()) is not null);

create policy recipe_ingredients_published on public.recipe_ingredients for select to authenticated
  using (exists (select 1 from public.recipes r where r.id = recipe_id));

-- Removing the row restores the unknown state. Availability never tracks a quantity.
create function public.masomeno_set_fridge_ingredient(ingredient_id text, ingredient_status text)
returns boolean
language plpgsql security invoker set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
begin
  if owner_id is null then raise exception 'Missing account' using errcode = '42501'; end if;

  if ingredient_status is null then
    delete from public.fridge_ingredients where user_id = owner_id and food_id = ingredient_id;
  else
    insert into public.fridge_ingredients (food_id, status) values (ingredient_id, ingredient_status)
      on conflict (user_id, food_id) do update set status = excluded.status;
  end if;
  return true;
end;
$$;

revoke all on function public.masomeno_set_fridge_ingredient(text, text) from public, anon, authenticated;
grant execute on function public.masomeno_set_fridge_ingredient(text, text) to authenticated;
