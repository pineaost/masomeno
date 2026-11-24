# Prueba de registro y aislamiento

`npm test` verifica las decisiones de acceso, la validación de formularios y las tres migraciones en PostgreSQL en memoria. Las pruebas locales de navegador pueden usar un proveedor simulado. La entrega de correo y el consentimiento de Google se prueban aparte con los servicios configurados.

## Aceptación con cuentas reales

1. Creá la cuenta A con correo y contraseña en MASOMENO. Comprobá el mensaje de confirmación pendiente. Antes de abrir el enlace, intentá ingresar con la contraseña correcta. Luego abrí el correo en otro navegador y verificá que se habilite el acceso.
2. Guardá un nombre, un idioma, unidades y un pesaje. Cerrá sesión y volvé a ingresar. Los datos y las preferencias de A deben persistir.
3. En la misma ventana, cerrá sesión y entrá como B con un correo distinto o una cuenta de Google nueva. Inicio y Gym deben estar vacíos hasta que B agregue sus propios registros. Probá regresar a las URLs privadas después de cerrar sesión.
4. Pedí recuperar A y una dirección inexistente. El sitio debe mostrar el mismo mensaje. Abrí el enlace de A, elegí una contraseña nueva y comprobá que la anterior falle y que la nueva permita recuperar el mismo perfil.
5. Verificá los tres idiomas, el ingreso recurrente con Google y la edición de un pesaje, una carga y una sesión de cinta.

## Comprobación de RLS

Usá el API hospedado con la clave publicable en la cabecera `apikey` y el token de **cada sesión de prueba** en `Authorization: Bearer <access_token>`. Podés inspeccionar la cookie HttpOnly `masomeno_auth` en DevTools de un perfil de prueba. Conservá el token solo mientras dure la prueba.

| Solicitud | Resultado esperado |
| --- | --- |
| `GET /rest/v1/profiles?select=id,display_name` con A o B | Solo el perfil de esa cuenta |
| `GET /rest/v1/user_preferences?select=user_id,locale` con A o B | Solo las preferencias de esa cuenta |
| `GET /rest/v1/weight_measurements?select=id,user_id` con A o B | Solo sus pesajes |
| `PATCH /rest/v1/profiles?id=eq.<id de la otra cuenta>` con el nombre actual y `Prefer: return=representation` | Lista vacía y ninguna fila afectada |
| `GET /rest/v1/profiles?select=id` usando solo `apikey` | Permiso denegado |

Repetí la consulta por ID ajeno con las tablas de ejercicios, cargas y cinta. Usá cuentas de prueba y verificá que ninguna propiedad cambie de titular.
