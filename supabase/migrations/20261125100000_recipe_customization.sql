alter table public.recipes
  add column variants jsonb not null default '[]' check (jsonb_typeof(variants) = 'array'),
  add column purchase_unit text check (purchase_unit in ('slice', 'unit'));

alter table public.recipe_ingredients
  add column optional_default boolean not null default false check (not optional_default or is_optional),
  add column adjustable_quantity boolean not null default false;

-- Keep historic references, weights and nutrient densities independent of the recipe catalog.
create function public.masomeno_resize_preparations(
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
    if servings < 0 or servings > 1000 or servings <> round(servings, 2) then
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
      grams := round((ingredient->>'grams')::numeric * servings / (preparation_group->>'servings')::numeric, 2);
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
