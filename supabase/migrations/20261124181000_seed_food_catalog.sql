-- Initial catalog. Reapplying the seed keeps curated corrections and existing IDs.
-- USDA FoodData Central SR Legacy (2018-04); potato gnocchi: CREA 006591.
-- USDA nutrient IDs: energy 1008, protein 1003, carbohydrate 1005 and fat 1004.
insert into public.food_categories (id, names) values
  ('vegetables', '{"es": "Verduras y hortalizas", "en": "Vegetables", "it": "Verdure e ortaggi"}'::jsonb),
  ('protein-dairy', '{"es": "Proteínas y lácteos", "en": "Proteins and dairy", "it": "Proteine e latticini"}'::jsonb),
  ('grains', '{"es": "Cereales, pastas y tubérculos", "en": "Grains, pasta and tubers", "it": "Cereali, pasta e tuberi"}'::jsonb),
  ('legumes', '{"es": "Legumbres", "en": "Legumes", "it": "Legumi"}'::jsonb),
  ('fruit', '{"es": "Frutas", "en": "Fruit", "it": "Frutta"}'::jsonb),
  ('fats-nuts', '{"es": "Grasas y frutos secos", "en": "Fats and nuts", "it": "Grassi e frutta a guscio"}'::jsonb)
on conflict (id) do nothing;

