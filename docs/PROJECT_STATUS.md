# Estado de MASOMENO

**24 de noviembre de 2026 · Etapa 1 completada.** Este archivo es el punto de partida para continuar el desarrollo.

## Implementado

- Proyecto Next.js App Router con TypeScript, Tailwind, Manrope local, tokens de marca, isotipo SVG e iconos de instalación. Git local inicializado en `main`.
- Inicio, Comidas, Evolución, Gym y Configuración. Barra inferior en celular y navegación lateral en escritorio.
- Catálogos en español, inglés e italiano. Preferencias de idioma y unidades guardadas en el navegador.
- Inicio con barra de calorías, excedente numérico y gráfico de peso. Demo de alta, edición y eliminación confirmada de comidas, más alta de pesajes.
- Búsqueda en tres fichas de recetas ficticias. El plan semanal muestra un estado informativo.
- Evolución con selector de período e historial. Gym con cuatro ejercicios y sesiones de cinta de ejemplo, cargas, velocidad media y ritmo.

## Verificaciones

- `npm run typecheck`, `npm run lint`, `npm test` y `npm run build` pasan. Tres pruebas de dominio cubren calorías, conversiones y fechas.
- Recorrido en Chrome de escritorio y vista emulada de iPhone 13 mini. Se verificaron navegación, cambios en el total calórico, búsqueda, peso, Gym, los tres idiomas, persistencia de preferencias e instalabilidad en Chrome.

## Decisiones y límites

- Los registros se guardan en memoria dentro del idioma activo. Reiniciar la página o cambiar de idioma restaura los ejemplos. La fecha de muestra es fija para reproducir los casos de prueba.
- Los gráficos representan las mediciones de ejemplo con SVG y las conversiones se calculan desde unidades métricas. La unidad de altura se aplicará al incorporar el perfil.
- La instalación usa manifiesto e iconos. La demo requiere conexión con el servidor. Falta verificar la instalación en un iPhone físico.
- ESLint 9 está fijado por compatibilidad con los plugins del preset Next. npm informa su fin de soporte al instalar.
- Supabase, autenticación, migraciones, persistencia de registros y despliegue quedan pendientes de la Etapa 2. Los modelos de comidas, recetas, entrenamiento y planificación se incorporarán en sus etapas, según el [roadmap](ROADMAP.md).

## Próxima tarea

Implementar la Etapa 2 en local. Empezar por una migración de perfiles, preferencias y lista privada de invitados. Luego conectar Supabase SSR y el callback de Google con PKCE y verificar RLS con dos cuentas.

## Acciones manuales pendientes

La demo funciona sin configuración externa. Para la Etapa 2, crear el proyecto Supabase, configurar el cliente OAuth en Google Cloud, definir los correos invitados y completar las dos variables públicas en `.env.local`. Para Vercel se necesitan el repositorio remoto y autorización para el despliegue. Los pasos están en la [guía de configuración](SETUP_SUPABASE.md).
