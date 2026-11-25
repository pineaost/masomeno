# Estado de MASOMENO

**Primer recetario funcional y registro combinado implementados en local.**

## Estado funcional

- La versión anterior está publicada en Vercel y el usuario confirmó el acceso con Google. Perfil, preferencias, peso, Gym y Cinta ya usan Supabase.
- La navegación usa el orden Hoy, Evolución, Comidas y Gym en escritorio y móvil. El nombre queda en Configuración → Perfil, junto a los datos de la cuenta.
- El idioma se guarda en la cuenta y el cambio mantiene el borrador del Perfil. Configuración usa un selector IANA con hora local, acceso directo en móvil y Cerrar sesión al final de la pantalla móvil.
- Hoy y Comidas comparten el modal de registro. Hoy renueva automáticamente el consumo a medianoche local y distingue el excedente del objetivo. Comidas permite elegir fecha y ver o editar consumos con el objetivo vigente de ese día.
- Gym usa una sola lista de ejercicios, encabezada por los destacados, con la última carga y repeticiones cuando existen. Ejercicios y Cinta usan dos columnas en escritorio y una en móvil.
- El registro ofrece medidas caseras, recetas publicadas con composición calculable, comidas recientes y carga libre. El cabutiá crudo y hervido tiene fuente directa y el horneado usa una referencia comparable indicada como estimación. [Fuentes](NUTRITION_CATALOG.md)
- Mi heladera usa una lista filtrable, con resumen y vista de disponibles. Los ingredientes personales conservan sus controles y persistencia por cuenta.
- El Recetario tiene 14 fichas en ES, EN e IT y cubre las cuatro intensidades. Las 14 quedan publicadas en la semilla local. Cada ficha ofrece medidas orientativas y nutrientes conocidos. Los filtros muestran toda la selección y priorizan las preparables según Mi heladera. [Primera tanda](RECIPE_CANDIDATES.md#primera-tanda) · [Fuentes y modelo](NUTRITION_CATALOG.md)
- Se pueden combinar recetas y personalizar porciones, sustituciones y acompañamientos desde la ficha, Hoy o Comidas. El total se guarda junto a la composición consumida. La edición histórica permite cambiar porciones o retirar una preparación con los valores originales.
- La carita usa azul petróleo en los iconos derivados. El JPG original se conserva. El botón de acceso muestra la G oficial de Google y mantiene el flujo de autenticación. [Recurso de Google Identity](https://developers.google.com/identity/branding-guidelines)

## Criterios para las próximas etapas

- Las cantidades y medidas domésticas son orientativas. Mi heladera registra disponibilidad sin inventario. [Criterios de porciones](ROADMAP.md#ingredientes-disponibles-y-porciones)

## Verificado

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

- Aplicar en Supabase, en orden, `20261125100000_recipe_customization.sql` y `20261125101000_seed_first_recipe_book.sql`, después de `20261124191000_daily_food_and_time_zone.sql` si aún está pendiente.
- Probar el registro y la edición de una comida real desde la versión publicada. El maki fino admite carga libre hasta incorporar una referencia específica.
- La publicación y las pruebas de esta etapa en Supabase hospedado quedan pendientes. El correo externo sigue pendiente de SMTP propio.
