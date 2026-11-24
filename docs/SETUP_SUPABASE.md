# Supabase para el registro abierto

El proyecto hospedado es **masomeno** (`uhefabgdptaxcvqdavkj`). El API de la app usa la clave publicable en `.env.local`. [Abrir el panel de Supabase](https://supabase.com/dashboard/project/uhefabgdptaxcvqdavkj)

## Migración

El CLI confirmó las tres versiones aplicadas, incluida [20261124170000_open_registration.sql](../supabase/migrations/20261124170000_open_registration.sql). Mantené desactivado el hook **Before User Created**. La función anterior se eliminó al habilitar el registro abierto. [Migraciones con Supabase CLI](https://supabase.com/docs/guides/local-development/cli-workflows)

## Activar correo y contraseña

1. En **Authentication → Sign In / Providers**, habilitá el proveedor **Email**, **Allow new users to sign up** y **Confirm email**. Configurá un mínimo de 8 caracteres y conservá deshabilitados los accesos anónimos y los proveedores no utilizados. [Autenticación con contraseña](https://supabase.com/docs/guides/auth/passwords)
2. En **Authentication → URL Configuration**, configurá la Site URL de la app y permití estas redirecciones para probar en local:

   - `http://localhost:3000/auth/confirm/es`
   - `http://localhost:3000/auth/confirm/en`
   - `http://localhost:3000/auth/confirm/it`
   - `http://localhost:3000/auth/callback` para Google.

   El proyecto hospedado ya permite el callback de Google en localhost. Agregá las tres URLs de correo si también vas a probar confirmación y recuperación en localhost. [URLs de redirección](https://supabase.com/docs/guides/auth/redirect-urls)
3. En **Authentication → Email → Templates**, copiá el contenido de [Confirm signup](../supabase/templates/confirmation.html) y [Reset password](../supabase/templates/recovery.html) en las plantillas respectivas. Ambas usan `{{ .RedirectTo }}` y `{{ .TokenHash }}`. El enlace de alta debe indicar `type=signup` y el de recuperación `type=recovery`. [Plantillas de correo para SSR](https://supabase.com/docs/guides/auth/auth-email-templates)

## URLs para Vercel

Con el dominio HTTPS confirmado, en **Authentication → URL Configuration** poné ese origen como **Site URL**. Agregá las URLs exactas en **Redirect URLs** y conservá el callback de Google de localhost:

- `https://<dominio>/auth/callback`
- `https://<dominio>/auth/confirm/es`
- `https://<dominio>/auth/confirm/en`
- `https://<dominio>/auth/confirm/it`

En Vercel, usá ese mismo origen para `MASOMENO_SITE_URL`. Abrí MASOMENO desde el dominio registrado para que el callback PKCE vuelva al origen que inició Google. En Google Cloud conservá el callback de Supabase `https://uhefabgdptaxcvqdavkj.supabase.co/auth/v1/callback`. [URLs de redirección](https://supabase.com/docs/guides/auth/redirect-urls)

## Entrega de correo

El proyecto tiene **Confirm email** activo y SMTP propio desactivado. El envío incorporado de Supabase se limita a direcciones del equipo y a dos envíos por hora. Para registrar o recuperar cuentas externas por correo, habilitá **Custom SMTP** en Auth y cargá las credenciales y el remitente en el Dashboard. Google puede probarse y publicarse mientras se configura el correo. [SMTP personalizado](https://supabase.com/docs/guides/auth/auth-smtp)

## Primera prueba

Desde `http://localhost:3000`, creá una cuenta con un correo propio, abrí el enlace recibido y verificá que se abra Inicio. Para probar sin envíos externos, Supabase CLI puede ejecutar Auth local con Mailpit si Docker está disponible. Las plantillas de este repositorio ya están referenciadas en `supabase/config.toml`. [Pruebas de Auth con Mailpit](https://supabase.com/docs/guides/auth/testing-auth-flows)

La activación de Google está en la [guía de Google OAuth](SETUP_GOOGLE_AUTH.md). El [checklist de aceptación](TEST_AUTH.md) cubre recuperación, persistencia y aislamiento.
