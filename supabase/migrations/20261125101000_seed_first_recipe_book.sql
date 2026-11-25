-- Shared cookbook. Stable IDs let the seed be reapplied without overwriting edits.
insert into public.foods (id, category_id, names, synonyms) values
  ('round-squash', 'vegetables', '{"es":"Zapallito redondo","en":"Round summer squash","it":"Zucchina tonda"}', array['zapallito de tronco', 'zapallito criollo']),
  ('sliced-ham', 'protein-dairy', '{"es":"Jamón cocido","en":"Cooked ham","it":"Prosciutto cotto"}', array['jamón en fetas', 'deli ham'])
on conflict (id) do nothing;

insert into public.food_references (
  id, food_id, preparation, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g,
  source_kind, source_ref, source_url, source_description, portion_unit, portion_grams, variant_names, validation
) values
  ('round-squash-raw', 'round-squash', 'raw', 13, 0.8, 2.4, null, 'official', 'ARGENFOODS 117', 'https://www.argenfood.unlu.edu.ar/Tablas/Codigo/117.htm', 'ARGENFOODS · Zapallito, parte tierna, fresco, crudo. Grasa total no cuantificada.', null, null, '{"es":"Crudo, parte tierna","en":"Raw, tender part","it":"Crudo, parte tenera"}', 'verified'),
  ('ham-sliced-prepared', 'sliced-ham', 'prepared', 107, 16.85, 0.7, 4.04, 'sr-legacy', '173863', 'https://fdc.nal.usda.gov/food-details/173863/nutrients', 'USDA SR Legacy · Ham, sliced, pre-packaged, deli meat (96% fat free, water added)', 'slice', 13, '{"es":"Cocido, en fetas","en":"Cooked, sliced","it":"Cotto, a fette"}', 'verified'),
  ('lean-beef-raw', 'lean-beef', 'raw', 116, 23.59, 0, 2.45, 'sr-legacy', '171759', 'https://fdc.nal.usda.gov/food-details/171759/nutrients', 'USDA SR Legacy · Select top round steak, boneless, separable lean only, raw', null, null, '{"es":"Nalga magra cruda","en":"Raw lean top round","it":"Fesa magra cruda"}', 'verified'),
  ('potato-raw', 'potato', 'raw', 77, 2.05, 17.49, 0.09, 'sr-legacy', '170026', 'https://fdc.nal.usda.gov/food-details/170026/nutrients', 'USDA SR Legacy · Potatoes, flesh and skin, raw · Medium potato', 'unit', 213, '{"es":"Cruda con piel","en":"Raw with skin","it":"Cruda con buccia"}', 'verified'),
  ('sweet-potato-raw', 'sweet-potato', 'raw', 86, 1.57, 20.12, 0.05, 'sr-legacy', '168482', 'https://fdc.nal.usda.gov/food-details/168482/nutrients', 'USDA SR Legacy · Sweet potato, raw, unprepared · 5-inch sweet potato', 'unit', 130, '{"es":"Cruda","en":"Raw","it":"Cruda"}', 'verified')
on conflict (id) do nothing;

-- FDC 171477 lists 86 g for half a breast (one cooked boneless fillet).
update public.food_references set portion_unit = 'piece', portion_grams = 86
where id = 'chicken-breast-cooked' and source_ref = '171477' and portion_unit is null;

