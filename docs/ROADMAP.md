# Etapas de MASOMENO

| Etapa | Alcance | Verificación |
| --- | --- | --- |
| 1. Fundación | App local, identidad, navegación adaptable, configuración, i18n, base instalable y datos de ejemplo | TypeScript, lint, build y recorrido en pantallas pequeñas y de escritorio |
| 2. Autenticación y persistencia | Registro abierto con Google PKCE o correo y contraseña. Confirmación, recuperación, perfil, preferencias y RLS por propietario | El esquema inicial está aplicado. Pendientes el cambio de acceso, la configuración de proveedores y las pruebas con cuentas reales |
| 3. Peso y entrenamiento | Pesajes y objetivo, historial y tendencia. Ejercicios y marcas, cuatro destacados y cinta con velocidad y ritmo. Logo provisional incorporado | El esquema está aplicado. Conversión de unidades, fechas, tendencias y RLS verificados en local |
| 4. Alimentación | Objetivo calórico versionado, carga libre, repetición, alimentos y porciones declaradas, edición y eliminación | Totales por día local, excedentes y cambios de objetivo sin alterar días anteriores |
| 5. Biblioteca | Ingredientes con sinónimos, estado crudo o cocido y fuentes verificables. Recetas, favoritos y búsqueda. Esquema JSON, ejemplo, validación e importación | Importación repetible, datos incompletos o duplicados rechazados con mensajes por entrada y cálculo por porción |
| 6. Recomendaciones | Heladera sin cantidades, ingredientes privados vinculables al catálogo, filtros y Sorprendeme | Orden por ingredientes faltantes, exclusiones estrictas y variedad entre tandas |
| 7. Planificación y refinamientos | Almuerzos y cenas planificados, mejoras de accesibilidad, i18n y rendimiento | Planificar y confirmar consumo como operaciones independientes. Revisión final de seguridad y consistencia |

## Biblioteca de recetas

En la etapa 5 se define primero el contrato de importación y se documenta un prompt para generar el lote externo. Validar el contrato y la red de ingredientes con unas pocas recetas de prueba antes de reunir las aproximadamente 50 recetas. Registrar las cantidades en gramos cuando sea viable, usar equivalencias declaradas y calcular el total a partir de datos nutricionales revisados.

El catálogo de ingredientes debe almacenar fuente y estado de validación. Considerar [USDA FoodData Central](https://fdc.nal.usda.gov/) para poblar el catálogo de forma revisada. La app consultará su propia base.
