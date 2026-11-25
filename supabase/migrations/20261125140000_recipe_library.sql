-- Browse categories are independent of food availability and recipe intensity.
alter table public.recipes
  add column if not exists kind text not null default 'dish' check (kind in ('dish', 'preparation', 'snack'));

update public.recipes set kind = 'preparation' where id = '94170000-0000-4000-8000-000000000003' and kind = 'dish';
update public.recipes set kind = 'snack' where id in ('94170000-0000-4000-8000-000000000015', '94170000-0000-4000-8000-000000000016') and kind = 'dish';

insert into public.foods (id, category_id, names, synonyms, search_priority) values
  ('empanada', 'prepared', '{"es":"Empanada","en":"Empanada","it":"Empanada"}', array['empanadas', 'empanada comprada', 'empanada al horno', 'empanadilla'], 12)
on conflict (id) do nothing;

-- CREA 006591 reports 34 g of available carbohydrate and a 130 g cooked serving.
update public.food_references set carbs_per_100g = 34, portion_unit = 'serving', portion_grams = 130,
  source_description = source_description || ' Carbohidratos disponibles. Porción cocida publicada de 130 g.'
where id = 'potato-gnocchi-cooked' and source_kind = 'crea' and source_ref = '006591'
  and carbs_per_100g is null and portion_unit is null;

insert into public.food_references (
  id, food_id, preparation, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g,
  portion_unit, portion_grams, source_kind, source_ref, source_url, source_description, variant_names, validation, is_estimate
) values
  ('potato-baked', 'potato', 'cooked', 93, 2.5, 21.15, 0.13, 'unit', 173, 'sr-legacy', '170093',
    'https://fdc.nal.usda.gov/food-details/170093/nutrients', 'USDA SR Legacy · Papa al horno con piel, sin sal ni aceite, unidad mediana.',
    '{"es":"Al horno con piel","en":"Baked, skin on","it":"Al forno con buccia"}', 'verified', false),
  ('lemon-juice-raw', 'lemon', 'raw', 22, 0.35, 6.9, 0.24, 'tablespoon', 15.25, 'sr-legacy', '167747',
    'https://fdc.nal.usda.gov/food-details/167747/nutrients', 'USDA SR Legacy · Jugo de limón crudo. Cucharada calculada como 1/16 de taza de 244 g.',
    '{"es":"Jugo exprimido","en":"Fresh juice","it":"Succo spremuto"}', 'verified', false),
  ('empanada-beef-prepared', 'empanada', 'prepared', 333, 12.1, 27.4, 19.2, 'unit', 130, 'fndds', '2708711',
    'https://fdc.nal.usda.gov/food-details/2708711/nutrients', 'USDA FNDDS 2021–2023 · Empanada de carne genérica, unidad regular o grande de 130 g.',
    '{"es":"Carne, unidad grande","en":"Beef, large","it":"Manzo, grande"}', 'estimated', true),
  ('empanada-chicken-prepared', 'empanada', 'prepared', 309, 12.6, 27.4, 16.5, 'unit', 130, 'fndds', '2708713',
    'https://fdc.nal.usda.gov/food-details/2708713/nutrients', 'USDA FNDDS 2021–2023 · Empanada de pollo genérica, unidad regular o grande de 130 g.',
    '{"es":"Pollo, unidad grande","en":"Chicken, large","it":"Pollo, grande"}', 'estimated', true),
  ('empanada-ham-cheese-prepared', 'empanada', 'prepared', 208.75, 13.75, 18.75, 8.75, 'unit', 80, 'label', 'Paladini · Empanada Jamón y Queso',
    'https://paladini.com/es/nuestros-alimentos/14-Panificados/producto/158-Empanada-Jamon-y-Queso',
    'Ejemplo de etiqueta argentina que declara 167 kcal, 11 g de proteínas, 15 g de carbohidratos y 7 g de grasa por unidad de 80 g. Convertido a 100 g.',
    '{"es":"Jamón y queso, unidad de 80 g","en":"Ham and cheese, 80 g unit","it":"Prosciutto e formaggio, pezzo da 80 g"}', 'estimated', true)
on conflict (id) do nothing;
