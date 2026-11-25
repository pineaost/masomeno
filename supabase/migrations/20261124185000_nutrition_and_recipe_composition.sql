-- Explicit nutrition references and optional alternatives for each recipe ingredient.
alter table public.food_references
  add column variant_names jsonb check (jsonb_typeof(variant_names) = 'object' and variant_names ?& array['es', 'en', 'it']),
  add column source_kind text check (source_kind in ('sr-legacy', 'fndds', 'crea', 'label', 'official')),
  add column source_ref text,
  add column is_estimate boolean not null default false,
  add constraint food_references_id_food_unique unique (id, food_id),
  drop constraint food_references_portion_unit_check,
  add constraint food_references_portion_unit_check
    check (portion_unit in ('egg', 'banana', 'tablespoon', 'slice', 'unit', 'piece'));

alter table public.meal_components
  drop constraint meal_components_unit_check,
  add constraint meal_components_unit_check
    check (unit in ('g', 'egg', 'banana', 'tablespoon', 'slice', 'unit', 'piece'));

alter table public.recipe_ingredients
  add column food_reference_id text,
  add column is_optional boolean not null default false,
  add constraint recipe_ingredients_reference_food_fkey
    foreign key (food_reference_id, food_id) references public.food_references (id, food_id);

create table public.recipe_ingredient_alternatives (
  recipe_id uuid not null,
  ingredient_position integer not null,
  position integer not null check (position > 0),
  food_id text not null,
  food_reference_id text not null,
  grams numeric not null check (grams > 0 and grams <= 100000),
  primary key (recipe_id, ingredient_position, position),
  foreign key (recipe_id, ingredient_position) references public.recipe_ingredients (recipe_id, position) on delete cascade,
  foreign key (food_reference_id, food_id) references public.food_references (id, food_id)
);

alter table public.recipe_ingredient_alternatives enable row level security;
revoke all on public.recipe_ingredient_alternatives from public, anon, authenticated;
grant select on public.recipe_ingredient_alternatives to authenticated;
create policy recipe_alternatives_published on public.recipe_ingredient_alternatives
  for select to authenticated using (exists (select 1 from public.recipes r where r.id = recipe_id));

comment on column public.recipes.kcal_per_serving is 'Legacy field. Derive energy from ingredient references and base_servings.';

alter table public.personal_fridge_ingredients
  add column matched_food_id text references public.foods(id) on delete set null;

-- Owned by the same RLS policy as the meal. Never joined back to mutable recipes.
alter table public.meals add column preparations jsonb
  check (jsonb_typeof(preparations) = 'array');

-- The flat editor can retain group boundaries when it leaves the composition intact.
-- Compare after the existing save function replaces the meal's component rows.
create function masomeno_private.reconcile_meal_preparations()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  before_edit jsonb;
  after_edit jsonb;
begin
  select jsonb_agg(jsonb_build_array(i.value->'referenceId', i.value->'grams', i.value->'kcal')
    order by p.ordinality, i.ordinality) into before_edit
    from jsonb_array_elements(old.preparations) with ordinality p
    cross join lateral jsonb_array_elements(p.value->'ingredients') with ordinality i;
  select jsonb_agg(jsonb_build_array(c.food_reference_id, c.amount * c.grams_per_unit, c.kcal)
    order by c.position) into after_edit
    from public.meal_components c where (c.meal_id, c.user_id) = (new.id, new.user_id);
  if before_edit is distinct from after_edit then
    update public.meals m set preparations = null
      where (m.id, m.user_id) = (new.id, new.user_id) and m.preparations = old.preparations;
  end if;
  return null;
end;
$$;

revoke all on function masomeno_private.reconcile_meal_preparations() from public, anon, authenticated;
create constraint trigger reconcile_meal_preparations after update of category, consumed_at, name, manual_kcal
  on public.meals deferrable initially deferred for each row when (old.preparations is not null)
  execute function masomeno_private.reconcile_meal_preparations();

-- Each ingredient's grams are the amount actually eaten, after any portion scaling.
create function public.masomeno_save_preparations(
  meal_category text, meal_time timestamptz, meal_name text, groups jsonb
)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  saved_id uuid;
  preparation_group jsonb;
  ingredient jsonb;
  group_name text;
  servings numeric;
  grams numeric;
  ref public.food_references%rowtype;
  food_names jsonb;
  groups_snapshot jsonb := '[]';
  ingredients_snapshot jsonb;
  lines jsonb := '[]';
  energy numeric;
  group_energy numeric;
  group_protein numeric;
  group_carbs numeric;
  group_fat numeric;
  group_estimated boolean;
