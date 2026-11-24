<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Reglas permanentes de MASOMENO

## Desarrollo local

- Realizá todo el desarrollo exclusivamente en `C:\Users\yvozzi\Downloads\MASOMENO`.
- Podés inspeccionar, crear, editar y eliminar archivos del proyecto, instalar dependencias y ejecutar las pruebas necesarias. Las modificaciones locales habituales están autorizadas.
- Usá localhost para comprobar las pantallas, la autenticación y los módulos.

## Git y GitHub

- El repositorio remoto es [pineaost/masomeno](https://github.com/pineaost/masomeno).
- Podés usar comandos Git de consulta, como `git status` y `git diff`.
- Requerí autorización expresa antes de ejecutar `git push`, `git pull`, `git merge`, `git reset` o cualquier otra operación que modifique el repositorio remoto o pueda sobrescribir trabajo.
- Creá commits únicamente si el usuario lo solicita expresamente. Esta regla también se aplica a los archivos generados por Next.js.
- El usuario decide cuándo se termina una etapa y cuándo se suben los cambios a GitHub.

## Vercel y Supabase

- Ejecutá deploys en Vercel, publicá cambios o aplicá migraciones en Supabase remoto únicamente con autorización expresa del usuario.
- Podés preparar cambios, desarrollar migraciones SQL y ejecutar pruebas locales.
- La aplicación local puede usar la conexión Supabase existente para las pruebas funcionales autorizadas. Evitá modificar datos reales innecesariamente.

## Forma de trabajo

- Trabajá con autonomía y criterio propio. Resolvé las decisiones técnicas o visuales menores sin consultar.
- Mantené las entregas breves y evitá los instructivos de vistas previas y los informes extensos.
- Al finalizar cada tarea, indicá brevemente qué modificaste, qué verificaste y si quedan operaciones externas pendientes.
- Actualizá `docs/PROJECT_STATUS.md` cuando corresponda.

**Codex desarrolla localmente. El usuario controla GitHub y Vercel.**
