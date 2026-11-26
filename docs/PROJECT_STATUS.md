# Estado de MASOMENO

**Categoría de comidas, etiquetas táctiles y zona objetivo de Hoy implementadas en local.**

## Estado funcional

- Configuración agrupa la búsqueda y la selección IANA. Cerrar sesión tiene más contraste en móvil y conserva su ubicación en el sidebar de escritorio.
- Las tarjetas de Hoy comparten un máximo de 900 px en escritorio. Biblioteca agrupa variantes y prioriza coincidencias por nombre o sinónimo. Mi heladera conserva cada alimento seleccionable. El peso neto de las galletitas permite convertir ¼ o ½ paquete a gramos. [Catálogo y fuentes](NUTRITION_CATALOG.md#ampliación-de-alimentos-cotidianos)

- La versión anterior está publicada en Vercel y el usuario confirmó el acceso con Google. Perfil, preferencias, peso, Gym y Cinta ya usan Supabase.
- La navegación usa el orden Hoy, Evolución, Comidas y Gym. Desde los 840 px, el sidebar incluye Configuración y Cerrar sesión. En anchos menores, la navegación es inferior, Configuración está en el encabezado y Cerrar sesión al final de Configuración.
- El idioma se guarda en la cuenta y el cambio mantiene el borrador del Perfil. Configuración usa un selector IANA con hora local, acceso directo en móvil y Cerrar sesión al final de la pantalla móvil.
- Hoy renueva el consumo a medianoche local y muestra un resumen compacto de las comidas del día. Comidas tiene un calendario con navegación por teclado y muestra el objetivo vigente de la fecha elegida.
- Hoy y el Registro de comidas comparten una zona de ±100 kcal alrededor del objetivo vigente para la fecha, con ambos límites incluidos. Fuera de la zona muestran la distancia al límite más cercano. La barra de Hoy tiene un marcador de meta y una escala fija al 125 % para metas habituales. El avance es naranja, verde dentro de la zona y coral después del límite superior. El porcentaje sigue calculándose sobre la meta exacta. Las metas pequeñas amplían la escala para mostrar la zona completa.
- Gym conserva una sola lista de ejercicios, con destacados, cargas y repeticiones. Desde los 840 px muestra Ejercicios a la izquierda y Cinta a la derecha. En anchos menores muestra Cinta primero. Los campos decimales de registro aceptan coma y punto, y las cargas y distancias se guardan como números.
- El registro ofrece medidas caseras, recetas publicadas con composición calculable, comidas recientes y carga libre. El cabutiá crudo y hervido tiene fuente directa y el horneado usa una referencia comparable indicada como estimación. [Fuentes](NUTRITION_CATALOG.md)
- El modal muestra una categoría común junto a la fecha y hora en todas las modalidades. La categoría se conserva al cambiar de modalidad o elegir una comida reciente. La hora de consumo se interpreta en la zona del perfil y se guarda con la categoría mediante las funciones existentes de Supabase. Las etiquetas opcionales de cada preparación mantienen el naranja al tocarlas.
- Mi heladera muestra todos los ingredientes que coinciden con los filtros. Conserva los estados y los ingredientes personales por cuenta.
- El Recetario ofrece búsqueda, filtros de tipo e intensidad, y fichas de preparaciones y variantes en ES, EN e IT. Prioriza las que se pueden hacer según Mi heladera y mantiene visibles las demás. El catálogo tiene 222 alimentos y 306 referencias. [Etapa B](RECIPE_CANDIDATES.md#etapa-b) · [Fuentes y modelo](NUTRITION_CATALOG.md#preparaciones-y-comidas-compradas)
- El modal de comidas mantiene la geometría al filtrar resultados y ajusta la altura al área visible. El botón Agregar otro elemento tiene mayor contraste. Personalizar ingredientes permite quitar, sustituir, ajustar y sumar alimentos de Biblioteca dentro de la misma preparación. Las calorías se recalculan mientras se edita. Cada receta arranca con su composición base, independiente de Mi heladera. El historial conserva el detalle y escala los ingredientes guardados al editar porciones. El guardado reutiliza las funciones existentes de Supabase.
- Evolución conserva tres pesajes visibles y abre el historial completo con edición y eliminación confirmada. La tendencia usa una media de siete días locales y el eje agrega 5 kg por extremo. Cinta y fuerza usan márgenes relativos.
- El login muestra «¿Comiste bien? ¿Entrenaste?» sobre la carita y Masomeno, con traducciones en inglés e italiano. El botón de acceso muestra la G oficial de Google. [Recurso de Google Identity](https://developers.google.com/identity/branding-guidelines)

## Criterios para las próximas etapas

- Las cantidades y medidas domésticas son orientativas. Mi heladera registra disponibilidad sin inventario. [Criterios de porciones](ROADMAP.md#ingredientes-disponibles-y-porciones)

## Verificado

- Categorías y zona objetivo. Pasaron TypeScript, ESLint, 58 pruebas y el build. Chrome de escritorio y emulación de iPhone 13 mini en ES, EN e IT verificaron los umbrales, las etiquetas al toque, el modal y la persistencia de categoría y fecha al recargar y editar. Las pruebas de guardado usaron PostgreSQL local y Supabase simulado.
- Escritorio y registro de comidas. Pasaron TypeScript, ESLint, 55 pruebas y el build. Chrome de escritorio y emulación de iPhone 13 mini en ES, EN e IT verificaron la navegación, el cambio de disposición entre 839 y 840 px, el guardado de decimales, el modal y la edición de ingredientes. El recorrido usó PostgreSQL local con el acceso y el transporte de Supabase simulados.
- Etapa B. Pasaron TypeScript, ESLint, 51 pruebas y el build. PostgreSQL local verificó la reaplicación de las semillas, las recetas publicadas, las porciones, las sustituciones y los consumos históricos. En Chrome de escritorio y emulación de iPhone 13 mini se recorrieron la búsqueda, los filtros, la ficha de una parte, el registro combinado, Hoy, Comidas y la prioridad de Mi heladera en ES, EN e IT con Supabase simulado.
- Etapa A. Pasaron TypeScript, ESLint, 50 pruebas y el build. PostgreSQL local verificó las migraciones idempotentes, las referencias, los identificadores previos, el historial y el aislamiento entre cuentas. En Chrome de escritorio y con emulación de iPhone 13 mini se verificaron variantes, medidas, registro combinado, Recetario y persistencia de Mi heladera en ES, EN e IT con Supabase simulado.
- TypeScript, ESLint, 49 pruebas y el build pasaron. En Chrome de escritorio y con emulación de iPhone 13 mini, en ES, EN e IT, se comprobaron el selector IANA, la persistencia, Cerrar sesión, la alineación de Hoy y el registro por unidad, porción y fracción de paquete. El recorrido usó PostgreSQL local y Supabase simulado.

- Registro cotidiano. Pasaron TypeScript, ESLint, 47 pruebas y el build. PostgreSQL local comprobó el guardado mixto, las equivalencias archivadas y el aislamiento entre cuentas.
- Chrome de escritorio y emulación de iPhone 13 mini en ES, EN e IT. Pasaron el registro mixto, la edición de cantidades, el calendario por teclado, la actualización del gráfico, la gestión de pesajes y la persistencia de Mi heladera, con Supabase simulado sobre PostgreSQL local.

- Primer recetario. Pasaron TypeScript, ESLint, 44 pruebas y el build. PostgreSQL local verificó la semilla idempotente, el catálogo de solo lectura, el aislamiento de cuentas y la edición con referencias históricas.
- En Chrome de escritorio y con emulación de iPhone 13 mini se verificaron los filtros, las fichas, las sustituciones, el registro combinado, la edición y la barra de Hoy en ES, EN e IT. El recorrido usó el catálogo sembrado en PostgreSQL local y el transporte de Supabase simulado.
- Se recorrieron los tres idiomas en Chrome de escritorio y con la emulación de iPhone 13 mini. Se verificaron el modal en Hoy y Comidas, el contador tras guardar, la edición histórica, la persistencia de Mi heladera, Gym, el selector IANA y Cerrar sesión. El acceso y las respuestas de Supabase se simularon en localhost.
- Pasaron TypeScript, ESLint, las 40 pruebas y el build de producción. Las pruebas cubren porciones, objetivos por fecha, excedentes, orden de ejercicios y el cambio de día en Buenos Aires. PostgreSQL local verificó la nueva migración, el historial y el aislamiento entre cuentas.
- En navegador local se verificaron las tres variantes de idioma, el orden de navegación, la distribución de Hoy y Gym en escritorio y móvil, y el foco de los controles. También se probaron la edición y persistencia del objetivo, el historial de Evolución, la última carga, las repeticiones y los ingredientes personales. Las pruebas usaron dos cuentas y PostgreSQL local con el transporte de Supabase simulado.
- La consulta de solo lectura en Supabase `uhefabgdptaxcvqdavkj` confirmó las tres migraciones de alimentación, sus nueve tablas con RLS, las funciones de guardado y las 31 referencias verificadas del catálogo.
- En navegador local se verificaron el botón de Google en escritorio y móvil, OAuth simulado, el formulario de correo y las rutas públicas del favicon, Apple Touch y PWA.
- En PostgreSQL local se verificaron el aislamiento de las comidas y la heladera, la lectura de recetas publicadas, las escrituras atómicas, la vigencia de objetivos y la importación repetida sin duplicados.
- En navegador local se verificaron el saldo con y sin consumos, la repetición, edición y eliminación de comidas, los tres estados de la heladera al recargar y la ficha y filtros del Recetario. El recorrido incluyó móvil, escritorio, tres idiomas y dos cuentas, con autenticación y transporte de Supabase simulados sobre PostgreSQL en memoria.
- Se auditaron las 31 referencias iniciales. Se completaron dos descripciones USDA y se conservaron las cifras originales. [Auditoría](NUTRITION_CATALOG.md#auditoría-de-las-31-referencias-iniciales)

## Pendiente

- Aplicar `20261125140000_recipe_library.sql` y `20261125141000_seed_expanded_recipe_library.sql` después de las migraciones de la Etapa A. El maki fino queda como borrador hasta contar con composición y peso fiable por pieza.
- Aplicar en orden `20261125130000_food_catalog_groups.sql`, `20261125131000_expand_everyday_food_catalog.sql` y `20261125132000_seed_breakfast_toasts.sql` después de las migraciones anteriores pendientes. Luego verificar la Biblioteca, Mi heladera y el Recetario con el entorno publicado.
- Aplicar `20261125120000_breakfast_and_snack_foods.sql` después de las migraciones anteriores pendientes.

- Aplicar `20261125110000_mixed_meals_and_household_measures.sql` en Supabase después de las migraciones previas que sigan pendientes, incluida la semilla del recetario `20261125101000_seed_first_recipe_book.sql`.
- Probar el registro y la edición de una comida real desde la versión publicada. El maki fino admite carga libre hasta incorporar una referencia específica.
- La publicación y las pruebas de esta etapa en Supabase hospedado quedan pendientes. El correo externo sigue pendiente de SMTP propio.
