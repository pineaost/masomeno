# Etapas de MASOMENO

| Etapa | Alcance | Verificación |
| --- | --- | --- |
| 1. Fundación | App local, identidad, navegación adaptable, configuración, i18n, base instalable y datos de ejemplo | TypeScript, lint, build y recorrido en pantallas pequeñas y de escritorio |
| 2. Autenticación y persistencia | Registro abierto con Google PKCE o correo y contraseña. Confirmación, recuperación, perfil, preferencias y RLS por propietario | Esquema aplicado y Google operativo en Vercel. Correo para usuarios externos pendiente de SMTP |
| 3. Peso y entrenamiento | Pesajes y objetivo, historial y tendencia. Ejercicios y marcas, cuatro destacados y cinta con velocidad y ritmo. Logo provisional incorporado | El esquema está aplicado. Conversión de unidades, fechas, tendencias y RLS verificados en local |
| 4. Alimentación | Balance diario, registro y repetición de comidas, catálogo inicial de 31 alimentos y Mi heladera | Implementado en local con el esquema aplicado en Supabase. Pendiente la prueba en Vercel |
| 5. Biblioteca | Lista y ficha con intensidad, tiempo y energía por porción. Pendientes el contenido, el contrato de importación y los favoritos | Datos incompletos o duplicados identificados y cálculo por porción |
| 6. Recomendaciones | Priorizar según disponibilidad y preferencias | Priorizar ingredientes principales marcados, luego los que requieren menos faltantes y finalmente el resto del recetario |
| 7. Planificación y refinamientos | Almuerzos y cenas planificados, mejoras de accesibilidad, i18n y rendimiento | Planificar y confirmar consumo como operaciones independientes. Revisión final de seguridad y consistencia |

## Biblioteca de recetas

En la etapa 5 se define primero el contrato de importación y se documenta un prompt para generar el lote externo. Validar el contrato y la red de ingredientes con unas pocas recetas de prueba antes de reunir las aproximadamente 50 recetas. Registrar las cantidades en gramos cuando sea viable, usar equivalencias declaradas y calcular el total a partir de datos nutricionales revisados.

El catálogo inicial ya guarda la fuente, el estado de validación y la preparación de cada referencia. La siguiente ampliación puede reutilizar ese modelo.

## Ingredientes disponibles y porciones

- La heladera distingue disponible, no disponible y sin marcar. La selección es opcional y el registro de consumos no la modifica.
- Los filtros Liviana, Media, Fuerte y En la pera describen contundencia aproximada. La intensidad y el objetivo calórico podrán orientar el orden de sugerencias. Todas las recetas seguirán accesibles, incluso si faltan ingredientes o la heladera está vacía.
- Una receta puede definir una porción estándar con cantidades y nutrientes estimados. Al ajustar la porción o el número de comensales, se escalan las cantidades y los valores nutricionales en la misma proporción.
- La porción sugerida debe guiarse principalmente por el objetivo energético, el presupuesto calórico de la comida y el tamaño de porción elegido. Peso, altura, edad, actividad y otros datos pertinentes pueden orientar la estimación futura. El peso por sí solo no determina la porción.
- Se pueden ofrecer medidas domésticas cuando exista una equivalencia fundamentada y se indique que es aproximada. Usar una receta no debe exigir pesar los ingredientes.
- Al registrar una receta, la persona podrá ajustar la porción y los ingredientes en el consumo. La receta del catálogo conservará su versión original.
