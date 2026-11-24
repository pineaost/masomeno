# Estado de MASOMENO

**24 de noviembre de 2026 · Limpieza visual e identidad aplicadas en local.**

## Estado funcional

- La versión anterior está publicada en Vercel y el usuario confirmó el acceso con Google. Perfil, preferencias, peso, Gym y Cinta ya usan Supabase.
- Configuración ordena Perfil, Preferencias y objetivo calórico. El nombre de Perfil aparece junto a las opciones de cuenta del sidebar y dentro del menú superior en móvil.
- Hoy, Today y Oggi conservan la ruta principal. La interfaz prioriza el balance calórico, los bloques y las acciones. Los encabezados redundantes de página se mantienen disponibles para lectores de pantalla. [Criterios de identidad y UX](ARCHITECTURE.md#identidad-y-experiencia)
- Comidas permite usar el catálogo de 31 alimentos, repetir una comida reciente como un registro nuevo, cargar una estimación manual y editar o eliminar consumos.
- Mi heladera guarda disponibilidad por cuenta y permite buscar por nombre o sinónimo. Distingue disponible, no disponible y sin marcar. El Recetario tiene lista compacta, filtros de intensidad y ficha. El catálogo de recetas permanece vacío.
- La carita usa azul petróleo en los iconos derivados. El JPG original se conserva. El botón de acceso muestra la G oficial de Google y mantiene el flujo de autenticación. [Recurso de Google Identity](https://developers.google.com/identity/branding-guidelines)

## Criterios para las próximas etapas

- La disponibilidad servirá para priorizar recetas y el recetario seguirá completo. Al registrar una receta se podrán ajustar porciones e ingredientes en el consumo, conservando intacta la receta de origen. [Criterios de porciones](ROADMAP.md#ingredientes-disponibles-y-porciones)

## Verificado

- Pasaron TypeScript, ESLint, las 27 pruebas automatizadas y el build de producción.
- En navegador local se verificaron las etiquetas Hoy, Today y Oggi, los encabezados accesibles y la navegación en escritorio y móvil. El nombre del perfil se actualizó al guardar, persistió al recargar y desapareció al quitarlo. Se comprobó el aislamiento entre dos cuentas con PostgreSQL local y Supabase simulado.
- La consulta de solo lectura en Supabase `uhefabgdptaxcvqdavkj` confirmó las tres migraciones de alimentación, sus nueve tablas con RLS, las funciones de guardado y las 31 referencias verificadas del catálogo.
- En navegador local se verificaron el botón de Google en escritorio y móvil, OAuth simulado, el formulario de correo y las rutas públicas del favicon, Apple Touch y PWA.
- En PostgreSQL local se verificaron el aislamiento de las comidas y la heladera, la lectura de recetas publicadas, las escrituras atómicas, la vigencia de objetivos y la importación repetida sin duplicados.
- En navegador local se verificaron el saldo con y sin consumos, la repetición, edición y eliminación de comidas, los tres estados de la heladera al recargar y la ficha y filtros del Recetario. El recorrido incluyó móvil, escritorio, tres idiomas y dos cuentas, con autenticación y transporte de Supabase simulados sobre PostgreSQL en memoria.
- El catálogo incluye 30 referencias de USDA y una de CREA, con preparación y fuente por alimento. [USDA SR Legacy](https://fdc.nal.usda.gov/download-datasets/) · [CREA, ñoquis cocidos](https://www.alimentinutrizione.it/tabelle-nutrizionali/006591)

## Pendiente

Probar el saldo de Hoy y Mi heladera con una cuenta real conectada al proyecto hospedado y publicar la actualización de la interfaz. El correo externo sigue pendiente de SMTP propio.
