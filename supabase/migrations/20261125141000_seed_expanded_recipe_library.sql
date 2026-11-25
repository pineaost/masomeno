-- Shared recipes reference the Stage A catalogue. Quantities describe the base recipe, before scaling.

insert into public.recipes (id, kind, intensity, preparation_minutes, base_servings, names, instructions, purchase_unit, published) values
  ('94170000-0000-4000-8000-000000000101', 'dish', 'medium', 25, 1,
    '{"es":"Salteado de pollo con verduras","en":"Chicken and vegetable stir-fry","it":"Pollo e verdure saltati"}', '{"es":"Dorá la pechuga y cortala en tiras. Salteá las verduras con el aceite, incorporá el pollo y agregá salsa de soja si querés.","en":"Cook the breast and slice it. Stir-fry the vegetables in the oil, add the chicken and finish with soy sauce if you like.","it":"Cuoci il petto e taglialo a strisce. Salta le verdure nell’olio, unisci il pollo e aggiungi salsa di soia a piacere."}', null, true),
  ('94170000-0000-4000-8000-000000000102', 'dish', 'hearty', 30, 1,
    '{"es":"Bife con puré de papas","en":"Steak with mashed potatoes","it":"Bistecca con purè di patate"}', '{"es":"Pisá las papas hervidas con leche y, si querés, manteca. Cociná el bife a la plancha y servilo con el puré. El peso del bife es cocido.","en":"Mash the boiled potatoes with milk and optional butter. Griddle the steak and serve it with the mash. The steak weight is cooked.","it":"Schiaccia le patate bollite con latte e, se vuoi, burro. Cuoci la bistecca alla piastra e servila con il purè. Il peso della carne è da cotta."}', null, true),
  ('94170000-0000-4000-8000-000000000103', 'dish', 'hearty', 55, 2,
    '{"es":"Colita de cuadril al horno con vegetales","en":"Roast tri-tip with vegetables","it":"Spinacino al forno con verdure"}', '{"es":"Horneá la colita junto con los vegetales cortados y el aceite. Dejá reposar la carne antes de cortarla. Las cantidades corresponden a ingredientes crudos.","en":"Roast the tri-tip with the chopped vegetables and oil. Rest the meat before slicing. Ingredient weights are raw.","it":"Cuoci lo spinacino al forno con le verdure a pezzi e l’olio. Lascia riposare la carne prima di affettarla. I pesi sono a crudo."}', null, true),
  ('94170000-0000-4000-8000-000000000104', 'dish', 'medium', 35, 1,
    '{"es":"Solomillo de cerdo con calabaza y chauchas","en":"Pork tenderloin with squash and green beans","it":"Filetto di maiale con zucca e fagiolini"}', '{"es":"Horneá el solomillo y la calabaza hasta que estén cocidos. Herví y escurrí las chauchas. Serví las verduras con el aceite.","en":"Roast the tenderloin and squash until cooked. Boil and drain the green beans. Dress the vegetables with the oil.","it":"Cuoci al forno il filetto e la zucca. Lessa e scola i fagiolini. Condisci le verdure con l’olio."}', null, true),
  ('94170000-0000-4000-8000-000000000105', 'dish', 'extraHearty', 100, 2,
    '{"es":"Bondiola al horno con papas","en":"Oven-braised pork shoulder with potatoes","it":"Coppa di maiale brasata al forno con patate"}', '{"es":"Cociná la bondiola tapada con la cebolla y un poco de agua hasta que quede tierna. Horneá las papas con el aceite y dividí todo en dos. Pesá la carne cocida sin hueso.","en":"Cover and oven-braise the pork with the onion and a little water until tender. Bake the potatoes with the oil and divide into two portions. Weigh the pork cooked and boneless.","it":"Brasa la coppa coperta con cipolla e poca acqua finché è tenera. Cuoci le patate al forno con l’olio e dividi in due. Pesa la carne cotta e disossata."}', null, true),
  ('94170000-0000-4000-8000-000000000106', 'dish', 'hearty', 25, 1,
    '{"es":"Hamburguesa casera","en":"Homemade beef burger","it":"Hamburger di manzo fatto in casa"}', '{"es":"Formá y cociná un medallón de carne. Servilo en el pan con tomate y lechuga. Sumá queso o mostaza si elegís esos agregados.","en":"Shape and cook a beef patty. Serve it in the bun with tomato and lettuce. Add cheese or mustard if selected.","it":"Forma e cuoci un hamburger di manzo. Servilo nel panino con pomodoro e lattuga. Aggiungi formaggio o senape se li hai scelti."}', null, true),
  ('94170000-0000-4000-8000-000000000107', 'dish', 'light', 25, 1,
    '{"es":"Merluza al horno con limón","en":"Baked hake with lemon","it":"Nasello al forno con limone"}', '{"es":"Poné el filete en una fuente con aceite y limón. Hornealo hasta que esté cocido. La referencia usa el peso del filete crudo.","en":"Set the fillet in a baking dish with oil and lemon juice. Bake until cooked through. Use the raw weight of the fish.","it":"Metti il filetto in una teglia con olio e succo di limone. Cuocilo al forno. Usa il peso del pesce crudo."}', null, true),
  ('94170000-0000-4000-8000-000000000108', 'dish', 'hearty', 35, 1,
    '{"es":"Salmón al horno con verduras","en":"Baked salmon with vegetables","it":"Salmone al forno con verdure"}', '{"es":"Horneá el salmón hasta que esté cocido. Cociná las verduras y aderezalas con el aceite. Agregá limón si querés. Pesá el salmón cocido.","en":"Bake the salmon until cooked. Cook the vegetables and dress them with the oil. Add lemon juice if you like. Weigh the salmon cooked.","it":"Cuoci il salmone al forno. Cuoci le verdure e condiscile con l’olio. Aggiungi limone a piacere. Pesa il salmone cotto."}', null, true),
  ('94170000-0000-4000-8000-000000000109', 'dish', 'medium', 20, 1,
    '{"es":"Salteado de langostinos con arroz","en":"Stir-fried prawns with rice","it":"Gamberi saltati con riso"}', '{"es":"Salteá el morrón y la cebolla, añadí los langostinos pelados y cocinalos por completo. Mezclá con arroz cocido y salsa de soja si la elegiste.","en":"Stir-fry the pepper and onion, add the peeled prawns and cook them through. Toss with cooked rice and optional soy sauce.","it":"Salta peperone e cipolla, unisci i gamberi sgusciati e cuocili completamente. Mescola con riso cotto e salsa di soia a piacere."}', null, true),
  ('94170000-0000-4000-8000-000000000110', 'dish', 'light', 20, 1,
    '{"es":"Pescado a la plancha con ensalada mixta","en":"Griddled fish with mixed salad","it":"Pesce alla piastra con insalata mista"}', '{"es":"Cociná el pescado a la plancha. Mezclá la lechuga, el tomate y la cebolla y aderezá con el aceite. Usá el peso cocido del pescado.","en":"Griddle the fish. Mix the lettuce, tomato and onion, then dress with the oil. Use the cooked weight of the fish.","it":"Cuoci il pesce alla piastra. Mescola lattuga, pomodoro e cipolla e condisci con l’olio. Usa il peso del pesce cotto."}', null, true),
  ('94170000-0000-4000-8000-000000000111', 'dish', 'hearty', 25, 1,
    '{"es":"Fideos con atún y tomate","en":"Pasta with tuna and tomato","it":"Pasta con tonno e pomodoro"}', '{"es":"Calentá la salsa con el aceite y, si querés, ajo. Sumá el atún escurrido y mezclá con los fideos ya cocidos.","en":"Heat the sauce with the oil and optional garlic. Add the drained tuna and toss with the cooked pasta.","it":"Scalda il sugo con l’olio e, se vuoi, l’aglio. Unisci il tonno sgocciolato e condisci la pasta cotta."}', null, true),
  ('94170000-0000-4000-8000-000000000112', 'dish', 'hearty', 30, 1,
    '{"es":"Arroz con pollo","en":"Chicken and rice","it":"Riso con pollo"}', '{"es":"Salteá cebolla y zanahoria. Sumá el pollo cocido en cubos, el arroz y las arvejas cocidas y mezclá al fuego hasta calentar todo.","en":"Sauté the onion and carrot. Add diced cooked chicken, rice and cooked peas and heat through.","it":"Salta cipolla e carota. Unisci pollo cotto a cubetti, riso e piselli cotti, mescola e scalda bene."}', null, true),
  ('94170000-0000-4000-8000-000000000113', 'dish', 'hearty', 40, 2,
    '{"es":"Guiso sencillo de lentejas","en":"Simple lentil stew","it":"Stufato semplice di lenticchie"}', '{"es":"Salteá cebolla y zanahoria. Agregá la papa en cubos, la salsa y agua. Cuando la papa esté tierna, incorporá las lentejas cocidas y calentá el guiso. Podés sumar bife cocido en trozos.","en":"Sauté the onion and carrot. Add diced potato, tomato sauce and water. Once tender, stir in the cooked lentils and heat through. Add pieces of cooked steak if you like.","it":"Salta cipolla e carota. Unisci patate a cubetti, passata e acqua. Quando le patate sono tenere, aggiungi le lenticchie cotte e scalda. A piacere aggiungi carne cotta a pezzi."}', null, true),
  ('94170000-0000-4000-8000-000000000114', 'dish', 'hearty', 25, 1,
    '{"es":"Ñoquis con salsa de tomate","en":"Gnocchi with tomato sauce","it":"Gnocchi al pomodoro"}', '{"es":"Calentá la salsa con el aceite. Herví los ñoquis según el envase y escurrilos. Mezclá y agregá queso rallado si querés.","en":"Heat the sauce with the oil. Cook and drain the gnocchi according to the package. Toss together and add grated cheese if you like.","it":"Scalda il sugo con l’olio. Lessa gli gnocchi seguendo le istruzioni e scolali. Condisci e aggiungi formaggio grattugiato a piacere."}', null, true),
  ('94170000-0000-4000-8000-000000000115', 'dish', 'hearty', 35, 2,
    '{"es":"Tortilla de papa","en":"Spanish potato omelette","it":"Tortilla di patate"}', '{"es":"Cortá las papas ya hervidas en rodajas. Dorá la cebolla si la usás. Mezclá con los huevos batidos y cociná la tortilla en el aceite hasta que el huevo cuaje por completo.","en":"Slice the boiled potatoes. Sauté the onion if using. Mix with the beaten eggs and cook the omelette in the oil until fully set.","it":"Affetta le patate bollite. Rosola la cipolla se la usi. Mescola con le uova sbattute e cuoci nell’olio fino a completa cottura."}', null, true),
  ('94170000-0000-4000-8000-000000000116', 'dish', 'medium', 20, 1,
    '{"es":"Rapiditas con pollo","en":"Chicken tortilla wraps","it":"Tortillas al pollo"}', '{"es":"Entibiá las tortillas. Rellenalas con pollo cocido, lechuga, tomate y yogur. Sumá queso si querés y enrollá.","en":"Warm the tortillas. Fill them with cooked chicken, lettuce, tomato and yogurt. Add cheese if you like and roll them up.","it":"Scalda le tortillas. Farcisci con pollo cotto, lattuga, pomodoro e yogurt. Aggiungi formaggio a piacere e arrotola."}', null, true),
  ('94170000-0000-4000-8000-000000000117', 'dish', 'hearty', 20, 1,
    '{"es":"Milanesa de soja con ensalada de garbanzos","en":"Breaded soy cutlet with chickpea salad","it":"Cotoletta di soia con insalata di ceci"}', '{"es":"Calentá la milanesa según el envase. Mezclá los garbanzos cocidos y escurridos con tomate, cebolla y el aceite. Si elegiste limón, sumalo al aderezo.","en":"Heat the cutlet as directed on the pack. Mix cooked, drained chickpeas with tomato, onion and oil. Add lemon juice if selected.","it":"Scalda la cotoletta seguendo la confezione. Mescola ceci cotti e scolati con pomodoro, cipolla e olio. Se vuoi, aggiungi succo di limone."}', null, true),
  ('94170000-0000-4000-8000-000000000118', 'dish', 'medium', 5, 1,
    '{"es":"Empanada de carne comprada","en":"Takeaway beef empanada","it":"Empanada di manzo da asporto"}', '{"es":"Elegí el relleno y la cantidad de empanadas. Carne y pollo usan una unidad grande de 130 g. Jamón y queso usa un ejemplo de 80 g. Ajustá los gramos si conocés el peso.","en":"Choose the filling and number of empanadas. Beef and chicken use a large 130 g example. Ham and cheese uses an 80 g example. Adjust the grams if you know the weight.","it":"Scegli il ripieno e il numero di empanadas. Manzo e pollo usano un esempio grande da 130 g. Prosciutto e formaggio usa un esempio da 80 g. Correggi i grammi se conosci il peso."}', 'unit', true),
  ('94170000-0000-4000-8000-000000000119', 'dish', 'light', 5, 1,
    '{"es":"Sushi, nigiri de salmón","en":"Sushi, salmon nigiri","it":"Sushi, nigiri al salmone"}', '{"es":"Elegí el tipo y registrá cuántas piezas comiste. Sumá otra preparación si combinaste tipos. El tamaño y el relleno pueden variar.","en":"Choose the type and enter how many pieces you ate. Add another preparation if you mixed types. Size and filling may vary.","it":"Scegli il tipo e indica quanti pezzi hai mangiato. Aggiungi un’altra preparazione se hai combinato tipi diversi. Dimensioni e ripieno possono variare."}', 'unit', true)
