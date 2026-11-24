# Estado de MASOMENO

**24 de noviembre de 2026 · Preparado para el primer despliegue en Vercel.**

## Estado funcional

- Registro abierto con Google PKCE o correo y contraseña. Hay confirmación de correo, recuperación y cierre de sesión. La demo está limitada a `npm run dev`.
- Inicio, Evolución y Gym guardan pesajes, objetivos, ejercicios, destacados, cargas y sesiones de cinta en Supabase. Los perfiles y preferencias se mantienen por cuenta. Comidas y recetas quedan para las próximas etapas.
- Los correos usan `MASOMENO_SITE_URL` o el dominio provisto por Vercel. La opción automática usa el dominio de producción o el del preview según el entorno. El valor por defecto localhost se usa solo en desarrollo.

## Verificado

- El usuario confirmó dos ingresos con cuentas de Google distintas en localhost. Las tres migraciones ya figuran aplicadas en el proyecto hospedado.
- Se comprobaron en Supabase las políticas por propietario y la ausencia de lectura anónima en las seis tablas personales. Google, Email, las altas y la confirmación por correo están activos. El acceso anónimo y SMTP propio están desactivados.
- La compilación de producción se probó bajo HTTPS local con Supabase simulado. Se comprobaron Google PKCE, renovación de sesión con cookies seguras, enlaces de correo y recuperación, persistencia de preferencias, operaciones de peso y entrenamiento, navegación móvil, manifiesto e iconos públicos. La demo permaneció desactivada incluso con su variable en `true`.
- Pasaron TypeScript, ESLint, las 19 pruebas y el build. La auditoría de dependencias de producción no reportó vulnerabilidades. El historial y los archivos del proyecto se revisaron para detectar secretos y archivos privados. `.env.local`, `.vercel/` y la configuración temporal del CLI están excluidos de Git.

## Publicación pendiente

Con autorización, subir la versión local a `main` e importar el repositorio `pineaost/masomeno` en Vercel. Configurar las variables de Production, confirmar el dominio HTTPS y agregar las URLs exactas en Supabase. Para probar el correo, agregar sus URLs y cargar las plantillas de confirmación y recuperación. Probar allí el login con Google, la renovación de sesión y una escritura de seguimiento. El correo a direcciones externas al equipo queda pendiente de SMTP propio. [Configuración de Vercel](../README.md#vercel) · [URLs de Supabase](SETUP_SUPABASE.md#urls-para-vercel)
