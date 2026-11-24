# Google OAuth para MASOMENO

## Google Cloud Console

1. Entrá en [Google Cloud Console](https://console.cloud.google.com/) y seleccioná o creá un proyecto para MASOMENO.
2. Abrí **Google Auth Platform**. En **Branding**, completá el nombre de la aplicación, el correo de soporte y los datos de contacto.
3. En **Audience**, elegí **External**. Usá **Testing** durante la configuración y seguí las indicaciones de Google para los usuarios de prueba. Para abrir el acceso de Google al público, cambiá la audiencia a **In production** cuando esté listo. [Audiencia y publicación](https://support.google.com/cloud/answer/15549945)
4. En **Data Access**, usá solo `openid`, `email` y `profile`. Para las solicitudes mediante Supabase, los nombres completos de los dos últimos scopes son `https://www.googleapis.com/auth/userinfo.email` y `https://www.googleapis.com/auth/userinfo.profile`.
5. En **Clients → Create client**, elegí **Web application**. En **Authorized redirect URIs** pegá exactamente:

   ```text
   https://uhefabgdptaxcvqdavkj.supabase.co/auth/v1/callback
   ```

   El flujo redirige a Google desde Supabase. Dejá vacíos los orígenes JavaScript autorizados para este flujo de redirección. [OAuth para aplicaciones web](https://developers.google.com/identity/protocols/oauth2/web-server)

6. Copiá el Client ID y el Client Secret para cargarlos directamente en Supabase.

## Supabase

1. Después de completar el cambio de [registro abierto en Supabase](SETUP_SUPABASE.md), abrí **Authentication → Sign In / Providers → Google** en [el panel del proyecto](https://supabase.com/dashboard/project/uhefabgdptaxcvqdavkj).
2. Habilitá Google, pegá el Client ID y el Client Secret en los campos del proveedor y guardá. Conservá el secreto en Supabase. [Guía de Supabase para Google](https://supabase.com/docs/guides/auth/social-sign-in/auth-google)
3. En **Authentication → URL Configuration**, agregá `http://localhost:3000/auth/callback` a Redirect URLs. El Client Secret queda fuera de `.env.local`, Git y Vercel.

| Quién redirige | URL de destino |
| --- | --- |
| Google, configurado en Authorized redirect URIs de Google Cloud | `https://uhefabgdptaxcvqdavkj.supabase.co/auth/v1/callback` |
| Supabase, configurado en Redirect URLs de Supabase | `http://localhost:3000/auth/callback` |

Ejecutá `npm run dev`, abrí [http://localhost:3000](http://localhost:3000) y elegí **Continuar con Google**. Al primer ingreso se crean el perfil y las preferencias. Los ingresos siguientes recuperan el idioma guardado.

Supabase puede vincular una identidad OAuth con una cuenta de correo existente cuando se cumplen las condiciones de verificación. MASOMENO conserva los datos por ID de Supabase. Si dos identidades permanecen en cuentas distintas, cada una conserva sus propios registros. [Vinculación de identidades de Supabase](https://supabase.com/docs/guides/auth/identities)