on conflict (id) do nothing;

insert into public.recipes (id, kind, intensity, preparation_minutes, base_servings, names, instructions, purchase_unit, published) values
  ('94170000-0000-4000-8000-000000000201', 'preparation', 'medium', 15, 1,
    '{"es":"Ensalada de lentejas","en":"Lentil salad","it":"Insalata di lenticchie"}', '{"es":"Mezclá las lentejas cocidas y escurridas con tomate y cebolla. Aderezá con aceite y, si querés, agregá huevo duro o limón.","en":"Mix cooked, drained lentils with tomato and onion. Dress with oil, and add hard-boiled egg or lemon if you like.","it":"Mescola le lenticchie cotte e scolate con pomodoro e cipolla. Condisci con olio e aggiungi a piacere uovo sodo o limone."}', null, true),
  ('94170000-0000-4000-8000-000000000202', 'preparation', 'medium', 25, 1,
    '{"es":"Ensalada de papa y huevo","en":"Potato and egg salad","it":"Insalata di patate e uova"}', '{"es":"Dejá enfriar la papa hervida y el huevo duro. Cortalos y mezclalos con el aceite. Agregá mayonesa si la elegiste.","en":"Cool the boiled potato and hard-boiled egg. Chop them and dress with the oil. Add mayonnaise if selected.","it":"Lascia raffreddare la patata lessa e l’uovo sodo. Taglia e condisci con l’olio. Aggiungi maionese a piacere."}', null, true),
  ('94170000-0000-4000-8000-000000000203', 'preparation', 'light', 10, 1,
    '{"es":"Ensalada de palta y tomate","en":"Avocado and tomato salad","it":"Insalata di avocado e pomodoro"}', '{"es":"Cortá la palta y el tomate. Mezclalos con jugo de limón y, si querés, cebolla picada.","en":"Dice the avocado and tomato. Toss with lemon juice and optional chopped onion.","it":"Taglia avocado e pomodoro. Mescola con succo di limone e, se vuoi, cipolla tritata."}', null, true),
  ('94170000-0000-4000-8000-000000000204', 'preparation', 'light', 45, 1,
    '{"es":"Papa al horno","en":"Baked potato","it":"Patata al forno"}', '{"es":"Horneá la papa lavada con piel hasta que esté tierna. Agregá aceite si lo elegiste. La porción base es una papa mediana cocida.","en":"Bake the scrubbed potato with its skin until tender. Add oil if selected. The base serving is one medium cooked potato.","it":"Cuoci al forno la patata lavata con la buccia finché è tenera. Aggiungi olio se lo hai scelto. La porzione base è una patata media cotta."}', null, true),
  ('94170000-0000-4000-8000-000000000205', 'preparation', 'light', 45, 1,
    '{"es":"Batata al horno","en":"Baked sweet potato","it":"Patata dolce al forno"}', '{"es":"Horneá la batata hasta que esté tierna y serví la pulpa. Agregá aceite si querés. Medí el peso cocido.","en":"Bake the sweet potato until tender and serve the flesh. Add oil if you like. Use the cooked weight.","it":"Cuoci la patata dolce al forno e servine la polpa. Aggiungi olio a piacere. Usa il peso da cotta."}', null, true),
  ('94170000-0000-4000-8000-000000000206', 'preparation', 'light', 25, 1,
    '{"es":"Puré de calabaza","en":"Mashed pumpkin","it":"Purè di zucca"}', '{"es":"Herví la calabaza pelada, escurrila bien y pisala. Agregá manteca si la elegiste. Pesá la pulpa cocida.","en":"Boil the peeled pumpkin, drain it well and mash. Add butter if selected. Weigh the cooked flesh.","it":"Lessa la zucca sbucciata, scolala bene e schiacciala. Aggiungi burro a piacere. Pesa la polpa cotta."}', null, true),
  ('94170000-0000-4000-8000-000000000207', 'preparation', 'light', 15, 1,
    '{"es":"Brócoli al vapor","en":"Steamed broccoli","it":"Broccoli al vapore"}', '{"es":"Separá los ramitos y cocinalos al vapor hasta que estén tiernos. El cálculo usa una taza de brócoli hervido como referencia comparable. Agregá aceite o limón si los usás.","en":"Steam the florets until tender. The estimate uses one cup of boiled broccoli as a comparable reference. Add oil or lemon if using.","it":"Cuoci le cimette al vapore finché sono tenere. La stima usa una tazza di broccoli bolliti come riferimento comparabile. Aggiungi olio o limone a piacere."}', null, true),
  ('94170000-0000-4000-8000-000000000208', 'preparation', 'light', 18, 1,
    '{"es":"Coliflor al vapor","en":"Steamed cauliflower","it":"Cavolfiore al vapore"}', '{"es":"Separá la coliflor en ramitos y cocinala al vapor. La estimación usa el peso cocido de la referencia hervida. Agregá aceite si lo usás.","en":"Steam the cauliflower florets until tender. The estimate uses the cooked weight from the boiled reference. Add oil if using.","it":"Cuoci le cimette di cavolfiore al vapore. La stima usa il peso cotto del riferimento bollito. Aggiungi olio a piacere."}', null, true),
  ('94170000-0000-4000-8000-000000000209', 'preparation', 'light', 35, 1,
    '{"es":"Alcauciles al vapor","en":"Steamed artichokes","it":"Carciofi al vapore"}', '{"es":"Cociná los alcauciles al vapor hasta que las hojas exteriores se desprendan fácilmente. Contá solo la parte comestible. El cálculo usa alcaucil hervido como referencia comparable.","en":"Steam until the outer leaves pull away easily. Count the edible portion. The estimate uses boiled artichoke as a comparable reference.","it":"Cuoci i carciofi al vapore finché le foglie esterne si staccano facilmente. Conta la parte commestibile. La stima usa il carciofo bollito come riferimento comparabile."}', null, true),
  ('94170000-0000-4000-8000-000000000210', 'preparation', 'light', 20, 1,
    '{"es":"Arroz blanco cocido","en":"Cooked white rice","it":"Riso bianco cotto"}', '{"es":"Cociná el arroz en agua y medilo ya cocido. Una porción base equivale a una taza.","en":"Cook the rice in water and measure it after cooking. The base serving is one cup.","it":"Cuoci il riso in acqua e misuralo da cotto. La porzione base è una tazza."}', null, true),
  ('94170000-0000-4000-8000-000000000211', 'preparation', 'light', 35, 1,
    '{"es":"Arroz integral cocido","en":"Cooked brown rice","it":"Riso integrale cotto"}', '{"es":"Cociná el arroz integral en agua hasta que esté tierno. Medí una taza de arroz cocido.","en":"Cook the brown rice in water until tender. Measure one cup of cooked rice.","it":"Cuoci il riso integrale in acqua finché è tenero. Misurane una tazza da cotto."}', null, true),
  ('94170000-0000-4000-8000-000000000212', 'preparation', 'medium', 25, 1,
    '{"es":"Arroz con verduras","en":"Vegetable rice","it":"Riso con verdure"}', '{"es":"Salteá la zanahoria y el morrón con el aceite. Agregá las arvejas y el arroz ya cocidos y mezclá.","en":"Sauté the carrot and pepper in oil. Stir in the cooked peas and rice.","it":"Salta carota e peperone nell’olio. Unisci i piselli e il riso già cotti e mescola."}', null, true),
  ('94170000-0000-4000-8000-000000000213', 'preparation', 'light', 15, 1,
    '{"es":"Polenta en agua","en":"Polenta cooked in water","it":"Polenta cotta in acqua"}', '{"es":"Cociná la polenta en agua según el envase. Serví la porción cocida. Sumá queso o manteca si los usaste.","en":"Cook the polenta in water according to its package. Serve the cooked portion. Add cheese or butter if using.","it":"Cuoci la polenta in acqua secondo la confezione. Servi la porzione cotta. Aggiungi formaggio o burro se li hai usati."}', null, true),
  ('94170000-0000-4000-8000-000000000214', 'preparation', 'medium', 20, 1,
    '{"es":"Fideos con aceite","en":"Pasta with olive oil","it":"Pasta all’olio"}', '{"es":"Herví los fideos y escurrilos. Mezclá con el aceite o elegí manteca para la otra variante. Medí los fideos ya cocidos.","en":"Boil and drain the pasta. Toss with olive oil, or choose butter for the other version. Measure the pasta cooked.","it":"Lessa e scola la pasta. Condiscila con olio oppure scegli il burro per l’altra variante. Misura la pasta cotta."}', null, true),
  ('94170000-0000-4000-8000-000000000215', 'preparation', 'light', 30, 1,
    '{"es":"Lentejas cocidas","en":"Cooked lentils","it":"Lenticchie cotte"}', '{"es":"Herví las lentejas hasta que estén tiernas y escurrilas. La porción base es media taza cocida.","en":"Boil the lentils until tender and drain them. The base serving is half a cup cooked.","it":"Lessa le lenticchie, scolale e misura mezza tazza da cotte per la porzione base."}', null, true),
  ('94170000-0000-4000-8000-000000000216', 'preparation', 'light', 60, 1,
    '{"es":"Garbanzos cocidos","en":"Cooked chickpeas","it":"Ceci cotti"}', '{"es":"Remojá los garbanzos secos antes de hervirlos o usá garbanzos al natural escurridos. Medí la porción después de cocinar y escurrir.","en":"Soak dried chickpeas before boiling, or use plain drained chickpeas. Weigh the portion after cooking and draining.","it":"Ammolla i ceci secchi prima della cottura oppure usa ceci al naturale sgocciolati. Pesa la porzione dopo la cottura e la scolatura."}', null, true)
