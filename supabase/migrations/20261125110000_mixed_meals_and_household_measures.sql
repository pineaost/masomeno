alter table public.recipes
  add column parts jsonb not null default '[]' check (jsonb_typeof(parts) = 'array');

-- Reusable preparations reference ingredient slots in their original recipe.
update public.recipes r set parts = seed.parts::jsonb
from (values
  ('94170000-0000-4000-8000-000000000001', '[{"id":"chicken-breast","positions":[1],"names":{"es":"Pechuga a la plancha","en":"Griddled chicken breast","it":"Petto di pollo alla piastra"}},{"id":"arugula-salad","positions":[2,3,4,5],"names":{"es":"Ensalada de rúcula, tomate y cebolla","en":"Arugula, tomato and onion salad","it":"Insalata di rucola, pomodoro e cipolla"}}]'),
  ('94170000-0000-4000-8000-000000000002', '[{"id":"omelette","positions":[1,2,3],"names":{"es":"Omelette de queso","en":"Cheese omelette","it":"Omelette al formaggio"}},{"id":"lettuce-salad","positions":[4,5],"names":{"es":"Ensalada de lechuga y tomate","en":"Lettuce and tomato salad","it":"Insalata di lattuga e pomodoro"}}]'),
  ('94170000-0000-4000-8000-000000000005', '[{"id":"breaded-hake","positions":[1,2,3,4],"names":{"es":"Milanesa de merluza","en":"Breaded hake","it":"Nasello impanato"}},{"id":"roast-kabocha","positions":[5],"names":{"es":"Cabutiá al horno","en":"Roasted kabocha squash","it":"Zucca cabotiá al forno"}}]'),
  ('94170000-0000-4000-8000-000000000009', '[{"id":"strip-steak","positions":[1],"names":{"es":"Bife de chorizo a la plancha","en":"Griddled strip steak","it":"Controfiletto alla piastra"}},{"id":"carrot-egg-salad","positions":[2,3,4],"names":{"es":"Ensalada de zanahoria y huevo","en":"Carrot and egg salad","it":"Insalata di carote e uova"}}]'),
  ('94170000-0000-4000-8000-000000000011', '[{"id":"roast-chicken","positions":[1],"names":{"es":"Pollo al horno","en":"Roast chicken","it":"Pollo al forno"}},{"id":"roast-vegetables","positions":[2,3,4,5,6],"names":{"es":"Verduras al horno","en":"Roasted vegetables","it":"Verdure al forno"}}]')
) as seed(id, parts)
where r.id = seed.id::uuid and r.parts = '[]';

alter table public.food_references
  drop constraint food_references_portion_unit_check,
  add constraint food_references_portion_unit_check check (
    portion_unit in ('egg', 'banana', 'tablespoon', 'slice', 'unit', 'piece', 'cup', 'steak', 'almond', 'walnut')
  );

alter table public.meal_components
  drop constraint meal_components_unit_check,
  add constraint meal_components_unit_check check (
    unit in ('g', 'egg', 'banana', 'bananaSmall', 'bananaLarge', 'tablespoon', 'slice', 'unit', 'piece', 'cup', 'steak',
      'steakMedium', 'almond', 'walnut', 'handful', 'serving')
  );

-- USDA 170567: one almond 1.2 g and one ounce 28.35 g. USDA 170187: one ounce is 14 halves.
update public.food_references
set portion_unit = 'almond', portion_grams = 1.2, additional_portions = additional_portions || '{"handful":28.35}'
where id = 'almonds-raw' and source_ref = '170567' and portion_unit is null;

update public.food_references
set portion_unit = 'walnut', portion_grams = 4.05, additional_portions = additional_portions || '{"handful":28.35}'
where id = 'walnuts-raw' and source_ref = '170187' and portion_unit is null;

-- App portions. The steak uses the existing 180 g recipe portion and cooked FDC density.
update public.food_references set additional_portions = additional_portions || '{"steakMedium":180}'
where id = 'strip-steak-cooked' and source_ref = '170239' and not (additional_portions ? 'steakMedium');

update public.food_references set additional_portions = additional_portions || '{"serving":99}'
where id = 'lentils-cooked' and source_ref = '172421' and portion_grams = 198 and not (additional_portions ? 'serving');

update public.foods f set synonyms = array(select distinct term from unnest(f.synonyms || groups.terms) term order by term)
from (values
  (array['hake','cod','salmon','tuna'], array['pescado','pescados','fish','pesce','pesci']),
  (array['strip-steak','lean-beef','ground-beef','burger-patty'], array['carne vacuna','carne de res','beef','manzo','carne bovina']),
  (array['wheat-pasta','potato-gnocchi'], array['pasta','pastas','noodles'])
) as groups(ids, terms)
where f.id = any(groups.ids);

