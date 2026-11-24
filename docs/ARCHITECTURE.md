# Arquitectura

## Fundación

- `src/app/[locale]` define la raíz HTML con idioma y Manrope. Las rutas se generan para `es`, `en` e `it`. La ruta `/` elige la preferencia guardada o español.
- `src/i18n` contiene los catálogos. Español define las claves requeridas por los otros catálogos. Las rutas internas se conservan al seleccionar las preferencias desde Configuración.
- La demo usa un proveedor React compartido por las rutas de un mismo idioma. Los datos ficticios parten del 24 de noviembre de 2026 y los formularios operan sobre ese día de ejemplo. Los datos se reinician al recargar o cambiar de idioma.
- Las preferencias de idioma, peso, altura y distancia son cookies locales versionables por nombre. La demo muestra peso, carga, distancia, velocidad y ritmo en las unidades elegidas. La altura se aplicará cuando haya perfil.
- Los tokens de color y estilos compartidos viven en `globals.css`. Los metadatos y los iconos de instalación reproducen los colores de marca. Si se modifica `public/brand.svg`, regenerar los PNG de 180, 192 y 512 píxeles.
- El manifiesto abre la ruta raíz en modo independiente. La instalación depende del navegador, de localhost o de HTTPS. El acceso offline queda fuera de la fundación.

## Modelo previsto

La aplicación autenticada persistirá el perfil y cada entidad privada con el ID de Supabase Auth y reglas RLS por propietario. Cada tabla privada deberá rechazar accesos anónimos. Los perfiles y las preferencias vendrán en la primera migración. Agregar las demás entidades cuando se incorporen sus pantallas y validaciones.

Conservar kilogramos, centímetros y kilómetros como unidades canónicas. Guardar los instantes reales como `timestamptz` y el huso del usuario como identificador IANA. Para buscar registros de un día local, convertir ambas medianoches de ese huso a instantes y consultar un intervalo semiabierto. Las fechas del plan representan un día de calendario y se guardan como `date`. Las utilidades UTC de la demo manejan fechas fijas que carecen de hora.

Los objetivos históricos tendrán fecha de vigencia. Los registros consumidos tendrán su propio flujo de confirmación. El catálogo compartido y los ingredientes personales tendrán reglas de acceso diferenciadas.