insert into public.recipes (id, intensity, preparation_minutes, base_servings, names, instructions, purchase_unit, variants, published)
values
  ('94170000-0000-4000-8000-000000000001', 'light', 20, 1, '{"es":"Pechuga a la plancha con ensalada de rúcula","en":"Griddled chicken breast with arugula salad","it":"Petto di pollo alla piastra con insalata di rucola"}', '{"es":"Dorá la pechuga en una plancha caliente hasta que esté bien cocida. Cortá el tomate y la cebolla, mezclalos con la rúcula y aderezá con parte del aceite.","en":"Sear the chicken on a hot griddle until cooked through. Slice the tomato and onion, toss with the arugula and dress with some of the oil.","it":"Cuoci il petto di pollo sulla piastra calda fino a cottura completa. Affetta pomodoro e cipolla, uniscili alla rucola e condisci con parte dell’olio."}', null, '[]', true),
  ('94170000-0000-4000-8000-000000000002', 'light', 15, 1, '{"es":"Omelette de queso con ensalada","en":"Cheese omelette with salad","it":"Omelette al formaggio con insalata"}', '{"es":"Batí los huevos. Cocinalos a fuego medio con el aceite y, cuando estén cuajando, agregá el queso y doblá la omelette. Serví con lechuga y tomate.","en":"Beat the eggs. Cook over medium heat in the oil, add the cheese as the eggs set and fold the omelette. Serve with lettuce and tomato.","it":"Sbatti le uova. Cuocile a fuoco medio con l’olio, aggiungi il formaggio quando si rapprendono e piega l’omelette. Servi con lattuga e pomodoro."}', null, '[]', true),
  ('94170000-0000-4000-8000-000000000003', 'light', 20, 2, '{"es":"Revuelto de zapallitos con huevo","en":"Round summer squash and egg scramble","it":"Zucchine tonde strapazzate con uova"}', '{"es":"Salteá la cebolla y los zapallitos cortados hasta que estén tiernos y se evapore el exceso de líquido. Sumá los huevos batidos y revolvé hasta que cuajen.","en":"Sauté the onion and chopped round summer squash until tender and the excess liquid has evaporated. Add the beaten eggs and stir until set.","it":"Salta la cipolla e le zucchine tonde a pezzi finché sono tenere e il liquido in eccesso è evaporato. Versa le uova sbattute e mescola finché si rapprendono."}', null, '[]', true),
  ('94170000-0000-4000-8000-000000000004', 'medium', 25, 2, '{"es":"Ensalada fría de arroz con atún y verduras","en":"Cold rice salad with tuna and vegetables","it":"Insalata fredda di riso con tonno e verdure"}', '{"es":"Enfriá rápido el arroz cocido en la heladera. Mezclalo con el atún escurrido o la proteína cocida que elijas, las verduras y los agregados. Aliñá con aceite y serví fría.","en":"Chill the cooked rice promptly in the fridge. Mix it with drained tuna or your choice of cooked protein, the vegetables and any extras. Dress with oil and serve chilled.","it":"Raffredda subito in frigorifero il riso cotto. Unisci il tonno sgocciolato o la proteina cotta che preferisci, le verdure e gli extra. Condisci con olio e servi fredda."}', null, '[]', true),
  ('94170000-0000-4000-8000-000000000005', 'medium', 40, 1, '{"es":"Milanesa de merluza con cabutiá al horno","en":"Breaded hake with roasted kabocha","it":"Merluzzo impanato con zucca cabotiá al forno"}', '{"es":"Horneá la pulpa de cabutiá en gajos hasta que esté tierna. Pasá el filete por huevo y pan rallado, pincelalo con aceite y hornealo en otra bandeja hasta que esté cocido y dorado. Las cantidades del rebozado corresponden a lo que queda adherido.","en":"Roast the kabocha flesh in wedges until tender. Dip the fillet in egg and breadcrumbs, brush with oil and bake on a separate tray until cooked through and golden. The coating amounts reflect what sticks to the fish.","it":"Arrostisci a spicchi la polpa della zucca cabotiá finché è tenera. Passa il filetto nell’uovo e nel pangrattato, spennellalo con olio e cuocilo su una teglia separata finché è cotto e dorato. Le quantità della panatura si riferiscono a quella che aderisce al pesce."}', null, '[]', true),
  ('94170000-0000-4000-8000-000000000006', 'medium', 50, 3, '{"es":"Tarta de verduras","en":"Savory vegetable tart","it":"Torta salata alle verdure"}', '{"es":"Salteá el zucchini, la zanahoria y la cebolla. Escurrí el relleno, mezclalo con huevo batido y queso si lo usás, y volcá sobre la masa. Horneá a 190 °C hasta que el centro esté firme y la base dorada. Cortá en tres porciones.","en":"Sauté the zucchini, carrot and onion. Drain the filling, mix with beaten egg and cheese if using, and spoon into the crust. Bake at 190°C / 375°F until the center is set and the crust is golden. Cut into three servings.","it":"Salta zucchine, carote e cipolla. Scola il ripieno, uniscilo alle uova sbattute e al formaggio se lo usi, e versalo sulla sfoglia. Cuoci a 190 °C finché il centro è sodo e la base dorata. Dividi in tre porzioni."}', null, '[]', true),
  ('94170000-0000-4000-8000-000000000007', 'medium', 15, 1, '{"es":"Rapiditas con queso, palta y tomate","en":"Tortilla wraps with cheese, avocado and tomato","it":"Tortilla con formaggio, avocado e pomodoro"}', '{"es":"Entibiá las tortillas y rellenalas con queso, palta y tomate. Sumá cebolla si querés. Si elegís hongos, doralos primero. Si elegís jamón, agregalo en fetas. Enrollá y serví.","en":"Warm the tortillas and fill with cheese, avocado and tomato. Add onion if you like. If using mushrooms, brown them first. If using ham, add it in slices. Roll up and serve.","it":"Scalda le tortilla e farciscile con formaggio, avocado e pomodoro. Aggiungi cipolla a piacere. Se scegli i funghi, falli dorare prima. Se scegli il prosciutto, aggiungilo a fette. Arrotola e servi."}', null, '[]', true),
  ('94170000-0000-4000-8000-000000000008', 'hearty', 50, 3, '{"es":"Tarta de atún, morrón, cebolla, huevo y queso","en":"Tuna tart with bell pepper, onion, egg and cheese","it":"Torta salata con tonno, peperone, cipolla, uova e formaggio"}', '{"es":"Salteá morrón y cebolla. Mezclalos con el atún escurrido, huevo batido y queso. Armá la tarta con base y tapa, y horneá a 190 °C hasta que esté dorada y el relleno firme. Dividí en tres porciones.","en":"Sauté the bell pepper and onion. Mix with drained tuna, beaten egg and cheese. Assemble the pie with a bottom and top crust, then bake at 190°C / 375°F until golden and set. Divide into three servings.","it":"Salta peperone e cipolla. Mescola con il tonno sgocciolato, le uova sbattute e il formaggio. Chiudi la torta con due dischi di sfoglia e cuoci a 190 °C finché è dorata e il ripieno è sodo. Dividi in tre porzioni."}', null, '[]', true),
  ('94170000-0000-4000-8000-000000000009', 'hearty', 25, 1, '{"es":"Bife de chorizo con zanahoria rallada y huevo","en":"Strip steak with grated carrot and hard-boiled egg","it":"Controfiletto con carota grattugiata e uovo sodo"}', '{"es":"Cociná el bife a la plancha y dejalo reposar. Rallá la zanahoria, cortá el huevo duro y serví junto al bife con un poco de aceite.","en":"Griddle the steak and let it rest. Grate the carrot, cut the hard-boiled egg and serve alongside the steak with a little oil.","it":"Cuoci il controfiletto alla piastra e lascialo riposare. Grattugia la carota, taglia l’uovo sodo e servili accanto alla carne con un filo d’olio."}', null, '[]', true),
  ('94170000-0000-4000-8000-000000000010', 'hearty', 25, 1, '{"es":"Fideos con manteca y queso rallado","en":"Pasta with butter and grated cheese","it":"Pasta al burro e formaggio grattugiato"}', '{"es":"Herví los fideos, escurrilos y mezclalos con manteca y queso rallado. Para la variante de salsa, salteá cebolla y ajo en aceite, agregá los tomates perita y cociná a fuego suave hasta espesar. Mezclá con los fideos.","en":"Boil and drain the pasta, then toss it with butter and grated cheese. For the sauce variation, sauté the onion and garlic in oil, add the plum tomatoes and simmer until thickened. Toss with the pasta.","it":"Lessa e scola la pasta, poi condiscila con burro e formaggio grattugiato. Per la variante al sugo, soffriggi cipolla e aglio nell’olio, aggiungi i pomodori pelati e lascia addensare a fuoco dolce. Condisci la pasta."}', null, '[{"names":{"es":"Fideos con salsa casera de tomate","en":"Pasta with homemade tomato sauce","it":"Pasta al sugo di pomodoro fatto in casa"},"choices":{"2":"omit","3":"omit","4":"default","5":"default","6":"default","7":"default"}}]', true),
  ('94170000-0000-4000-8000-000000000011', 'hearty', 60, 2, '{"es":"Pollo al horno con papa, batata, cebolla y morrón","en":"Roast chicken with potato, sweet potato, onion and pepper","it":"Pollo al forno con patate, patate dolci, cipolla e peperone"}', '{"es":"Cortá las verduras que elijas y acomodalas con el pollo en una asadera. Agregá el aceite y horneá a 200 °C hasta que el pollo esté bien cocido y las verduras tiernas. La cantidad de pollo corresponde a carne y piel sin hueso.","en":"Chop your choice of vegetables and arrange them with the chicken on a roasting tray. Add oil and roast at 200°C / 400°F until the chicken is cooked through and the vegetables are tender. The chicken amount refers to meat and skin without bone.","it":"Taglia le verdure che preferisci e disponile con il pollo in una teglia. Aggiungi l’olio e cuoci a 200 °C fino a cottura del pollo e finché le verdure sono tenere. La quantità di pollo si riferisce a carne e pelle senza ossa."}', null, '[]', true),
  ('94170000-0000-4000-8000-000000000012', 'extraHearty', 5, 1, '{"es":"Pizza de muzzarella comprada","en":"Takeaway mozzarella pizza","it":"Pizza alla mozzarella da asporto"}', '{"es":"Elegí cuántas porciones comiste. La referencia equivale a una porción de pizza grande de masa fina.","en":"Choose how many slices you ate. The reference is one slice from a large thin-crust pizza.","it":"Indica quante fette hai mangiato. Il riferimento è una fetta di pizza grande a impasto sottile."}', 'slice', '[]', true),
  ('94170000-0000-4000-8000-000000000013', 'extraHearty', 5, 1, '{"es":"Hamburguesa completa con queso","en":"Fast-food cheeseburger","it":"Cheeseburger completo"}', '{"es":"Elegí cuántas hamburguesas comiste. La referencia es una hamburguesa mediana de comida rápida con queso, sin papas ni bebida.","en":"Choose how many burgers you ate. The reference is a medium fast-food cheeseburger. Sides and drinks are counted separately.","it":"Indica quanti hamburger hai mangiato. Il riferimento è un cheeseburger medio da fast food. Patatine e bevande si contano a parte."}', 'unit', '[]', true),
  ('94170000-0000-4000-8000-000000000014', 'extraHearty', 45, 1, '{"es":"Milanesa napolitana con papas","en":"Breaded steak with tomato, ham, mozzarella and potatoes","it":"Cotoletta alla napoletana con patate"}', '{"es":"Cortá las papas y hornealas con parte del aceite. Pasá la carne por huevo y pan rallado, pincelá con el resto del aceite y horneá hasta dorar. Cubrí con tomate triturado, jamón y muzzarella y gratiná. El peso del rebozado es el que queda adherido.","en":"Cut the potatoes and roast with some of the oil. Dip the steak in egg and breadcrumbs, brush with the remaining oil and bake until golden. Top with crushed tomato, ham and mozzarella, then broil to melt the cheese. The coating amounts reflect what sticks to the steak.","it":"Taglia le patate e cuocile al forno con parte dell’olio. Passa la carne nell’uovo e nel pangrattato, spennella con l’olio rimasto e cuoci fino a doratura. Copri con pomodoro schiacciato, prosciutto e mozzarella e fai gratinare. Le quantità della panatura si riferiscono a quella che aderisce alla carne."}', null, '[]', true)