insert into public.foods (id, category_id, names, synonyms) values
  ('tomato', 'vegetables', '{"es": "Tomate", "en": "Tomato", "it": "Pomodoro"}'::jsonb, array['tomate rojo']::text[]),
  ('onion', 'vegetables', '{"es": "Cebolla", "en": "Onion", "it": "Cipolla"}'::jsonb, array[]::text[]),
  ('carrot', 'vegetables', '{"es": "Zanahoria", "en": "Carrot", "it": "Carota"}'::jsonb, array[]::text[]),
  ('spinach', 'vegetables', '{"es": "Espinaca", "en": "Spinach", "it": "Spinaci"}'::jsonb, array[]::text[]),
  ('lettuce', 'vegetables', '{"es": "Lechuga de hoja verde", "en": "Green leaf lettuce", "it": "Lattuga a foglia verde"}'::jsonb, array['lechuga', 'lattuga']::text[]),
  ('red-pepper', 'vegetables', '{"es": "Morrón rojo", "en": "Red bell pepper", "it": "Peperone rosso"}'::jsonb, array['pimiento', 'pimiento rojo', 'ají morrón', 'bell pepper']::text[]),
  ('broccoli', 'vegetables', '{"es": "Brócoli", "en": "Broccoli", "it": "Broccoli"}'::jsonb, array[]::text[]),
  ('zucchini', 'vegetables', '{"es": "Zucchini", "en": "Zucchini", "it": "Zucchina"}'::jsonb, array['zapallito italiano', 'calabacín', 'courgette', 'zucchine']::text[]),
  ('egg', 'protein-dairy', '{"es": "Huevo", "en": "Egg", "it": "Uovo"}'::jsonb, array['huevo duro', 'hard-boiled egg', 'uovo sodo']::text[]),
  ('chicken-breast', 'protein-dairy', '{"es": "Pechuga de pollo", "en": "Chicken breast", "it": "Petto di pollo"}'::jsonb, array['pollo', 'chicken']::text[]),
  ('lean-beef', 'protein-dairy', '{"es": "Carne vacuna magra (nalga)", "en": "Lean beef (top round)", "it": "Manzo magro (fesa)"}'::jsonb, array['carne de res', 'nalga vacuna', 'carne vacuna', 'top round']::text[]),
  ('tuna', 'protein-dairy', '{"es": "Atún al natural", "en": "Tuna in water", "it": "Tonno al naturale"}'::jsonb, array['atún en agua', 'atún escurrido', 'canned tuna', 'tonno in scatola']::text[]),
  ('cod', 'protein-dairy', '{"es": "Bacalao atlántico", "en": "Atlantic cod", "it": "Merluzzo atlantico"}'::jsonb, array['pescado blanco', 'white fish', 'pesce bianco']::text[]),
  ('tofu', 'protein-dairy', '{"es": "Tofu firme", "en": "Firm tofu", "it": "Tofu compatto"}'::jsonb, array['tofu']::text[]),
  ('yogurt', 'protein-dairy', '{"es": "Yogur natural entero", "en": "Plain whole-milk yogurt", "it": "Yogurt bianco intero"}'::jsonb, array['yogurt natural', 'yoghurt', 'plain yogurt', 'yogurt naturale']::text[]),
  ('potato', 'grains', '{"es": "Papa", "en": "Potato", "it": "Patata"}'::jsonb, array['patata', 'papa hervida', 'boiled potato', 'patata lessa']::text[]),
  ('sweet-potato', 'grains', '{"es": "Batata", "en": "Sweet potato", "it": "Patata dolce"}'::jsonb, array['camote', 'boniato']::text[]),
  ('white-rice', 'grains', '{"es": "Arroz blanco", "en": "White rice", "it": "Riso bianco"}'::jsonb, array['arroz cocido', 'arroz hervido', 'cooked rice', 'riso cotto']::text[]),
  ('brown-rice', 'grains', '{"es": "Arroz integral", "en": "Brown rice", "it": "Riso integrale"}'::jsonb, array[]::text[]),
  ('oats', 'grains', '{"es": "Avena seca", "en": "Dry rolled oats", "it": "Fiocchi d’avena secchi"}'::jsonb, array['copos de avena', 'rolled oats', 'fiocchi di avena']::text[]),
  ('wheat-pasta', 'grains', '{"es": "Fideos de trigo", "en": "Wheat pasta", "it": "Pasta di grano"}'::jsonb, array['espagueti', 'espaguetis', 'spaghetti', 'tallarines', 'fideos cocidos', 'pasta cocida']::text[]),
  ('potato-gnocchi', 'grains', '{"es": "Ñoquis de papa", "en": "Potato gnocchi", "it": "Gnocchi di patate"}'::jsonb, array['gnocchi']::text[]),
  ('whole-wheat-bread', 'grains', '{"es": "Pan integral", "en": "Whole-wheat bread", "it": "Pane integrale"}'::jsonb, array['pan de trigo integral', 'wholemeal bread']::text[]),
  ('lentils', 'legumes', '{"es": "Lentejas", "en": "Lentils", "it": "Lenticchie"}'::jsonb, array[]::text[]),
  ('chickpeas', 'legumes', '{"es": "Garbanzos", "en": "Chickpeas", "it": "Ceci"}'::jsonb, array['garbanzo', 'garbanzo beans']::text[]),
  ('black-beans', 'legumes', '{"es": "Porotos negros", "en": "Black beans", "it": "Fagioli neri"}'::jsonb, array['frijoles negros', 'alubias negras', 'porotos', 'judías negras']::text[]),
  ('banana', 'fruit', '{"es": "Banana", "en": "Banana", "it": "Banana"}'::jsonb, array['plátano', 'banano']::text[]),
  ('apple', 'fruit', '{"es": "Manzana con piel", "en": "Apple with skin", "it": "Mela con buccia"}'::jsonb, array['manzana', 'manzana con cáscara', 'apple', 'mela']::text[]),
  ('orange', 'fruit', '{"es": "Naranja", "en": "Orange", "it": "Arancia"}'::jsonb, array[]::text[]),
  ('olive-oil', 'fats-nuts', '{"es": "Aceite de oliva", "en": "Olive oil", "it": "Olio di oliva"}'::jsonb, array['aceite', 'olio d’oliva']::text[]),
  ('walnuts', 'fats-nuts', '{"es": "Nueces (nogal común)", "en": "English walnuts", "it": "Noci comuni"}'::jsonb, array['nuez', 'walnut', 'noce']::text[])
on conflict (id) do nothing;

insert into public.food_references
  (id, food_id, preparation, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g,
   source_url, source_description, validation, portion_unit, portion_grams)
