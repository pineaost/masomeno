# Estado de MASOMENO

**24 de noviembre de 2026 · Normalización nutricional y preparación del Recetario implementadas en local.**

## Estado funcional

- La versión anterior está publicada en Vercel y el usuario confirmó el acceso con Google. Perfil, preferencias, peso, Gym y Cinta ya usan Supabase.
- La navegación usa el orden Hoy, Evolución, Comidas y Gym en escritorio y móvil. El nombre queda en Configuración → Perfil, junto a los datos de la cuenta.
- Hoy concentra el balance y el registro de comidas. El objetivo calórico se edita en esa tarjeta y conserva el historial por día local. Evolución mantiene el gráfico y los pesajes con indicadores más compactos.
- Gym distribuye fuerza y cinta en dos columnas en escritorio y en vertical en móvil. Los destacados muestran la última carga y las repeticiones cuando se registraron.
- Comidas permite repetir, editar o eliminar consumos y usar el catálogo o una estimación manual. La semilla ampliada deja 65 alimentos y 84 referencias, con estados de preparación, fuentes y medidas documentadas.
- Mi heladera prioriza búsqueda, categorías y chips para los ingredientes disponibles. Los ingredientes personales se pueden agregar, editar y eliminar. Su disponibilidad se guarda por cuenta junto con el estado de los alimentos del catálogo. La lista personal queda separada de los datos nutricionales.
- El Recetario deriva las calorías por porción de las referencias específicas. El esquema admite sustituciones y opcionales, y el guardado de comidas admite varias preparaciones con su composición histórica. Las 23 familias candidatas están fuera del catálogo publicado. [Auditoría y modelo](NUTRITION_CATALOG.md) · [Candidatas](RECIPE_CANDIDATES.md)
- La carita usa azul petróleo en los iconos derivados. El JPG original se conserva. El botón de acceso muestra la G oficial de Google y mantiene el flujo de autenticación. [Recurso de Google Identity](https://developers.google.com/identity/branding-guidelines)

## Criterios para las próximas etapas

- La disponibilidad servirá para priorizar recetas y el recetario seguirá completo. Al registrar una receta se podrán ajustar porciones e ingredientes en el consumo, conservando intacta la receta de origen. [Criterios de porciones](ROADMAP.md#ingredientes-disponibles-y-porciones)

## Verificado

- Pasaron TypeScript, ESLint, las 33 pruebas automatizadas y el build de producción. En PostgreSQL local se aplicó la secuencia completa de migraciones, se repitió la semilla y se verificaron porciones, sustituciones, guardado atómico de preparaciones, historial y RLS.
- En navegador local se verificaron las tres variantes de idioma, el orden de navegación, la distribución de Hoy y Gym en escritorio y móvil, y el foco de los controles. También se probaron la edición y persistencia del objetivo, el historial de Evolución, la última carga, las repeticiones y los ingredientes personales. Las pruebas usaron dos cuentas y PostgreSQL local con el transporte de Supabase simulado.
- La consulta de solo lectura en Supabase `uhefabgdptaxcvqdavkj` confirmó las tres migraciones de alimentación, sus nueve tablas con RLS, las funciones de guardado y las 31 referencias verificadas del catálogo.
- En navegador local se verificaron el botón de Google en escritorio y móvil, OAuth simulado, el formulario de correo y las rutas públicas del favicon, Apple Touch y PWA.
- En PostgreSQL local se verificaron el aislamiento de las comidas y la heladera, la lectura de recetas publicadas, las escrituras atómicas, la vigencia de objetivos y la importación repetida sin duplicados.
- En navegador local se verificaron el saldo con y sin consumos, la repetición, edición y eliminación de comidas, los tres estados de la heladera al recargar y la ficha y filtros del Recetario. El recorrido incluyó móvil, escritorio, tres idiomas y dos cuentas, con autenticación y transporte de Supabase simulados sobre PostgreSQL en memoria.
- Se auditaron las 31 referencias iniciales. Se completaron dos descripciones USDA y se conservaron las cifras originales. [Auditoría](NUTRITION_CATALOG.md#auditoría-de-las-31-referencias-iniciales)

## Pendiente

- Aplicar en Supabase `20261124185000_nutrition_and_recipe_composition.sql` y `20261124190000_expand_food_catalog.sql` cuando se autorice. Aplicar primero cualquier migración anterior pendiente, incluida la de ingredientes personales que usa el nuevo esquema.
- Seleccionar las primeras recetas, confirmar preparación, pesos por referencia, porciones e intensidad y probar el registro con una comida real. Quedan pendientes las referencias del cabutiá crudo y al horno y del maki fino.
- La publicación y las pruebas de esta etapa en Supabase hospedado quedan pendientes. El correo externo sigue pendiente de SMTP propio.