on conflict (id) do nothing;

insert into public.recipes (id, kind, intensity, preparation_minutes, base_servings, names, instructions, purchase_unit, published) values
  ('94170000-0000-4000-8000-000000000301', 'snack', 'light', 10, 1,
    '{"es":"Café con leche y tostadas","en":"Coffee with milk and toast","it":"Caffellatte con pane tostato"}', '{"es":"Prepará el café con leche y tostá dos rebanadas. Agregá azúcar solo si la usás.","en":"Make coffee with milk and toast two slices of bread. Add sugar if using.","it":"Prepara il caffellatte e tosta due fette di pane. Aggiungi zucchero se lo usi."}', null, true),
  ('94170000-0000-4000-8000-000000000302', 'snack', 'light', 5, 1,
    '{"es":"Yogur con frutas","en":"Yogurt with fruit","it":"Yogurt con frutta"}', '{"es":"Serví el yogur con las frutillas cortadas. Sumá banana si elegís ese agregado.","en":"Serve the yogurt with sliced strawberries. Add banana if selected.","it":"Servi lo yogurt con fragole a pezzi. Aggiungi banana a piacere."}', null, true),
  ('94170000-0000-4000-8000-000000000303', 'snack', 'medium', 5, 1,
    '{"es":"Yogur con granola","en":"Yogurt with granola","it":"Yogurt con granola"}', '{"es":"Mezclá el yogur con la granola justo antes de comer. Sumá arándanos si querés.","en":"Stir the granola into the yogurt just before eating. Add blueberries if you like.","it":"Mescola la granola con lo yogurt appena prima di mangiare. Aggiungi mirtilli a piacere."}', null, true),
  ('94170000-0000-4000-8000-000000000304', 'snack', 'medium', 10, 1,
    '{"es":"Avena con banana","en":"Banana oatmeal","it":"Porridge d’avena con banana"}', '{"es":"Cociná los copos secos en agua o con la leche que elijas. Agregá la banana y, si querés, un poco de miel.","en":"Cook the dry oats with water or your chosen milk. Stir in banana and optional honey.","it":"Cuoci i fiocchi secchi in acqua o nel latte che preferisci. Aggiungi banana e, se vuoi, un po’ di miele."}', null, true),
  ('94170000-0000-4000-8000-000000000305', 'snack', 'light', 5, 1,
    '{"es":"Copos de maíz con leche","en":"Corn flakes with milk","it":"Fiocchi di mais con latte"}', '{"es":"Poné una taza de copos en un bol y agregá media taza de leche. Sumá un poco de banana si querés.","en":"Pour a cup of corn flakes into a bowl and add half a cup of milk. Add banana if you like.","it":"Versa una tazza di fiocchi di mais in una ciotola e aggiungi mezza tazza di latte. Aggiungi banana a piacere."}', null, true),
  ('94170000-0000-4000-8000-000000000306', 'snack', 'medium', 10, 1,
    '{"es":"Sándwich de jamón y queso","en":"Ham and cheese sandwich","it":"Panino con prosciutto e formaggio"}', '{"es":"Armá el sándwich con dos rebanadas, jamón cocido y queso. Sumá mostaza si la usás.","en":"Build the sandwich with two slices, cooked ham and cheese. Add mustard if using.","it":"Farcisci due fette di pane con prosciutto cotto e formaggio. Aggiungi senape se la usi."}', null, true),
  ('94170000-0000-4000-8000-000000000307', 'snack', 'light', 10, 1,
    '{"es":"Tostadas con mermelada","en":"Toast with jam","it":"Pane tostato con confettura"}', '{"es":"Tostá dos rebanadas y repartí una cucharada de mermelada. Sumá manteca si la usás.","en":"Toast two slices and spread a tablespoon of jam between them. Add butter if using.","it":"Tosta due fette e distribuisci un cucchiaio di confettura. Aggiungi burro se lo usi."}', null, true),
  ('94170000-0000-4000-8000-000000000308', 'snack', 'medium', 5, 1,
    '{"es":"Licuado de banana","en":"Banana smoothie","it":"Frullato di banana"}', '{"es":"Licuá una banana con una taza de leche. Si lo querés más dulce, agregá la miel elegida.","en":"Blend a banana with a cup of milk. Add honey if you want a sweeter smoothie.","it":"Frulla una banana con una tazza di latte. Aggiungi miele se desideri un frullato più dolce."}', null, true)
