-- Create one new meal with current catalog items and/or immutable, owned historical items.
create function public.masomeno_repeat_preparations(
  meal_category text, meal_time timestamptz, meal_name text, meal_locale text, groups jsonb
) returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  saved_id uuid;
  fresh jsonb;
  fresh_snapshots jsonb;
  fresh_index integer := 0;
  item jsonb;
  source_groups jsonb;
  snapshot jsonb;
  original jsonb;
  component public.meal_components%rowtype;
  ingredient jsonb;
  ingredients jsonb;
  output_groups jsonb := '[]';
  quantity numeric;
  grams numeric;
  energy numeric;
  kcal numeric;
  protein numeric;
  carbs numeric;
  fat numeric;
  line_position integer := 0;
begin
  if owner_id is null then raise exception 'Missing account' using errcode = '42501'; end if;
  if meal_time is null or meal_time > statement_timestamp() or jsonb_typeof(groups) is distinct from 'array'
    or jsonb_array_length(groups) not between 1 and 30 then
    raise exception 'Invalid meal' using errcode = '22023';
  end if;

  -- Let the existing catalog writer validate and price all fresh items in one call.
  select jsonb_agg(g.value order by g.ordinality) into fresh
    from jsonb_array_elements(groups) with ordinality g where g.value->>'type' is distinct from 'repeat';
  if fresh is not null then
    saved_id := public.masomeno_save_preparations(meal_category, meal_time, meal_name, fresh);
    select m.preparations into fresh_snapshots from public.meals m where m.id = saved_id;
    delete from public.meal_components c where c.meal_id = saved_id;
  else
    insert into public.meals(user_id, category, consumed_at, name)
      values (owner_id, meal_category, meal_time, nullif(btrim(meal_name), '')) returning id into saved_id;
  end if;

  for item in select value from jsonb_array_elements(groups) loop
    if item->>'type' is distinct from 'repeat' then
      snapshot := fresh_snapshots->fresh_index;
      fresh_index := fresh_index + 1;
      quantity := (snapshot->>'servings')::numeric;
    else
      select m.preparations into source_groups from public.meals m
        where m.user_id = owner_id and m.id = (item->>'sourceMeal')::uuid for share;
      if not found then raise exception 'Source meal changed' using errcode = '40001'; end if;
      if source_groups is not null and jsonb_array_length(source_groups) > 0 then
        snapshot := source_groups->((item->>'index')::int);
        original := snapshot;
      else
        select c.* into component from public.meal_components c
          where c.user_id = owner_id and c.meal_id = (item->>'sourceMeal')::uuid and c.id = (item->'original'->>'id')::uuid;
        original := to_jsonb(component) - 'user_id' - 'meal_id';
        -- Old component rows only archived energy and their household conversion.
        select jsonb_build_object('name', coalesce(f.names->>meal_locale, f.names->>'es'), 'servings', component.amount,
          'measureUnit', component.unit, 'measureGrams', component.grams_per_unit, 'legacyMeasure', true,
          'ingredients', jsonb_build_array(jsonb_build_object('referenceId', r.id, 'foodId', f.id, 'names', f.names,
            'variantNames', r.variant_names, 'preparation', r.preparation, 'grams', component.amount * component.grams_per_unit,
            'per100g', jsonb_build_object('kcal', component.kcal_per_100g, 'protein', null, 'carbs', null, 'fat', null))))
          into snapshot from public.food_references r join public.foods f on f.id = r.food_id
          where r.id = component.food_reference_id;
      end if;
      if snapshot is null or original is distinct from item->'original' then
        raise exception 'Source item changed' using errcode = '40001';
      end if;
      quantity := replace(item->>'amount', ',', '.')::numeric;
      if quantity is null or quantity <= 0 or quantity <> round(quantity, 2)
        or quantity > (case when snapshot ? 'measureUnit' then 10000 else 1000 end)
        or (item->>'role' is not null and item->>'role' not in ('main','side')) then
        raise exception 'Invalid portion' using errcode = '22023';
      end if;
      snapshot := (snapshot - 'role') || jsonb_strip_nulls(jsonb_build_object('role', item->>'role'));
    end if;

    ingredients := '[]';
    kcal := 0; protein := 0; carbs := 0; fat := 0;
    for ingredient in select value from jsonb_array_elements(snapshot->'ingredients') loop
      if snapshot->>'legacyMeasure' = 'true' then
        grams := quantity * (snapshot->>'measureGrams')::numeric;
      elsif quantity = (snapshot->>'servings')::numeric then
        grams := (ingredient->>'grams')::numeric;
      else
        grams := round(quantity * coalesce((snapshot->>'measureGrams')::numeric,
          (ingredient->>'grams')::numeric / (snapshot->>'servings')::numeric), 2);
      end if;
      line_position := line_position + 1;
      energy := round(grams * (ingredient->'per100g'->>'kcal')::numeric / 100, 2);
      kcal := kcal + energy;
      protein := protein + round(grams * (ingredient->'per100g'->>'protein')::numeric / 100, 2);
      carbs := carbs + round(grams * (ingredient->'per100g'->>'carbs')::numeric / 100, 2);
      fat := fat + round(grams * (ingredient->'per100g'->>'fat')::numeric / 100, 2);
      ingredients := ingredients || jsonb_build_array(ingredient || jsonb_build_object('grams', grams, 'kcal', energy));
      insert into public.meal_components
        (meal_id, user_id, food_reference_id, position, amount, unit, grams_per_unit, kcal_per_100g)
        values (saved_id, owner_id, ingredient->>'referenceId', line_position,
          case when snapshot->>'legacyMeasure' = 'true' then quantity else grams end,
          case when snapshot->>'legacyMeasure' = 'true' then snapshot->>'measureUnit' else 'g' end,
          case when snapshot->>'legacyMeasure' = 'true' then (snapshot->>'measureGrams')::numeric else 1 end,
          (ingredient->'per100g'->>'kcal')::numeric);
    end loop;
    output_groups := output_groups || jsonb_build_array(snapshot || jsonb_build_object(
      'servings',quantity,'ingredients',ingredients,'kcal',kcal,'protein',protein,'carbs',carbs,'fat',fat));
  end loop;
  update public.meals set preparations = output_groups where id = saved_id;
  return saved_id;
end;
$$;
revoke all on function public.masomeno_repeat_preparations(text,timestamptz,text,text,jsonb) from public,anon;
grant execute on function public.masomeno_repeat_preparations(text,timestamptz,text,text,jsonb) to authenticated;