begin
  if owner_id is null then raise exception 'Missing account' using errcode = '42501'; end if;
  if jsonb_typeof(groups) is distinct from 'array' then
    raise exception 'Invalid preparations' using errcode = '22023';
  end if;
  if jsonb_array_length(groups) not between 1 and 30 then
    raise exception 'Invalid preparation count' using errcode = '22023';
  end if;

  for preparation_group in select value from jsonb_array_elements(groups) loop
    group_name := btrim(preparation_group->>'name');
    if group_name is null or char_length(group_name) not between 1 and 120
      or jsonb_typeof(preparation_group->'servings') is distinct from 'number'
      or jsonb_typeof(preparation_group->'ingredients') is distinct from 'array' then
      raise exception 'Invalid preparation' using errcode = '22023';
    end if;
    servings := (preparation_group->>'servings')::numeric;
    if servings <= 0 or servings > 1000
      or jsonb_array_length(preparation_group->'ingredients') not between 1 and 30 then
      raise exception 'Invalid servings or ingredients' using errcode = '22023';
    end if;

    ingredients_snapshot := '[]';
    group_energy := 0;
    group_protein := 0;
    group_carbs := 0;
    group_fat := 0;
    group_estimated := false;
    for ingredient in select value from jsonb_array_elements(preparation_group->'ingredients') loop
      if jsonb_typeof(ingredient->'grams') is distinct from 'number' or jsonb_array_length(lines) >= 30 then
        raise exception 'Invalid meal ingredients' using errcode = '22023';
      end if;
      grams := (ingredient->>'grams')::numeric;
      if grams <= 0 or grams > 10000 or grams <> round(grams, 2) then
        raise exception 'Invalid ingredient weight' using errcode = '22023';
      end if;

      select r.* into ref from public.food_references r
        where r.id = ingredient->>'referenceId' and r.validation = 'verified' for share;
      if not found then raise exception 'Unverified food reference' using errcode = '22023'; end if;
      select f.names into food_names from public.foods f where f.id = ref.food_id;
      energy := round(grams * ref.kcal_per_100g / 100, 2);
      group_energy := group_energy + energy;
      group_protein := group_protein + round(grams * ref.protein_per_100g / 100, 2);
      group_carbs := group_carbs + round(grams * ref.carbs_per_100g / 100, 2);
      group_fat := group_fat + round(grams * ref.fat_per_100g / 100, 2);
      group_estimated := group_estimated or ref.is_estimate;
      lines := lines || jsonb_build_array(jsonb_build_object('referenceId', ref.id, 'amount', grams, 'unit', 'g'));
      ingredients_snapshot := ingredients_snapshot || jsonb_build_array(jsonb_build_object(
        'referenceId', ref.id, 'foodId', ref.food_id, 'names', food_names,
        'preparation', ref.preparation, 'variantNames', ref.variant_names, 'grams', grams, 'kcal', energy,
        'per100g', jsonb_build_object('kcal', ref.kcal_per_100g, 'protein', ref.protein_per_100g,
          'carbs', ref.carbs_per_100g, 'fat', ref.fat_per_100g),
        'sourceRef', ref.source_ref, 'sourceUrl', ref.source_url, 'sourceDescription', ref.source_description,
        'sourceKind', ref.source_kind, 'isEstimate', ref.is_estimate
      ));
    end loop;
    groups_snapshot := groups_snapshot || jsonb_build_array(jsonb_build_object(
      'name', group_name, 'servings', servings, 'ingredients', ingredients_snapshot, 'kcal', group_energy,
      'protein', group_protein, 'carbs', group_carbs, 'fat', group_fat, 'isEstimate', group_estimated
    ));
  end loop;

  saved_id := public.masomeno_save_meal(null, meal_category, meal_time, meal_name, null, lines);
  update public.meals m set preparations = groups_snapshot where m.id = saved_id and m.user_id = owner_id;
  return saved_id;
end;
$$;

revoke all on function public.masomeno_save_preparations(text, timestamptz, text, jsonb) from public, anon, authenticated;
grant execute on function public.masomeno_save_preparations(text, timestamptz, text, jsonb) to authenticated;