-- Store household conversions and optional labels alongside the current preparation snapshots.
create or replace function public.masomeno_save_preparations(
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
  meal_role text;
  measure_unit text;
  measure_grams numeric;
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
    meal_role := preparation_group->>'role';
    measure_unit := preparation_group->>'measureUnit';
    measure_grams := null;
    if group_name is null or char_length(group_name) not between 1 and 120
      or jsonb_typeof(preparation_group->'servings') is distinct from 'number'
      or jsonb_typeof(preparation_group->'ingredients') is distinct from 'array' then
      raise exception 'Invalid preparation' using errcode = '22023';
    end if;
    servings := (preparation_group->>'servings')::numeric;
    if servings <= 0 or servings > (case when measure_unit is null then 1000 else 10000 end)
      or (meal_role is not null and meal_role not in ('main', 'side'))
      or (measure_unit is not null and
        (servings <> round(servings, 2) or jsonb_array_length(preparation_group->'ingredients') <> 1))
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
        where r.id = ingredient->>'referenceId' and r.validation in ('verified', 'estimated') for share;
      if not found then raise exception 'Unverified food reference' using errcode = '22023'; end if;
      if measure_unit is not null then
        measure_grams := case
          when measure_unit = 'g' then 1
          when measure_unit = ref.portion_unit then ref.portion_grams
          else (ref.additional_portions->>measure_unit)::numeric
        end;
        if measure_grams is null or grams <> round(servings * measure_grams, 2) then
          raise exception 'Invalid food measure' using errcode = '22023';
        end if;
      end if;
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
    ) || jsonb_strip_nulls(jsonb_build_object('role', meal_role, 'measureUnit', measure_unit, 'measureGrams', measure_grams)));
  end loop;

  saved_id := public.masomeno_save_meal(null, meal_category, meal_time, meal_name, null, lines);
  update public.meals m set preparations = groups_snapshot where m.id = saved_id and m.user_id = owner_id;
  return saved_id;
end;
$$;

create or replace function public.masomeno_resize_preparations(
  meal_id uuid, meal_category text, meal_time timestamptz, meal_name text, expected_groups jsonb, portions jsonb
)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  original_groups jsonb;
  original_ids uuid[];
  preparation_group jsonb;
  ingredient jsonb;
  selected_portions jsonb;
  servings numeric;
  grams numeric;
  energy numeric;
  group_energy numeric;
  group_protein numeric;
  group_carbs numeric;
  group_fat numeric;
  group_position integer := 0;
  line_position integer := 0;
  new_groups jsonb := '[]';
  new_ingredients jsonb;
  lines jsonb := '[]';
  saved_id uuid;
begin
  if owner_id is null then raise exception 'Missing account' using errcode = '42501'; end if;
  select m.preparations into original_groups from public.meals m
    where m.id = meal_id and m.user_id = owner_id for update;
  if not found or original_groups is null or original_groups is distinct from expected_groups then return null; end if;
  if jsonb_typeof(portions) is distinct from 'array' then
    raise exception 'Invalid portions' using errcode = '22023';
  end if;
  if jsonb_array_length(portions) <> jsonb_array_length(original_groups) then
    raise exception 'Invalid portions' using errcode = '22023';
  end if;

  select array_agg(c.id order by c.position) into original_ids
    from public.meal_components c where c.meal_id = masomeno_resize_preparations.meal_id and c.user_id = owner_id;

  for preparation_group in select value from jsonb_array_elements(original_groups) loop
    selected_portions := portions -> group_position;
    group_position := group_position + 1;
    if jsonb_typeof(selected_portions) is distinct from 'number' then
      raise exception 'Invalid servings' using errcode = '22023';
    end if;
    servings := (selected_portions #>> '{}')::numeric;
    if servings < 0 or servings > (case when preparation_group ? 'measureUnit' then 10000 else 1000 end)
      or servings <> round(servings, 2) then
      raise exception 'Invalid servings' using errcode = '22023';
    end if;

    new_ingredients := '[]';
    group_energy := 0;
    group_protein := 0;
    group_carbs := 0;
    group_fat := 0;
    for ingredient in select value from jsonb_array_elements(preparation_group->'ingredients') loop
      line_position := line_position + 1;
      if servings = 0 then continue; end if;
      grams := round(servings * coalesce((preparation_group->>'measureGrams')::numeric,
        (ingredient->>'grams')::numeric / (preparation_group->>'servings')::numeric), 2);
      if grams <= 0 or grams > 10000 or original_ids[line_position] is null then
        raise exception 'Invalid ingredient weight' using errcode = '22023';
      end if;
      energy := round(grams * (ingredient->'per100g'->>'kcal')::numeric / 100, 2);
      group_energy := group_energy + energy;
      group_protein := group_protein + round(grams * (ingredient->'per100g'->>'protein')::numeric / 100, 2);
      group_carbs := group_carbs + round(grams * (ingredient->'per100g'->>'carbs')::numeric / 100, 2);
      group_fat := group_fat + round(grams * (ingredient->'per100g'->>'fat')::numeric / 100, 2);
      lines := lines || jsonb_build_array(jsonb_build_object(
        'id', original_ids[line_position], 'referenceId', ingredient->>'referenceId', 'amount', grams, 'unit', 'g'
      ));
      new_ingredients := new_ingredients || jsonb_build_array(ingredient || jsonb_build_object('grams', grams, 'kcal', energy));
    end loop;
    if servings > 0 then
      new_groups := new_groups || jsonb_build_array(preparation_group || jsonb_build_object(
        'servings', servings, 'ingredients', new_ingredients, 'kcal', group_energy,
        'protein', group_protein, 'carbs', group_carbs, 'fat', group_fat
      ));
    end if;
  end loop;

  if lines = '[]' or cardinality(original_ids) is distinct from line_position then
    raise exception 'Invalid recorded preparations' using errcode = '22023';
  end if;
  saved_id := public.masomeno_save_meal(meal_id, meal_category, meal_time, meal_name, null, lines);
  update public.meals m set preparations = new_groups where m.id = saved_id and m.user_id = owner_id;
  return saved_id;
end;
$$;

revoke all on function public.masomeno_resize_preparations(uuid, text, timestamptz, text, jsonb, jsonb) from public, anon;
grant execute on function public.masomeno_resize_preparations(uuid, text, timestamptz, text, jsonb, jsonb) to authenticated;