on conflict (id) do nothing;

insert into public.recipe_ingredients
  (recipe_id, food_id, position, is_main, grams, food_reference_id, is_optional, optional_default, adjustable_quantity)
select recipe_id::uuid, r.food_id, position, position = 1, grams, r.id, optional, default_on, adjustable
from (values
  ('94170000-0000-4000-8000-000000000001', 1, 'chicken-breast-cooked', 86, false, false, false),
  ('94170000-0000-4000-8000-000000000001', 2, 'arugula-raw', 35, true, true, false),
  ('94170000-0000-4000-8000-000000000001', 3, 'tomato-raw', 90, true, true, false),
  ('94170000-0000-4000-8000-000000000001', 4, 'onion-raw', 25, true, true, false),
  ('94170000-0000-4000-8000-000000000001', 5, 'olive-oil-prepared', 7, true, true, false),
  ('94170000-0000-4000-8000-000000000002', 1, 'egg-raw', 100, false, false, false),
  ('94170000-0000-4000-8000-000000000002', 2, 'queso-cremoso-ricrem', 30, false, false, false),
  ('94170000-0000-4000-8000-000000000002', 3, 'olive-oil-prepared', 5, false, false, false),
  ('94170000-0000-4000-8000-000000000002', 4, 'lettuce-raw', 45, true, true, false),
  ('94170000-0000-4000-8000-000000000002', 5, 'tomato-raw', 90, true, true, false),
  ('94170000-0000-4000-8000-000000000003', 1, 'round-squash-raw', 300, false, false, false),
  ('94170000-0000-4000-8000-000000000003', 2, 'egg-raw', 100, false, false, false),
  ('94170000-0000-4000-8000-000000000003', 3, 'onion-raw', 60, false, false, false),
  ('94170000-0000-4000-8000-000000000003', 4, 'olive-oil-prepared', 7, false, false, false),
  ('94170000-0000-4000-8000-000000000004', 1, 'white-rice-cooked', 316, false, false, false),
  ('94170000-0000-4000-8000-000000000004', 2, 'tuna-prepared', 140, false, false, false),
  ('94170000-0000-4000-8000-000000000004', 3, 'tomato-raw', 140, true, true, false),
  ('94170000-0000-4000-8000-000000000004', 4, 'onion-raw', 40, true, true, false),
  ('94170000-0000-4000-8000-000000000004', 5, 'carrot-raw', 80, true, true, false),
  ('94170000-0000-4000-8000-000000000004', 6, 'egg-cooked', 50, true, false, false),
  ('94170000-0000-4000-8000-000000000004', 7, 'avocado-raw', 70, true, false, false),
  ('94170000-0000-4000-8000-000000000004', 8, 'sweet-corn-cooked', 80, true, false, false),
  ('94170000-0000-4000-8000-000000000004', 9, 'olive-oil-prepared', 13.5, true, true, false),
  ('94170000-0000-4000-8000-000000000005', 1, 'hake-vepez-raw', 150, false, false, false),
  ('94170000-0000-4000-8000-000000000005', 2, 'egg-raw', 20, false, false, false),
  ('94170000-0000-4000-8000-000000000005', 3, 'breadcrumbs-prepared', 25, false, false, false),
  ('94170000-0000-4000-8000-000000000005', 4, 'sunflower-oil-prepared', 7, false, false, false),
  ('94170000-0000-4000-8000-000000000005', 5, 'kabocha-raw', 205, true, true, false),
  ('94170000-0000-4000-8000-000000000006', 1, 'pie-crust-la-saltena', 120, false, false, false),
  ('94170000-0000-4000-8000-000000000006', 2, 'zucchini-raw', 220, false, false, false),
  ('94170000-0000-4000-8000-000000000006', 3, 'carrot-raw', 120, false, false, false),
  ('94170000-0000-4000-8000-000000000006', 4, 'onion-raw', 90, false, false, false),
  ('94170000-0000-4000-8000-000000000006', 5, 'egg-raw', 100, false, false, false),
  ('94170000-0000-4000-8000-000000000006', 6, 'queso-cremoso-ricrem', 90, true, true, false),
  ('94170000-0000-4000-8000-000000000006', 7, 'olive-oil-prepared', 10, false, false, false),
  ('94170000-0000-4000-8000-000000000007', 1, 'tortilla-wrap-wheat', 64, false, false, true),
  ('94170000-0000-4000-8000-000000000007', 2, 'queso-cremoso-ricrem', 45, false, false, false),
  ('94170000-0000-4000-8000-000000000007', 3, 'avocado-raw', 60, false, false, false),
  ('94170000-0000-4000-8000-000000000007', 4, 'tomato-raw', 70, false, false, false),
  ('94170000-0000-4000-8000-000000000007', 5, 'onion-raw', 20, true, false, false),
  ('94170000-0000-4000-8000-000000000007', 6, 'white-mushroom-cooked', 55, true, false, false),
  ('94170000-0000-4000-8000-000000000008', 1, 'pie-crust-la-saltena', 240, false, false, false),
  ('94170000-0000-4000-8000-000000000008', 2, 'tuna-prepared', 240, false, false, false),
  ('94170000-0000-4000-8000-000000000008', 3, 'red-pepper-raw', 120, false, false, false),
  ('94170000-0000-4000-8000-000000000008', 4, 'onion-raw', 90, false, false, false),
  ('94170000-0000-4000-8000-000000000008', 5, 'egg-raw', 100, false, false, false),
  ('94170000-0000-4000-8000-000000000008', 6, 'mozzarella-prepared', 105, false, false, false),
  ('94170000-0000-4000-8000-000000000008', 7, 'olive-oil-prepared', 13.5, false, false, false),
  ('94170000-0000-4000-8000-000000000009', 1, 'strip-steak-cooked', 180, false, false, false),
  ('94170000-0000-4000-8000-000000000009', 2, 'carrot-raw', 100, true, true, false),
  ('94170000-0000-4000-8000-000000000009', 3, 'egg-cooked', 50, true, true, false),
  ('94170000-0000-4000-8000-000000000009', 4, 'olive-oil-prepared', 7, true, true, false),
  ('94170000-0000-4000-8000-000000000010', 1, 'wheat-pasta-raw', 100, false, false, false),
  ('94170000-0000-4000-8000-000000000010', 2, 'butter-prepared', 15, true, true, false),
  ('94170000-0000-4000-8000-000000000010', 3, 'grated-hard-cheese-prepared', 20, true, true, false),
  ('94170000-0000-4000-8000-000000000010', 4, 'canned-plum-tomato-mutti', 160, true, false, false),
  ('94170000-0000-4000-8000-000000000010', 5, 'garlic-raw', 5, true, false, false),
  ('94170000-0000-4000-8000-000000000010', 6, 'onion-raw', 40, true, false, false),
  ('94170000-0000-4000-8000-000000000010', 7, 'olive-oil-prepared', 7, true, false, false),
  ('94170000-0000-4000-8000-000000000011', 1, 'roasting-chicken-raw', 400, false, false, false),
  ('94170000-0000-4000-8000-000000000011', 2, 'potato-raw', 250, true, true, false),
  ('94170000-0000-4000-8000-000000000011', 3, 'sweet-potato-raw', 200, true, true, false),
  ('94170000-0000-4000-8000-000000000011', 4, 'onion-raw', 100, true, true, false),
  ('94170000-0000-4000-8000-000000000011', 5, 'red-pepper-raw', 100, true, true, false),
  ('94170000-0000-4000-8000-000000000011', 6, 'olive-oil-prepared', 13.5, true, true, false),
  ('94170000-0000-4000-8000-000000000012', 1, 'pizza-slice-cheese-thin', 86, false, false, false),
  ('94170000-0000-4000-8000-000000000013', 1, 'burger-cheeseburger', 165, false, false, false),
  ('94170000-0000-4000-8000-000000000014', 1, 'lean-beef-raw', 150, false, false, false),
  ('94170000-0000-4000-8000-000000000014', 2, 'egg-raw', 25, false, false, false),
  ('94170000-0000-4000-8000-000000000014', 3, 'breadcrumbs-prepared', 30, false, false, false),
  ('94170000-0000-4000-8000-000000000014', 4, 'canned-plum-tomato-mutti', 65, false, false, false),
  ('94170000-0000-4000-8000-000000000014', 5, 'ham-sliced-prepared', 26, false, false, false),
  ('94170000-0000-4000-8000-000000000014', 6, 'mozzarella-prepared', 65, false, false, false),
  ('94170000-0000-4000-8000-000000000014', 7, 'potato-raw', 230, true, true, false),
  ('94170000-0000-4000-8000-000000000014', 8, 'sunflower-oil-prepared', 13.5, false, false, false)
) as seed(recipe_id, position, ref_id, grams, optional, default_on, adjustable)
left join public.food_references r on r.id = seed.ref_id and r.validation in ('verified', 'estimated')
on conflict (recipe_id, position) do nothing;

