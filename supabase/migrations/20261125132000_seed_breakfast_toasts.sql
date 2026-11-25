-- The toast preparations reuse catalogue ingredients and their individual references.
insert into public.recipes (id, intensity, preparation_minutes, base_servings, names, instructions, published) values
  ('94170000-0000-4000-8000-000000000015', 'light', 5, 1,
    '{"es":"Tostada con palta","en":"Avocado toast","it":"Toast con avocado"}',
    '{"es":"Tostá una rebanada. Pisá un poco de palta y repartila sobre el pan.","en":"Toast a slice of bread. Mash some avocado and spread it over the toast.","it":"Tosta una fetta di pane. Schiaccia un po’ di avocado e spalmalo sul pane."}', true),
  ('94170000-0000-4000-8000-000000000016', 'light', 5, 1,
    '{"es":"Tostada con queso","en":"Cheese toast","it":"Toast con formaggio"}',
    '{"es":"Tostá una rebanada y cubrila con una feta de queso port salut. Si querés que se derrita, calentala unos instantes más.","en":"Toast a slice of bread and top it with a slice of Port Salut-style cheese. Heat briefly to melt the cheese if you like.","it":"Tosta una fetta di pane e aggiungi una fetta di formaggio tipo Port Salut. Scalda ancora per far sciogliere il formaggio, se preferisci."}', true)
on conflict (id) do nothing;

insert into public.recipe_ingredients (recipe_id, food_id, position, is_main, grams, food_reference_id, adjustable_quantity)
select seed.recipe_id::uuid, r.food_id, seed.position, true, seed.grams, r.id, seed.adjustable
from (values
  ('94170000-0000-4000-8000-000000000015', 1, 'white-bread-prepared-toasted', 22, true),
  ('94170000-0000-4000-8000-000000000015', 2, 'avocado-raw', 50, false),
  ('94170000-0000-4000-8000-000000000016', 1, 'white-bread-prepared-toasted', 22, true),
  ('94170000-0000-4000-8000-000000000016', 2, 'port-salut-prepared', 30, true)
) as seed(recipe_id, position, reference_id, grams, adjustable)
join public.food_references r on r.id = seed.reference_id
on conflict (recipe_id, position) do nothing;
