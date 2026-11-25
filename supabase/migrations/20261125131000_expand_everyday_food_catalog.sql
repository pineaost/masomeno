-- Everyday foods, regional examples and documented household portions.
-- Each nutrition row represents 100 g of edible food in the stated preparation.

insert into public.food_categories (id, names) values
  ('beef', '{"es":"Carne vacuna","en":"Beef","it":"Carne bovina"}'),
  ('pork', '{"es":"Cerdo","en":"Pork","it":"Maiale"}'),
  ('poultry', '{"es":"Pollo y otras aves","en":"Chicken and poultry","it":"Pollo e pollame"}'),
  ('seafood', '{"es":"Pescados y mariscos","en":"Fish and seafood","it":"Pesce e frutti di mare"}'),
  ('eggs', '{"es":"Huevos","en":"Eggs","it":"Uova"}'),
  ('dairy', '{"es":"Lácteos y quesos","en":"Dairy and cheese","it":"Latticini e formaggi"}'),
  ('pasta', '{"es":"Pastas","en":"Pasta","it":"Pasta"}'),
  ('bread', '{"es":"Panificados","en":"Bread and wraps","it":"Pane e prodotti da forno"}'),
  ('breakfast', '{"es":"Cereales y untables","en":"Breakfast cereals and spreads","it":"Cereali da colazione e creme spalmabili"}'),
  ('sweets', '{"es":"Dulces y postres","en":"Sweets and desserts","it":"Dolci e dessert"}'),
  ('drinks', '{"es":"Bebidas","en":"Drinks","it":"Bevande"}'),
  ('preserves', '{"es":"Conservas","en":"Preserved foods","it":"Conserve"}'),
  ('plant', '{"es":"Proteínas vegetales","en":"Plant proteins","it":"Proteine vegetali"}')
on conflict (id) do nothing;

insert into public.foods (id, category_id, names, synonyms, browse_parent, search_priority) values
  ('cauliflower', 'vegetables', '{"es":"Coliflor","en":"Cauliflower","it":"Cavolfiore"}', array['coliflor hervida'], null, 30),
  ('swiss-chard', 'vegetables', '{"es":"Acelga","en":"Swiss chard","it":"Bietola"}', array['acelgas', 'bietole', 'leaf beet'], null, 40),
  ('white-cabbage', 'vegetables', '{"es":"Repollo blanco","en":"White cabbage","it":"Cavolo cappuccio bianco"}', array['repollo', 'col', 'cavolo', 'cabbage'], null, 38),
  ('red-cabbage', 'vegetables', '{"es":"Repollo colorado","en":"Red cabbage","it":"Cavolo cappuccio rosso"}', array['repollo morado', 'col lombarda'], 'white-cabbage', 65),
  ('beetroot', 'vegetables', '{"es":"Remolacha","en":"Beetroot","it":"Barbabietola"}', array['remolachas', 'betabel', 'beets'], null, 42),
  ('cucumber', 'vegetables', '{"es":"Pepino","en":"Cucumber","it":"Cetriolo"}', array['pepinos', 'pepino con piel'], null, 31),
  ('cherry-tomato', 'vegetables', '{"es":"Tomate cherry","en":"Cherry tomato","it":"Pomodoro ciliegino"}', array['tomatito', 'tomates cherry', 'pomodorini'], 'tomato', 32),
  ('red-onion', 'vegetables', '{"es":"Cebolla morada","en":"Red onion","it":"Cipolla rossa"}', array['cebolla colorada', 'cebolla roja'], 'onion', 32),
  ('green-pepper', 'vegetables', '{"es":"Morrón verde","en":"Green bell pepper","it":"Peperone verde"}', array['pimiento verde', 'aji verde', 'bell pepper'], 'red-pepper', 41),
  ('yellow-pepper', 'vegetables', '{"es":"Morrón amarillo","en":"Yellow bell pepper","it":"Peperone giallo"}', array['pimiento amarillo', 'aji amarillo'], 'red-pepper', 42),
  ('eggplant', 'vegetables', '{"es":"Berenjena","en":"Eggplant","it":"Melanzana"}', array['berenjenas', 'aubergine'], null, 40),
  ('butternut', 'vegetables', '{"es":"Zapallo anco","en":"Butternut squash","it":"Zucca butternut"}', array['anquito', 'coreanito', 'calabaza anco', 'zapallo coreano'], null, 37),
  ('pumpkin', 'vegetables', '{"es":"Calabaza","en":"Pumpkin","it":"Zucca"}', array['zapallo común', 'calabaza común', 'zapallo de guarda'], null, 43),
  ('green-beans', 'vegetables', '{"es":"Chauchas","en":"Green beans","it":"Fagiolini"}', array['chaucha', 'judías verdes', 'ejotes', 'string beans'], null, 45),
  ('green-peas', 'vegetables', '{"es":"Arvejas","en":"Green peas","it":"Piselli"}', array['arveja', 'guisantes', 'piselli verdi'], null, 39),
  ('portobello', 'vegetables', '{"es":"Hongos portobello","en":"Portobello mushrooms","it":"Funghi portobello"}', array['portobello', 'champiñón portobello'], 'white-mushroom', 65),
  ('oyster-mushrooms', 'vegetables', '{"es":"Gírgolas","en":"Oyster mushrooms","it":"Funghi pleurotus"}', array['gírgola', 'orellana', 'seta ostra', 'pleuroto'], 'white-mushroom', 70),
  ('asparagus', 'vegetables', '{"es":"Espárragos","en":"Asparagus","it":"Asparagi"}', array['espárrago', 'asparago'], null, 50),
  ('celery', 'vegetables', '{"es":"Apio","en":"Celery","it":"Sedano"}', array['tallo de apio', 'celery stalk'], null, 55),
  ('leek', 'vegetables', '{"es":"Puerro","en":"Leek","it":"Porro"}', array['puerros'], null, 56),
  ('radish', 'vegetables', '{"es":"Rabanito","en":"Radish","it":"Ravanello"}', array['rabanitos', 'rábano', 'ravanelli'], null, 57),
  ('brussels-sprouts', 'vegetables', '{"es":"Repollitos de Bruselas","en":"Brussels sprouts","it":"Cavolini di Bruxelles"}', array['coles de bruselas', 'repollitos'], null, 58)
on conflict (id) do nothing;

insert into public.foods (id, category_id, names, synonyms, browse_parent, search_priority) values
  ('pear', 'fruit', '{"es":"Pera","en":"Pear","it":"Pera"}', array['peras'], null, 12),
  ('mandarin', 'fruit', '{"es":"Mandarina","en":"Mandarin","it":"Mandarino"}', array['tangerina', 'tangerine', 'mandarinas'], null, 13),
  ('grapefruit', 'fruit', '{"es":"Pomelo","en":"Grapefruit","it":"Pompelmo"}', array['toronja', 'pomelos'], null, 24),
  ('peach', 'fruit', '{"es":"Durazno","en":"Peach","it":"Pesca"}', array['duraznos', 'melocotón'], null, 16),
  ('plum', 'fruit', '{"es":"Ciruela","en":"Plum","it":"Prugna"}', array['ciruelas', 'susina'], null, 18),
  ('apricot', 'fruit', '{"es":"Damasco","en":"Apricot","it":"Albicocca"}', array['damascos', 'albaricoque'], null, 24),
  ('strawberry', 'fruit', '{"es":"Frutillas","en":"Strawberries","it":"Fragole"}', array['frutilla', 'fresa', 'fresas'], null, 15),
  ('blueberry', 'fruit', '{"es":"Arándanos","en":"Blueberries","it":"Mirtilli"}', array['arándano', 'blueberry'], null, 20),
  ('grapes', 'fruit', '{"es":"Uvas","en":"Grapes","it":"Uva"}', array['uva', 'racimo', 'uvas frescas'], null, 16),
  ('kiwi', 'fruit', '{"es":"Kiwi","en":"Kiwifruit","it":"Kiwi"}', array['kiwi verde'], null, 19),
  ('pineapple', 'fruit', '{"es":"Ananá","en":"Pineapple","it":"Ananas"}', array['piña', 'ananás'], null, 22),
  ('mango', 'fruit', '{"es":"Mango","en":"Mango","it":"Mango"}', array['mangos'], null, 23),
  ('melon', 'fruit', '{"es":"Melón","en":"Melon","it":"Melone"}', array['cantalupo', 'cantaloupe'], null, 22),
  ('watermelon', 'fruit', '{"es":"Sandía","en":"Watermelon","it":"Anguria"}', array['sandias', 'cocomero'], null, 19),
  ('coconut', 'fruit', '{"es":"Coco","en":"Coconut","it":"Cocco"}', array['coco fresco', 'carne de coco'], null, 34)
on conflict (id) do nothing;

insert into public.foods (id, category_id, names, synonyms, browse_parent, search_priority) values
  ('pecans', 'fats-nuts', '{"es":"Nueces pecán","en":"Pecans","it":"Noci pecan"}', array['nuez pecán', 'pecanes', 'pecan nuts'], 'walnuts', 30),
  ('peanuts', 'fats-nuts', '{"es":"Maní tostado","en":"Roasted peanuts","it":"Arachidi tostate"}', array['maní', 'cacahuate', 'cacahuete', 'peanuts'], null, 26),
  ('cashews', 'fats-nuts', '{"es":"Castañas de cajú","en":"Cashews","it":"Anacardi"}', array['castañas de cajú', 'castañas de caju', 'nueces de la india', 'cashew nuts'], null, 32),
  ('pistachios', 'fats-nuts', '{"es":"Pistachos","en":"Pistachios","it":"Pistacchi"}', array['pistacho', 'pistacchio'], null, 35),
  ('hazelnuts', 'fats-nuts', '{"es":"Avellanas","en":"Hazelnuts","it":"Nocciole"}', array['avellana', 'nocciola'], null, 36),
  ('chia', 'fats-nuts', '{"es":"Semillas de chía","en":"Chia seeds","it":"Semi di chia"}', array['chia', 'semilla de chía'], null, 40),
  ('flaxseed', 'fats-nuts', '{"es":"Semillas de lino","en":"Flaxseed","it":"Semi di lino"}', array['linaza', 'flax seed'], null, 41),
  ('sunflower-seeds', 'fats-nuts', '{"es":"Semillas de girasol","en":"Sunflower seeds","it":"Semi di girasole"}', array['pipas', 'pipas de girasol'], null, 42),
  ('sesame', 'fats-nuts', '{"es":"Semillas de sésamo","en":"Sesame seeds","it":"Semi di sesamo"}', array['ajonjolí', 'sésamo', 'semi di sesamo'], null, 43)
on conflict (id) do nothing;

insert into public.foods (id, category_id, names, synonyms, browse_parent, search_priority) values
  ('beef-steak', 'beef', '{"es":"Bife o churrasco","en":"Beef steak","it":"Bistecca di manzo"}', array['bife', 'churrasco', 'carne', 'carne vacuna', 'steak', 'bistecca', 'fettina'], null, 1),
  ('beef-tenderloin', 'beef', '{"es":"Lomo vacuno","en":"Beef tenderloin","it":"Filetto di manzo"}', array['lomo', 'filet de lomo', 'solomillo de ternera', 'beef fillet'], 'beef-steak', 22),
  ('skirt-steak', 'beef', '{"es":"Entraña","en":"Outside skirt steak","it":"Diaframma di manzo"}', array['entraña vacuna', 'outside skirt', 'skirt steak'], 'beef-steak', 24),
  ('cuadrada', 'beef', '{"es":"Cuadrada","en":"Beef outside round","it":"Fesa esterna di manzo"}', array['contra', 'cuadrada vacuna', 'outside round', 'bottom round'], 'beef-steak', 36),
  ('knuckle', 'beef', '{"es":"Bola de lomo","en":"Beef knuckle","it":"Noce di manzo"}', array['bola de lomo vacuna', 'babilla', 'sirloin tip'], 'beef-steak', 33),
  ('rump', 'beef', '{"es":"Cuadril","en":"Beef rump","it":"Scamone di manzo"}', array['corazón de cuadril', 'rump steak', 'culata'], 'beef-steak', 29),
  ('tri-tip', 'beef', '{"es":"Colita de cuadril","en":"Tri-tip","it":"Spinacino di manzo"}', array['punta de picana', 'tri tip'], 'beef-steak', 31),
  ('flank', 'beef', '{"es":"Vacío","en":"Argentine flank cut","it":"Pancia di manzo"}', array['vacio', 'pancia', 'flank'], 'beef-steak', 30),
  ('short-ribs', 'beef', '{"es":"Asado de tira","en":"Beef short ribs","it":"Costine di manzo"}', array['asado', 'tira de asado', 'costilla vacuna', 'short ribs'], 'beef-steak', 25),
  ('matambre', 'beef', '{"es":"Matambre","en":"Argentine beef matambre","it":"Matambre di manzo"}', array['matambre vacuno', 'matambre a la parrilla'], 'beef-steak', 32),
  ('eye-round', 'beef', '{"es":"Peceto","en":"Eye of round","it":"Girello di manzo"}', array['redondo de ternera', 'peceto vacuno', 'eye round'], 'beef-steak', 33),
  ('beef-shank', 'beef', '{"es":"Osobuco","en":"Beef shank","it":"Ossobuco di manzo"}', array['osso buco', 'jarrete', 'morcillo', 'beef shank'], 'beef-steak', 35),
  ('ground-beef-common', 'beef', '{"es":"Carne picada común","en":"Regular ground beef","it":"Macinato di manzo comune"}', array['minced meat', '80/20', 'picada común', 'picada con grasa', 'carne molida común'], 'ground-beef', 13)
on conflict (id) do nothing;

insert into public.foods (id, category_id, names, synonyms, browse_parent, search_priority) values
  ('pork-shoulder', 'pork', '{"es":"Bondiola","en":"Pork shoulder butt","it":"Coppa di maiale"}', array['bondiola de cerdo', 'pork butt', 'spalla di maiale'], null, 24),
  ('pork-tenderloin', 'pork', '{"es":"Solomillo de cerdo","en":"Pork tenderloin","it":"Filetto di maiale"}', array['lomo de cerdo', 'solomillo', 'pork fillet'], null, 23),
  ('pork-ribs', 'pork', '{"es":"Costillas de cerdo","en":"Pork spare ribs","it":"Costine di maiale"}', array['costillitas de cerdo', 'costillar de cerdo', 'spareribs'], null, 25),
  ('pork-loin', 'pork', '{"es":"Carré de cerdo","en":"Pork loin","it":"Lonza di maiale"}', array['carre de cerdo', 'carre', 'chuleta de cerdo', 'lombo de porco'], null, 26),
  ('bacon', 'pork', '{"es":"Panceta","en":"Bacon","it":"Pancetta"}', array['tocino', 'bacon', 'panceta curada'], null, 30)
on conflict (id) do nothing;

insert into public.foods (id, category_id, names, synonyms, browse_parent, search_priority) values
  ('chicken-thigh', 'poultry', '{"es":"Muslo de pollo","en":"Chicken thigh","it":"Sovracoscia di pollo"}', array['muslo', 'contramuslo', 'coscia di pollo'], null, 18),
  ('chicken-drumstick', 'poultry', '{"es":"Pata de pollo","en":"Chicken drumstick","it":"Fuso di pollo"}', array['pata', 'jamoncito de pollo', 'coscetta di pollo'], null, 19),
  ('chicken-leg', 'poultry', '{"es":"Pata-muslo de pollo","en":"Chicken leg quarter","it":"Coscia di pollo intera"}', array['pata muslo', 'cuarto trasero de pollo', 'cuarto de pollo'], null, 21),
  ('turkey-breast', 'poultry', '{"es":"Pechuga de pavo","en":"Turkey breast","it":"Petto di tacchino"}', array['pavo', 'turkey', 'tacchino'], null, 30)
on conflict (id) do nothing;

insert into public.foods (id, category_id, names, synonyms, browse_parent, search_priority) values
  ('fresh-tuna', 'seafood', '{"es":"Atún fresco","en":"Fresh tuna","it":"Tonno fresco"}', array['atún', 'atún aleta amarilla', 'yellowfin tuna', 'tonno pinna gialla'], null, 17),
  ('sole', 'seafood', '{"es":"Lenguado","en":"Sole","it":"Sogliola"}', array['filet de lenguado', 'filete de lenguado', 'flatfish'], null, 21),
  ('trout', 'seafood', '{"es":"Trucha arcoíris","en":"Rainbow trout","it":"Trota iridea"}', array['trucha', 'trout', 'trota'], null, 18),
  ('sardines', 'seafood', '{"es":"Sardinas","en":"Sardines","it":"Sardine"}', array['sardinas en lata', 'sardinas en aceite', 'sardine'], null, 23),
  ('mackerel', 'seafood', '{"es":"Caballa","en":"Atlantic mackerel","it":"Sgombro atlantico"}', array['macarela', 'mackerel', 'caballa del atlántico'], null, 22),
  ('argentine-prawn', 'seafood', '{"es":"Langostinos argentinos","en":"Argentine red shrimp","it":"Gamberi argentini"}', array['langostino', 'langostinos', 'langostino patagónico', 'pleoticus muelleri'], null, 27),
  ('squid', 'seafood', '{"es":"Calamares","en":"Squid","it":"Calamari"}', array['calamar', 'calamaro'], null, 29),
  ('mussels', 'seafood', '{"es":"Mejillones","en":"Mussels","it":"Cozze"}', array['mejillón', 'cozza', 'mitili'], null, 32)
