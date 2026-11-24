# Arquitectura

## Fundación

- `src/app/[locale]` define la raíz HTML con idioma y Manrope. `src/i18n` contiene los tres catálogos. La ruta `/` elige la preferencia local de idioma o español.
- El grupo de rutas `(private)` preserva las rutas existentes para `es`, `en` e `it`. La pantalla `/[locale]/login`, el callback `/auth/callback` y el manejador `/auth/confirm/[locale]` son públicos.
- La demo está disponible exclusivamente en desarrollo con `MASOMENO_DEMO_MODE=true`. Sus registros provienen de un proveedor React en memoria y sus unidades se guardan en cookies propias del navegador.
- Los tokens de color y estilos compartidos viven en `globals.css`. `src/lib/brand.ts` centraliza las referencias al favicon, al icono del encabezado y al manifiesto. Los PNG se recortaron de `logo1.jpg` conservando sus trazos. La variante maskable tiene margen para que la máscara del dispositivo respete el rostro.
- El manifiesto abre la ruta raíz en modo independiente. La instalación depende del navegador, de localhost o de HTTPS. El acceso offline queda fuera de la fundación.

## Sesión y datos de cuenta

- Google mantiene PKCE y el callback SSR. La pantalla de correo usa las operaciones de contraseña de Supabase Auth. El primer ingreso o la confirmación del correo crea el perfil y las preferencias de forma idempotente con el ID de Auth.
- El manejador de correo llama a `verifyOtp` con el tipo exacto del enlace. La recuperación usa una cookie HttpOnly separada con duración de 15 minutos. La acción de recuperar cambia la contraseña vía Supabase Auth, cierra esa sesión temporal y vuelve al login.
- `src/proxy.ts` renueva las cookies mediante Supabase SSR. La capa de acceso verifica la sesión con `getClaims()`. Las acciones de Configuración y seguimiento verifican la sesión antes de escribir. RLS usa `auth.uid()` y los permisos de las columnas para limitar las operaciones a su propietario.
- Configuración guarda el perfil y las preferencias en Supabase. El idioma guardado se prioriza al volver de OAuth. La cookie local conserva el último idioma utilizado para Login. La altura del perfil se ingresa y guarda en centímetros.

## Peso y entrenamiento

- `src/lib/tracking-data.ts` concentra las lecturas autenticadas y las pagina con orden estable. Las acciones de servidor en `src/features/tracking-actions.ts` verifican la sesión, validan las entradas y revalidan las pantallas afectadas.
- La segunda migración agrega el objetivo opcional al perfil y crea las cuatro tablas privadas de seguimiento. La migración de registro abierto preserva la separación por propietario. La clave foránea compuesta de fuerza impide enlazar marcas con ejercicios ajenos. Los destacados ocupan uno de cuatro lugares únicos por usuario. Eliminar un ejercicio elimina sus marcas.
- El peso y la carga se guardan en kg, la cinta en km y segundos. El pesaje usa `timestamptz`. El formulario interpreta la hora según la zona del perfil y el historial se muestra en esa misma zona. Se rechazan horas que no existen por un cambio de horario y las horas repetidas se interpretan como la primera ocurrencia. Las fechas de fuerza y cinta son días de calendario.
- El gráfico de peso conserva los puntos registrados. Con cinco o más mediciones muestra una línea separada con la media de los últimos tres pesajes donde existe esa ventana. El objetivo corporal se configura en Evolución.
- Gym compara la última carga con la anterior. La velocidad reciente usa distancia total dividida por tiempo total en hasta cinco sesiones y se compara con las cinco anteriores cuando ambos grupos están completos.

## Modelos posteriores

Incorporar las entidades privadas de comidas con el ID de Supabase Auth y reglas RLS por propietario.

Conservar kilogramos, centímetros y kilómetros como unidades canónicas. Guardar los instantes reales como `timestamptz` y el huso del usuario como identificador IANA. Para buscar registros de un día local, convertir ambas medianoches de ese huso a instantes y consultar un intervalo semiabierto. Las fechas del plan representan un día de calendario y se guardan como `date`. Las utilidades UTC de la demo manejan fechas fijas que carecen de hora.

Los objetivos históricos tendrán fecha de vigencia. Los registros consumidos tendrán su propio flujo de confirmación. El catálogo compartido y los ingredientes personales tendrán reglas de acceso diferenciadas.