on conflict (id) do nothing;

insert into public.recipe_ingredients
  (recipe_id, position, food_id, food_reference_id, grams, is_main, is_optional, optional_default, adjustable_quantity)
select seed.recipe_id::uuid, seed.position, r.food_id, r.id, seed.grams, seed.main, seed.optional, seed.default_on, seed.adjustable
from (values
  ('94170000-0000-4000-8000-000000000101', 1, 'chicken-breast-cooked', 130, true, false, false, false),
  ('94170000-0000-4000-8000-000000000101', 2, 'zucchini-raw', 100, false, false, false, false),
  ('94170000-0000-4000-8000-000000000101', 3, 'red-pepper-raw', 75, false, false, false, false),
  ('94170000-0000-4000-8000-000000000101', 4, 'onion-raw', 45, false, false, false, false),
  ('94170000-0000-4000-8000-000000000101', 5, 'olive-oil-prepared', 10, false, false, false, false),
  ('94170000-0000-4000-8000-000000000101', 6, 'soy-sauce-prepared', 5, false, true, false, false),
  ('94170000-0000-4000-8000-000000000102', 1, 'beef-steak-cooked', 160, true, false, false, false),
  ('94170000-0000-4000-8000-000000000102', 2, 'potato-cooked', 180, false, false, false, false),
  ('94170000-0000-4000-8000-000000000102', 3, 'milk-whole-prepared', 30, false, false, false, false),
  ('94170000-0000-4000-8000-000000000102', 4, 'butter-prepared', 5, false, true, false, false),
  ('94170000-0000-4000-8000-000000000103', 1, 'tri-tip-raw', 350, true, false, false, false),
  ('94170000-0000-4000-8000-000000000103', 2, 'carrot-raw', 160, false, false, false, false),
  ('94170000-0000-4000-8000-000000000103', 3, 'onion-raw', 100, false, false, false, false),
  ('94170000-0000-4000-8000-000000000103', 4, 'butternut-raw', 260, false, false, false, false),
  ('94170000-0000-4000-8000-000000000103', 5, 'olive-oil-prepared', 14, false, false, false, false),
  ('94170000-0000-4000-8000-000000000104', 1, 'pork-tenderloin-cooked', 120, true, false, false, false),
  ('94170000-0000-4000-8000-000000000104', 2, 'butternut-cooked', 180, false, false, false, false),
  ('94170000-0000-4000-8000-000000000104', 3, 'green-beans-cooked', 100, false, false, false, false),
  ('94170000-0000-4000-8000-000000000104', 4, 'olive-oil-prepared', 7, false, false, false, false),
  ('94170000-0000-4000-8000-000000000105', 1, 'pork-shoulder-cooked', 320, true, false, false, false),
  ('94170000-0000-4000-8000-000000000105', 2, 'potato-baked', 346, false, false, false, false),
  ('94170000-0000-4000-8000-000000000105', 3, 'onion-raw', 100, false, false, false, false),
  ('94170000-0000-4000-8000-000000000105', 4, 'olive-oil-prepared', 14, false, false, false, false),
  ('94170000-0000-4000-8000-000000000106', 1, 'burger-patty-cooked', 105, true, false, false, false),
  ('94170000-0000-4000-8000-000000000106', 2, 'hamburger-bun-prepared', 60, false, false, false, false),
  ('94170000-0000-4000-8000-000000000106', 3, 'tomato-raw', 40, false, false, false, false),
  ('94170000-0000-4000-8000-000000000106', 4, 'lettuce-raw', 15, false, false, false, false),
  ('94170000-0000-4000-8000-000000000106', 5, 'mozzarella-prepared', 25, false, true, false, false),
  ('94170000-0000-4000-8000-000000000106', 6, 'mustard-prepared', 5, false, true, false, false),
  ('94170000-0000-4000-8000-000000000107', 1, 'hake-vepez-raw', 160, true, false, false, false),
  ('94170000-0000-4000-8000-000000000107', 2, 'lemon-juice-raw', 15.25, false, false, false, true),
  ('94170000-0000-4000-8000-000000000107', 3, 'olive-oil-prepared', 7, false, false, false, false),
  ('94170000-0000-4000-8000-000000000107', 4, 'oregano-prepared', 1, false, true, false, false),
  ('94170000-0000-4000-8000-000000000108', 1, 'salmon-cooked', 150, true, false, false, false),
  ('94170000-0000-4000-8000-000000000108', 2, 'asparagus-cooked', 100, false, false, false, false),
  ('94170000-0000-4000-8000-000000000108', 3, 'carrot-cooked', 100, false, false, false, false),
  ('94170000-0000-4000-8000-000000000108', 4, 'olive-oil-prepared', 7, false, false, false, false),
  ('94170000-0000-4000-8000-000000000108', 5, 'lemon-juice-raw', 10, false, true, false, false),
  ('94170000-0000-4000-8000-000000000109', 1, 'argentine-prawn-raw', 150, true, false, false, false),
  ('94170000-0000-4000-8000-000000000109', 2, 'white-rice-cooked', 158, false, false, false, true),
  ('94170000-0000-4000-8000-000000000109', 3, 'green-pepper-raw', 65, false, false, false, false),
  ('94170000-0000-4000-8000-000000000109', 4, 'onion-raw', 35, false, false, false, false),
  ('94170000-0000-4000-8000-000000000109', 5, 'olive-oil-prepared', 10, false, false, false, false),
  ('94170000-0000-4000-8000-000000000109', 6, 'soy-sauce-prepared', 7, false, true, false, false),
  ('94170000-0000-4000-8000-000000000110', 1, 'cod-cooked', 150, true, false, false, false),
  ('94170000-0000-4000-8000-000000000110', 2, 'lettuce-raw', 50, false, false, false, false),
  ('94170000-0000-4000-8000-000000000110', 3, 'tomato-raw', 120, false, false, false, false),
  ('94170000-0000-4000-8000-000000000110', 4, 'onion-raw', 30, false, false, false, false),
  ('94170000-0000-4000-8000-000000000110', 5, 'olive-oil-prepared', 7, false, false, false, false),
  ('94170000-0000-4000-8000-000000000111', 1, 'wheat-pasta-cooked', 175, true, false, false, false),
  ('94170000-0000-4000-8000-000000000111', 2, 'tuna-prepared', 90, false, false, false, false),
  ('94170000-0000-4000-8000-000000000111', 3, 'tomato-sauce-prepared', 100, false, false, false, false),
  ('94170000-0000-4000-8000-000000000111', 4, 'olive-oil-prepared', 7, false, false, false, false),
  ('94170000-0000-4000-8000-000000000111', 5, 'garlic-raw', 3, false, true, false, false),
  ('94170000-0000-4000-8000-000000000112', 1, 'white-rice-cooked', 158, true, false, false, true),
  ('94170000-0000-4000-8000-000000000112', 2, 'chicken-breast-cooked', 120, false, false, false, false),
  ('94170000-0000-4000-8000-000000000112', 3, 'carrot-raw', 65, false, false, false, false),
  ('94170000-0000-4000-8000-000000000112', 4, 'green-peas-cooked', 60, false, false, false, false),
  ('94170000-0000-4000-8000-000000000112', 5, 'onion-raw', 40, false, false, false, false),
  ('94170000-0000-4000-8000-000000000112', 6, 'olive-oil-prepared', 7, false, false, false, false),
  ('94170000-0000-4000-8000-000000000113', 1, 'lentils-cooked', 396, true, false, false, false),
  ('94170000-0000-4000-8000-000000000113', 2, 'potato-raw', 200, false, false, false, false),
  ('94170000-0000-4000-8000-000000000113', 3, 'carrot-raw', 100, false, false, false, false),
  ('94170000-0000-4000-8000-000000000113', 4, 'onion-raw', 80, false, false, false, false),
  ('94170000-0000-4000-8000-000000000113', 5, 'tomato-sauce-prepared', 160, false, false, false, false),
  ('94170000-0000-4000-8000-000000000113', 6, 'olive-oil-prepared', 14, false, false, false, false),
  ('94170000-0000-4000-8000-000000000113', 7, 'beef-steak-cooked', 120, false, true, false, false),
  ('94170000-0000-4000-8000-000000000114', 1, 'potato-gnocchi-cooked', 200, true, false, false, true),
  ('94170000-0000-4000-8000-000000000114', 2, 'tomato-sauce-prepared', 110, false, false, false, false),
  ('94170000-0000-4000-8000-000000000114', 3, 'olive-oil-prepared', 7, false, false, false, false),
  ('94170000-0000-4000-8000-000000000114', 4, 'grated-hard-cheese-prepared', 10, false, true, false, false),
  ('94170000-0000-4000-8000-000000000115', 1, 'potato-cooked', 340, true, false, false, false),
  ('94170000-0000-4000-8000-000000000115', 2, 'egg-raw', 150, false, false, false, true),
  ('94170000-0000-4000-8000-000000000115', 3, 'olive-oil-prepared', 14, false, false, false, false),
  ('94170000-0000-4000-8000-000000000115', 4, 'onion-raw', 70, false, true, false, false),
  ('94170000-0000-4000-8000-000000000116', 1, 'tortilla-wrap-wheat', 52, true, false, false, true),
  ('94170000-0000-4000-8000-000000000116', 2, 'chicken-breast-cooked', 100, false, false, false, false),
  ('94170000-0000-4000-8000-000000000116', 3, 'lettuce-raw', 35, false, false, false, false),
  ('94170000-0000-4000-8000-000000000116', 4, 'tomato-raw', 60, false, false, false, false),
  ('94170000-0000-4000-8000-000000000116', 5, 'yogurt-prepared', 25, false, false, false, false),
  ('94170000-0000-4000-8000-000000000116', 6, 'semi-hard-cheese-prepared', 20, false, true, false, false),
  ('94170000-0000-4000-8000-000000000117', 1, 'soy-cutlet-granja-del-sol', 82.5, true, false, false, true),
  ('94170000-0000-4000-8000-000000000117', 2, 'chickpeas-cooked', 100, false, false, false, false),
  ('94170000-0000-4000-8000-000000000117', 3, 'tomato-raw', 90, false, false, false, false),
  ('94170000-0000-4000-8000-000000000117', 4, 'onion-raw', 25, false, false, false, false),
  ('94170000-0000-4000-8000-000000000117', 5, 'olive-oil-prepared', 7, false, false, false, false),
  ('94170000-0000-4000-8000-000000000117', 6, 'lemon-juice-raw', 10, false, true, false, false),
  ('94170000-0000-4000-8000-000000000118', 1, 'empanada-beef-prepared', 130, true, false, false, false),
  ('94170000-0000-4000-8000-000000000119', 1, 'sushi-nigiri-salmon', 35, true, false, false, false),
  ('94170000-0000-4000-8000-000000000201', 1, 'lentils-cooked', 99, true, false, false, true),
  ('94170000-0000-4000-8000-000000000201', 2, 'tomato-raw', 120, false, false, false, false),
  ('94170000-0000-4000-8000-000000000201', 3, 'egg-cooked', 50, false, true, false, true),
  ('94170000-0000-4000-8000-000000000201', 4, 'onion-raw', 25, false, false, false, false),
  ('94170000-0000-4000-8000-000000000201', 5, 'olive-oil-prepared', 7, false, false, false, false),
  ('94170000-0000-4000-8000-000000000201', 6, 'lemon-juice-raw', 10, false, true, false, false),
  ('94170000-0000-4000-8000-000000000202', 1, 'potato-cooked', 170, true, false, false, false),
  ('94170000-0000-4000-8000-000000000202', 2, 'egg-cooked', 50, false, false, false, true),
  ('94170000-0000-4000-8000-000000000202', 3, 'olive-oil-prepared', 7, false, false, false, false),
  ('94170000-0000-4000-8000-000000000202', 4, 'mayonnaise-prepared', 14, false, true, false, false),
  ('94170000-0000-4000-8000-000000000203', 1, 'avocado-raw', 65, true, false, false, false),
  ('94170000-0000-4000-8000-000000000203', 2, 'tomato-raw', 123, false, false, false, true),
  ('94170000-0000-4000-8000-000000000203', 3, 'lemon-juice-raw', 12, false, false, false, false),
  ('94170000-0000-4000-8000-000000000203', 4, 'onion-raw', 20, false, true, false, false),
  ('94170000-0000-4000-8000-000000000204', 1, 'potato-baked', 173, true, false, false, true),
  ('94170000-0000-4000-8000-000000000204', 2, 'olive-oil-prepared', 7, false, true, false, false),
  ('94170000-0000-4000-8000-000000000205', 1, 'sweet-potato-cooked', 150, true, false, false, false),
  ('94170000-0000-4000-8000-000000000205', 2, 'olive-oil-prepared', 7, false, true, false, false),
  ('94170000-0000-4000-8000-000000000206', 1, 'pumpkin-cooked', 200, true, false, false, false),
  ('94170000-0000-4000-8000-000000000206', 2, 'butter-prepared', 5, false, true, false, false),
  ('94170000-0000-4000-8000-000000000207', 1, 'broccoli-cooked', 156, true, false, false, true),
  ('94170000-0000-4000-8000-000000000207', 2, 'olive-oil-prepared', 7, false, true, false, false),
  ('94170000-0000-4000-8000-000000000207', 3, 'lemon-juice-raw', 10, false, true, false, false),
  ('94170000-0000-4000-8000-000000000208', 1, 'cauliflower-cooked', 150, true, false, false, false),
  ('94170000-0000-4000-8000-000000000208', 2, 'olive-oil-prepared', 7, false, true, false, false),
  ('94170000-0000-4000-8000-000000000209', 1, 'artichoke-cooked', 100, true, false, false, false),
  ('94170000-0000-4000-8000-000000000209', 2, 'lemon-juice-raw', 12, false, true, false, false),
  ('94170000-0000-4000-8000-000000000209', 3, 'olive-oil-prepared', 7, false, true, false, false),
  ('94170000-0000-4000-8000-000000000210', 1, 'white-rice-cooked', 158, true, false, false, true),
  ('94170000-0000-4000-8000-000000000211', 1, 'brown-rice-cooked', 202, true, false, false, true),
  ('94170000-0000-4000-8000-000000000212', 1, 'white-rice-cooked', 158, true, false, false, true),
  ('94170000-0000-4000-8000-000000000212', 2, 'carrot-raw', 65, false, false, false, false),
  ('94170000-0000-4000-8000-000000000212', 3, 'green-peas-cooked', 60, false, false, false, false),
  ('94170000-0000-4000-8000-000000000212', 4, 'red-pepper-raw', 70, false, false, false, false),
  ('94170000-0000-4000-8000-000000000212', 5, 'olive-oil-prepared', 7, false, false, false, false),
  ('94170000-0000-4000-8000-000000000213', 1, 'polenta-cooked', 200, true, false, false, true),
  ('94170000-0000-4000-8000-000000000213', 2, 'grated-hard-cheese-prepared', 10, false, true, false, false),
  ('94170000-0000-4000-8000-000000000213', 3, 'butter-prepared', 5, false, true, false, false),
  ('94170000-0000-4000-8000-000000000214', 1, 'wheat-pasta-cooked', 175, true, false, false, false),
  ('94170000-0000-4000-8000-000000000214', 2, 'olive-oil-prepared', 7, false, false, false, false),
  ('94170000-0000-4000-8000-000000000215', 1, 'lentils-cooked', 99, true, false, false, true),
  ('94170000-0000-4000-8000-000000000216', 1, 'chickpeas-cooked', 82, true, false, false, true),
  ('94170000-0000-4000-8000-000000000301', 1, 'coffee-with-milk-prepared', 240, true, false, false, true),
  ('94170000-0000-4000-8000-000000000301', 2, 'white-bread-prepared-toasted', 44, false, false, false, true),
  ('94170000-0000-4000-8000-000000000301', 3, 'sugar-prepared', 4.2, false, true, false, true),
  ('94170000-0000-4000-8000-000000000302', 1, 'yogurt-prepared', 170, true, false, false, false),
  ('94170000-0000-4000-8000-000000000302', 2, 'strawberry-raw', 90, false, false, false, false),
  ('94170000-0000-4000-8000-000000000302', 3, 'banana-raw', 59, false, true, false, false),
  ('94170000-0000-4000-8000-000000000303', 1, 'yogurt-prepared', 170, true, false, false, false),
  ('94170000-0000-4000-8000-000000000303', 2, 'granola-prepared', 30, false, false, false, false),
  ('94170000-0000-4000-8000-000000000303', 3, 'blueberry-raw', 40, false, true, false, false),
  ('94170000-0000-4000-8000-000000000304', 1, 'oats-raw', 40, true, false, false, false),
  ('94170000-0000-4000-8000-000000000304', 2, 'banana-raw', 118, false, false, false, true),
  ('94170000-0000-4000-8000-000000000304', 3, 'milk-whole-prepared', 120, false, true, false, false),
  ('94170000-0000-4000-8000-000000000304', 4, 'honey-prepared', 7, false, true, false, false),
  ('94170000-0000-4000-8000-000000000305', 1, 'corn-flakes-prepared', 30, true, false, false, true),
  ('94170000-0000-4000-8000-000000000305', 2, 'milk-whole-prepared', 122, false, false, false, true),
  ('94170000-0000-4000-8000-000000000305', 3, 'banana-raw', 59, false, true, false, false),
  ('94170000-0000-4000-8000-000000000306', 1, 'white-bread-prepared-sliced', 58, true, false, false, true),
  ('94170000-0000-4000-8000-000000000306', 2, 'ham-sliced-prepared', 26, false, false, false, true),
  ('94170000-0000-4000-8000-000000000306', 3, 'port-salut-prepared', 30, false, false, false, true),
  ('94170000-0000-4000-8000-000000000306', 4, 'mustard-prepared', 5, false, true, false, false),
  ('94170000-0000-4000-8000-000000000307', 1, 'white-bread-prepared-toasted', 44, true, false, false, true),
  ('94170000-0000-4000-8000-000000000307', 2, 'jam-prepared', 20, false, false, false, true),
  ('94170000-0000-4000-8000-000000000307', 3, 'butter-prepared', 5, false, true, false, false),
  ('94170000-0000-4000-8000-000000000308', 1, 'banana-raw', 118, true, false, false, true),
  ('94170000-0000-4000-8000-000000000308', 2, 'milk-whole-prepared', 244, false, false, false, true),
  ('94170000-0000-4000-8000-000000000308', 3, 'honey-prepared', 7, false, true, false, false)
) as seed(recipe_id, position, reference_id, grams, main, optional, default_on, adjustable)
left join public.food_references r on r.id = seed.reference_id and r.validation in ('verified', 'estimated')
on conflict (recipe_id, position) do nothing;

