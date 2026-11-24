# MASOMENO

**Más o menos, pero mejor.** Una bitácora personal para decidir qué comer, registrar comidas y seguir el peso y el entrenamiento. Está pensada para pocas personas, con una experiencia móvil y registros rápidos. Las estimaciones son aproximadas y las futuras sugerencias de recetas saldrán de un catálogo con reglas deterministas.

## Estado

MASOMENO usa un registro abierto con Google o correo y contraseña. Cada cuenta conserva en privado su perfil, preferencias, pesajes, ejercicios, cargas y sesiones de cinta. Las tres migraciones están aplicadas en Supabase. El acceso con Google ya se probó en localhost con dos cuentas distintas. Está pendiente el primer despliegue.

La demo de la Etapa 1 sigue disponible durante el desarrollo. Para usarla, agregá `MASOMENO_DEMO_MODE=true` a `.env.local` y reiniciá `npm run dev`. Los registros ficticios se reinician al recargar o cambiar de idioma. Quitá esa opción para probar el flujo de autenticación.

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
| `npm test` | Prueba dominio, validaciones de cuenta, decisiones de acceso y RLS en PostgreSQL en memoria |
| `npm run build` | Compila la versión de producción |
| `npm run start` | Sirve la compilación de producción |

## Tecnologías y carpetas

Next.js 16 con App Router, React 19, TypeScript, Tailwind CSS 4, next-intl, Lucide y Supabase SSR. Manrope se sirve desde la aplicación con `next/font/local` y su licencia está en `src/assets`. Los gráficos son SVG. La ilustración original `logo1.jpg` se conserva en la raíz, y el favicon y los iconos de instalación reproducen su dibujo.

| Ruta | Contenido |
| --- | --- |
| `src/app` | Rutas, callback de OAuth, acciones de cuenta, metadatos y estilos |
| `src/components` | Navegación, encabezados, diálogos y gráfico |
| `src/features` | Pantallas privadas, login, configuración y demostración |
| `src/i18n` | Catálogos de español, inglés e italiano y configuración regional |
| `src/lib` | Conexión con Supabase, autorización, validación, fechas y unidades |
| `public` | Favicon, iconos de instalación y primer isotipo |
| `supabase` | Configuración del CLI y migraciones de cuenta y entrenamiento con RLS |
| `tests` | Pruebas de dominio, cuenta y políticas SQL |
| `docs` | Estado, etapas y guías de configuración |

## Variables de entorno

En una copia nueva, creá `.env.local` a partir de [.env.example](.env.example).

| Variable | Origen |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave publicable del proyecto Supabase |
| `MASOMENO_SITE_URL` | Origen para los correos. En Vercel usá el dominio HTTPS canónico. La app puede usar el dominio automático de Vercel si están expuestas las variables de sistema. En `npm run dev` el valor por defecto es `http://localhost:3000` |
| `MASOMENO_DEMO_MODE` | Opcional, activa la demo exclusivamente con `npm run dev` |

El secreto de OAuth se configura en Supabase. Conservá `.env.local` fuera de Git.

## Supabase, Google OAuth y migraciones

La [guía de Supabase](docs/SETUP_SUPABASE.md) describe el cambio de acceso y la configuración de confirmación, recuperación y SMTP. La [guía de Google](docs/SETUP_GOOGLE_AUTH.md) detalla las URLs del callback. La [prueba de aceptación](docs/TEST_AUTH.md) cubre el primer registro y el aislamiento.

## Vercel

Cuando se autorice publicar, importá `pineaost/masomeno` desde GitHub con la rama de producción `main`, preset Next.js, raíz `.` y Node.js 24.x. El despliegue por Git usa los valores predeterminados de Vercel. [Git y Vercel](https://vercel.com/docs/git)

En el entorno **Production**, configurá las dos variables `NEXT_PUBLIC_SUPABASE_*` antes del build y `MASOMENO_SITE_URL` con el origen HTTPS definitivo. Dejá `MASOMENO_DEMO_MODE` sin definir. Los secretos de Google OAuth y SMTP se configuran en Supabase. Una vez confirmado el dominio, completá las [URLs públicas en Supabase](docs/SETUP_SUPABASE.md#urls-para-vercel).

## Continuidad

- [Estado del proyecto y próxima tarea](docs/PROJECT_STATUS.md)
- [Etapas de desarrollo](docs/ROADMAP.md)
- [Arquitectura](docs/ARCHITECTURE.md)