on conflict (id) do nothing;

insert into public.foods (id, category_id, names, synonyms, browse_parent, search_priority) values
  ('egg-white', 'eggs', '{"es":"Clara de huevo","en":"Egg white","it":"Albume"}', array['clara', 'claras', 'albume d’uovo'], 'egg', 20),
  ('egg-yolk', 'eggs', '{"es":"Yema de huevo","en":"Egg yolk","it":"Tuorlo"}', array['yema', 'yemas', 'tuorlo d’uovo'], 'egg', 21)
on conflict (id) do nothing;

insert into public.foods (id, category_id, names, synonyms, browse_parent, search_priority) values
  ('milk-whole', 'dairy', '{"es":"Leche entera","en":"Whole milk","it":"Latte intero"}', array['leche', 'milk', 'latte'], null, 6),
  ('milk-low-fat', 'dairy', '{"es":"Leche parcialmente descremada","en":"Reduced-fat milk","it":"Latte parzialmente scremato"}', array['leche semidescremada', 'leche descremada parcial', 'semi-skimmed milk', 'latte parz scremato'], 'milk-whole', 9),
  ('milk-skim', 'dairy', '{"es":"Leche descremada","en":"Skim milk","it":"Latte scremato"}', array['leche sin grasa', 'leche desnatada', 'skimmed milk'], 'milk-whole', 10),
  ('yogurt-flavored', 'dairy', '{"es":"Yogur saborizado","en":"Flavored yogurt","it":"Yogurt aromatizzato"}', array['yogurt de vainilla', 'yogur de vainilla', 'yogur sabor vainilla', 'vanilla yogurt', 'yogurt alla vaniglia'], 'yogurt', 16),
  ('yogurt-greek', 'dairy', '{"es":"Yogur griego","en":"Greek yogurt","it":"Yogurt greco"}', array['yogurt griego', 'yogur estilo griego'], 'yogurt', 15),
  ('port-salut', 'dairy', '{"es":"Queso port salut","en":"Port Salut-style cheese","it":"Formaggio tipo Port Salut"}', array['port salut', 'port salut tradicional', 'queso port salud'], null, 21),
  ('cream-cheese', 'dairy', '{"es":"Queso untable","en":"Cream cheese","it":"Formaggio spalmabile"}', array['queso crema', 'queso blanco untable', 'creamcheese', 'formaggio cremoso'], null, 20),
  ('ricotta', 'dairy', '{"es":"Ricota","en":"Ricotta","it":"Ricotta"}', array['ricotta', 'queso ricota'], null, 25),
  ('semi-hard-cheese', 'dairy', '{"es":"Queso semiduro","en":"Semi-hard cheese","it":"Formaggio semiduro"}', array['gouda', 'queso mar del plata', 'queso pategrás'], null, 29),
  ('heavy-cream', 'dairy', '{"es":"Crema de leche","en":"Heavy cream","it":"Panna fresca"}', array['nata', 'crema', 'crema para batir', 'whipping cream'], null, 23)
on conflict (id) do nothing;

insert into public.foods (id, category_id, names, synonyms, browse_parent, search_priority) values
  ('quinoa', 'grains', '{"es":"Quinoa","en":"Quinoa","it":"Quinoa"}', array['quinua'], null, 24),
  ('couscous', 'grains', '{"es":"Cuscús","en":"Couscous","it":"Couscous"}', array['cous cous', 'cuscus', 'cuzcuz'], null, 32),
  ('polenta', 'grains', '{"es":"Polenta","en":"Polenta","it":"Polenta"}', array['harina de maíz', 'sémola de maíz', 'cornmeal'], null, 26),
  ('white-flour', 'grains', '{"es":"Harina de trigo","en":"Wheat flour","it":"Farina di grano tenero"}', array['harina', 'harina común', 'harina 000', 'all-purpose flour'], null, 38)
on conflict (id) do nothing;

insert into public.foods (id, category_id, names, synonyms, browse_parent, search_priority) values
  ('fresh-pasta', 'pasta', '{"es":"Fideos frescos","en":"Fresh pasta","it":"Pasta fresca"}', array['fideos al huevo', 'pasta fresca', 'tallarines frescos', 'fideos'], null, 14),
  ('ravioli', 'pasta', '{"es":"Ravioles","en":"Ravioli","it":"Ravioli"}', array['raviol', 'pasta rellena', 'fideos', 'pasta ripiena'], null, 17),
  ('sorrentinos', 'pasta', '{"es":"Sorrentinos","en":"Argentine filled pasta rounds","it":"Sorrentinos argentini"}', array['sorrentino', 'pasta rellena', 'fideos', 'rellenos de jamón y queso'], null, 19)
on conflict (id) do nothing;

insert into public.foods (id, category_id, names, synonyms, browse_parent, search_priority) values
  ('white-bread', 'bread', '{"es":"Pan blanco o lactal","en":"White sliced bread","it":"Pane bianco a fette"}', array['pan', 'pan lactal', 'pan de molde', 'pan de miga', 'sandwich bread', 'pancarrè'], null, 7),
  ('baguette', 'bread', '{"es":"Pan francés","en":"French bread","it":"Pane tipo baguette"}', array['baguette', 'pan flauta', 'pan de panadería', 'pan francés tipo flauta'], null, 15),
  ('rice-cakes', 'bread', '{"es":"Galletas de arroz","en":"Rice cakes","it":"Gallette di riso"}', array['galletitas de arroz', 'tortitas de arroz', 'rice crackers'], null, 22)
on conflict (id) do nothing;

insert into public.foods (id, category_id, names, synonyms, browse_parent, search_priority) values
  ('kidney-beans', 'legumes', '{"es":"Porotos colorados","en":"Red kidney beans","it":"Fagioli rossi"}', array['porotos', 'frijoles', 'habichuelas', 'kidney beans', 'porotos rojos'], null, 15),
  ('white-beans', 'legumes', '{"es":"Porotos blancos","en":"White beans","it":"Fagioli bianchi"}', array['alubias', 'frijoles blancos', 'white beans'], null, 17),
  ('split-peas', 'legumes', '{"es":"Arvejas partidas","en":"Split peas","it":"Piselli spezzati"}', array['arvejas secas', 'guisantes secos', 'dried peas'], null, 25),
  ('lima-beans', 'legumes', '{"es":"Porotos pallares","en":"Lima beans","it":"Fagioli di Lima"}', array['pallares', 'porotos manteca', 'butter beans'], null, 24)
on conflict (id) do nothing;

insert into public.foods (id, category_id, names, synonyms, browse_parent, search_priority) values
  ('granola', 'breakfast', '{"es":"Granola","en":"Granola","it":"Granola"}', array['granola casera', 'cereales de desayuno', 'granola con frutos secos'], null, 15),
  ('corn-flakes', 'breakfast', '{"es":"Copos de maíz","en":"Corn flakes","it":"Fiocchi di mais"}', array['cereal', 'cereales para desayuno', 'cereales de desayuno', 'cornflakes', 'flakes'], null, 12),
  ('jam', 'breakfast', '{"es":"Mermelada","en":"Jam","it":"Confettura"}', array['dulce de fruta', 'jalea', 'confitura', 'preserves', 'marmellata'], null, 18),
  ('dulce-de-leche', 'breakfast', '{"es":"Dulce de leche","en":"Dulce de leche","it":"Dulce de leche"}', array['doce de leite', 'caramelo de leche', 'milk caramel'], null, 15),
  ('honey', 'breakfast', '{"es":"Miel","en":"Honey","it":"Miele"}', array['miel de abeja'], null, 17),
  ('peanut-butter', 'breakfast', '{"es":"Mantequilla de maní","en":"Peanut butter","it":"Burro di arachidi"}', array['pasta de maní', 'manteca de maní', 'crema de cacahuate'], null, 20),
  ('cereal-bar', 'breakfast', '{"es":"Barrita de cereal","en":"Cereal bar","it":"Barretta ai cereali"}', array['barra de cereal', 'barrita', 'granola bar'], null, 24)
on conflict (id) do nothing;

insert into public.foods (id, category_id, names, synonyms, browse_parent, search_priority) values
  ('oat-cookies', 'biscuits', '{"es":"Galletitas de avena","en":"Oatmeal cookies","it":"Biscotti all’avena"}', array['galletitas de avena', 'biscotti avena', 'oat biscuits'], null, 32),
  ('wholegrain-crackers', 'biscuits', '{"es":"Galletitas integrales saladas","en":"Whole-wheat crackers","it":"Cracker integrali"}', array['galletitas integrales', 'galletitas de salvado', 'crackers integrales'], null, 31)
on conflict (id) do nothing;

insert into public.foods (id, category_id, names, synonyms, browse_parent, search_priority) values
  ('churro', 'pastries', '{"es":"Churro simple","en":"Plain churro","it":"Churro semplice"}', array['churros', 'churro sin relleno', 'factura frita', 'plain churros'], null, 26)
on conflict (id) do nothing;

insert into public.foods (id, category_id, names, synonyms, browse_parent, search_priority) values
  ('alfajor', 'sweets', '{"es":"Alfajor de dulce de leche","en":"Dulce de leche alfajor","it":"Alfajor al dulce de leche"}', array['alfajor', 'alfajores', 'alfajorcito'], null, 13),
  ('alfajor-maicena', 'sweets', '{"es":"Alfajor de maicena","en":"Cornstarch alfajor","it":"Alfajor alla maizena"}', array['alfajor de maizena', 'alfajores de maicena'], 'alfajor', 17),
  ('sponge-cake', 'sweets', '{"es":"Bizcochuelo","en":"Sponge cake","it":"Pan di Spagna"}', array['bizcocho', 'queque esponjoso', 'torta esponjosa'], null, 20),
  ('pound-cake', 'sweets', '{"es":"Budín tipo inglés","en":"Pound cake","it":"Plumcake"}', array['budín', 'budín de vainilla', 'panqué', 'budin inglés'], null, 22),
  ('muffin', 'sweets', '{"es":"Muffin de arándanos","en":"Blueberry muffin","it":"Muffin ai mirtilli"}', array['muffin', 'muffins', 'magdalena de arándanos'], null, 23),
  ('dark-chocolate', 'sweets', '{"es":"Chocolate amargo","en":"Dark chocolate","it":"Cioccolato fondente"}', array['chocolate', 'tableta de chocolate', 'semiamargo'], null, 15),
  ('milk-chocolate', 'sweets', '{"es":"Chocolate con leche","en":"Milk chocolate","it":"Cioccolato al latte"}', array['chocolate de leche', 'tableta con leche'], 'dark-chocolate', 16),
  ('vanilla-ice-cream', 'sweets', '{"es":"Helado de vainilla","en":"Vanilla ice cream","it":"Gelato alla vaniglia"}', array['helado', 'crema helada', 'gelato'], null, 14),
  ('chocolate-ice-cream', 'sweets', '{"es":"Helado de chocolate","en":"Chocolate ice cream","it":"Gelato al cioccolato"}', array['crema helada de chocolate', 'gelato cioccolato'], 'vanilla-ice-cream', 17)
on conflict (id) do nothing;

insert into public.foods (id, category_id, names, synonyms, browse_parent, search_priority) values
  ('water', 'drinks', '{"es":"Agua","en":"Water","it":"Acqua"}', array['agua sin gas', 'agua de la canilla', 'vaso de agua'], null, 4),
  ('coffee', 'drinks', '{"es":"Café solo","en":"Black coffee","it":"Caffè senza latte"}', array['café', 'coffee', 'caffè', 'café negro', 'sin leche'], null, 5),
  ('coffee-with-milk', 'drinks', '{"es":"Café con leche","en":"Coffee with milk","it":"Caffellatte"}', array['cafe latte', 'café latte', 'latte macchiato'], 'coffee', 11),
  ('tea', 'drinks', '{"es":"Té negro","en":"Black tea","it":"Tè nero"}', array['té', 'tea', 'te'], null, 9),
  ('green-tea', 'drinks', '{"es":"Té verde","en":"Green tea","it":"Tè verde"}', array['green tea', 'te verde'], 'tea', 12),
  ('mate', 'drinks', '{"es":"Mate amargo","en":"Unsweetened yerba mate","it":"Mate non zuccherato"}', array['mate', 'yerba mate', 'mate cebado', 'mate cocido'], null, 8),
  ('cola', 'drinks', '{"es":"Gaseosa cola común","en":"Regular cola","it":"Cola zuccherata"}', array['gaseosa', 'refresco', 'soda', 'cola', 'bebida cola'], null, 10),
  ('cola-zero', 'drinks', '{"es":"Gaseosa cola sin azúcar","en":"Sugar-free cola","it":"Cola senza zucchero"}', array['gaseosa zero', 'gaseosa light', 'cola light', 'zero', 'diet soda'], 'cola', 11),
  ('orange-juice', 'drinks', '{"es":"Jugo de naranja","en":"Orange juice","it":"Succo d’arancia"}', array['jugo', 'zumo', 'jugo exprimido', 'exprimido', 'spremuta'], null, 11),
  ('apple-juice', 'drinks', '{"es":"Jugo de manzana","en":"Apple juice","it":"Succo di mela"}', array['jugo de manzana sin azúcar', 'zumo de manzana'], 'orange-juice', 16),
  ('fruit-smoothie', 'drinks', '{"es":"Licuado de frutas","en":"Fruit smoothie","it":"Frullato di frutta"}', array['licuado', 'batido', 'smoothie', 'licuado con leche'], null, 17),
  ('beer', 'drinks', '{"es":"Cerveza","en":"Beer","it":"Birra"}', array['cerveza regular', 'birra', 'lager'], null, 30),
  ('red-wine', 'drinks', '{"es":"Vino tinto","en":"Red wine","it":"Vino rosso"}', array['vino', 'copa de vino', 'red table wine'], null, 32)
on conflict (id) do nothing;

insert into public.foods (id, category_id, names, synonyms, browse_parent, search_priority) values
  ('vinegar', 'seasonings', '{"es":"Vinagre de vino","en":"Wine vinegar","it":"Aceto di vino"}', array['vinagre', 'vinagre tinto', 'vinagre de vino tinto'], null, 21),
  ('mayonnaise', 'seasonings', '{"es":"Mayonesa","en":"Mayonnaise","it":"Maionese"}', array['mayo', 'mahonesa'], null, 14),
  ('ketchup', 'seasonings', '{"es":"Kétchup","en":"Ketchup","it":"Ketchup"}', array['ketchup', 'catsup', 'salsa kétchup'], null, 15),
  ('mustard', 'seasonings', '{"es":"Mostaza","en":"Mustard","it":"Senape"}', array['mostaza amarilla', 'yellow mustard'], null, 20),
  ('soy-sauce', 'seasonings', '{"es":"Salsa de soja","en":"Soy sauce","it":"Salsa di soia"}', array['salsa de soya', 'shoyu'], null, 23),
  ('tomato-sauce', 'seasonings', '{"es":"Salsa de tomate","en":"Tomato sauce","it":"Salsa di pomodoro"}', array['salsa de tomates', 'salsa roja', 'puré de tomate', 'tomato sauce'], null, 16),
  ('sugar', 'seasonings', '{"es":"Azúcar","en":"Sugar","it":"Zucchero"}', array['azúcar blanca', 'azúcar común', 'white sugar'], null, 15),
  ('sweetener', 'seasonings', '{"es":"Edulcorante en polvo","en":"Powdered sweetener","it":"Dolcificante in polvere"}', array['edulcorante', 'azucar sin calorías', 'sugar substitute', 'endulzante'], null, 24),
  ('salt', 'seasonings', '{"es":"Sal","en":"Salt","it":"Sale"}', array['sal fina', 'sal de mesa', 'table salt'], null, 18),
  ('paprika', 'seasonings', '{"es":"Pimentón","en":"Paprika","it":"Paprica"}', array['paprika', 'pimentón dulce'], null, 26)
on conflict (id) do nothing;