insert into public.recipe_ingredient_alternatives (recipe_id, ingredient_position, position, food_id, food_reference_id, grams)
select seed.recipe_id::uuid, seed.ingredient_position, seed.position, r.food_id, r.id, seed.grams
from (values
  ('94170000-0000-4000-8000-000000000012', 1, 1, 'pizza-slice-pepperoni-thin', 91),
  ('94170000-0000-4000-8000-000000000016', 2, 1, 'cream-cheese-prepared', 14.5),
  ('94170000-0000-4000-8000-000000000101', 3, 1, 'green-pepper-raw', 75),
  ('94170000-0000-4000-8000-000000000102', 1, 1, 'strip-steak-cooked', 160),
  ('94170000-0000-4000-8000-000000000102', 3, 1, 'milk-low-fat-prepared', 30),
  ('94170000-0000-4000-8000-000000000106', 5, 1, 'port-salut-prepared', 25),
  ('94170000-0000-4000-8000-000000000108', 1, 1, 'trout-cooked', 150),
  ('94170000-0000-4000-8000-000000000109', 2, 1, 'brown-rice-cooked', 158),
  ('94170000-0000-4000-8000-000000000112', 1, 1, 'brown-rice-cooked', 158),
  ('94170000-0000-4000-8000-000000000116', 1, 1, 'tortilla-wrap-corn', 52),
  ('94170000-0000-4000-8000-000000000116', 6, 1, 'mozzarella-prepared', 20),
  ('94170000-0000-4000-8000-000000000118', 1, 1, 'empanada-chicken-prepared', 130),
  ('94170000-0000-4000-8000-000000000118', 1, 2, 'empanada-ham-cheese-prepared', 80),
  ('94170000-0000-4000-8000-000000000119', 1, 1, 'sushi-roll-california', 30),
  ('94170000-0000-4000-8000-000000000119', 1, 2, 'sushi-roll-tuna', 30),
  ('94170000-0000-4000-8000-000000000201', 1, 1, 'chickpeas-cooked', 99),
  ('94170000-0000-4000-8000-000000000212', 1, 1, 'brown-rice-cooked', 158),
  ('94170000-0000-4000-8000-000000000214', 2, 1, 'butter-prepared', 7),
  ('94170000-0000-4000-8000-000000000302', 1, 1, 'yogurt-greek-prepared-nonfat', 170),
  ('94170000-0000-4000-8000-000000000302', 2, 1, 'blueberry-raw', 90),
  ('94170000-0000-4000-8000-000000000303', 1, 1, 'yogurt-greek-prepared-whole', 170),
  ('94170000-0000-4000-8000-000000000304', 3, 1, 'milk-skim-prepared', 120),
  ('94170000-0000-4000-8000-000000000305', 2, 1, 'milk-skim-prepared', 122),
  ('94170000-0000-4000-8000-000000000306', 1, 1, 'whole-wheat-bread-prepared', 56),
  ('94170000-0000-4000-8000-000000000308', 2, 1, 'milk-low-fat-prepared', 244)
) as seed(recipe_id, ingredient_position, position, ref_id, grams)
left join public.food_references r on r.id = seed.ref_id and r.validation in ('verified', 'estimated')
on conflict (recipe_id, ingredient_position, position) do nothing;

