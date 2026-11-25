-- Group display choices without changing the food or reference IDs used in meals and recipes.
alter table public.foods
  add column if not exists browse_parent text references public.foods(id) check (browse_parent <> id),
  add column if not exists search_priority smallint not null default 100 check (search_priority >= 0);

alter table public.food_references
  drop constraint if exists food_references_portion_unit_check,
  add constraint food_references_portion_unit_check check (
    portion_unit in ('egg', 'banana', 'bananaSmall', 'bananaLarge', 'tablespoon', 'slice', 'unit', 'piece', 'cup', 'steak',
      'steakSmall', 'steakMedium', 'steakLarge', 'almond', 'walnut', 'handful', 'serving', 'teaspoon')
  );

alter table public.meal_components
  drop constraint if exists meal_components_unit_check,
  add constraint meal_components_unit_check check (
    unit in ('g', 'egg', 'banana', 'bananaSmall', 'bananaLarge', 'tablespoon', 'slice', 'unit', 'piece', 'cup', 'steak',
      'steakSmall', 'steakMedium', 'steakLarge', 'almond', 'walnut', 'handful', 'serving', 'teaspoon')
  );