-- Keep food IDs and prior links. Refresh display metadata and keep existing aliases.
update public.foods f set
  category_id = seed.category_id,
  browse_parent = seed.parent,
  search_priority = seed.priority,
  names = coalesce(seed.names::jsonb, f.names),
  synonyms = array(select distinct alias from unnest(f.synonyms || seed.aliases) as alias order by alias)
from (values
  ('apple', 'fruit', null, 5, '{"es":"Manzana","en":"Apple","it":"Mela"}', array['manzana con piel']),
  ('lettuce', 'vegetables', null, 12, '{"es":"Lechuga","en":"Lettuce","it":"Lattuga"}', array['lechuga de hoja verde']),
  ('oats', 'grains', null, 8, '{"es":"Avena","en":"Oats","it":"Avena"}', array['avena seca', 'hojuelas de avena', 'fiocchi d’avena']),
  ('potato', 'vegetables', null, 10, null, array['patata', 'potatoes']),
  ('sweet-potato', 'vegetables', null, 19, null, array['boniato', 'camote', 'sweet potato']),
  ('tomato', 'vegetables', null, 7, null, array['tomate común', 'tomates', 'tomate redondo']),
  ('onion', 'vegetables', null, 11, null, array['cebolla común', 'cebolla blanca']),
  ('red-pepper', 'vegetables', null, 23, null, array['morrón', 'pimiento', 'ají morrón', 'peperone']),
  ('canned-plum-tomato', 'vegetables', 'tomato', 64, null, array['tomate en lata', 'tomate pelado']),
  ('white-mushroom', 'vegetables', null, 32, null, array['hongos', 'setas', 'funghi']),
  ('broccoli', 'vegetables', null, 22, null, array['brécol', 'broccoli']),
  ('spinach', 'vegetables', null, 24, null, array['espinacas']),
  ('carrot', 'vegetables', null, 14, null, array['zanahorias']),
  ('zucchini', 'vegetables', null, 22, null, array['calabacín', 'zapallito largo', 'courgette']),
  ('kabocha', 'vegetables', null, 29, null, array['cabutiá', 'cabotia', 'kabutiá']),
  ('walnuts', 'fats-nuts', null, 8, '{"es":"Nueces de nogal","en":"Walnuts","it":"Noci comuni"}', array['nueces', 'nuez', 'nogal', 'noci', 'walnut']),
  ('almonds', 'fats-nuts', null, 10, null, array['almendra']),
  ('olive-oil', 'seasonings', null, 10, null, array['aceite']),
  ('sunflower-oil', 'seasonings', null, 13, null, array['aceite vegetal']),
  ('olives', 'preserves', null, 19, null, array['aceituna', 'olivas en conserva']),
  ('strip-steak', 'beef', 'beef-steak', 14, null, array['bife angosto', 'contra filete', 'entrecot']),
  ('lean-beef', 'beef', 'beef-steak', 25, '{"es":"Nalga vacuna","en":"Beef top round","it":"Fesa di manzo"}', array['nalga', 'carne vacuna magra', 'carne para milanesa']),
  ('ground-beef', 'beef', null, 11, '{"es":"Carne picada magra","en":"Lean ground beef","it":"Macinato magro di manzo"}', array['carne picada', 'picada magra', 'carne vacuna', '90/10']),
  ('burger-patty', 'beef', null, 21, null, array['hamburguesa de carne', 'medallón', 'carne para hamburguesa']),
  ('chicken-breast', 'poultry', null, 8, null, array['pechuga', 'pechuga sin hueso', 'pollo deshuesado']),
  ('roasting-chicken', 'poultry', null, 5, '{"es":"Pollo al horno","en":"Roast chicken","it":"Pollo arrosto"}', array['pollo', 'pollo deshuesado', 'pollo con piel', 'pollo sin piel']),
  ('sliced-ham', 'pork', null, 14, null, array['jamón en fetas', 'prosciutto cotto']),
  ('egg', 'eggs', null, 6, null, array['huevo entero', 'huevos']),
  ('cod', 'seafood', null, 16, null, array['bacalao', 'pescado blanco']),
  ('hake', 'seafood', null, 7, null, array['filet de merluza', 'pescado', 'pescado blanco']),
  ('salmon', 'seafood', null, 8, null, array['salmón', 'pescado']),
  ('shrimp', 'seafood', null, 22, '{"es":"Camarones","en":"Shrimp","it":"Gamberetti"}', array['camarón', 'camarones', 'shrimp', 'gamberetti', 'langostinos de especies mixtas']),
  ('tuna', 'seafood', null, 12, '{"es":"Atún en conserva","en":"Canned tuna","it":"Tonno in scatola"}', array['atún en lata', 'atún al natural']),
  ('butter', 'dairy', null, 15, null, array['mantequilla']),
  ('grated-hard-cheese', 'dairy', null, 18, null, array['queso rallado', 'parmesano', 'parmigiano']),
  ('mozzarella', 'dairy', null, 16, null, array['muzzarella', 'musarela']),
  ('queso-cremoso', 'dairy', null, 14, null, array['queso fresco cremoso']),
  ('yogurt', 'dairy', null, 8, null, array['yogur', 'yogurt', 'yoghurt', 'yogur natural']),
  ('tofu', 'plant', null, 24, null, array['soja']),
  ('white-rice', 'grains', null, 10, null, array['arroz', 'riso', 'rice']),
  ('brown-rice', 'grains', null, 20, null, array['arroz yamaní', 'wholegrain rice']),
  ('wheat-pasta', 'pasta', null, 6, null, array['fideos', 'pastas', 'spaghetti', 'espagueti', 'tallarines', 'macarrones']),
  ('potato-gnocchi', 'pasta', null, 15, null, array['ñoquis', 'gnocchi', 'pastas', 'fideos']),
  ('whole-wheat-bread', 'bread', null, 11, null, array['pan lactal integral', 'pan de molde integral', 'tostada integral']),
  ('hamburger-bun', 'bread', null, 20, null, array['pan de hamburguesas']),
  ('breadcrumbs', 'bread', null, 24, null, array['pan molido', 'pan para empanar']),
  ('tortilla-wrap', 'bread', null, 15, null, array['rapidita', 'rapiditas', 'tortilla', 'wrap', 'tortillas de maíz', 'tortillas de trigo']),
  ('pie-crust', 'bread', null, 26, null, array['masa de tarta']),
  ('pizza-dough', 'bread', null, 26, null, array['base de pizza']),
  ('black-beans', 'legumes', null, 14, null, array['porotos', 'frijoles negros']),
  ('chickpeas', 'legumes', null, 13, null, array['garbanzo']),
  ('lentils', 'legumes', null, 11, null, array['lenteja']),
  ('water-crackers', 'biscuits', null, 10, null, '{}'::text[]),
  ('plain-sweet-biscuits', 'biscuits', null, 12, null, '{}'::text[]),
  ('filled-biscuits', 'biscuits', null, 14, null, '{}'::text[]),
  ('chocolate-coated-biscuits', 'biscuits', null, 16, null, '{}'::text[]),
  ('chocolate-chip-cookies', 'biscuits', null, 18, null, '{}'::text[]),
  ('medialuna-butter', 'pastries', null, 10, null, '{}'::text[]),
  ('medialuna-fat', 'pastries', null, 11, null, '{}'::text[]),
  ('plain-factura', 'pastries', null, 14, null, '{}'::text[]),
  ('custard-factura', 'pastries', null, 15, null, '{}'::text[]),
  ('dulce-de-leche-factura', 'pastries', null, 16, null, '{}'::text[])
) as seed(id, category_id, parent, priority, names, aliases)
where f.id = seed.id;

-- The preexisting mixed-species USDA entries remain under their original ID.
update public.foods set synonyms = array_remove(array_remove(synonyms, 'langostino'), 'langostinos') where id = 'shrimp';

