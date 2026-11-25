-- Adopt the device time zone once. Existing non-UTC choices remain explicit.
alter table public.profiles add column time_zone_selected boolean not null default false;
update public.profiles set time_zone_selected = true where time_zone <> 'UTC';
grant update (time_zone_selected) on public.profiles to authenticated;

-- A documented proxy is usable but stays distinct from a verified food match.
alter table public.food_references
  drop constraint food_references_validation_check,
  add constraint food_references_validation_check check (validation in ('verified', 'estimated', 'pending')),
  add constraint food_references_estimate_check check (validation <> 'estimated' or
    (is_estimate and kcal_per_100g is not null and source_url is not null and source_description is not null)),
  add column additional_portions jsonb not null default '{}' check (jsonb_typeof(additional_portions) = 'object'),
  drop constraint food_references_portion_unit_check,
  add constraint food_references_portion_unit_check
    check (portion_unit in ('egg', 'banana', 'tablespoon', 'slice', 'unit', 'piece', 'cup', 'steak'));

alter table public.meal_components
  drop constraint meal_components_unit_check,
  add constraint meal_components_unit_check
    check (unit in ('g', 'egg', 'banana', 'bananaSmall', 'bananaLarge', 'tablespoon', 'slice', 'unit', 'piece', 'cup', 'steak'));

update public.food_references
set validation = 'verified', kcal_per_100g = 41, protein_per_100g = 1.75, carbs_per_100g = 8.36, fat_per_100g = 0.54,
    source_kind = 'official', source_ref = 'TBCA BRC0002B',
    source_url = 'https://www.tbca.net.br/base-dados-en/int_food_composition.php?cod_produto=BRC0002B',
    source_description = 'TBCA · Cabotiá crudo, pulpa sin cáscara ni semillas (Cucurbita maxima × Cucurbita moschata)'
where id = 'kabocha-raw' and validation = 'pending';

update public.food_references
set validation = 'estimated', is_estimate = true,
    kcal_per_100g = 50, protein_per_100g = 2.48, carbs_per_100g = 10.81, fat_per_100g = 0.62,
    source_kind = 'sr-legacy', source_ref = '168476', source_url = 'https://fdc.nal.usda.gov/food-details/168476/nutrients',
    source_description = 'USDA SR Legacy · Hubbard al horno sin sal como referencia comparable de cocción seca, sin aceite añadido',
    portion_unit = 'cup', portion_grams = 205
where id = 'kabocha-roasted' and validation = 'pending';

insert into public.food_references (
  id, food_id, preparation, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g,
  source_kind, source_ref, source_url, source_description, validation, variant_names
) values (
  'kabocha-boiled', 'kabocha', 'cooked', 50, 1.44, 10.8, 0.73, 'official', 'TBCA BRC0059B',
  'https://www.tbca.net.br/base-dados-en/int_food_composition.php?cod_produto=BRC0059B',
  'TBCA · Cabotiá hervido, escurrido, sin cáscara, aceite ni sal', 'verified',
  '{"es":"Hervido sin aceite","en":"Boiled without oil","it":"Bollito senza olio"}'
) on conflict (id) do nothing;

update public.food_references set portion_unit = 'steak', portion_grams = 119,
  variant_names = '{"es":"A la parrilla o a la plancha sin aceite","en":"Grilled or griddled without oil","it":"Alla griglia o alla piastra senza olio"}',
  source_description = source_description || ' · Porción orientativa: un bife cocido de la ficha USDA, 119 g. La parrilla sirve de aproximación para plancha sin aceite.'
where id = 'strip-steak-cooked' and portion_unit is null and source_ref = '170239';

update public.food_references set portion_unit = 'cup', portion_grams = 158
where id = 'white-rice-cooked' and portion_unit is null and source_ref = '169757';

update public.food_references r set portion_unit = m.unit, portion_grams = m.grams
from (values
  ('brown-rice-cooked', '169704', 'cup', 202),
  ('lentils-cooked', '172421', 'cup', 198),
  ('chickpeas-cooked', '173757', 'cup', 164),
  ('black-beans-cooked', '173735', 'cup', 172),
  ('apple-raw', '171688', 'unit', 182),
  ('orange-raw', '169097', 'unit', 131)
) as m(id, source_ref, unit, grams)
where r.id = m.id and r.source_ref = m.source_ref and r.portion_unit is null;

update public.food_references set additional_portions = '{"bananaSmall":101,"bananaLarge":136}'
where id = 'banana-raw' and additional_portions = '{}' and source_ref = '173944';

create or replace function public.masomeno_save_meal(
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
    if not found or (ref.validation = 'pending' and old_line is null) then
      raise exception 'Unverified food reference' using errcode = '22023';
    end if;

    energy := coalesce((old_line->>'kcal_per_100g')::numeric, ref.kcal_per_100g);
    grams_per_portion := case
      when portion = 'g' then 1
      when portion = old_line->>'unit' then (old_line->>'grams_per_unit')::numeric
      when portion = ref.portion_unit then ref.portion_grams
      else (ref.additional_portions->>portion)::numeric
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
        where r.id = ingredient->>'referenceId' and r.validation in ('verified', 'estimated') for share;
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
