# Estado de MASOMENO

**Registro cotidiano, historial de peso y ajustes de interfaz implementados en local.**

## Estado funcional

- La versión anterior está publicada en Vercel y el usuario confirmó el acceso con Google. Perfil, preferencias, peso, Gym y Cinta ya usan Supabase.
- La navegación usa el orden Hoy, Evolución, Comidas y Gym en escritorio y móvil. El nombre queda en Configuración → Perfil, junto a los datos de la cuenta.
- El idioma se guarda en la cuenta y el cambio mantiene el borrador del Perfil. Configuración usa un selector IANA con hora local, acceso directo en móvil y Cerrar sesión al final de la pantalla móvil.
- Hoy renueva el consumo a medianoche local y muestra un resumen compacto de las comidas del día. Comidas tiene un calendario con navegación por teclado y muestra el objetivo vigente de la fecha elegida.
- Gym usa una sola lista de ejercicios, encabezada por los destacados, con la última carga y repeticiones cuando existen. Ejercicios y Cinta usan dos columnas en escritorio y una en móvil.
- El registro ofrece medidas caseras, recetas publicadas con composición calculable, comidas recientes y carga libre. El cabutiá crudo y hervido tiene fuente directa y el horneado usa una referencia comparable indicada como estimación. [Fuentes](NUTRITION_CATALOG.md)
- Mi heladera muestra todos los ingredientes que coinciden con los filtros. Conserva los estados y los ingredientes personales por cuenta.
- El Recetario tiene 14 fichas en ES, EN e IT y cubre las cuatro intensidades. Las 14 quedan publicadas en la semilla local. Cada ficha ofrece medidas orientativas y nutrientes conocidos. Los filtros muestran toda la selección y priorizan las preparables según Mi heladera. [Primera tanda](RECIPE_CANDIDATES.md#primera-tanda) · [Fuentes y modelo](NUTRITION_CATALOG.md)
- El modal combina Biblioteca, recetas y partes reutilizables en filas confirmables, con cantidades domésticas, etiquetas opcionales y total estimado. La edición histórica usa las medidas y los valores guardados.
- Evolución conserva tres pesajes visibles y abre el historial completo con edición y eliminación confirmada. La tendencia usa una media de siete días locales y el eje agrega 5 kg por extremo. Cinta y fuerza usan márgenes relativos.
- El login muestra «¿Comiste bien? ¿Entrenaste?» sobre la carita y Masomeno, con traducciones en inglés e italiano. El botón de acceso muestra la G oficial de Google. [Recurso de Google Identity](https://developers.google.com/identity/branding-guidelines)

## Criterios para las próximas etapas

- Las cantidades y medidas domésticas son orientativas. Mi heladera registra disponibilidad sin inventario. [Criterios de porciones](ROADMAP.md#ingredientes-disponibles-y-porciones)

## Verificado

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

- Aplicar `20261125110000_mixed_meals_and_household_measures.sql` en Supabase después de las migraciones previas que sigan pendientes, incluida la semilla del recetario `20261125101000_seed_first_recipe_book.sql`.
- Probar el registro y la edición de una comida real desde la versión publicada. El maki fino admite carga libre hasta incorporar una referencia específica.
- La publicación y las pruebas de esta etapa en Supabase hospedado quedan pendientes. El correo externo sigue pendiente de SMTP propio.