insert into public.recipe_ingredient_alternatives
  (recipe_id, ingredient_position, position, food_id, food_reference_id, grams)
select recipe_id::uuid, ingredient_position, position, r.food_id, r.id, grams
from (values
  ('94170000-0000-4000-8000-000000000002', 2, 1, 'mozzarella-prepared', 30),
  ('94170000-0000-4000-8000-000000000003', 1, 1, 'zucchini-raw', 300),
  ('94170000-0000-4000-8000-000000000004', 1, 1, 'brown-rice-cooked', 316),
  ('94170000-0000-4000-8000-000000000004', 2, 1, 'chicken-breast-cooked', 140),
  ('94170000-0000-4000-8000-000000000004', 2, 2, 'shrimp-cooked', 140),
  ('94170000-0000-4000-8000-000000000006', 5, 1, 'egg-raw', 150),
  ('94170000-0000-4000-8000-000000000006', 6, 1, 'mozzarella-prepared', 90),
  ('94170000-0000-4000-8000-000000000007', 1, 1, 'tortilla-wrap-corn', 52),
  ('94170000-0000-4000-8000-000000000007', 2, 1, 'mozzarella-prepared', 45),
  ('94170000-0000-4000-8000-000000000007', 6, 1, 'ham-sliced-prepared', 26)
) as seed(recipe_id, ingredient_position, position, ref_id, grams)
left join public.food_references r on r.id = seed.ref_id and r.validation in ('verified', 'estimated')
on conflict (recipe_id, ingredient_position, position) do nothing;
