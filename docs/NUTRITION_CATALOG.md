# Catálogo nutricional

## Auditoría de las 31 referencias iniciales

Los identificadores, las preparaciones y los valores de la columna correspondiente se contrastaron con SR Legacy 2018-04. Se usaron los nutrientes USDA 1008, 1003, 1005 y 1004. Se verificaron las equivalencias de huevo duro grande (50 g), banana mediana (118 g) y cucharada de aceite (13,5 g). El arroz integral cocido y la manzana con piel tenían descripciones abreviadas. Se completaron ambas y los valores se conservaron. Los ñoquis cocidos se verificaron en CREA. [USDA FoodData Central](https://fdc.nal.usda.gov/download-datasets/) · [CREA 006591](https://www.alimentinutrizione.it/tabelle-nutrizionali/006591)

| Referencia MASOMENO | Fuente | kcal/100 g | Proteínas (g) | Carbohidratos (g) | Grasas (g) |
| --- | --- | ---: | ---: | ---: | ---: |
| `tomato-raw` | 170457 | 18 | 0.88 | 3.89 | 0.2 |
| `onion-raw` | 170000 | 40 | 1.1 | 9.34 | 0.1 |
| `carrot-raw` | 170393 | 41 | 0.93 | 9.58 | 0.24 |
| `spinach-raw` | 168462 | 23 | 2.86 | 3.63 | 0.39 |
| `lettuce-raw` | 169249 | 15 | 1.36 | 2.87 | 0.15 |
| `red-pepper-raw` | 170108 | 26 | 0.99 | 6.03 | 0.3 |
| `broccoli-raw` | 170379 | 34 | 2.82 | 6.64 | 0.37 |
| `zucchini-raw` | 169291 | 17 | 1.21 | 3.11 | 0.32 |
| `egg-cooked` | 173424 | 155 | 12.58 | 1.12 | 10.61 |
| `chicken-breast-cooked` | 171477 | 165 | 31.02 | 0 | 3.57 |
| `lean-beef-cooked` | 169472 | 158 | 29.81 | 0 | 3.37 |
| `tuna-prepared` | 171986 | 116 | 25.51 | 0 | 0.82 |
| `cod-cooked` | 171956 | 105 | 22.83 | 0 | 0.86 |
| `tofu-raw` | 172475 | 144 | 17.27 | 2.78 | 8.72 |
| `yogurt-prepared` | 171284 | 61 | 3.47 | 4.66 | 3.25 |
| `potato-cooked` | 170438 | 87 | 1.87 | 20.13 | 0.1 |
| `sweet-potato-cooked` | 168483 | 90 | 2.01 | 20.71 | 0.15 |
| `white-rice-cooked` | 169757 | 130 | 2.69 | 28.17 | 0.28 |
| `brown-rice-cooked` | 169704 | 123 | 2.74 | 25.58 | 0.97 |
| `oats-raw` | 173904 | 379 | 13.15 | 67.7 | 6.52 |
| `wheat-pasta-cooked` | 168928 | 158 | 5.8 | 30.86 | 0.93 |
| `whole-wheat-bread-prepared` | 172688 | 252 | 12.45 | 42.71 | 3.5 |
| `lentils-cooked` | 172421 | 116 | 9.02 | 20.13 | 0.38 |
| `chickpeas-cooked` | 173757 | 164 | 8.86 | 27.42 | 2.59 |
| `black-beans-cooked` | 173735 | 132 | 8.86 | 23.71 | 0.54 |
| `banana-raw` | 173944 | 89 | 1.09 | 22.84 | 0.33 |
| `apple-raw` | 171688 | 52 | 0.26 | 13.81 | 0.17 |
| `orange-raw` | 169097 | 47 | 0.94 | 11.75 | 0.12 |
| `olive-oil-prepared` | 171413 | 884 | 0 | 0 | 100 |
| `walnuts-raw` | 170187 | 654 | 15.23 | 13.71 | 65.21 |
| `potato-gnocchi-cooked` | CREA 006591 | 147 | 3,5 | — | 0,2 |

## Criterios de cálculo

- Cada ingrediente guarda el alimento de la heladera y, para calcular, una referencia nutricional concreta con su peso comestible en el estado indicado. Por ejemplo, 80 g de arroz blanco seco y 200 g de arroz blanco cocido representan dos pesos medidos distintos. El agua ya está contemplada en la densidad energética de cada referencia.
- Registrar el aceite agregado como ingrediente cuando la referencia de cocción no lo incluye. Si un preparado ya contiene aceite, su referencia cubre esa parte. Las porciones base se escalan proporcionalmente. Las cantidades cumplen una función orientativa y la heladera sigue usando disponibilidad sin inventario.
- `verified` significa que se contrastó la referencia con la fuente. `is_estimate` identifica estimaciones de encuestas o promedios comerciales. El Registro muestra el tipo, la unidad y la fuente. Los promedios de comida comprada sirven para el tipo y tamaño indicados. Con datos del local o del envase se puede usar la estimación manual. La app lee el catálogo en Supabase.
- Los carbohidratos de SR Legacy y FNDDS siguen la definición de USDA. En las etiquetas se conserva la cifra declarada. CREA informa 34 g de carbohidratos disponibles en los ñoquis y CoFID 57,5 g en equivalentes de monosacáridos en la base de pizza. En esos dos casos el campo comparable queda vacío. Pelati deja grasa sin valor puntual porque la etiqueta solo informa menos de 0,5 g.

## Fuentes de la ampliación

- Los valores USDA se extrajeron de SR Legacy 2018-04 y FNDDS 2021–2023. El SQL guarda el identificador exacto, estado, valor por 100 g y peso de la medida cuando existe. Las dos pizzas de masa fina usan porciones de una pizza grande de 33–38 cm. Hamburguesas medianas de comida rápida con y sin queso y piezas de sushi diferenciadas usan el peso de su registro FNDDS. La hamburguesa casera se calcula por componentes. [USDA FoodData Central](https://fdc.nal.usda.gov/download-datasets/)
- Se contrastaron las fichas de merluza argentina Vepez, tomate Mutti Pelati y queso cremoso Ricrem, y las etiquetas de tapa individual La Salteña y milanesa original Granja del Sol. Las etiquetas por porción se escalaron a 100 g. La base cruda de pizza usa el promedio de CoFID 2021, código 11-1016. [Vepez](https://vepez.com.ar/productos/merluza/) · [Mutti](https://mutti-parma.com/en/products/peeled-tomatoes/) · [Ricrem](https://www.ricrem.com.ar/es/products/cremoso) · [La Salteña](https://www.molinos.com.ar/wp-content/uploads/2024/12/tabla_pascualina_individual_hojaldre.webp) · [Granja del Sol](https://www.molinos.com.ar/wp-content/uploads/2026/03/Tabla-Granja-del-Sol-Milanesa-de-Soja-Original-new.webp) · [CoFID](https://www.gov.uk/government/publications/composition-of-foods-integrated-dataset-cofid)
- El cabutiá crudo y hervido usa fichas de la TBCA. Para horno se ofrece una estimación señalizada basada en zapallo Hubbard horneado sin aceite. La taza de 205 g corresponde a esa referencia comparable. El maki fino sigue pendiente y admite carga libre. [TBCA crudo](https://www.tbca.net.br/base-dados-en/int_food_composition.php?cod_produto=BRC0002B) · [TBCA hervido](https://www.tbca.net.br/base-dados-en/int_food_composition.php?cod_produto=BRC0059B) · [USDA Hubbard al horno](https://fdc.nal.usda.gov/food-details/168476/nutrients)
- Un bife cocido equivale a 119 g y una taza de arroz blanco cocido a 158 g según sus medidas USDA. El bife a la parrilla sirve de aproximación para la plancha sin aceite. La banana chica, mediana y grande usa 101, 118 y 136 g. Las medidas se pueden fraccionar o reemplazar por gramos. [Bife](https://fdc.nal.usda.gov/food-details/170239/nutrients) · [Arroz](https://fdc.nal.usda.gov/food-details/169757/nutrients) · [Banana](https://fdc.nal.usda.gov/food-details/173944/nutrients)

- La primera tanda agregó zapallito redondo crudo, jamón en fetas, nalga cruda, papa y batata crudas. La grasa del zapallito queda sin cuantificar. La pechuga se calcula con la referencia de carne cocida sin piel y una pieza orientativa de 86 g, equivalente a media pechuga deshuesada. Las tortillas usan tamaños genéricos de trigo o maíz. [ARGENFOODS 117](https://www.argenfood.unlu.edu.ar/Tablas/Codigo/117.htm) · [USDA pechuga](https://fdc.nal.usda.gov/food-details/171477/nutrients) · [USDA FoodData Central](https://fdc.nal.usda.gov/download-datasets/)

## Medidas para el registro cotidiano

- Una almendra equivale a 1,2 g y una nuez entera sin cáscara a 4,05 g. El puñado orientativo se aproxima a una onza de 28,35 g. [USDA almendras](https://fdc.nal.usda.gov/food-details/170567/nutrients) · [USDA nueces](https://fdc.nal.usda.gov/food-details/170187/nutrients)
- El bife mediano de la app corresponde a los 180 g cocidos de la receta base. El bife de la fuente pesa 119 g y sigue disponible. La porción de lentejas de la app corresponde a media taza cocida, 99 g. [USDA bife](https://fdc.nal.usda.gov/food-details/170239/nutrients) · [USDA lentejas](https://fdc.nal.usda.gov/food-details/172421/nutrients)

## Composición y registro

`recipe_ingredients` conserva el alimento genérico y admite referencia, gramos, posición y opcionalidad. `recipe_ingredient_alternatives` define sustitutos con referencia y peso propios. El Recetario deriva la energía y los macronutrientes conocidos de los ingredientes de la composición base. Un nutriente sin valor específico se muestra con un guion. Cambiar porciones, opciones y acompañamientos recalcula el consumo antes de guardarlo. Las cuatro intensidades siguen siendo orientativas.

`masomeno_save_preparations` guarda una o más preparaciones bajo la comida de la cuenta y reutiliza el cálculo del diario. Cada preparación conserva nombre, porciones, cantidades, fuente, nutrientes y calorías al momento del registro. Una entrada de Biblioteca también conserva la medida y su equivalencia cuando se guarda con otras preparaciones. Las partes reutilizan los pesos y referencias de las posiciones seleccionadas de la receta original. El editor ajusta porciones o retira preparaciones usando la composición y las densidades guardadas. Los cambios en el catálogo dejan intacto el historial.

La heladera prioriza recetas con los ingredientes base o sus sustitutos disponibles y conserva visible la lista completa. Si queda una opción sin marcar, la falta sigue sin confirmar. El campo `matched_food_id` deja preparada la asociación futura de ingredientes personales sin asignar nutrición al texto ingresado. [Familias candidatas](RECIPE_CANDIDATES.md)