values
  ('tomato-raw', 'tomato', 'raw', 18, 0.88, 3.89, 0.2, 'https://fdc.nal.usda.gov/food-details/170457/nutrients', 'USDA FoodData Central · SR Legacy · Tomatoes, red, ripe, raw, year round average', 'verified', null, null),
  ('onion-raw', 'onion', 'raw', 40, 1.1, 9.34, 0.1, 'https://fdc.nal.usda.gov/food-details/170000/nutrients', 'USDA FoodData Central · SR Legacy · Onions, raw', 'verified', null, null),
  ('carrot-raw', 'carrot', 'raw', 41, 0.93, 9.58, 0.24, 'https://fdc.nal.usda.gov/food-details/170393/nutrients', 'USDA FoodData Central · SR Legacy · Carrots, raw', 'verified', null, null),
  ('spinach-raw', 'spinach', 'raw', 23, 2.86, 3.63, 0.39, 'https://fdc.nal.usda.gov/food-details/168462/nutrients', 'USDA FoodData Central · SR Legacy · Spinach, raw', 'verified', null, null),
  ('lettuce-raw', 'lettuce', 'raw', 15, 1.36, 2.87, 0.15, 'https://fdc.nal.usda.gov/food-details/169249/nutrients', 'USDA FoodData Central · SR Legacy · Lettuce, green leaf, raw', 'verified', null, null),
  ('red-pepper-raw', 'red-pepper', 'raw', 26, 0.99, 6.03, 0.3, 'https://fdc.nal.usda.gov/food-details/170108/nutrients', 'USDA FoodData Central · SR Legacy · Peppers, sweet, red, raw', 'verified', null, null),
  ('broccoli-raw', 'broccoli', 'raw', 34, 2.82, 6.64, 0.37, 'https://fdc.nal.usda.gov/food-details/170379/nutrients', 'USDA FoodData Central · SR Legacy · Broccoli, raw', 'verified', null, null),
  ('zucchini-raw', 'zucchini', 'raw', 17, 1.21, 3.11, 0.32, 'https://fdc.nal.usda.gov/food-details/169291/nutrients', 'USDA FoodData Central · SR Legacy · Squash, summer, zucchini, includes skin, raw', 'verified', null, null),
  ('egg-cooked', 'egg', 'cooked', 155, 12.58, 1.12, 10.61, 'https://fdc.nal.usda.gov/food-details/173424/nutrients', 'USDA FoodData Central · SR Legacy · Egg, whole, cooked, hard-boiled', 'verified', 'egg', 50),
  ('chicken-breast-cooked', 'chicken-breast', 'cooked', 165, 31.02, 0, 3.57, 'https://fdc.nal.usda.gov/food-details/171477/nutrients', 'USDA FoodData Central · SR Legacy · Chicken, broilers or fryers, breast, meat only, cooked, roasted', 'verified', null, null),
  ('lean-beef-cooked', 'lean-beef', 'cooked', 158, 29.81, 0, 3.37, 'https://fdc.nal.usda.gov/food-details/169472/nutrients', 'USDA FoodData Central · SR Legacy · Beef, round, top round steak, boneless, separable lean only, trimmed to 0" fat, select, cooked, grilled', 'verified', null, null),
  ('tuna-prepared', 'tuna', 'prepared', 116, 25.51, 0, 0.82, 'https://fdc.nal.usda.gov/food-details/171986/nutrients', 'USDA FoodData Central · SR Legacy · Fish, tuna, light, canned in water, without salt, drained solids', 'verified', null, null),
  ('cod-cooked', 'cod', 'cooked', 105, 22.83, 0, 0.86, 'https://fdc.nal.usda.gov/food-details/171956/nutrients', 'USDA FoodData Central · SR Legacy · Fish, cod, Atlantic, cooked, dry heat', 'verified', null, null),
  ('tofu-raw', 'tofu', 'raw', 144, 17.27, 2.78, 8.72, 'https://fdc.nal.usda.gov/food-details/172475/nutrients', 'USDA FoodData Central · SR Legacy · Tofu, raw, firm, prepared with calcium sulfate', 'verified', null, null),
  ('yogurt-prepared', 'yogurt', 'prepared', 61, 3.47, 4.66, 3.25, 'https://fdc.nal.usda.gov/food-details/171284/nutrients', 'USDA FoodData Central · SR Legacy · Yogurt, plain, whole milk', 'verified', null, null),
  ('potato-cooked', 'potato', 'cooked', 87, 1.87, 20.13, 0.1, 'https://fdc.nal.usda.gov/food-details/170438/nutrients', 'USDA FoodData Central · SR Legacy · Potatoes, boiled, cooked in skin, flesh, without salt', 'verified', null, null),
  ('sweet-potato-cooked', 'sweet-potato', 'cooked', 90, 2.01, 20.71, 0.15, 'https://fdc.nal.usda.gov/food-details/168483/nutrients', 'USDA FoodData Central · SR Legacy · Sweet potato, cooked, baked in skin, flesh, without salt', 'verified', null, null),
  ('white-rice-cooked', 'white-rice', 'cooked', 130, 2.69, 28.17, 0.28, 'https://fdc.nal.usda.gov/food-details/169757/nutrients', 'USDA FoodData Central · SR Legacy · Rice, white, long-grain, regular, unenriched, cooked without salt', 'verified', null, null),
  ('brown-rice-cooked', 'brown-rice', 'cooked', 123, 2.74, 25.58, 0.97, 'https://fdc.nal.usda.gov/food-details/169704/nutrients', 'USDA FoodData Central · SR Legacy · Rice, brown, long-grain, cooked (Includes foods for USDA''s Food Distribution Program)', 'verified', null, null),
  ('oats-raw', 'oats', 'raw', 379, 13.15, 67.7, 6.52, 'https://fdc.nal.usda.gov/food-details/173904/nutrients', 'USDA FoodData Central · SR Legacy · Cereals, oats, regular and quick, not fortified, dry', 'verified', null, null),
  ('wheat-pasta-cooked', 'wheat-pasta', 'cooked', 158, 5.8, 30.86, 0.93, 'https://fdc.nal.usda.gov/food-details/168928/nutrients', 'USDA FoodData Central · SR Legacy · Pasta, cooked, unenriched, without added salt', 'verified', null, null),
  ('potato-gnocchi-cooked', 'potato-gnocchi', 'cooked', 147, 3.5, null, 0.2, 'https://www.alimentinutrizione.it/tabelle-nutrizionali/006591', 'CREA Centro di ricerca Alimenti e Nutrizione · 006591 · Gnocchi di patate, cotti', 'verified', null, null),
  ('whole-wheat-bread-prepared', 'whole-wheat-bread', 'prepared', 252, 12.45, 42.71, 3.5, 'https://fdc.nal.usda.gov/food-details/172688/nutrients', 'USDA FoodData Central · SR Legacy · Bread, whole-wheat, commercially prepared', 'verified', null, null),
  ('lentils-cooked', 'lentils', 'cooked', 116, 9.02, 20.13, 0.38, 'https://fdc.nal.usda.gov/food-details/172421/nutrients', 'USDA FoodData Central · SR Legacy · Lentils, mature seeds, cooked, boiled, without salt', 'verified', null, null),
  ('chickpeas-cooked', 'chickpeas', 'cooked', 164, 8.86, 27.42, 2.59, 'https://fdc.nal.usda.gov/food-details/173757/nutrients', 'USDA FoodData Central · SR Legacy · Chickpeas (garbanzo beans, bengal gram), mature seeds, cooked, boiled, without salt', 'verified', null, null),
  ('black-beans-cooked', 'black-beans', 'cooked', 132, 8.86, 23.71, 0.54, 'https://fdc.nal.usda.gov/food-details/173735/nutrients', 'USDA FoodData Central · SR Legacy · Beans, black, mature seeds, cooked, boiled, without salt', 'verified', null, null),
  ('banana-raw', 'banana', 'raw', 89, 1.09, 22.84, 0.33, 'https://fdc.nal.usda.gov/food-details/173944/nutrients', 'USDA FoodData Central · SR Legacy · Bananas, raw', 'verified', 'banana', 118),
  ('apple-raw', 'apple', 'raw', 52, 0.26, 13.81, 0.17, 'https://fdc.nal.usda.gov/food-details/171688/nutrients', 'USDA FoodData Central · SR Legacy · Apples, raw, with skin (Includes foods for USDA''s Food Distribution Program)', 'verified', null, null),
  ('orange-raw', 'orange', 'raw', 47, 0.94, 11.75, 0.12, 'https://fdc.nal.usda.gov/food-details/169097/nutrients', 'USDA FoodData Central · SR Legacy · Oranges, raw, all commercial varieties', 'verified', null, null),
  ('olive-oil-prepared', 'olive-oil', 'prepared', 884, 0, 0, 100, 'https://fdc.nal.usda.gov/food-details/171413/nutrients', 'USDA FoodData Central · SR Legacy · Oil, olive, salad or cooking', 'verified', 'tablespoon', 13.5),
  ('walnuts-raw', 'walnuts', 'raw', 654, 15.23, 13.71, 65.21, 'https://fdc.nal.usda.gov/food-details/170187/nutrients', 'USDA FoodData Central · SR Legacy · Nuts, walnuts, english', 'verified', null, null)
on conflict (id) do nothing;