-- Add named choices without changing defaults or existing published recipe quantities.
with variants(recipe_id, entry) as (values
  ('94170000-0000-4000-8000-000000000012', '{"names":{"es":"Pizza con pepperoni comprada","en":"Takeaway pepperoni pizza","it":"Pizza al salame piccante da asporto"},"choices":{"1":1}}'),
  ('94170000-0000-4000-8000-000000000016', '{"names":{"es":"Tostada con queso untable","en":"Cream cheese toast","it":"Toast con formaggio spalmabile"},"choices":{"2":1},"instructions":{"es":"Tostá una rebanada y cubrila con una cucharada de queso untable.","en":"Toast a slice of bread and spread it with a tablespoon of cream cheese.","it":"Tosta una fetta di pane e spalmala con un cucchiaio di formaggio spalmabile."}}'),
  ('94170000-0000-4000-8000-000000000118', '{"names":{"es":"Empanada de pollo comprada","en":"Takeaway chicken empanada","it":"Empanada di pollo da asporto"},"choices":{"1":1}}'),
  ('94170000-0000-4000-8000-000000000118', '{"names":{"es":"Empanada de jamón y queso comprada","en":"Takeaway ham and cheese empanada","it":"Empanada di prosciutto e formaggio da asporto"},"choices":{"1":2}}'),
  ('94170000-0000-4000-8000-000000000119', '{"names":{"es":"Sushi, California roll","en":"Sushi, California roll","it":"Sushi, California roll"},"choices":{"1":1}}'),
  ('94170000-0000-4000-8000-000000000119', '{"names":{"es":"Sushi, roll de atún","en":"Sushi, tuna roll","it":"Sushi, roll al tonno"},"choices":{"1":2}}'),
  ('94170000-0000-4000-8000-000000000214', '{"names":{"es":"Fideos con manteca","en":"Pasta with butter","it":"Pasta al burro"},"choices":{"2":1}}')
)
update public.recipes r set variants = r.variants || (
  select coalesce(jsonb_agg(v.entry::jsonb order by v.entry::jsonb->'choices'), '[]')
  from variants v
  where v.recipe_id::uuid = r.id and not exists (
    select 1 from jsonb_array_elements(r.variants) as current(entry)
    where current.entry->'names' = v.entry::jsonb->'names'
  )
)
where r.id in (select recipe_id::uuid from variants);