insert into public.food_references (id, food_id, preparation, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g,
  portion_unit, portion_grams, additional_portions, source_kind, source_ref, source_url, source_description,
  variant_names, validation, is_estimate) values
  ('cauliflower-raw', 'cauliflower', 'raw', 25, 1.92, 4.97, 0.28, 'cup', 107, '{}', 'sr-legacy', '169986', 'https://fdc.nal.usda.gov/food-details/169986/nutrients', 'USDA FoodData Central · SR Legacy · Cauliflower, raw.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('cauliflower-cooked', 'cauliflower', 'cooked', 23, 1.84, 4.11, 0.45, null, null, '{}', 'sr-legacy', '170397', 'https://fdc.nal.usda.gov/food-details/170397/nutrients', 'USDA FoodData Central · SR Legacy · Cauliflower, cooked, boiled, drained, without salt.', '{"es":"Cocido","en":"Cooked","it":"Cotto"}', 'verified', false),
  ('swiss-chard-raw', 'swiss-chard', 'raw', 19, 1.8, 3.74, 0.2, 'cup', 36, '{}', 'sr-legacy', '169991', 'https://fdc.nal.usda.gov/food-details/169991/nutrients', 'USDA FoodData Central · SR Legacy · Chard, swiss, raw.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('swiss-chard-cooked', 'swiss-chard', 'cooked', 20, 1.88, 4.13, 0.08, 'cup', 175, '{}', 'sr-legacy', '170401', 'https://fdc.nal.usda.gov/food-details/170401/nutrients', 'USDA FoodData Central · SR Legacy · Chard, swiss, cooked, boiled, drained, without salt.', '{"es":"Cocido","en":"Cooked","it":"Cotto"}', 'verified', false),
  ('white-cabbage-raw', 'white-cabbage', 'raw', 25, 1.28, 5.8, 0.1, 'cup', 89, '{}', 'sr-legacy', '169975', 'https://fdc.nal.usda.gov/food-details/169975/nutrients', 'USDA FoodData Central · SR Legacy · Cabbage, raw.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('white-cabbage-cooked', 'white-cabbage', 'cooked', 23, 1.27, 5.51, 0.06, null, null, '{}', 'sr-legacy', '169976', 'https://fdc.nal.usda.gov/food-details/169976/nutrients', 'USDA FoodData Central · SR Legacy · Cabbage, cooked, boiled, drained, without salt.', '{"es":"Cocido","en":"Cooked","it":"Cotto"}', 'verified', false),
  ('red-cabbage-raw', 'red-cabbage', 'raw', 31, 1.43, 7.37, 0.16, 'cup', 89, '{}', 'sr-legacy', '169977', 'https://fdc.nal.usda.gov/food-details/169977/nutrients', 'USDA FoodData Central · SR Legacy · Cabbage, red, raw.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('red-cabbage-cooked', 'red-cabbage', 'cooked', 29, 1.51, 6.94, 0.09, null, null, '{}', 'sr-legacy', '169978', 'https://fdc.nal.usda.gov/food-details/169978/nutrients', 'USDA FoodData Central · SR Legacy · Cabbage, red, cooked, boiled, drained, without salt.', '{"es":"Cocido","en":"Cooked","it":"Cotto"}', 'verified', false),
  ('beetroot-raw', 'beetroot', 'raw', 43, 1.61, 9.56, 0.17, 'unit', 82, '{}', 'sr-legacy', '169145', 'https://fdc.nal.usda.gov/food-details/169145/nutrients', 'USDA FoodData Central · SR Legacy · Beets, raw.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('beetroot-cooked', 'beetroot', 'cooked', 44, 1.68, 9.96, 0.18, null, null, '{}', 'sr-legacy', '169146', 'https://fdc.nal.usda.gov/food-details/169146/nutrients', 'USDA FoodData Central · SR Legacy · Beets, cooked, boiled, drained.', '{"es":"Cocido","en":"Cooked","it":"Cotto"}', 'verified', false),
  ('cucumber-raw', 'cucumber', 'raw', 15, 0.65, 3.63, 0.11, 'cup', 104, '{}', 'sr-legacy', '168409', 'https://fdc.nal.usda.gov/food-details/168409/nutrients', 'USDA FoodData Central · SR Legacy · Cucumber, with peel, raw. Taza de rodajas calculada a partir de media taza (52 g).', '{"es":"Con piel","en":"Skin on","it":"Con pelle"}', 'verified', false),
  ('cherry-tomato-raw', 'cherry-tomato', 'raw', 26, 1.4, 2.7, 0.6, 'cup', 149, '{}', 'official', 'FCDB 0646', 'https://www.nutridatabaze.cz/en/food/?id=646', 'Nutridatabáze 0646, tomate cherry crudo. Carbohidratos disponibles. Taza de la medida USDA 170457.', '{"es":"Cherry crudo","en":"Raw cherry","it":"Ciliegino crudo"}', 'verified', false),
  ('red-onion-raw', 'red-onion', 'raw', 34, 1.31, 7.54, 0.4, null, null, '{}', 'official', 'TBCA BRC1207B', 'https://www.tbca.net.br/base-dados-en/int_food_composition_2_edit.php?cod_produto=BRC1207B', 'TBCA · Cebolla morada cruda, porción comestible.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('green-pepper-raw', 'green-pepper', 'raw', 20, 0.86, 4.64, 0.17, 'cup', 149, '{}', 'sr-legacy', '170427', 'https://fdc.nal.usda.gov/food-details/170427/nutrients', 'USDA FoodData Central · SR Legacy · Peppers, sweet, green, raw.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('yellow-pepper-raw', 'yellow-pepper', 'raw', 27, 1, 6.32, 0.21, null, null, '{}', 'sr-legacy', '169383', 'https://fdc.nal.usda.gov/food-details/169383/nutrients', 'USDA FoodData Central · SR Legacy · Peppers, sweet, yellow, raw.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('eggplant-raw', 'eggplant', 'raw', 25, 0.98, 5.88, 0.18, 'cup', 82, '{}', 'sr-legacy', '169228', 'https://fdc.nal.usda.gov/food-details/169228/nutrients', 'USDA FoodData Central · SR Legacy · Eggplant, raw.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('eggplant-cooked', 'eggplant', 'cooked', 35, 0.83, 8.73, 0.23, 'cup', 99, '{}', 'sr-legacy', '169229', 'https://fdc.nal.usda.gov/food-details/169229/nutrients', 'USDA FoodData Central · SR Legacy · Eggplant, cooked, boiled, drained, without salt.', '{"es":"Cocido","en":"Cooked","it":"Cotto"}', 'verified', false),
  ('butternut-raw', 'butternut', 'raw', 45, 1, 11.69, 0.1, 'cup', 140, '{}', 'sr-legacy', '169295', 'https://fdc.nal.usda.gov/food-details/169295/nutrients', 'USDA FoodData Central · SR Legacy · Squash, winter, butternut, raw.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('butternut-cooked', 'butternut', 'cooked', 40, 0.9, 10.49, 0.09, 'cup', 205, '{}', 'sr-legacy', '169296', 'https://fdc.nal.usda.gov/food-details/169296/nutrients', 'USDA FoodData Central · SR Legacy · Squash, winter, butternut, cooked, baked, without salt.', '{"es":"Al horno","en":"Roasted","it":"Al forno"}', 'verified', false),
  ('pumpkin-raw', 'pumpkin', 'raw', 26, 1, 6.5, 0.1, 'cup', 116, '{}', 'sr-legacy', '168448', 'https://fdc.nal.usda.gov/food-details/168448/nutrients', 'USDA FoodData Central · SR Legacy · Pumpkin, raw.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('pumpkin-cooked', 'pumpkin', 'cooked', 20, 0.72, 4.9, 0.07, 'cup', 245, '{}', 'sr-legacy', '168449', 'https://fdc.nal.usda.gov/food-details/168449/nutrients', 'USDA FoodData Central · SR Legacy · Pumpkin, cooked, boiled, drained, without salt.', '{"es":"Cocido","en":"Cooked","it":"Cotto"}', 'verified', false),
  ('green-beans-raw', 'green-beans', 'raw', 31, 1.83, 6.97, 0.22, 'cup', 100, '{}', 'sr-legacy', '169961', 'https://fdc.nal.usda.gov/food-details/169961/nutrients', 'USDA FoodData Central · SR Legacy · Beans, snap, green, raw.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('green-beans-cooked', 'green-beans', 'cooked', 35, 1.89, 7.88, 0.28, 'cup', 125, '{}', 'sr-legacy', '169141', 'https://fdc.nal.usda.gov/food-details/169141/nutrients', 'USDA FoodData Central · SR Legacy · Beans, snap, green, cooked, boiled, drained, without salt.', '{"es":"Cocido","en":"Cooked","it":"Cotto"}', 'verified', false),
  ('green-peas-raw', 'green-peas', 'raw', 81, 5.42, 14.45, 0.4, 'cup', 145, '{}', 'sr-legacy', '170419', 'https://fdc.nal.usda.gov/food-details/170419/nutrients', 'USDA FoodData Central · SR Legacy · Peas, green, raw.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('green-peas-cooked', 'green-peas', 'cooked', 84, 5.36, 15.63, 0.22, 'cup', 160, '{}', 'sr-legacy', '170420', 'https://fdc.nal.usda.gov/food-details/170420/nutrients', 'USDA FoodData Central · SR Legacy · Peas, green, cooked, boiled, drained, without salt.', '{"es":"Cocido","en":"Cooked","it":"Cotto"}', 'verified', false),
  ('portobello-raw', 'portobello', 'raw', 22, 2.11, 3.87, 0.35, 'cup', 86, '{}', 'sr-legacy', '169255', 'https://fdc.nal.usda.gov/food-details/169255/nutrients', 'USDA FoodData Central · SR Legacy · Mushrooms, portabella, raw.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('oyster-mushrooms-raw', 'oyster-mushrooms', 'raw', 33, 3.31, 6.09, 0.41, 'cup', 86, '{}', 'sr-legacy', '168580', 'https://fdc.nal.usda.gov/food-details/168580/nutrients', 'USDA FoodData Central · SR Legacy · Mushrooms, oyster, raw.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('asparagus-raw', 'asparagus', 'raw', 20, 2.2, 3.88, 0.12, 'cup', 134, '{}', 'sr-legacy', '168389', 'https://fdc.nal.usda.gov/food-details/168389/nutrients', 'USDA FoodData Central · SR Legacy · Asparagus, raw.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('asparagus-cooked', 'asparagus', 'cooked', 22, 2.4, 4.11, 0.22, null, null, '{}', 'sr-legacy', '168390', 'https://fdc.nal.usda.gov/food-details/168390/nutrients', 'USDA FoodData Central · SR Legacy · Asparagus, cooked, boiled, drained.', '{"es":"Cocido","en":"Cooked","it":"Cotto"}', 'verified', false),
  ('celery-raw', 'celery', 'raw', 14, 0.69, 2.97, 0.17, 'cup', 101, '{}', 'sr-legacy', '169988', 'https://fdc.nal.usda.gov/food-details/169988/nutrients', 'USDA FoodData Central · SR Legacy · Celery, raw.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('leek-raw', 'leek', 'raw', 61, 1.5, 14.15, 0.3, 'cup', 89, '{}', 'sr-legacy', '169246', 'https://fdc.nal.usda.gov/food-details/169246/nutrients', 'USDA FoodData Central · SR Legacy · Leeks, (bulb and lower leaf-portion), raw.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('radish-raw', 'radish', 'raw', 16, 0.68, 3.4, 0.1, 'cup', 116, '{}', 'sr-legacy', '169276', 'https://fdc.nal.usda.gov/food-details/169276/nutrients', 'USDA FoodData Central · SR Legacy · Radishes, raw.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('brussels-sprouts-raw', 'brussels-sprouts', 'raw', 43, 3.38, 8.95, 0.3, 'cup', 88, '{}', 'sr-legacy', '170383', 'https://fdc.nal.usda.gov/food-details/170383/nutrients', 'USDA FoodData Central · SR Legacy · Brussels sprouts, raw.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('brussels-sprouts-cooked', 'brussels-sprouts', 'cooked', 36, 2.55, 7.1, 0.5, null, null, '{}', 'sr-legacy', '169971', 'https://fdc.nal.usda.gov/food-details/169971/nutrients', 'USDA FoodData Central · SR Legacy · Brussels sprouts, cooked, boiled, drained, without salt.', '{"es":"Cocido","en":"Cooked","it":"Cotto"}', 'verified', false)
on conflict (id) do nothing;

insert into public.food_references (id, food_id, preparation, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g,
  portion_unit, portion_grams, additional_portions, source_kind, source_ref, source_url, source_description,
  variant_names, validation, is_estimate) values
  ('pear-raw', 'pear', 'raw', 57, 0.36, 15.23, 0.14, 'unit', 178, '{}', 'sr-legacy', '169118', 'https://fdc.nal.usda.gov/food-details/169118/nutrients', 'USDA FoodData Central · SR Legacy · Pears, raw.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('mandarin-raw', 'mandarin', 'raw', 53, 0.81, 13.34, 0.31, 'unit', 88, '{}', 'sr-legacy', '169105', 'https://fdc.nal.usda.gov/food-details/169105/nutrients', 'USDA FoodData Central · SR Legacy · Tangerines, (mandarin oranges), raw.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('grapefruit-raw', 'grapefruit', 'raw', 32, 0.63, 8.08, 0.1, 'unit', 256, '{}', 'sr-legacy', '173033', 'https://fdc.nal.usda.gov/food-details/173033/nutrients', 'USDA FoodData Central · SR Legacy · Grapefruit, raw, pink and red and white, all areas. Peso comestible de un pomelo mediano calculado a partir de medio (128 g).', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('peach-raw', 'peach', 'raw', 39, 0.91, 9.54, 0.25, 'unit', 150, '{}', 'sr-legacy', '169928', 'https://fdc.nal.usda.gov/food-details/169928/nutrients', 'USDA FoodData Central · SR Legacy · Peaches, yellow, raw.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('plum-raw', 'plum', 'raw', 46, 0.7, 11.42, 0.28, 'unit', 66, '{}', 'sr-legacy', '169949', 'https://fdc.nal.usda.gov/food-details/169949/nutrients', 'USDA FoodData Central · SR Legacy · Plums, raw.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('apricot-raw', 'apricot', 'raw', 48, 1.4, 11.12, 0.39, 'unit', 35, '{}', 'sr-legacy', '171697', 'https://fdc.nal.usda.gov/food-details/171697/nutrients', 'USDA FoodData Central · SR Legacy · Apricots, raw.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('strawberry-raw', 'strawberry', 'raw', 32, 0.67, 7.68, 0.3, 'cup', 152, '{}', 'sr-legacy', '167762', 'https://fdc.nal.usda.gov/food-details/167762/nutrients', 'USDA FoodData Central · SR Legacy · Strawberries, raw.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('blueberry-raw', 'blueberry', 'raw', 57, 0.74, 14.49, 0.33, 'cup', 148, '{}', 'sr-legacy', '171711', 'https://fdc.nal.usda.gov/food-details/171711/nutrients', 'USDA FoodData Central · SR Legacy · Blueberries, raw.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('grapes-raw', 'grapes', 'raw', 69, 0.72, 18.1, 0.16, 'cup', 151, '{}', 'sr-legacy', '174683', 'https://fdc.nal.usda.gov/food-details/174683/nutrients', 'USDA FoodData Central · SR Legacy · Grapes, red or green (European type, such as Thompson seedless), raw.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('kiwi-raw', 'kiwi', 'raw', 61, 1.14, 14.66, 0.52, 'unit', 69, '{}', 'sr-legacy', '168153', 'https://fdc.nal.usda.gov/food-details/168153/nutrients', 'USDA FoodData Central · SR Legacy · Kiwifruit, green, raw.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('pineapple-raw', 'pineapple', 'raw', 50, 0.54, 13.12, 0.12, 'cup', 165, '{}', 'sr-legacy', '169124', 'https://fdc.nal.usda.gov/food-details/169124/nutrients', 'USDA FoodData Central · SR Legacy · Pineapple, raw, all varieties.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('mango-raw', 'mango', 'raw', 60, 0.82, 14.98, 0.38, 'cup', 165, '{}', 'sr-legacy', '169910', 'https://fdc.nal.usda.gov/food-details/169910/nutrients', 'USDA FoodData Central · SR Legacy · Mangos, raw.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('melon-raw', 'melon', 'raw', 34, 0.84, 8.16, 0.19, 'cup', 160, '{}', 'sr-legacy', '169092', 'https://fdc.nal.usda.gov/food-details/169092/nutrients', 'USDA FoodData Central · SR Legacy · Melons, cantaloupe, raw.', '{"es":"Tipo cantalupo","en":"Cantaloupe","it":"Tipo cantalupo"}', 'verified', false),
  ('watermelon-raw', 'watermelon', 'raw', 30, 0.61, 7.55, 0.15, 'cup', 152, '{}', 'sr-legacy', '167765', 'https://fdc.nal.usda.gov/food-details/167765/nutrients', 'USDA FoodData Central · SR Legacy · Watermelon, raw.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('coconut-raw', 'coconut', 'raw', 354, 3.33, 15.23, 33.49, 'cup', 80, '{}', 'sr-legacy', '170169', 'https://fdc.nal.usda.gov/food-details/170169/nutrients', 'USDA FoodData Central · SR Legacy · Nuts, coconut meat, raw.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false)
on conflict (id) do nothing;

insert into public.food_references (id, food_id, preparation, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g,
  portion_unit, portion_grams, additional_portions, source_kind, source_ref, source_url, source_description,
  variant_names, validation, is_estimate) values
  ('pecans-raw', 'pecans', 'raw', 691, 9.17, 13.86, 71.97, 'handful', 28.35, '{}', 'sr-legacy', '170182', 'https://fdc.nal.usda.gov/food-details/170182/nutrients', 'USDA FoodData Central · SR Legacy · Nuts, pecans.  Puñado orientativo equivalente a una onza de parte comestible.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('peanuts-prepared', 'peanuts', 'prepared', 587, 24.35, 21.26, 49.66, 'handful', 28.35, '{}', 'sr-legacy', '173806', 'https://fdc.nal.usda.gov/food-details/173806/nutrients', 'USDA FoodData Central · SR Legacy · Peanuts, all types, dry-roasted, without salt.  Puñado orientativo equivalente a una onza de parte comestible.', '{"es":"Sin sal","en":"Unsalted","it":"Senza sale"}', 'verified', false),
  ('cashews-raw', 'cashews', 'raw', 553, 18.22, 30.19, 43.85, 'handful', 28.35, '{}', 'sr-legacy', '170162', 'https://fdc.nal.usda.gov/food-details/170162/nutrients', 'USDA FoodData Central · SR Legacy · Nuts, cashew nuts, raw.  Puñado orientativo equivalente a una onza de parte comestible.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('pistachios-raw', 'pistachios', 'raw', 560, 20.16, 27.17, 45.32, 'handful', 28.35, '{}', 'sr-legacy', '170184', 'https://fdc.nal.usda.gov/food-details/170184/nutrients', 'USDA FoodData Central · SR Legacy · Nuts, pistachio nuts, raw.  Puñado orientativo equivalente a una onza de parte comestible.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('hazelnuts-raw', 'hazelnuts', 'raw', 628, 14.95, 16.7, 60.75, 'handful', 28.35, '{}', 'sr-legacy', '170581', 'https://fdc.nal.usda.gov/food-details/170581/nutrients', 'USDA FoodData Central · SR Legacy · Nuts, hazelnuts or filberts.  Puñado orientativo equivalente a una onza de parte comestible.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('chia-prepared', 'chia', 'prepared', 486, 16.54, 42.12, 30.74, 'serving', 28.35, '{}', 'sr-legacy', '170554', 'https://fdc.nal.usda.gov/food-details/170554/nutrients', 'USDA FoodData Central · SR Legacy · Seeds, chia seeds, dried.', '{"es":"Preparado","en":"Prepared","it":"Preparato"}', 'verified', false),
  ('flaxseed-prepared', 'flaxseed', 'prepared', 534, 18.29, 28.88, 42.16, 'tablespoon', 10.3, '{}', 'sr-legacy', '169414', 'https://fdc.nal.usda.gov/food-details/169414/nutrients', 'USDA FoodData Central · SR Legacy · Seeds, flaxseed.', '{"es":"Preparado","en":"Prepared","it":"Preparato"}', 'verified', false),
  ('sunflower-seeds-prepared', 'sunflower-seeds', 'prepared', 584, 20.78, 20, 51.46, 'cup', 140, '{}', 'sr-legacy', '170562', 'https://fdc.nal.usda.gov/food-details/170562/nutrients', 'USDA FoodData Central · SR Legacy · Seeds, sunflower seed kernels, dried.', '{"es":"Preparado","en":"Prepared","it":"Preparato"}', 'verified', false),
  ('sesame-prepared', 'sesame', 'prepared', 573, 17.73, 23.45, 49.67, 'tablespoon', 9, '{}', 'sr-legacy', '170150', 'https://fdc.nal.usda.gov/food-details/170150/nutrients', 'USDA FoodData Central · SR Legacy · Seeds, sesame seeds, whole, dried.', '{"es":"Preparado","en":"Prepared","it":"Preparato"}', 'verified', false)
on conflict (id) do nothing;

insert into public.food_references (id, food_id, preparation, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g,
  portion_unit, portion_grams, additional_portions, source_kind, source_ref, source_url, source_description,
  variant_names, validation, is_estimate) values
  ('beef-steak-cooked', 'beef-steak', 'cooked', 189, 24.6, null, 10.1, 'steakMedium', 160, '{"steakSmall":120,"steakLarge":240}', 'official', '227', 'https://www.argenfood.unlu.edu.ar/Tablas/Codigo/227.htm', 'ARGENFOODS · Bife vacuno genérico a la parrilla. Tamaños orientativos de USDA FNDDS 2705824: fino, regular y grueso, en peso cocido comestible.', '{"es":"A la parrilla","en":"Grilled","it":"Alla griglia"}', 'estimated', true),
  ('beef-tenderloin-cooked', 'beef-tenderloin', 'cooked', 211, 30.5, 0, 8.91, null, null, '{}', 'sr-legacy', '170237', 'https://fdc.nal.usda.gov/food-details/170237/nutrients', 'USDA FoodData Central · SR Legacy · Beef, loin, tenderloin steak, boneless, separable lean and fat, trimmed to 0" fat, all grades, cooked, grilled.', '{"es":"A la parrilla","en":"Grilled","it":"Alla griglia"}', 'verified', false),
  ('beef-tenderloin-raw', 'beef-tenderloin', 'raw', 116, 20, null, 4, null, null, '{}', 'official', '233', 'https://www.argenfood.unlu.edu.ar/Tablas/Codigo/233.htm', 'ARGENFOODS · Lomo vacuno crudo.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('skirt-steak-cooked', 'skirt-steak', 'cooked', 255, 23.51, 0, 17.13, null, null, '{}', 'sr-legacy', '171788', 'https://fdc.nal.usda.gov/food-details/171788/nutrients', 'USDA FoodData Central · SR Legacy · Beef, plate, outside skirt steak, separable lean and fat, trimmed to 0" fat, all grades, cooked, broiled.', '{"es":"Al asador","en":"Broiled","it":"Al grill"}', 'verified', false),
  ('cuadrada-raw', 'cuadrada', 'raw', 142, 21.59, 0, 5.53, null, null, '{}', 'sr-legacy', '173371', 'https://fdc.nal.usda.gov/food-details/173371/nutrients', 'USDA FoodData Central · SR Legacy · Beef, round, outside round, bottom round, steak, separable lean and fat, trimmed to 0" fat, all grades, raw. El outside round desgrasado es un corte comparable a la cuadrada argentina.', '{"es":"Corte comparable, desgrasado","en":"Comparable cut, trimmed","it":"Taglio comparabile, sgrassato"}', 'estimated', true),
  ('knuckle-raw', 'knuckle', 'raw', 114, 22, 0, 3.2, null, null, '{}', 'official', '504', 'https://www.argenfood.unlu.edu.ar/Tablas/Codigo/504.htm', 'ARGENFOODS · Bola de lomo de novillito cruda.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('rump-raw', 'rump', 'raw', 116, 22, 0, 2.6, null, null, '{}', 'official', '507', 'https://www.argenfood.unlu.edu.ar/Tablas/Codigo/507.htm', 'ARGENFOODS · Corazón de cuadril de novillito crudo.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('tri-tip-raw', 'tri-tip', 'raw', 143, 21, 0, 6.7, null, null, '{}', 'official', '506', 'https://www.argenfood.unlu.edu.ar/Tablas/Codigo/506.htm', 'ARGENFOODS · Colita de cuadril de novillito cruda.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('tri-tip-cooked', 'tri-tip', 'cooked', 211, 26.05, 0, 11.07, null, null, '{}', 'sr-legacy', '169558', 'https://fdc.nal.usda.gov/food-details/169558/nutrients', 'USDA FoodData Central · SR Legacy · Beef, bottom sirloin, tri-tip roast, separable lean and fat, trimmed to 0" fat, all grades, cooked, roasted. Corte comparable tri-tip. Peso cocido sin hueso.', '{"es":"Al horno","en":"Roasted","it":"Al forno"}', 'estimated', true),
  ('flank-raw', 'flank', 'raw', 174, 20, 0, 11, null, null, '{}', 'official', '517', 'https://www.argenfood.unlu.edu.ar/Tablas/Codigo/517.htm', 'ARGENFOODS · Vacío de novillito crudo.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('flank-cooked', 'flank', 'cooked', 258, 25.6, null, 17.3, null, null, '{}', 'official', '240', 'https://www.argenfood.unlu.edu.ar/Tablas/Codigo/240.htm', 'ARGENFOODS · Vacío vacuno a la parrilla.', '{"es":"A la parrilla","en":"Grilled","it":"Alla griglia"}', 'verified', false),
  ('short-ribs-raw', 'short-ribs', 'raw', 170, 18.4, null, 10.7, null, null, '{}', 'official', '226', 'https://www.argenfood.unlu.edu.ar/Tablas/Codigo/226.htm', 'ARGENFOODS · Asado vacuno fresco crudo. Peso de la parte comestible, sin hueso.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('short-ribs-cooked', 'short-ribs', 'cooked', 240, 26.1, 0, 15.1, null, null, '{}', 'official', 'SARA 2 · tabla 7.A, asado entre los cortes grasos', 'https://iah.msal.gov.ar/doc/720.pdf', 'Promedio de cortes grasos a la parrilla del grupo que incluye el asado. Peso sin hueso.', '{"es":"A la parrilla","en":"Grilled","it":"Alla griglia"}', 'estimated', true),
  ('matambre-cooked', 'matambre', 'cooked', 240, 26.1, 0, 15.1, null, null, '{}', 'official', 'SARA 2 · tabla 7.A, matambre entre los cortes grasos', 'https://iah.msal.gov.ar/doc/720.pdf', 'Promedio de cortes grasos a la parrilla del grupo que incluye el matambre. Estimación provisional sin relleno.', '{"es":"A la parrilla","en":"Grilled","it":"Alla griglia"}', 'estimated', true),
  ('eye-round-raw', 'eye-round', 'raw', 125, 23, 0, 1.9, null, null, '{}', 'official', '514', 'https://www.argenfood.unlu.edu.ar/Tablas/Codigo/514.htm', 'ARGENFOODS · Peceto de novillito crudo.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('eye-round-cooked', 'eye-round', 'cooked', 155, 29.85, 0, 3.9, null, null, '{}', 'sr-legacy', '171772', 'https://fdc.nal.usda.gov/food-details/171772/nutrients', 'USDA FoodData Central · SR Legacy · Beef, round, eye of round steak, boneless, separable lean only, trimmed to 0" fat, all grades, cooked, grilled.', '{"es":"A la parrilla","en":"Grilled","it":"Alla griglia"}', 'verified', false),
  ('beef-shank-raw', 'beef-shank', 'raw', 128, 21.75, 0, 3.85, null, null, '{}', 'sr-legacy', '169441', 'https://fdc.nal.usda.gov/food-details/169441/nutrients', 'USDA FoodData Central · SR Legacy · Beef, shank crosscuts, separable lean only, trimmed to 1/4" fat, choice, raw.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('beef-shank-cooked', 'beef-shank', 'cooked', 201, 33.68, 0, 6.36, null, null, '{}', 'sr-legacy', '169442', 'https://fdc.nal.usda.gov/food-details/169442/nutrients', 'USDA FoodData Central · SR Legacy · Beef, shank crosscuts, separable lean only, trimmed to 1/4" fat, choice, cooked, simmered.', '{"es":"Hervido lento, sin hueso","en":"Simmered, boneless","it":"Sobbollito, senza osso"}', 'verified', false),
  ('ground-beef-common-raw', 'ground-beef-common', 'raw', 254, 17.17, 0, 20, null, null, '{}', 'sr-legacy', '174036', 'https://fdc.nal.usda.gov/food-details/174036/nutrients', 'USDA FoodData Central · SR Legacy · Beef, ground, 80% lean meat / 20% fat, raw.', '{"es":"20 % de grasa","en":"20% fat","it":"20% di grassi"}', 'verified', false),
  ('ground-beef-common-cooked', 'ground-beef-common', 'cooked', 272, 27, 0, 17.36, null, null, '{}', 'sr-legacy', '171799', 'https://fdc.nal.usda.gov/food-details/171799/nutrients', 'USDA FoodData Central · SR Legacy · Beef, ground, 80% lean meat / 20% fat, crumbles, cooked, pan-browned.', '{"es":"20 % de grasa","en":"20% fat","it":"20% di grassi"}', 'verified', false)
on conflict (id) do nothing;

insert into public.food_references (id, food_id, preparation, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g,
  portion_unit, portion_grams, additional_portions, source_kind, source_ref, source_url, source_description,
  variant_names, validation, is_estimate) values
  ('pork-shoulder-cooked', 'pork-shoulder', 'cooked', 267, 25.07, 0, 17.69, null, null, '{}', 'sr-legacy', '167850', 'https://fdc.nal.usda.gov/food-details/167850/nutrients', 'USDA FoodData Central · SR Legacy · Pork, fresh, shoulder, (Boston butt), blade (steaks), separable lean and fat, cooked, braised. Corte comparable de la parte alta del hombro. Peso comestible.', '{"es":"Braseado","en":"Braised","it":"Brasato"}', 'estimated', true),
  ('pork-tenderloin-raw', 'pork-tenderloin', 'raw', 120, 20.65, 0, 3.53, null, null, '{}', 'sr-legacy', '168312', 'https://fdc.nal.usda.gov/food-details/168312/nutrients', 'USDA FoodData Central · SR Legacy · Pork, fresh, loin, tenderloin, separable lean and fat, raw.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('pork-tenderloin-cooked', 'pork-tenderloin', 'cooked', 147, 26.04, 0, 3.96, null, null, '{}', 'sr-legacy', '167905', 'https://fdc.nal.usda.gov/food-details/167905/nutrients', 'USDA FoodData Central · SR Legacy · Pork, fresh, loin, tenderloin, separable lean and fat, cooked, roasted.', '{"es":"Al horno","en":"Roasted","it":"Al forno"}', 'verified', false),
  ('pork-ribs-raw', 'pork-ribs', 'raw', 277, 15.47, 0, 23.4, null, null, '{}', 'sr-legacy', '167853', 'https://fdc.nal.usda.gov/food-details/167853/nutrients', 'USDA FoodData Central · SR Legacy · Pork, fresh, spareribs, separable lean and fat, raw.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('pork-ribs-cooked', 'pork-ribs', 'cooked', 361, 20.89, 0, 30.86, null, null, '{}', 'sr-legacy', '169178', 'https://fdc.nal.usda.gov/food-details/169178/nutrients', 'USDA FoodData Central · SR Legacy · Pork, fresh, spareribs, separable lean and fat, cooked, roasted.', '{"es":"Al horno","en":"Roasted","it":"Al forno"}', 'verified', false),
  ('pork-loin-raw', 'pork-loin', 'raw', 198, 19.74, 0, 12.58, null, null, '{}', 'sr-legacy', '167818', 'https://fdc.nal.usda.gov/food-details/167818/nutrients', 'USDA FoodData Central · SR Legacy · Pork, fresh, loin, whole, separable lean and fat, raw.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false),
  ('pork-loin-cooked', 'pork-loin', 'cooked', 248, 27.09, 0, 14.65, null, null, '{}', 'sr-legacy', '167821', 'https://fdc.nal.usda.gov/food-details/167821/nutrients', 'USDA FoodData Central · SR Legacy · Pork, fresh, loin, whole, separable lean and fat, cooked, roasted.', '{"es":"Al horno","en":"Roasted","it":"Al forno"}', 'verified', false),
  ('bacon-prepared', 'bacon', 'prepared', 393, 13.66, 0, 37.13, null, null, '{}', 'sr-legacy', '168277', 'https://fdc.nal.usda.gov/food-details/168277/nutrients', 'USDA FoodData Central · SR Legacy · Pork, cured, bacon, unprepared.', '{"es":"Curada, sin cocinar","en":"Cured, uncooked","it":"Salata, da cuocere"}', 'verified', false),
  ('bacon-cooked', 'bacon', 'cooked', 468, 33.92, 1.7, 35.09, 'slice', 11.5, '{}', 'sr-legacy', '168322', 'https://fdc.nal.usda.gov/food-details/168322/nutrients', 'USDA FoodData Central · SR Legacy · Pork, cured, bacon, pre-sliced, cooked, pan-fried.', '{"es":"Dorada en sartén","en":"Pan-fried","it":"Rosolata in padella"}', 'verified', false)
on conflict (id) do nothing;

insert into public.food_references (id, food_id, preparation, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g,
  portion_unit, portion_grams, additional_portions, source_kind, source_ref, source_url, source_description,
  variant_names, validation, is_estimate) values
  ('chicken-thigh-raw', 'chicken-thigh', 'raw', 221, 16.52, 0.25, 16.61, null, null, '{}', 'sr-legacy', '172385', 'https://fdc.nal.usda.gov/food-details/172385/nutrients', 'USDA FoodData Central · SR Legacy · Chicken, broilers or fryers, thigh, meat and skin, raw.', '{"es":"Con piel","en":"Skin on","it":"Con pelle"}', 'verified', false),
  ('chicken-thigh-cooked-skinless', 'chicken-thigh', 'cooked', 179, 24.76, 0, 8.15, 'piece', 116, '{}', 'sr-legacy', '172388', 'https://fdc.nal.usda.gov/food-details/172388/nutrients', 'USDA FoodData Central · SR Legacy · Chicken, broilers or fryers, thigh, meat only, cooked, roasted.', '{"es":"Sin piel","en":"Skinless","it":"Senza pelle"}', 'verified', false),
  ('chicken-thigh-cooked-skin-on', 'chicken-thigh', 'cooked', 232, 23.26, 0, 14.71, 'piece', 137, '{}', 'sr-legacy', '173625', 'https://fdc.nal.usda.gov/food-details/173625/nutrients', 'USDA FoodData Central · SR Legacy · Chicken, broilers or fryers, thigh, meat and skin, cooked, roasted.', '{"es":"Con piel","en":"Skin on","it":"Con pelle"}', 'verified', false),
  ('chicken-drumstick-raw', 'chicken-drumstick', 'raw', 161, 18.08, 0.11, 9.2, null, null, '{}', 'sr-legacy', '172373', 'https://fdc.nal.usda.gov/food-details/172373/nutrients', 'USDA FoodData Central · SR Legacy · Chicken, broilers or fryers, drumstick, meat and skin, raw.', '{"es":"Con piel","en":"Skin on","it":"Con pelle"}', 'verified', false),
  ('chicken-drumstick-cooked-skin-on', 'chicken-drumstick', 'cooked', 190, 23.2, 0, 10.1, 'piece', 60, '{}', 'fndds', '2706002', 'https://fdc.nal.usda.gov/food-details/2706002/nutrients', 'USDA FoodData Central · FNDDS 2021–2023 · Chicken drumstick, baked, broiled, or roasted, skin eaten, from raw. Peso comestible de una pata mediana con piel, sin hueso.', '{"es":"Con piel","en":"Skin on","it":"Con pelle"}', 'verified', false),
  ('chicken-drumstick-cooked-skinless', 'chicken-drumstick', 'cooked', 154, 24.1, 0, 5.67, 'piece', 50, '{}', 'fndds', '2706003', 'https://fdc.nal.usda.gov/food-details/2706003/nutrients', 'USDA FoodData Central · FNDDS 2021–2023 · Chicken drumstick, baked, broiled, or roasted, skin not eaten, from raw. Peso comestible de una pata mediana sin piel ni hueso.', '{"es":"Sin piel","en":"Skinless","it":"Senza pelle"}', 'verified', false),
  ('chicken-leg-raw', 'chicken-leg', 'raw', 214, 16.37, 0.17, 15.95, null, null, '{}', 'sr-legacy', '172378', 'https://fdc.nal.usda.gov/food-details/172378/nutrients', 'USDA FoodData Central · SR Legacy · Chicken, broilers or fryers, leg, meat and skin, raw.', '{"es":"Con piel","en":"Skin on","it":"Con pelle"}', 'verified', false),
  ('chicken-leg-cooked-skinless', 'chicken-leg', 'cooked', 174, 24.22, 0, 7.8, 'piece', 199, '{}', 'sr-legacy', '172380', 'https://fdc.nal.usda.gov/food-details/172380/nutrients', 'USDA FoodData Central · SR Legacy · Chicken, broilers or fryers, leg, meat only, cooked, roasted.', '{"es":"Sin piel","en":"Skinless","it":"Senza pelle"}', 'verified', false),
  ('chicken-leg-cooked-skin-on', 'chicken-leg', 'cooked', 184, 24.03, 0, 8.99, 'piece', 258, '{}', 'sr-legacy', '173617', 'https://fdc.nal.usda.gov/food-details/173617/nutrients', 'USDA FoodData Central · SR Legacy · Chicken, broilers or fryers, leg, meat and skin, cooked, roasted.', '{"es":"Con piel","en":"Skin on","it":"Con pelle"}', 'verified', false),
  ('turkey-breast-cooked', 'turkey-breast', 'cooked', 147, 30.13, 0, 2.08, null, null, '{}', 'sr-legacy', '171496', 'https://fdc.nal.usda.gov/food-details/171496/nutrients', 'USDA FoodData Central · SR Legacy · Turkey, whole, breast, meat only, cooked, roasted.', '{"es":"Al horno","en":"Roasted","it":"Al forno"}', 'verified', false),
  ('turkey-breast-raw', 'turkey-breast', 'raw', 114, 23.66, 0.14, 1.48, null, null, '{}', 'sr-legacy', '171098', 'https://fdc.nal.usda.gov/food-details/171098/nutrients', 'USDA FoodData Central · SR Legacy · Turkey, whole, breast, meat only, raw.', '{"es":"Crudo","en":"Raw","it":"Crudo"}', 'verified', false)
on conflict (id) do nothing;

insert into public.food_references (id, food_id, preparation, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g,
  portion_unit, portion_grams, additional_portions, source_kind, source_ref, source_url, source_description,
  variant_names, validation, is_estimate) values
  ('fresh-tuna-raw', 'fresh-tuna', 'raw', 109, 24.4, 0, 0.49, null, null, '{}', 'sr-legacy', '175159', 'https://fdc.nal.usda.gov/food-details/175159/nutrients', 'USDA FoodData Central · SR Legacy · Fish, tuna, fresh, yellowfin, raw.', '{"es":"Aleta amarilla","en":"Yellowfin","it":"Pinna gialla"}', 'verified', false),
  ('fresh-tuna-cooked', 'fresh-tuna', 'cooked', 130, 29.15, 0, 0.59, null, null, '{}', 'sr-legacy', '172006', 'https://fdc.nal.usda.gov/food-details/172006/nutrients', 'USDA FoodData Central · SR Legacy · Fish, tuna, yellowfin, fresh, cooked, dry heat.', '{"es":"Aleta amarilla","en":"Yellowfin","it":"Pinna gialla"}', 'verified', false),
  ('sole-raw', 'sole', 'raw', 70, 12.41, 0, 1.93, null, null, '{}', 'sr-legacy', '174196', 'https://fdc.nal.usda.gov/food-details/174196/nutrients', 'USDA FoodData Central · SR Legacy · Fish, flatfish (flounder and sole species), raw. USDA agrupa lenguados y otros peces planos. Parte comestible.', '{"es":"Mezcla de peces planos","en":"Flatfish mix","it":"Mix di pesci piatti"}', 'estimated', true),
  ('sole-cooked', 'sole', 'cooked', 86, 15.24, 0, 2.37, null, null, '{}', 'sr-legacy', '174197', 'https://fdc.nal.usda.gov/food-details/174197/nutrients', 'USDA FoodData Central · SR Legacy · Fish, flatfish (flounder and sole species), cooked, dry heat. USDA agrupa lenguados y otros peces planos. Cocción seca.', '{"es":"Mezcla de peces planos","en":"Flatfish mix","it":"Mix di pesci piatti"}', 'estimated', true),
  ('trout-raw', 'trout', 'raw', 141, 19.94, 0, 6.18, null, null, '{}', 'sr-legacy', '173717', 'https://fdc.nal.usda.gov/food-details/173717/nutrients', 'USDA FoodData Central · SR Legacy · Fish, trout, rainbow, farmed, raw.', '{"es":"De criadero","en":"Farmed","it":"Di allevamento"}', 'verified', false),
  ('trout-cooked', 'trout', 'cooked', 168, 23.8, 0, 7.38, 'piece', 71, '{}', 'sr-legacy', '173718', 'https://fdc.nal.usda.gov/food-details/173718/nutrients', 'USDA FoodData Central · SR Legacy · Fish, trout, rainbow, farmed, cooked, dry heat.', '{"es":"De criadero","en":"Farmed","it":"Di allevamento"}', 'verified', false),
  ('sardines-prepared', 'sardines', 'prepared', 208, 24.62, 0, 11.45, null, null, '{}', 'sr-legacy', '175139', 'https://fdc.nal.usda.gov/food-details/175139/nutrients', 'USDA FoodData Central · SR Legacy · Fish, sardine, Atlantic, canned in oil, drained solids with bone.', '{"es":"En aceite, escurridas","en":"In oil, drained","it":"Sott’olio, sgocciolate"}', 'verified', false),
  ('mackerel-raw', 'mackerel', 'raw', 205, 18.6, 0, 13.89, null, null, '{}', 'sr-legacy', '175119', 'https://fdc.nal.usda.gov/food-details/175119/nutrients', 'USDA FoodData Central · SR Legacy · Fish, mackerel, Atlantic, raw.', '{"es":"Del Atlántico","en":"Atlantic","it":"Atlantico"}', 'verified', false),
  ('mackerel-cooked', 'mackerel', 'cooked', 262, 23.85, 0, 17.81, null, null, '{}', 'sr-legacy', '175120', 'https://fdc.nal.usda.gov/food-details/175120/nutrients', 'USDA FoodData Central · SR Legacy · Fish, mackerel, Atlantic, cooked, dry heat.', '{"es":"Del Atlántico","en":"Atlantic","it":"Atlantico"}', 'verified', false),
  ('argentine-prawn-raw', 'argentine-prawn', 'raw', 59, 13.1, null, 0.7, null, null, '{}', 'label', 'Cabo Vírgenes · Pleoticus muelleri, cola pelada', 'https://www.cabovirgenes.es/wp-content/uploads/3.5-TS-Argentine-Shrimp-Tails-Peeled-And-Deveined-Tail-On-EAN-en.pdf', 'Etiqueta de cola cruda congelada, pelada y desvenada de langostino argentino. Incluye agua y sal. Carbohidratos declarados por debajo de 0,5 g.', '{"es":"Cola de langostino patagónico","en":"Argentine red shrimp tail","it":"Coda di gambero argentino"}', 'estimated', true),
  ('squid-raw', 'squid', 'raw', 92, 15.58, 3.08, 1.38, null, null, '{}', 'sr-legacy', '174223', 'https://fdc.nal.usda.gov/food-details/174223/nutrients', 'USDA FoodData Central · SR Legacy · Mollusks, squid, mixed species, raw.', '{"es":"Especies mixtas","en":"Mixed species","it":"Specie miste"}', 'verified', false),
  ('mussels-raw', 'mussels', 'raw', 86, 11.9, 3.69, 2.24, null, null, '{}', 'sr-legacy', '174216', 'https://fdc.nal.usda.gov/food-details/174216/nutrients', 'USDA FoodData Central · SR Legacy · Mollusks, mussel, blue, raw.', '{"es":"Mejillón azul","en":"Blue mussel","it":"Cozza comune"}', 'verified', false),
  ('mussels-cooked', 'mussels', 'cooked', 172, 23.8, 7.39, 4.48, null, null, '{}', 'sr-legacy', '174217', 'https://fdc.nal.usda.gov/food-details/174217/nutrients', 'USDA FoodData Central · SR Legacy · Mollusks, mussel, blue, cooked, moist heat.', '{"es":"Mejillón azul","en":"Blue mussel","it":"Cozza comune"}', 'verified', false)
on conflict (id) do nothing;

insert into public.food_references (id, food_id, preparation, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g,
  portion_unit, portion_grams, additional_portions, source_kind, source_ref, source_url, source_description,
  variant_names, validation, is_estimate) values
  ('egg-white-raw', 'egg-white', 'raw', 52, 10.9, 0.73, 0.17, 'unit', 33, '{}', 'sr-legacy', '172183', 'https://fdc.nal.usda.gov/food-details/172183/nutrients', 'USDA FoodData Central · SR Legacy · Egg, white, raw, fresh. Clara de un huevo grande.', '{"es":"Cruda","en":"Raw","it":"Crudo"}', 'verified', false),
  ('egg-yolk-raw', 'egg-yolk', 'raw', 322, 15.86, 3.59, 26.54, 'unit', 17, '{}', 'sr-legacy', '172184', 'https://fdc.nal.usda.gov/food-details/172184/nutrients', 'USDA FoodData Central · SR Legacy · Egg, yolk, raw, fresh. Yema de un huevo grande.', '{"es":"Cruda","en":"Raw","it":"Crudo"}', 'verified', false)
on conflict (id) do nothing;

insert into public.food_references (id, food_id, preparation, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g,
  portion_unit, portion_grams, additional_portions, source_kind, source_ref, source_url, source_description,
  variant_names, validation, is_estimate) values
  ('milk-whole-prepared', 'milk-whole', 'prepared', 61, 3.15, 4.8, 3.25, 'cup', 244, '{}', 'sr-legacy', '171265', 'https://fdc.nal.usda.gov/food-details/171265/nutrients', 'USDA FoodData Central · SR Legacy · Milk, whole, 3.25% milkfat, with added vitamin D.', '{"es":"Preparado","en":"Prepared","it":"Preparato"}', 'verified', false),
  ('milk-low-fat-prepared', 'milk-low-fat', 'prepared', 50, 3.3, 4.8, 1.98, 'cup', 244, '{}', 'sr-legacy', '171267', 'https://fdc.nal.usda.gov/food-details/171267/nutrients', 'USDA FoodData Central · SR Legacy · Milk, reduced fat, fluid, 2% milkfat, with added vitamin A and vitamin D.', '{"es":"2 % de grasa","en":"2% milk fat","it":"2% di grassi"}', 'verified', false),
  ('milk-skim-prepared', 'milk-skim', 'prepared', 34, 3.37, 4.96, 0.08, 'cup', 245, '{}', 'sr-legacy', '171269', 'https://fdc.nal.usda.gov/food-details/171269/nutrients', 'USDA FoodData Central · SR Legacy · Milk, nonfat, fluid, with added vitamin A and vitamin D (fat free or skim).', '{"es":"Preparado","en":"Prepared","it":"Preparato"}', 'verified', false),
  ('yogurt-flavored-prepared', 'yogurt-flavored', 'prepared', 85, 4.93, 13.8, 1.25, 'cup', 245, '{}', 'sr-legacy', '170888', 'https://fdc.nal.usda.gov/food-details/170888/nutrients', 'USDA FoodData Central · SR Legacy · Yogurt, vanilla, low fat.. Ejemplo USDA de yogur de vainilla bajo en grasa. La fórmula comercial varía.', '{"es":"Vainilla, bajo en grasa","en":"Vanilla, low fat","it":"Vaniglia, magro"}', 'estimated', true),
  ('yogurt-greek-prepared-whole', 'yogurt-greek', 'prepared', 97, 9, 3.98, 5, null, null, '{}', 'sr-legacy', '171304', 'https://fdc.nal.usda.gov/food-details/171304/nutrients', 'USDA FoodData Central · SR Legacy · Yogurt, Greek, plain, whole milk.', '{"es":"Entero","en":"Whole milk","it":"Latte intero"}', 'verified', false),
  ('yogurt-greek-prepared-nonfat', 'yogurt-greek', 'prepared', 59, 10.19, 3.6, 0.39, 'serving', 170, '{}', 'sr-legacy', '170894', 'https://fdc.nal.usda.gov/food-details/170894/nutrients', 'USDA FoodData Central · SR Legacy · Yogurt, Greek, plain, nonfat (Includes foods for USDA''s Food Distribution Program).', '{"es":"Descremado","en":"Nonfat","it":"Scremato"}', 'verified', false),
  ('port-salut-prepared', 'port-salut', 'prepared', 310, 20, 1, 25, 'serving', 30, '{}', 'label', 'La Serenísima · Port Salut tradicional', 'https://www.laserenisima.com.ar/Nutriboletin/20200803/img/TablasJulio2020.pdf', 'Etiqueta La Serenísima, versión tradicional naturalmente sin lactosa. Porción declarada de 30 g.', '{"es":"Tradicional","en":"Regular","it":"Tradizionale"}', 'estimated', true),
  ('cream-cheese-prepared', 'cream-cheese', 'prepared', 350, 6.15, 5.52, 34.44, 'tablespoon', 14.5, '{}', 'sr-legacy', '173418', 'https://fdc.nal.usda.gov/food-details/173418/nutrients', 'USDA FoodData Central · SR Legacy · Cheese, cream.', '{"es":"Preparado","en":"Prepared","it":"Preparato"}', 'verified', false),
  ('ricotta-prepared-whole', 'ricotta', 'prepared', 150, 7.54, 7.27, 10.18, 'cup', 246, '{}', 'sr-legacy', '170851', 'https://fdc.nal.usda.gov/food-details/170851/nutrients', 'USDA FoodData Central · SR Legacy · Cheese, ricotta, whole milk.', '{"es":"Entero","en":"Whole milk","it":"Latte intero"}', 'verified', false),
  ('ricotta-prepared-reduced-fat', 'ricotta', 'prepared', 138, 11.39, 5.14, 7.91, 'cup', 246, '{}', 'sr-legacy', '171248', 'https://fdc.nal.usda.gov/food-details/171248/nutrients', 'USDA FoodData Central · SR Legacy · Cheese, ricotta, part skim milk.', '{"es":"Parcialmente descremada","en":"Part-skim","it":"Parzialmente scremata"}', 'verified', false),
  ('semi-hard-cheese-prepared', 'semi-hard-cheese', 'prepared', 356, 24.94, 2.22, 27.44, 'serving', 28.35, '{}', 'sr-legacy', '171241', 'https://fdc.nal.usda.gov/food-details/171241/nutrients', 'USDA FoodData Central · SR Legacy · Cheese, gouda. Ejemplo de queso semiduro tipo Gouda. La variedad y el tamaño de feta pueden cambiar.', '{"es":"Tipo Gouda","en":"Gouda style","it":"Tipo Gouda"}', 'estimated', true),
  ('heavy-cream-prepared', 'heavy-cream', 'prepared', 340, 2.84, 2.84, 36.08, 'tablespoon', 15, '{"cup":238}', 'sr-legacy', '170859', 'https://fdc.nal.usda.gov/food-details/170859/nutrients', 'USDA FoodData Central · SR Legacy · Cream, fluid, heavy whipping.', '{"es":"Crema para batir","en":"Whipping cream","it":"Panna da montare"}', 'verified', false)
on conflict (id) do nothing;

insert into public.food_references (id, food_id, preparation, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g,
  portion_unit, portion_grams, additional_portions, source_kind, source_ref, source_url, source_description,
  variant_names, validation, is_estimate) values
  ('quinoa-raw', 'quinoa', 'raw', 368, 14.12, 64.16, 6.07, 'cup', 170, '{}', 'sr-legacy', '168874', 'https://fdc.nal.usda.gov/food-details/168874/nutrients', 'USDA FoodData Central · SR Legacy · Quinoa, uncooked.', '{"es":"Seco","en":"Dry","it":"Secco"}', 'verified', false),
  ('quinoa-cooked', 'quinoa', 'cooked', 120, 4.4, 21.3, 1.92, 'cup', 185, '{}', 'sr-legacy', '168917', 'https://fdc.nal.usda.gov/food-details/168917/nutrients', 'USDA FoodData Central · SR Legacy · Quinoa, cooked.', '{"es":"Cocido","en":"Cooked","it":"Cotto"}', 'verified', false),
  ('couscous-raw', 'couscous', 'raw', 376, 12.76, 77.43, 0.64, 'cup', 173, '{}', 'sr-legacy', '169699', 'https://fdc.nal.usda.gov/food-details/169699/nutrients', 'USDA FoodData Central · SR Legacy · Couscous, dry.', '{"es":"Seco","en":"Dry","it":"Secco"}', 'verified', false),
  ('couscous-cooked', 'couscous', 'cooked', 112, 3.79, 23.22, 0.16, 'cup', 157, '{}', 'sr-legacy', '169700', 'https://fdc.nal.usda.gov/food-details/169700/nutrients', 'USDA FoodData Central · SR Legacy · Couscous, cooked.', '{"es":"Cocido","en":"Cooked","it":"Cotto"}', 'verified', false),
  ('polenta-raw', 'polenta', 'raw', 362, 8.12, 76.89, 3.59, 'cup', 122, '{}', 'sr-legacy', '169697', 'https://fdc.nal.usda.gov/food-details/169697/nutrients', 'USDA FoodData Central · SR Legacy · Cornmeal, whole-grain, yellow.', '{"es":"Seco","en":"Dry","it":"Secco"}', 'verified', false),
  ('polenta-cooked', 'polenta', 'cooked', 65, 1.23, 13.86, 0.39, 'cup', 233, '{}', 'sr-legacy', '171672', 'https://fdc.nal.usda.gov/food-details/171672/nutrients', 'USDA FoodData Central · SR Legacy · Cereals, corn grits, yellow, regular and quick, enriched, cooked with water, without salt. Referencia comparable de sémola amarilla cocida en agua. Sin leche, queso ni manteca.', '{"es":"Cocida en agua","en":"Cooked in water","it":"Cotta in acqua"}', 'estimated', true),
  ('white-flour-raw', 'white-flour', 'raw', 364, 10.33, 76.31, 0.98, 'cup', 125, '{}', 'sr-legacy', '168936', 'https://fdc.nal.usda.gov/food-details/168936/nutrients', 'USDA FoodData Central · SR Legacy · Wheat flour, white, all-purpose, enriched, unbleached.', '{"es":"Seco","en":"Dry","it":"Secco"}', 'verified', false)
on conflict (id) do nothing;

insert into public.food_references (id, food_id, preparation, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g,
  portion_unit, portion_grams, additional_portions, source_kind, source_ref, source_url, source_description,
  variant_names, validation, is_estimate) values
  ('fresh-pasta-raw', 'fresh-pasta', 'raw', 288, 11.31, 54.73, 2.3, null, null, '{}', 'sr-legacy', '169727', 'https://fdc.nal.usda.gov/food-details/169727/nutrients', 'USDA FoodData Central · SR Legacy · Pasta, fresh-refrigerated, plain, as purchased.', '{"es":"Frescos, sin cocinar","en":"Fresh, uncooked","it":"Fresca, da cuocere"}', 'verified', false),
  ('fresh-pasta-cooked', 'fresh-pasta', 'cooked', 131, 5.15, 24.93, 1.05, null, null, '{}', 'sr-legacy', '169728', 'https://fdc.nal.usda.gov/food-details/169728/nutrients', 'USDA FoodData Central · SR Legacy · Pasta, fresh-refrigerated, plain, cooked.', '{"es":"Cocidos, sin salsa","en":"Cooked, plain","it":"Cotta, senza condimento"}', 'verified', false),
  ('ravioli-raw', 'ravioli', 'raw', 295, 13.7, 44.8, 8, null, null, '{}', 'official', 'SARA 2 · tabla 3.A, ravioles artesanales crudos', 'https://iah.msal.gov.ar/doc/720.pdf', 'Ravioles frescos artesanales. El relleno puede variar.', '{"es":"Seco","en":"Dry","it":"Secco"}', 'estimated', true),
  ('ravioli-cooked', 'ravioli', 'cooked', 211, 9.8, 32, 5.7, null, null, '{}', 'official', 'SARA 2 · tabla 3.A, ravioles artesanales hervidos', 'https://iah.msal.gov.ar/doc/720.pdf', 'Ravioles frescos artesanales hervidos. Sin salsa ni queso rallado. El relleno puede variar.', '{"es":"Hervido","en":"Boiled","it":"Bollito"}', 'estimated', true),
  ('sorrentinos-raw', 'sorrentinos', 'raw', 268, 9, 37, 9.4, 'serving', 100, '{}', 'label', 'La Salteña · Sorrentinos de jamón y queso', 'https://www.lasaltena.com.ar/productos/sorrentinos-jamon-y-queso/', 'Etiqueta de pasta fresca envasada con jamón y muzzarella. Porción declarada de 100 g. No extrapolar al peso hervido.', '{"es":"Jamón y queso, sin cocinar","en":"Ham and cheese, uncooked","it":"Prosciutto e formaggio, da cuocere"}', 'estimated', true)
on conflict (id) do nothing;

insert into public.food_references (id, food_id, preparation, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g,
  portion_unit, portion_grams, additional_portions, source_kind, source_ref, source_url, source_description,
  variant_names, validation, is_estimate) values
  ('white-bread-prepared-sliced', 'white-bread', 'prepared', 266, 8.85, 49.42, 3.33, 'slice', 29, '{}', 'sr-legacy', '174924', 'https://fdc.nal.usda.gov/food-details/174924/nutrients', 'USDA FoodData Central · SR Legacy · Bread, white, commercially prepared (includes soft bread crumbs). Rebanada estándar de 29 g; el peso varía entre panes.', '{"es":"Rebanada sin tostar","en":"Untoasted slice","it":"Fetta non tostata"}', 'verified', false),
  ('white-bread-prepared-toasted', 'white-bread', 'prepared', 290, 9, 54.5, 4, 'slice', 22, '{}', 'sr-legacy', '174925', 'https://fdc.nal.usda.gov/food-details/174925/nutrients', 'USDA FoodData Central · SR Legacy · Bread, white, commercially prepared, toasted.', '{"es":"Tostado","en":"Toasted","it":"Tostato"}', 'verified', false),
  ('baguette-prepared', 'baguette', 'prepared', 272, 10.8, 51.9, 2.42, 'slice', 32, '{}', 'fndds', '2707610', 'https://fdc.nal.usda.gov/food-details/2707610/nutrients', 'USDA FoodData Central · FNDDS 2021–2023 · Bread, French or Vienna. Ejemplo de pan francés; el tamaño de rebanada varía.', '{"es":"Rebanada fina","en":"Thin slice","it":"Fetta sottile"}', 'estimated', true),
  ('rice-cakes-prepared', 'rice-cakes', 'prepared', 387, 8.2, 81.5, 2.8, 'unit', 9, '{}', 'sr-legacy', '170250', 'https://fdc.nal.usda.gov/food-details/170250/nutrients', 'USDA FoodData Central · SR Legacy · Snacks, rice cakes, brown rice, plain, unsalted.', '{"es":"Sin sal","en":"Unsalted","it":"Senza sale"}', 'verified', false)
on conflict (id) do nothing;

insert into public.food_references (id, food_id, preparation, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g,
  portion_unit, portion_grams, additional_portions, source_kind, source_ref, source_url, source_description,
  variant_names, validation, is_estimate) values
  ('kidney-beans-cooked', 'kidney-beans', 'cooked', 127, 8.67, 22.8, 0.5, 'cup', 177, '{}', 'sr-legacy', '175194', 'https://fdc.nal.usda.gov/food-details/175194/nutrients', 'USDA FoodData Central · SR Legacy · Beans, kidney, red, mature seeds, cooked, boiled, without salt.', '{"es":"Cocido","en":"Cooked","it":"Cotto"}', 'verified', false),
  ('kidney-beans-raw', 'kidney-beans', 'raw', 337, 22.53, 61.29, 1.06, 'cup', 184, '{}', 'sr-legacy', '173744', 'https://fdc.nal.usda.gov/food-details/173744/nutrients', 'USDA FoodData Central · SR Legacy · Beans, kidney, red, mature seeds, raw.', '{"es":"Seco","en":"Dry","it":"Secco"}', 'verified', false),
  ('white-beans-cooked', 'white-beans', 'cooked', 139, 9.73, 25.09, 0.35, 'cup', 179, '{}', 'sr-legacy', '175203', 'https://fdc.nal.usda.gov/food-details/175203/nutrients', 'USDA FoodData Central · SR Legacy · Beans, white, mature seeds, cooked, boiled, without salt.', '{"es":"Cocido","en":"Cooked","it":"Cotto"}', 'verified', false),
  ('split-peas-cooked', 'split-peas', 'cooked', 118, 8.34, 21.1, 0.39, 'cup', 196, '{}', 'sr-legacy', '172429', 'https://fdc.nal.usda.gov/food-details/172429/nutrients', 'USDA FoodData Central · SR Legacy · Peas, split, mature seeds, cooked, boiled, without salt.', '{"es":"Cocido","en":"Cooked","it":"Cotto"}', 'verified', false),
  ('split-peas-raw', 'split-peas', 'raw', 304, 17.1, 68.5, 1.33, null, null, '{}', 'official', 'TBCA BRC0026T', 'https://www.tbca.net.br/base-dados-en/int_food_composition_2_edit.php?cod_produto=BRC0026T', 'TBCA · Arvejas partidas secas, composición por 100 g.', '{"es":"Seco","en":"Dry","it":"Secco"}', 'verified', false),
  ('lima-beans-cooked', 'lima-beans', 'cooked', 115, 7.8, 20.88, 0.38, 'cup', 188, '{}', 'sr-legacy', '174253', 'https://fdc.nal.usda.gov/food-details/174253/nutrients', 'USDA FoodData Central · SR Legacy · Lima beans, large, mature seeds, cooked, boiled, without salt.', '{"es":"Cocido","en":"Cooked","it":"Cotto"}', 'verified', false)
on conflict (id) do nothing;

insert into public.food_references (id, food_id, preparation, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g,
  portion_unit, portion_grams, additional_portions, source_kind, source_ref, source_url, source_description,
  variant_names, validation, is_estimate) values
  ('granola-prepared', 'granola', 'prepared', 489, 13.67, 53.88, 24.31, 'cup', 122, '{}', 'sr-legacy', '171646', 'https://fdc.nal.usda.gov/food-details/171646/nutrients', 'USDA FoodData Central · SR Legacy · Cereals ready-to-eat, granola, homemade. Granola casera de referencia. Los ingredientes y el peso por taza varían.', '{"es":"Estilo casero","en":"Homemade style","it":"Tipo casalingo"}', 'estimated', true),
  ('corn-flakes-prepared', 'corn-flakes', 'prepared', 365, 6.4, 79.5, 1.6, 'cup', 30, '{}', 'fndds', '2708453', 'https://fdc.nal.usda.gov/food-details/2708453/nutrients', 'USDA FoodData Central · FNDDS 2021–2023 · Cereal, corn flakes, plain. Copos de maíz simples, sin leche. La composición comercial puede variar.', '{"es":"Simple","en":"Plain","it":"Semplice"}', 'estimated', true),
  ('jam-prepared', 'jam', 'prepared', 278, 0.37, 68.86, 0.07, 'tablespoon', 20, '{}', 'sr-legacy', '169641', 'https://fdc.nal.usda.gov/food-details/169641/nutrients', 'USDA FoodData Central · SR Legacy · Jams and preserves. Promedio genérico de mermeladas y conservas de fruta.', '{"es":"Preparado","en":"Prepared","it":"Preparato"}', 'estimated', true),
  ('dulce-de-leche-prepared', 'dulce-de-leche', 'prepared', 315, 6.84, 55.35, 7.35, 'tablespoon', 19, '{}', 'sr-legacy', '173461', 'https://fdc.nal.usda.gov/food-details/173461/nutrients', 'USDA FoodData Central · SR Legacy · Dulce de Leche. Ejemplo de dulce de leche. El espesor y la receta comercial pueden variar.', '{"es":"Preparado","en":"Prepared","it":"Preparato"}', 'estimated', true),
  ('honey-prepared', 'honey', 'prepared', 304, 0.3, 82.4, 0, 'tablespoon', 21, '{}', 'sr-legacy', '169640', 'https://fdc.nal.usda.gov/food-details/169640/nutrients', 'USDA FoodData Central · SR Legacy · Honey.', '{"es":"Preparado","en":"Prepared","it":"Preparato"}', 'verified', false),
  ('peanut-butter-prepared', 'peanut-butter', 'prepared', 598, 22.21, 22.31, 51.36, 'tablespoon', 16.1, '{}', 'sr-legacy', '172470', 'https://fdc.nal.usda.gov/food-details/172470/nutrients', 'USDA FoodData Central · SR Legacy · Peanut butter, smooth style, without salt. Cucharada aproximada calculada como 1/16 de taza de 258 g.', '{"es":"Sin sal","en":"Unsalted","it":"Senza sale"}', 'verified', false),
  ('cereal-bar-prepared', 'cereal-bar', 'prepared', 471, 10.1, 64.4, 19.8, 'unit', 28, '{}', 'sr-legacy', '167542', 'https://fdc.nal.usda.gov/food-details/167542/nutrients', 'USDA FoodData Central · SR Legacy · Snacks, granola bars, hard, plain. Barra de granola crocante como referencia. El peso y la fórmula de otras barras varían.', '{"es":"Crocante, simple","en":"Crunchy, plain","it":"Croccante, semplice"}', 'estimated', true)
on conflict (id) do nothing;

insert into public.food_references (id, food_id, preparation, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g,
  portion_unit, portion_grams, additional_portions, source_kind, source_ref, source_url, source_description,
  variant_names, validation, is_estimate) values
  ('oat-cookies-prepared', 'oat-cookies', 'prepared', 450, 6.2, 68.7, 18.1, 'unit', 25, '{}', 'sr-legacy', '172725', 'https://fdc.nal.usda.gov/food-details/172725/nutrients', 'USDA FoodData Central · SR Legacy · Cookies, oatmeal, commercially prepared, regular. Ejemplo de galletita de avena comercial. El tamaño varía.', '{"es":"Preparado","en":"Prepared","it":"Preparato"}', 'estimated', true),
  ('wholegrain-crackers-prepared', 'wholegrain-crackers', 'prepared', 427, 10.58, 69.55, 14.13, 'unit', 4.6, '{}', 'sr-legacy', '172749', 'https://fdc.nal.usda.gov/food-details/172749/nutrients', 'USDA FoodData Central · SR Legacy · Crackers, whole-wheat. Ejemplo de cracker comercial de trigo integral.', '{"es":"Preparado","en":"Prepared","it":"Preparato"}', 'estimated', true)
on conflict (id) do nothing;

insert into public.food_references (id, food_id, preparation, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g,
  portion_unit, portion_grams, additional_portions, source_kind, source_ref, source_url, source_description,
  variant_names, validation, is_estimate) values
  ('churro-prepared', 'churro', 'prepared', 419, 6.05, 48.9, 22.2, 'unit', 45, '{}', 'fndds', '2708070', 'https://fdc.nal.usda.gov/food-details/2708070/nutrients', 'USDA FoodData Central · FNDDS 2021–2023 · Churros. Churro sin relleno de 45 g. La masa, el aceite absorbido y el tamaño pueden variar.', '{"es":"Simple","en":"Plain","it":"Semplice"}', 'estimated', true)
on conflict (id) do nothing;

insert into public.food_references (id, food_id, preparation, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g,
  portion_unit, portion_grams, additional_portions, source_kind, source_ref, source_url, source_description,
  variant_names, validation, is_estimate) values
  ('alfajor-prepared', 'alfajor', 'prepared', 381, 6.6, 70.2, 8.9, null, null, '{}', 'official', 'SARA 2 · tabla 13.A, alfajor de dulce de leche', 'https://iah.msal.gov.ar/doc/720.pdf', 'Promedio argentino de alfajor de dulce de leche. Usá el peso indicado en su envase si lo conocés.', '{"es":"Preparado","en":"Prepared","it":"Preparato"}', 'estimated', true),
  ('alfajor-maicena-prepared', 'alfajor-maicena', 'prepared', 405, 6.3, 71.7, 13.4, null, null, '{}', 'official', 'SARA 2 · tabla 13.A, alfajor de maicena', 'https://iah.msal.gov.ar/doc/720.pdf', 'Promedio argentino de alfajor de maicena. El tamaño por unidad varía.', '{"es":"Preparado","en":"Prepared","it":"Preparato"}', 'estimated', true),
  ('sponge-cake-prepared', 'sponge-cake', 'prepared', 297, 7.3, 57.7, 4.3, 'slice', 63, '{}', 'sr-legacy', '172707', 'https://fdc.nal.usda.gov/food-details/172707/nutrients', 'USDA FoodData Central · SR Legacy · Cake, sponge, prepared from recipe. Referencia de receta de bizcochuelo simple, sin cobertura.', '{"es":"Estilo casero","en":"Homemade style","it":"Tipo casalingo"}', 'estimated', true),
  ('pound-cake-prepared', 'pound-cake', 'prepared', 353, 5, 53.64, 13.96, 'unit', 49, '{}', 'sr-legacy', '172704', 'https://fdc.nal.usda.gov/food-details/172704/nutrients', 'USDA FoodData Central · SR Legacy · Cake, pound, commercially prepared, butter (includes fresh and frozen). Ejemplo comercial de budín de manteca. La receta varía.', '{"es":"De manteca","en":"Butter","it":"Al burro"}', 'estimated', true),
  ('muffin-prepared', 'muffin', 'prepared', 375, 4.49, 53, 16.07, 'unit', 113, '{}', 'sr-legacy', '172765', 'https://fdc.nal.usda.gov/food-details/172765/nutrients', 'USDA FoodData Central · SR Legacy · Muffins, blueberry, commercially prepared (Includes mini-muffins). Ejemplo de muffin comercial de arándanos, tamaño mediano.', '{"es":"Preparado","en":"Prepared","it":"Preparato"}', 'estimated', true),
  ('dark-chocolate-prepared', 'dark-chocolate', 'prepared', 579, 6.12, 52.42, 38.31, null, null, '{}', 'sr-legacy', '170272', 'https://fdc.nal.usda.gov/food-details/170272/nutrients', 'USDA FoodData Central · SR Legacy · Chocolate, dark, 60-69% cacao solids.', '{"es":"60–69 % cacao","en":"60–69% cacao","it":"60–69% cacao"}', 'verified', false),
  ('milk-chocolate-prepared', 'milk-chocolate', 'prepared', 535, 7.65, 59.4, 29.66, null, null, '{}', 'sr-legacy', '167587', 'https://fdc.nal.usda.gov/food-details/167587/nutrients', 'USDA FoodData Central · SR Legacy · Candies, milk chocolate.', '{"es":"Con leche","en":"Milk chocolate","it":"Al latte"}', 'verified', false),
  ('vanilla-ice-cream-prepared', 'vanilla-ice-cream', 'prepared', 207, 3.5, 23.6, 11, 'serving', 66, '{}', 'sr-legacy', '167575', 'https://fdc.nal.usda.gov/food-details/167575/nutrients', 'USDA FoodData Central · SR Legacy · Ice creams, vanilla. Helado de vainilla genérico. La densidad y la formulación comercial varían.', '{"es":"Preparado","en":"Prepared","it":"Preparato"}', 'estimated', true),
  ('chocolate-ice-cream-prepared', 'chocolate-ice-cream', 'prepared', 216, 3.8, 28.2, 11, 'cup', 132, '{}', 'sr-legacy', '168809', 'https://fdc.nal.usda.gov/food-details/168809/nutrients', 'USDA FoodData Central · SR Legacy · Ice creams, chocolate. Helado de chocolate genérico. La densidad y la formulación comercial varían. Taza calculada con la media taza USDA de 66 g.', '{"es":"Preparado","en":"Prepared","it":"Preparato"}', 'estimated', true)
on conflict (id) do nothing;

insert into public.food_references (id, food_id, preparation, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g,
  portion_unit, portion_grams, additional_portions, source_kind, source_ref, source_url, source_description,
  variant_names, validation, is_estimate) values
  ('water-prepared', 'water', 'prepared', 0, 0, 0, 0, 'cup', 237, '{}', 'sr-legacy', '173647', 'https://fdc.nal.usda.gov/food-details/173647/nutrients', 'USDA FoodData Central · SR Legacy · Beverages, water, tap, drinking.', '{"es":"Agua potable","en":"Tap water","it":"Acqua potabile"}', 'verified', false),
  ('coffee-prepared-black-coffee', 'coffee', 'prepared', 1, 0.12, 0, 0.02, 'cup', 237, '{}', 'sr-legacy', '171890', 'https://fdc.nal.usda.gov/food-details/171890/nutrients', 'USDA FoodData Central · SR Legacy · Beverages, coffee, brewed, prepared with tap water.', '{"es":"Filtrado sin azúcar","en":"Brewed, unsweetened","it":"Filtrato senza zucchero"}', 'verified', false),
  ('coffee-prepared-espresso', 'coffee', 'prepared', 9, 0.12, 1.67, 0.18, 'serving', 29.6, '{}', 'sr-legacy', '171891', 'https://fdc.nal.usda.gov/food-details/171891/nutrients', 'USDA FoodData Central · SR Legacy · Beverages, coffee, brewed, espresso, restaurant-prepared.', '{"es":"Espresso","en":"Espresso","it":"Espresso"}', 'verified', false),
  ('coffee-with-milk-prepared', 'coffee-with-milk', 'prepared', 43, 2.81, 4.35, 1.61, 'cup', 240, '{}', 'fndds', '2710386', 'https://fdc.nal.usda.gov/food-details/2710386/nutrients', 'USDA FoodData Central · FNDDS 2021–2023 · Coffee, Latte. Ejemplo de café con leche tipo latte. La proporción de leche puede variar.', '{"es":"Tipo latte, sin azúcar","en":"Latte, unsweetened","it":"Caffellatte senza zucchero"}', 'estimated', true),
  ('tea-prepared', 'tea', 'prepared', 1, 0, 0.3, 0, 'cup', 237, '{}', 'sr-legacy', '173227', 'https://fdc.nal.usda.gov/food-details/173227/nutrients', 'USDA FoodData Central · SR Legacy · Beverages, tea, black, brewed, prepared with tap water.', '{"es":"Sin azúcar añadida","en":"Unsweetened","it":"Senza zucchero"}', 'verified', false),
  ('green-tea-prepared', 'green-tea', 'prepared', 1, 0.22, 0, 0, 'cup', 240, '{}', 'fndds', '2710490', 'https://fdc.nal.usda.gov/food-details/2710490/nutrients', 'USDA FoodData Central · FNDDS 2021–2023 · Tea, hot, leaf, green. Infusión de té verde sin azúcar.', '{"es":"Sin azúcar añadida","en":"Unsweetened","it":"Senza zucchero"}', 'verified', false),
  ('mate-prepared-mate-bombilla', 'mate', 'prepared', 9.2, 0.26, 2.04, 0, 'serving', 500, '{}', 'official', 'UNNE · Tabla 6 · Cebadura', 'https://repositorio.unne.edu.ar/bitstream/handle/123456789/27895/RIUNNE_FACENA_CL_Maiocchi_MG.pdf?isAllowed=y&sequence=1', 'Cebadura de 50 g de yerba con 500 mL de agua a 84 °C. Se aproxima 1 mL de infusión a 1 g. El rendimiento y la concentración varían.', '{"es":"Cebado, sin azúcar","en":"With bombilla, unsweetened","it":"Con bombilla, senza zucchero"}', 'estimated', true),
  ('mate-prepared-mate-cocido', 'mate', 'prepared', 1.38, 0.04, 0.305, 0, 'cup', 200, '{}', 'official', 'UNNE · Tabla 6 · Mate cocido', 'https://repositorio.unne.edu.ar/bitstream/handle/123456789/27895/RIUNNE_FACENA_CL_Maiocchi_MG.pdf?isAllowed=y&sequence=1', 'Infusión de un saquito de 3 g en 200 mL de agua. Se aproxima 1 mL de infusión a 1 g. Sin azúcar ni leche.', '{"es":"Mate cocido en saquito","en":"Brewed yerba mate tea","it":"Infuso di mate in bustina"}', 'estimated', true),
  ('cola-prepared', 'cola', 'prepared', 42, 0, 10.36, 0.25, 'cup', 245.6, '{}', 'sr-legacy', '174852', 'https://fdc.nal.usda.gov/food-details/174852/nutrients', 'USDA FoodData Central · SR Legacy · Beverages, carbonated, cola, regular. Taza de 8 onzas líquidas, calculada con la equivalencia a gramos de la fuente.', '{"es":"Cola con azúcar","en":"Sugar-sweetened cola","it":"Cola con zucchero"}', 'verified', false),
  ('cola-zero-prepared', 'cola-zero', 'prepared', 2, 0.11, 0.29, 0.03, 'cup', 236.8, '{}', 'sr-legacy', '175099', 'https://fdc.nal.usda.gov/food-details/175099/nutrients', 'USDA FoodData Central · SR Legacy · Beverages, carbonated, low calorie, cola or pepper-type, with aspartame, contains caffeine. Referencia de cola light con aspartamo. La fórmula comercial puede variar. Taza de 8 onzas líquidas, calculada con la equivalencia a gramos de la fuente.', '{"es":"Cola con edulcorante","en":"Cola with sweetener","it":"Cola con dolcificante"}', 'estimated', true),
  ('orange-juice-raw', 'orange-juice', 'raw', 45, 0.7, 10.4, 0.2, 'cup', 248, '{}', 'sr-legacy', '169098', 'https://fdc.nal.usda.gov/food-details/169098/nutrients', 'USDA FoodData Central · SR Legacy · Orange juice, raw (Includes foods for USDA''s Food Distribution Program).', '{"es":"Exprimido","en":"Freshly squeezed","it":"Appena spremuto"}', 'verified', false),
  ('apple-juice-prepared', 'apple-juice', 'prepared', 46, 0.1, 11.3, 0.13, 'cup', 248, '{}', 'sr-legacy', '173933', 'https://fdc.nal.usda.gov/food-details/173933/nutrients', 'USDA FoodData Central · SR Legacy · Apple juice, canned or bottled, unsweetened, without added ascorbic acid.', '{"es":"Sin azúcar añadida","en":"Unsweetened","it":"Senza zucchero"}', 'verified', false),
  ('fruit-smoothie-prepared-with-dairy', 'fruit-smoothie', 'prepared', 66, 2.32, 12, 1.1, 'cup', 216, '{}', 'fndds', '2705514', 'https://fdc.nal.usda.gov/food-details/2705514/nutrients', 'USDA FoodData Central · FNDDS 2021–2023 · Fruit smoothie, with whole fruit and dairy. Ejemplo genérico con fruta entera y lácteos. La receta puede variar.', '{"es":"Con lácteos","en":"With dairy","it":"Con latte o yogurt"}', 'estimated', true),
  ('fruit-smoothie-prepared-without-dairy', 'fruit-smoothie', 'prepared', 54, 0.61, 12.7, 0.35, 'cup', 216, '{}', 'fndds', '2709334', 'https://fdc.nal.usda.gov/food-details/2709334/nutrients', 'USDA FoodData Central · FNDDS 2021–2023 · Fruit smoothie, with whole fruit, no dairy. Ejemplo genérico con fruta entera, sin lácteos. La receta puede variar.', '{"es":"Sin lácteos","en":"Without dairy","it":"Senza latte"}', 'estimated', true),
  ('beer-prepared', 'beer', 'prepared', 43, 0.46, 3.55, 0, 'cup', 237.6, '{}', 'sr-legacy', '168746', 'https://fdc.nal.usda.gov/food-details/168746/nutrients', 'USDA FoodData Central · SR Legacy · Alcoholic beverage, beer, regular, all. Taza de 8 onzas líquidas, calculada con la equivalencia a gramos de la fuente.', '{"es":"Preparado","en":"Prepared","it":"Preparato"}', 'verified', false),
  ('red-wine-prepared', 'red-wine', 'prepared', 85, 0.07, 2.61, 0, 'serving', 147, '{}', 'sr-legacy', '173190', 'https://fdc.nal.usda.gov/food-details/173190/nutrients', 'USDA FoodData Central · SR Legacy · Alcoholic beverage, wine, table, red.', '{"es":"Preparado","en":"Prepared","it":"Preparato"}', 'verified', false)
on conflict (id) do nothing;

insert into public.food_references (id, food_id, preparation, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g,
  portion_unit, portion_grams, additional_portions, source_kind, source_ref, source_url, source_description,
  variant_names, validation, is_estimate) values
  ('vinegar-prepared', 'vinegar', 'prepared', 19, 0.04, 0.27, 0, 'tablespoon', 14.9, '{}', 'sr-legacy', '172240', 'https://fdc.nal.usda.gov/food-details/172240/nutrients', 'USDA FoodData Central · SR Legacy · Vinegar, red wine.', '{"es":"Preparado","en":"Prepared","it":"Preparato"}', 'verified', false),
  ('mayonnaise-prepared', 'mayonnaise', 'prepared', 680, 0.96, 0.57, 74.85, 'tablespoon', 13.8, '{}', 'sr-legacy', '171009', 'https://fdc.nal.usda.gov/food-details/171009/nutrients', 'USDA FoodData Central · SR Legacy · Salad dressing, mayonnaise, regular. Mayonesa regular genérica. El aceite de la fórmula comercial puede variar.', '{"es":"Preparado","en":"Prepared","it":"Preparato"}', 'estimated', true),
  ('ketchup-prepared', 'ketchup', 'prepared', 101, 1.04, 27.4, 0.1, 'tablespoon', 17, '{}', 'sr-legacy', '168556', 'https://fdc.nal.usda.gov/food-details/168556/nutrients', 'USDA FoodData Central · SR Legacy · Catsup.', '{"es":"Preparado","en":"Prepared","it":"Preparato"}', 'verified', false),
  ('mustard-prepared', 'mustard', 'prepared', 60, 3.74, 5.83, 3.34, 'teaspoon', 5, '{}', 'sr-legacy', '172234', 'https://fdc.nal.usda.gov/food-details/172234/nutrients', 'USDA FoodData Central · SR Legacy · Mustard, prepared, yellow.', '{"es":"Preparado","en":"Prepared","it":"Preparato"}', 'verified', false),
  ('soy-sauce-prepared', 'soy-sauce', 'prepared', 53, 8.14, 4.93, 0.57, 'tablespoon', 16, '{}', 'sr-legacy', '174277', 'https://fdc.nal.usda.gov/food-details/174277/nutrients', 'USDA FoodData Central · SR Legacy · Soy sauce made from soy and wheat (shoyu).', '{"es":"Preparado","en":"Prepared","it":"Preparato"}', 'verified', false),
  ('tomato-sauce-prepared', 'tomato-sauce', 'prepared', 24, 1.2, 5.31, 0.3, 'cup', 245, '{}', 'sr-legacy', '170054', 'https://fdc.nal.usda.gov/food-details/170054/nutrients', 'USDA FoodData Central · SR Legacy · Tomato products, canned, sauce.', '{"es":"Preparado","en":"Prepared","it":"Preparato"}', 'verified', false),
  ('sugar-prepared', 'sugar', 'prepared', 387, 0, 99.98, 0, 'teaspoon', 4.2, '{}', 'sr-legacy', '169655', 'https://fdc.nal.usda.gov/food-details/169655/nutrients', 'USDA FoodData Central · SR Legacy · Sugars, granulated.', '{"es":"Preparado","en":"Prepared","it":"Preparato"}', 'verified', false),
  ('sweetener-prepared', 'sweetener', 'prepared', 349, 0.66, 90.1, 0, 'unit', 0.8, '{}', 'fndds', '2710267', 'https://fdc.nal.usda.gov/food-details/2710267/nutrients', 'USDA FoodData Central · FNDDS 2021–2023 · Sugar substitute, powder, NFS. Ejemplo de edulcorante en polvo con vehículo, por sobre de 0,8 g; la composición y el gramaje varían.', '{"es":"En sobre, ejemplo genérico","en":"Powdered packet, generic","it":"In bustina, generico"}', 'estimated', true),
  ('salt-prepared', 'salt', 'prepared', 0, 0, 0, 0, 'teaspoon', 6, '{}', 'sr-legacy', '173468', 'https://fdc.nal.usda.gov/food-details/173468/nutrients', 'USDA FoodData Central · SR Legacy · Salt, table.', '{"es":"Preparado","en":"Prepared","it":"Preparato"}', 'verified', false),
  ('paprika-prepared', 'paprika', 'prepared', 282, 14.14, 53.99, 12.89, 'teaspoon', 2.3, '{}', 'sr-legacy', '171329', 'https://fdc.nal.usda.gov/food-details/171329/nutrients', 'USDA FoodData Central · SR Legacy · Spices, paprika.', '{"es":"Preparado","en":"Prepared","it":"Preparato"}', 'verified', false)
on conflict (id) do nothing;

insert into public.food_references (id, food_id, preparation, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g,
  portion_unit, portion_grams, additional_portions, source_kind, source_ref, source_url, source_description,
  variant_names, validation, is_estimate) values
  ('broccoli-cooked', 'broccoli', 'cooked', 35, 2.38, 7.18, 0.41, 'cup', 156, '{}', 'sr-legacy', '169967', 'https://fdc.nal.usda.gov/food-details/169967/nutrients', 'USDA FoodData Central · SR Legacy · Broccoli, cooked, boiled, drained, without salt. Una taza equivale a dos medias tazas de 78 g.', '{"es":"Hervido","en":"Boiled","it":"Bollito"}', 'verified', false),
  ('spinach-cooked', 'spinach', 'cooked', 23, 2.97, 3.75, 0.26, 'cup', 180, '{}', 'sr-legacy', '168463', 'https://fdc.nal.usda.gov/food-details/168463/nutrients', 'USDA FoodData Central · SR Legacy · Spinach, cooked, boiled, drained, without salt.', '{"es":"Hervido","en":"Boiled","it":"Bollito"}', 'verified', false),
  ('zucchini-cooked', 'zucchini', 'cooked', 15, 1.14, 2.69, 0.36, 'cup', 180, '{}', 'sr-legacy', '169292', 'https://fdc.nal.usda.gov/food-details/169292/nutrients', 'USDA FoodData Central · SR Legacy · Squash, summer, zucchini, includes skin, cooked, boiled, drained, without salt.', '{"es":"Hervido","en":"Boiled","it":"Bollito"}', 'verified', false),
  ('chicken-breast-skin-on-raw', 'chicken-breast', 'raw', 172, 20.85, 0, 9.25, null, null, '{}', 'sr-legacy', '171474', 'https://fdc.nal.usda.gov/food-details/171474/nutrients', 'USDA FoodData Central · SR Legacy · Chicken, broilers or fryers, breast, meat and skin, raw.', '{"es":"Con piel","en":"Skin on","it":"Con pelle"}', 'verified', false),
  ('chicken-breast-chicken-breast-half-cooked', 'chicken-breast', 'cooked', 197, 29.8, 0, 7.78, 'piece', 98, '{}', 'sr-legacy', '171075', 'https://fdc.nal.usda.gov/food-details/171075/nutrients', 'USDA FoodData Central · SR Legacy · Chicken, broilers or fryers, breast, meat and skin, cooked, roasted. Una pieza equivale al filete de media pechuga con piel, sin hueso.', '{"es":"Con piel, sin hueso","en":"Skin on, boneless","it":"Con pelle, senza osso"}', 'verified', false),
  ('roasting-chicken-skinless-cooked', 'roasting-chicken', 'cooked', 190, 28.93, 0, 7.41, 'cup', 140, '{}', 'sr-legacy', '171054', 'https://fdc.nal.usda.gov/food-details/171054/nutrients', 'USDA FoodData Central · SR Legacy · Chicken, broilers or fryers, meat only, cooked, roasted.', '{"es":"Sin piel","en":"Skinless","it":"Senza pelle"}', 'verified', false),
  ('black-beans-raw', 'black-beans', 'raw', 341, 21.6, 62.36, 1.42, 'cup', 194, '{}', 'sr-legacy', '173734', 'https://fdc.nal.usda.gov/food-details/173734/nutrients', 'USDA FoodData Central · SR Legacy · Beans, black, mature seeds, raw.', '{"es":"Seco","en":"Dry","it":"Secco"}', 'verified', false),
  ('chickpeas-raw', 'chickpeas', 'raw', 378, 20.47, 62.95, 6.04, 'cup', 200, '{}', 'sr-legacy', '173756', 'https://fdc.nal.usda.gov/food-details/173756/nutrients', 'USDA FoodData Central · SR Legacy · Chickpeas (garbanzo beans, bengal gram), mature seeds, raw.', '{"es":"Seco","en":"Dry","it":"Secco"}', 'verified', false),
  ('lentils-raw', 'lentils', 'raw', 352, 24.63, 63.35, 1.06, 'cup', 192, '{}', 'sr-legacy', '172420', 'https://fdc.nal.usda.gov/food-details/172420/nutrients', 'USDA FoodData Central · SR Legacy · Lentils, raw.', '{"es":"Seco","en":"Dry","it":"Secco"}', 'verified', false)
on conflict (id) do nothing;

-- Add sourced equivalents to existing references without changing their nutrition.
update public.food_references r set
  portion_unit = seed.unit,
  portion_grams = seed.grams,
  source_description = r.source_description || ' ' || seed.note
from (values
  ('tomato-raw', '170457', 'unit', 123, 'Un tomate redondo mediano, según USDA.'),
  ('chicken-breast-cooked', '171477', 'piece', 86, 'Una pieza equivale al filete de media pechuga cocida, sin piel ni hueso, según USDA.')
) as seed(id, source_id, unit, grams, note)
where r.id = seed.id and r.source_ref = seed.source_id and r.portion_unit is null;

-- Existing examples flagged as approximate keep their nutrition and use the same validation status as new examples.
update public.food_references set validation = 'estimated' where validation = 'verified' and is_estimate;

update public.food_references r set variant_names = seed.names::jsonb
from (values
  ('apple-raw', '{"es":"Cruda con piel","en":"Raw with skin","it":"Cruda con buccia"}'),
  ('lettuce-raw', '{"es":"De hoja verde, cruda","en":"Green leaf, raw","it":"A foglia verde, cruda"}'),
  ('oats-raw', '{"es":"Copos secos","en":"Dry rolled oats","it":"Fiocchi secchi"}')
) as seed(id, names)
where r.id = seed.id and r.variant_names is distinct from seed.names::jsonb;
