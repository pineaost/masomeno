# Preparar Supabase, Google y Vercel

La demo se ejecuta de inmediato. Aplicá esta guía al comenzar la Etapa 2, cuando estén disponibles el callback, las migraciones y la lista de invitados.

## Supabase

1. Creá un proyecto de desarrollo en [Supabase](https://supabase.com/dashboard).
2. En Connect o Project Settings, copiá la URL del proyecto y su clave publicable. En la raíz del repositorio, ejecutá `Copy-Item .env.example .env.local` en PowerShell y completá ambas variables. La clave publicable actúa con los permisos de RLS.
3. En **Authentication → URL Configuration**, usá `http://localhost:3000` como Site URL durante el desarrollo. Agregá `http://localhost:3000/auth/callback` a Redirect URLs. En un entorno desplegado agregá la URL HTTPS exacta de la app seguida de `/auth/callback`. [Guía de redirecciones de Supabase](https://supabase.com/docs/guides/auth/redirect-urls)

## Google OAuth

1. En [Google Cloud Console](https://console.cloud.google.com/), seleccioná un proyecto. En **Google Auth Platform**, completá Branding y Audience. Si la audiencia es externa y la app está en modo de pruebas, agregá los correos invitados como Test users.
2. En **Clients**, creá un cliente OAuth de tipo **Web application**. En **Authorized redirect URIs**, pegá la URL exacta que muestra **Supabase → Authentication → Sign In / Providers → Google**, normalmente `https://<referencia-proyecto>.supabase.co/auth/v1/callback`. Google redirige ahí y luego Supabase redirige a `/auth/callback` de la app.
3. Habilitá Google en Supabase y completá Client ID y Client Secret. Guardá el secreto en el panel de Supabase. [Guía oficial de Google OAuth con Supabase](https://supabase.com/docs/guides/auth/social-sign-in/auth-google)
4. Cuando se aplique la primera migración, cargá en la lista privada los correos invitados y habilitá el hook **Before User Created** en Supabase. La implementación prevista deberá validar también el acceso a la app para sesiones existentes. Probá el flujo con una cuenta invitada y otra ajena. [Hook de alta](https://supabase.com/docs/guides/auth/auth-hooks/before-user-created-hook)

## Migraciones de la Etapa 2

La Etapa 1 no requiere SQL. La Etapa 2 incorporará la primera migración bajo `supabase/migrations/`, con nombre ordenable por fecha. La ruta recomendada es el CLI desde la raíz, con el proyecto de desarrollo seleccionado:

```powershell
supabase login
supabase link --project-ref <referencia-proyecto>
supabase db push --dry-run
supabase db push
supabase migration list
```

Reemplazá el marcador con la referencia del proyecto real. Si se usa el SQL Editor, ejecutá los archivos pendientes una vez, del más antiguo al más nuevo, y registrá sus versiones como aplicadas antes de usar `db push` con ese mismo proyecto. [Migraciones con Supabase](https://supabase.com/docs/guides/deployment/database-migrations)

Verificá que la migración figure como aplicada, que un invitado pueda leer y actualizar su perfil y que una segunda cuenta autenticada reciba cero filas cuando consulte el perfil ajeno. Probá que modificar o insertar con un ID ajeno falle. Repetí la lectura sin sesión. El checklist de la etapa deberá usar la clave publicable en las pruebas de acceso.

## Vercel

Cuando se autorice publicar, importá el repositorio privado de GitHub y elegí Next.js con Node 24. En **Settings → Environment Variables**, cargá la URL pública y la clave publicable de Supabase para el entorno elegido. Confirmá que las URL de la app y del callback correspondan al proyecto Supabase del mismo entorno. Probá OAuth desde el dominio final. La Etapa 1 se verifica en local. [Despliegue desde Git](https://vercel.com/docs/git)