-- Reuse the parent ingredient positions, including their optional choices.
with parts(recipe_id, entry) as (values
  ('94170000-0000-4000-8000-000000000001', '{"id":"chicken-breast","intensity":"light","minutes":15,"instructions":{"es":"Cociná la pechuga a la plancha hasta que esté bien cocida. Medí la porción cocida, sin piel ni hueso.","en":"Griddle the breast until cooked through. Measure the cooked portion without skin or bone.","it":"Cuoci il petto alla piastra. Misura la porzione cotta, senza pelle né ossa."}}'),
  ('94170000-0000-4000-8000-000000000001', '{"id":"arugula-salad","intensity":"light","minutes":10,"instructions":{"es":"Mezclá rúcula lavada, tomate y cebolla. Aderezá con aceite si lo usás.","en":"Toss washed arugula, tomato and onion. Add oil if using.","it":"Mescola rucola lavata, pomodoro e cipolla. Condisci con olio se lo usi."}}'),
  ('94170000-0000-4000-8000-000000000001', '{"id":"tomato-onion","intensity":"light","minutes":8,"instructions":{"es":"Cortá el tomate y la cebolla finita. Mezclá y agregá el aceite si querés.","en":"Slice the tomato and onion thinly. Toss and add oil if you like.","it":"Affetta sottilmente pomodoro e cipolla. Mescola e aggiungi olio a piacere."},"names":{"es":"Ensalada de tomate y cebolla","en":"Tomato and onion salad","it":"Insalata di pomodoro e cipolla"},"positions":[3,4,5]}'),
  ('94170000-0000-4000-8000-000000000002', '{"id":"omelette","intensity":"light","minutes":10,"instructions":{"es":"Batí los huevos. Cocinalos en el aceite y agregá el queso antes de doblar. Terminá de cocinar hasta que cuajen.","en":"Beat the eggs. Cook in oil, add the cheese before folding and cook until set.","it":"Sbatti le uova. Cuocile nell’olio, aggiungi il formaggio prima di piegare e termina la cottura."}}'),
  ('94170000-0000-4000-8000-000000000002', '{"id":"lettuce-salad","intensity":"light","minutes":8,"instructions":{"es":"Lavá las hojas, cortá el tomate y mezclá.","en":"Wash the lettuce, chop the tomato and toss together.","it":"Lava la lattuga, taglia il pomodoro e mescola."}}'),
  ('94170000-0000-4000-8000-000000000004', '{"id":"rice-salad","intensity":"medium","minutes":15,"instructions":{"es":"Mezclá el arroz cocido ya frío con los vegetales elegidos y el aceite. Enfriá el arroz en la heladera después de cocinarlo.","en":"Toss chilled cooked rice with your chosen vegetables and oil. Refrigerate the rice promptly after cooking.","it":"Mescola riso cotto freddo con le verdure scelte e l’olio. Riponi il riso in frigorifero dopo la cottura."},"names":{"es":"Ensalada fría de arroz y verduras","en":"Cold vegetable rice salad","it":"Insalata fredda di riso e verdure"},"positions":[1,3,4,5,6,7,8,9]}'),
  ('94170000-0000-4000-8000-000000000005', '{"id":"breaded-hake","intensity":"medium","minutes":25,"instructions":{"es":"Pasá el filet por huevo y pan rallado, pincelalo con el aceite previsto para la milanesa y hornealo hasta dorar.","en":"Dip the fillet in egg and breadcrumbs, brush with the oil allotted to the fillet and bake until golden and cooked through.","it":"Passa il filetto nell’uovo e nel pangrattato, spennellalo con l’olio previsto e cuoci al forno fino a doratura."}}'),
  ('94170000-0000-4000-8000-000000000005', '{"id":"roast-kabocha","intensity":"light","minutes":30,"instructions":{"es":"Horneá el cabutiá en gajos hasta que esté tierno. Usá el peso de la pulpa cocida.","en":"Roast the squash wedges until tender. Weigh the cooked flesh.","it":"Cuoci gli spicchi di zucca al forno finché sono teneri. Pesa la polpa cotta."}}'),
  ('94170000-0000-4000-8000-000000000009', '{"id":"strip-steak","intensity":"hearty","minutes":15,"instructions":{"es":"Cociná el bife a la plancha. Medí el peso comestible ya cocido.","en":"Griddle the steak. Measure its cooked edible weight.","it":"Cuoci il controfiletto alla piastra. Misura il peso commestibile da cotto."}}'),
  ('94170000-0000-4000-8000-000000000009', '{"id":"carrot-egg-salad","intensity":"light","minutes":12,"instructions":{"es":"Rallá la zanahoria, cortá el huevo duro y mezclá con el aceite si lo usás.","en":"Grate the carrot, chop the hard-boiled egg and toss with oil if using.","it":"Grattugia la carota, taglia l’uovo sodo e mescola con olio a piacere."}}'),
  ('94170000-0000-4000-8000-000000000011', '{"id":"roast-chicken","intensity":"medium","minutes":45,"instructions":{"es":"Horneá el pollo hasta que esté bien cocido. La referencia de esta receta usa peso crudo de carne y piel sin hueso.","en":"Roast the chicken until cooked through. This recipe uses the raw weight of meat and skin without bone.","it":"Cuoci il pollo al forno. Il riferimento usa il peso a crudo di carne e pelle senza ossa."}}'),
  ('94170000-0000-4000-8000-000000000011', '{"id":"roast-vegetables","intensity":"light","minutes":40,"instructions":{"es":"Cortá las verduras elegidas y hornealas con el aceite hasta que estén tiernas. Medí las verduras en crudo.","en":"Chop the vegetables and roast with oil until tender. Weigh them raw.","it":"Taglia le verdure e cuocile con l’olio finché sono tenere. Pesale a crudo."}}'),
  ('94170000-0000-4000-8000-000000000101', '{"id":"vegetable-stir-fry","intensity":"light","minutes":15,"instructions":{"es":"Cortá el zucchini, el morrón y la cebolla. Saltealos con el aceite y agregá salsa de soja si querés.","en":"Slice the zucchini, pepper and onion. Stir-fry in oil and add soy sauce if you like.","it":"Taglia zucchina, peperone e cipolla. Saltali nell’olio e aggiungi salsa di soia a piacere."},"names":{"es":"Salteado de verduras","en":"Vegetable stir-fry","it":"Verdure saltate"},"positions":[2,3,4,5,6]}'),
  ('94170000-0000-4000-8000-000000000102', '{"id":"potato-mash","intensity":"light","minutes":20,"instructions":{"es":"Pisá las papas hervidas con la leche. Agregá la manteca si la usás. Medí la papa ya cocida.","en":"Mash the boiled potatoes with milk. Add butter if using. Weigh the potato after cooking.","it":"Schiaccia le patate lesse con il latte. Aggiungi burro se lo usi. Pesa le patate da cotte."},"names":{"es":"Puré de papas","en":"Mashed potatoes","it":"Purè di patate"},"positions":[2,3,4]}'),
  ('94170000-0000-4000-8000-000000000110', '{"id":"mixed-salad","intensity":"light","minutes":10,"instructions":{"es":"Cortá lechuga, tomate y cebolla. Mezclá y aderezá con el aceite.","en":"Chop lettuce, tomato and onion. Toss and dress with oil.","it":"Taglia lattuga, pomodoro e cipolla, mescola e condisci con olio."},"names":{"es":"Ensalada mixta","en":"Mixed salad","it":"Insalata mista"},"positions":[2,3,4,5]}'),
  ('94170000-0000-4000-8000-000000000117', '{"id":"chickpea-salad","intensity":"medium","minutes":10,"instructions":{"es":"Mezclá garbanzos cocidos y escurridos, tomate y cebolla. Aderezá con aceite y limón si lo usás.","en":"Toss cooked, drained chickpeas with tomato and onion. Dress with oil and optional lemon juice.","it":"Mescola ceci cotti e scolati con pomodoro e cipolla. Condisci con olio e succo di limone a piacere."},"names":{"es":"Ensalada de garbanzos","en":"Chickpea salad","it":"Insalata di ceci"},"positions":[2,3,4,5,6]}')
)
update public.recipes r set parts = (
  select coalesce(jsonb_agg(coalesce(p.entry::jsonb, '{}') || current.entry order by current.sort), '[]')
  from jsonb_array_elements(r.parts) with ordinality as current(entry, sort)
  left join parts p on p.recipe_id::uuid = r.id and p.entry::jsonb->>'id' = current.entry->>'id'
) || (
  select coalesce(jsonb_agg(p.entry::jsonb order by p.entry::jsonb->>'id'), '[]')
  from parts p
  where p.recipe_id::uuid = r.id and p.entry::jsonb ? 'positions' and not exists (
    select 1 from jsonb_array_elements(r.parts) as current(entry)
    where current.entry->>'id' = p.entry::jsonb->>'id'
  )
)
where r.id in (select recipe_id::uuid from parts);

-- The maki draft stays private until a type-specific composition and piece weight are available.
insert into public.recipes (id, kind, intensity, names, published) values
  ('94170000-0000-4000-8000-000000000401', 'dish', 'light',
    '{"es":"Sushi, maki fino","en":"Sushi, thin maki","it":"Sushi, hosomaki"}', false)
on conflict (id) do nothing;

insert into public.recipe_ingredients (recipe_id, position, food_id, food_reference_id, is_main) values
  ('94170000-0000-4000-8000-000000000401', 1, 'sushi', 'sushi-maki', true)
on conflict (recipe_id, position) do nothing;
