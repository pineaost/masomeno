# MASOMENO

**Más o menos, pero mejor.** Una bitácora personal para decidir qué comer, registrar comidas y seguir el peso y el entrenamiento. Está pensada para pocas personas, con una experiencia móvil y registros rápidos. Las estimaciones son aproximadas y las futuras sugerencias de recetas saldrán de un catálogo con reglas deterministas.

## Estado

Etapa 1, fundación. Incluye Inicio, Comidas, Evolución, Gym y Configuración con datos ficticios. Podés probar el registro y la corrección de comidas, agregar un pesaje y cambiar el idioma o las unidades. Los registros de ejemplo se mantienen durante la navegación y se reinician al recargar o cambiar de idioma. Las preferencias se guardan en cookies del navegador.

La fecha de ejemplo es el 24 de noviembre de 2026. Las cargas y sesiones de cinta ilustran cómo se verá el historial. El recetario contiene tres ejemplos que se pueden buscar.

## Desarrollo local

Requiere Node.js 24 LTS y npm.

```powershell
cd C:\Users\yvozzi\Downloads\MASOMENO
npm ci
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

Para probar el modo independiente, usá la opción de instalar del navegador en localhost o en un entorno HTTPS. En Safari para iOS, está en Compartir → Agregar a inicio. Para ejecutar la demo instalada se necesita conexión con el servidor.

| Comando | Uso |
| --- | --- |
| `npm run dev` | Ejecuta el servidor de desarrollo |
| `npm run typecheck` | Genera los tipos de rutas y verifica TypeScript |
| `npm run lint` | Ejecuta ESLint |
| `npm test` | Prueba cálculos de calorías, unidades y fechas |
| `npm run build` | Compila la versión de producción |
| `npm run start` | Sirve la compilación de producción |

## Tecnologías y carpetas

Next.js 16 con App Router, React 19, TypeScript, Tailwind CSS 4, next-intl y Lucide. Manrope se sirve desde la aplicación con `next/font/local` y su licencia está en `src/assets`. Los gráficos de demo son SVG y el manifiesto de instalación usa el isotipo de la marca.

| Ruta | Contenido |
| --- | --- |
| `src/app` | Rutas, layouts, metadatos, manifiesto y tokens CSS |
| `src/components` | Navegación, encabezados, diálogos y gráfico |
| `src/features` | Pantallas, datos y estado de demostración |
| `src/i18n` | Catálogos de español, inglés e italiano y configuración regional |
| `src/lib` | Fechas, unidades y preferencias del navegador |
| `public` | Isotipo SVG e iconos de instalación |
| `docs` | Estado, etapas y guías de configuración |

## Variables de entorno

La Etapa 1 funciona sin variables. A partir de la Etapa 2, copiá `.env.example` a `.env.local` y completá:

| Variable | Origen |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave publicable del proyecto Supabase |

El secreto de OAuth se configura en Supabase. Conservá `.env.local` fuera de Git.

## Supabase, Google OAuth y migraciones

La [guía de la Etapa 2](docs/SETUP_SUPABASE.md) explica cómo preparar un proyecto Supabase, dar acceso a las cuentas invitadas, configurar Google OAuth y verificar las migraciones y el aislamiento de datos. El código de autenticación y la primera migración se incorporarán durante esa etapa.

## Vercel

Cuando se autorice un primer despliegue, importá el repositorio de GitHub en Vercel con el preset Next.js, raíz del proyecto `.`, Node.js 24.x y los comandos predeterminados. Agregá las dos variables de Supabase al entorno que corresponda y registrá la URL final del callback en Supabase antes de probar Google. Usá un proyecto Supabase de prueba para las vistas previas. [Configuración de builds en Vercel](https://vercel.com/docs/builds/configure-a-build)

## Continuidad

- [Estado del proyecto y próxima tarea](docs/PROJECT_STATUS.md)
- [Etapas de desarrollo](docs/ROADMAP.md)
- [Arquitectura](docs/ARCHITECTURE.md)
