# 05 — Módulo 1: Reportería y Control Preventivo de Provisiones

**Última actualización:** 2026-08-13
**Relacionado:** [01-producto](01-producto.md) · [04-datos](04-datos.md) · [03-diseño](03-diseno.md) · [08-alertas](08-alertas.md)
**Subagente:** `m1-reporteria`

---

> **Estado de implementación (2026-08-13).** El **Reporte A** (SAP, vista OVH) está construido: tabla, filtros/orden/paginación en la URL, indicadores resumen, flagging de 1 clic, y el drawer completo de detalle/bitácora/acciones descrito en §8–§11. Los **Reportes B (NS) y C (TURBO)**, la pestaña **"No Provisionable"**, la **comparación SAP vs NS**, las **vistas guardadas**, la **exportación** y los **gráficos** de §10 **no están construidos todavía**: sus rutas responden con una página "en construcción" explicativa, no con un error ni una pantalla en blanco.

## 1. Objetivo

Permitir a los Controllers **analizar y corregir preventivamente** registros antes del cierre contable, auditando y validando la información antes de que sea tarde para arreglarla.

## 2. Navegación

### Dos pestañas globales

| Pestaña | Contenido |
|---|---|
| **1. A Provisionar / Proyectado** | Transacciones registradas o pendientes de provisión para el periodo activo |
| **2. No Provisionable** | Vista **unificada de todos los sistemas** (SAP, NS, TURBO) con las transacciones descartadas o clasificadas como "no provisionables". Existe para auditar **omisiones erróneas**: lo que se excluyó y no debía excluirse |

La pestaña "No Provisionable" no es un archivo muerto. Es un control: su propósito es que alguien revise que las exclusiones estén bien hechas.

### Segmentación por sub-perfil de Controller

> **Terminología.** "Controller OVH" y "Controller TURBO" **no son roles distintos**: son los dos **sub-perfiles** del rol `controller` definido en [01-producto §5](01-producto.md). El rol determina *qué puede hacer* un usuario; el sub-perfil determina *qué alcance ve*. Los cinco roles del sistema son `admin`, `controller`, `analista_p2p`, `contabilidad` y `consulta`.

| Sub-perfil | Ve |
|---|---|
| **Controller OVH** | Reportes **A** y **B** únicamente |
| **Controller TURBO** | Reporte **C** únicamente |
| **admin** | Ambas vistas |

La segmentación se aplica en la navegación **y** en el guard de ruta (`GuardSubperfil`, ver [02-arquitectura §6](02-arquitectura.md)). Un Controller TURBO que intente entrar a `/reporteria/registro/sap-ovh` recibe un estado explicativo, no un error.

---

## 3. Reporte A — SAP: Provisiones Registradas (Vista OVH)

**Objetivo:** monitorear día a día las provisiones contabilizadas en SAP durante el periodo activo.
**Origen previsto:** Snowflake (read-only).

### Campos

**Contexto**
| Campo | Tipo | Notas |
|---|---|---|
| Fecha de registro | fecha | |
| Periodo contable | periodo | `YYYY-MM` |
| Compañía | catálogo | |
| País | catálogo | |
| Unidad de negocio | catálogo | |
| Centro de costo | catálogo | Se valida contra el catálogo esperado |
| Cuenta contable | catálogo | Se valida contra el catálogo esperado |

**Documento**
| Campo | Tipo | Notas |
|---|---|---|
| Número de documento | texto | Identificador principal |
| Orden de compra | texto | Opcional — su ausencia dispara una inconsistencia |
| Proveedor | catálogo | |
| Concepto / Descripción | texto | |
| Usuario que registró | texto | |

**Valores**
| Campo | Tipo | Notas |
|---|---|---|
| Moneda | ISO 4217 | Siempre visible junto al valor |
| Valor en moneda local | decimal | |
| Valor en USD | decimal | Moneda de reporte para consolidados |

**Auditoría**
| Campo | Tipo | Notas |
|---|---|---|
| Estado del registro | estado | Ver §7 |
| Tipo de provisión | catálogo | |
| Posible inconsistencia | catálogo | Ver §6 |
| Responsable de revisión | usuario | Puede estar vacío → dispara inconsistencia |
| Estado de la revisión | estado | Ver §7 |
| Fecha de corrección | fecha | |
| Comentarios | texto | Resumen; el detalle vive en la bitácora |

---

## 4. Reporte B — NS: Provisiones Proyectadas a Fin de Mes (Vista OVH)

**Objetivo:** anticipar las provisiones estimadas que se prevé registrar al cierre mensual.

> **Nota de implementación:** "NS" es el **identificador de la fuente de información**, no el nombre confirmado del sistema. El sistema exacto y su mecanismo de integración se confirmarán durante el desarrollo. Se mantiene el nombre "NS" hasta entonces. Ver [04-datos](04-datos.md).

### Campos

**Contexto:** Compañía · País · Centro de costo · Cuenta contable
**Detalle:** Proveedor · Orden de compra · Concepto
**Proyección:** Moneda · Valor estimado · Fecha esperada de registro
**Gestión:** Responsable · Estado · Nivel de riesgo · Comentarios

---

## 5. Reporte C — SAP TURBO: Provisiones Registradas (Vista TURBO)

**Objetivo:** auditoría diaria de provisiones bajo la estructura operativa y contable del alcance TURBO.

> **Los nombres de campo van en mayúsculas y en inglés tal como los define el negocio. No se traducen ni se renombran** — son los nombres del sistema fuente y los usuarios los reconocen así.

**Ubicación y entidad**
`COUNTRY` · `SOCIETY` · `ACCOUNT` · `ACCOUNT_NAME`

**Terceros y origen**
`Descripción de Coupa` · `THIRD` · `THIRD_NAME`

**Soporte contable**
`DOCUMENT_NUMBER` · `DOCUMENT_TYPE` · `FISCAL_YEAR` · `PERIOD` · `REFERENCE_DOCUMENT` · `PURCHASE_DOCUMENT`

**Importes**
`CURRENCY_DOCUMENT` · `AMOUNT_DOCUMENT` · `AMOUNT_ML1` · `AMOUNT_ML2`

**Auditoría y compensación**
`CREATED_BY` · `COMPENSATION_DOCUMENT` · `COMPENSATION_DATE` · `Comentarios`

> `AMOUNT_DOCUMENT` está en `CURRENCY_DOCUMENT`; `AMOUNT_ML1` y `AMOUNT_ML2` están en las monedas locales de la sociedad. **Las tres columnas nunca se suman entre sí.** Cada una lleva su moneda visible en el encabezado.

---

## 6. Detección de inconsistencias

El módulo debe permitir identificar:

| # | Tipo de inconsistencia | Cómo se detecta | Riesgo típico |
|---|---|---|---|
| 1 | **Provisión esperada no registrada** | Está en NS (B) y no aparece en SAP (A) para el periodo | Crítico |
| 2 | **Duplicado** | Misma compañía + proveedor + OC + valor + periodo, en más de un documento | Crítico |
| 3 | **Diferencia de valor** | Coincide la clave entre A y B pero el monto difiere más allá del umbral configurado | Alto |
| 4 | **Cuenta contable posiblemente incorrecta** | La cuenta no corresponde al tipo de gasto/proveedor esperado | Alto |
| 5 | **Centro de costo posiblemente incorrecto** | El centro de costo no corresponde a la unidad de negocio esperada | Medio |
| 6 | **Sin orden de compra** | El registro no tiene OC y su tipo de provisión la exige | Alto |
| 7 | **De otro periodo** | La fecha de registro o el periodo contable no corresponden al periodo activo | Medio |
| 8 | **Sin responsable** | No hay responsable de revisión asignado | Medio |

### Comparación SAP vs NS

Es la función central del módulo. Debe permitir ver, para el periodo activo:
- Lo que está en **ambos** (y si los valores coinciden).
- Lo que está **solo en NS** → provisión esperada que aún no se registra.
- Lo que está **solo en SAP** → registro no proyectado, a validar.

La clave de cruce y el umbral de tolerancia de diferencia de valor son **configurables** y se documentan; no se dejan hardcodeados en un componente.

### Niveles de riesgo

`crítico` · `alto` · `medio` · `bajo`

El nivel se propone automáticamente según el tipo de inconsistencia y el monto involucrado, pero **es editable por el Controller**. Un cambio manual de nivel queda registrado en la bitácora con su autor.

---

## 7. Estados

Ciclo de vida de una observación:

| Estado | Significado |
|---|---|
| **Sin revisar** | Detectada, nadie la ha mirado |
| **En análisis** | Alguien la está investigando |
| **Corrección solicitada** | Se pidió el ajuste al responsable |
| **En corrección** | El responsable está aplicando el ajuste |
| **Corregido** | El ajuste se aplicó |
| **Validado** | El Controller verificó la corrección. Estado terminal |
| **No aplica** | Se determinó que no era una inconsistencia real. Estado terminal, **requiere comentario justificando** |

Reglas:
- Todo cambio de estado se registra en la bitácora con autor y fecha/hora.
- Pasar a **No aplica** exige un comentario. Sin comentario, la acción se rechaza.
- Pasar a **Validado** solo lo puede hacer un `controller` o `admin`.
- Un registro en estado terminal se puede reabrir; la reapertura también queda en bitácora.

### Indicador visual de estado (flagging)

Marcador rápido por fila, accionable en un clic, con tres marcas:
- **Con inconsistencia**
- **En revisión**
- **Validado**

Es un atajo visual, no reemplaza al estado completo. Cambia el estado subyacente de forma consistente y queda en la bitácora.

---

## 8. Colaboración: panel lateral de comentarios y bitácora

Al pulsar el ícono de comentarios de cualquier fila se abre un **drawer lateral** que **no pierde el contexto de la tabla**: la tabla sigue visible y la fila seleccionada queda resaltada.

El drawer contiene:

**Encabezado** — identificación del registro (documento, proveedor, monto con moneda, periodo) y su estado actual.

**Bitácora** — línea de tiempo cronológica con:
- Autor de cada entrada
- Fecha y hora
- Observación
- Cambios de estado intercalados como eventos del timeline (quién cambió qué, de qué estado a cuál)

**Acciones** — desde el mismo panel:
- Agregar una nota
- **Etiquetar a otros responsables** (menciones)
- Cambiar el estado de la inconsistencia
- Asignar responsable
- Registrar fecha compromiso
- Marcar la corrección como completada
- Adjuntar evidencia

**Reglas del drawer:**
- Se cierra con `Esc` y con clic fuera.
- El foco entra al drawer al abrirse y vuelve al botón de origen al cerrarse.
- Se puede navegar a la fila anterior/siguiente sin cerrarlo.
- Nada se guarda a medias: si el usuario cierra con cambios sin guardar, se le advierte.

---

## 9. Vista de detalle

Al **seleccionar un registro** (clic en la fila, no en el ícono de comentarios) se abre el panel lateral con la información **completa**: todos los campos del reporte, comentarios, evidencias, responsable, estado e historial. Es el mismo drawer, con la pestaña de detalle activa.

---

## 10. Filtros, búsqueda y tabla

### Filtros disponibles
Periodo · Fecha · País · Compañía · Proveedor · Cuenta contable · Centro de costo · Responsable · Estado · Nivel de riesgo · Tipo de inconsistencia

Comportamiento:
- Los filtros activos se reflejan en la **URL** (ver [02-arquitectura](02-arquitectura.md)), de modo que una vista filtrada se pueda compartir.
- Se muestran como *chips* removibles individualmente, con un "limpiar todo".
- Se puede **guardar una vista** (combinación de filtros + orden + columnas) con un nombre, y volver a ella. Las vistas guardadas son por usuario.

### Tabla
- **Buscador** de texto libre sobre los campos textuales, con debounce.
- **Ordenamiento** por columna, ascendente/descendente.
- **Paginación** con tamaño de página seleccionable.
- **Selección de columnas** visibles.
- **Descarga en Excel o CSV** — exporta **lo que está filtrado**, no el dataset completo, e incluye una fila de metadatos con los filtros aplicados y la fecha de generación.
- Encabezado fijo al hacer scroll.
- Valores monetarios alineados a la derecha, con moneda visible y dígitos tabulares.

### Indicadores resumen (parte superior)
Tarjetas compactas sobre la tabla, que responden a los filtros activos:
- Total de registros
- Valor total (en la moneda de reporte, declarada explícitamente)
- Registros con inconsistencia
- Registros críticos
- Registros sin responsable
- Avance de corrección (%)

### Gráficos
**Sencillos y útiles. Se prohíben los gráficos decorativos.** Los que aportan:
- Barras: inconsistencias por tipo
- Barras: pendientes por responsable
- Barras apiladas: estado por compañía/país
- Línea: evolución de provisiones registradas vs proyectadas en el periodo

Todo gráfico es **clicable** y aplica el filtro correspondiente a la tabla.

---

## 11. Acciones sobre un registro

| Acción | Quién |
|---|---|
| Asignar responsable | admin, controller, analista_p2p |
| Agregar comentario | admin, controller, analista_p2p, contabilidad |
| Cambiar estado de la observación | admin, controller, analista_p2p |
| Registrar fecha compromiso | admin, controller, analista_p2p |
| Cambiar nivel de riesgo | admin, controller |
| Marcar corrección como completada | admin, controller |
| Marcar como Validado | admin, controller |
| Consultar historial | todos salvo `consulta` |

Las acciones no permitidas se muestran **deshabilitadas con explicación** (tooltip), no ocultas sin más — así el usuario entiende que la función existe y por qué no la tiene.

---

## 12. Criterios de aceptación

- [ ] Las dos pestañas globales funcionan y la de "No Provisionable" unifica SAP, NS y TURBO.
- [ ] Un Controller OVH ve solo A y B; un Controller TURBO ve solo C.
- [ ] Los tres reportes muestran todos los campos listados, con los nombres exactos definidos aquí.
- [ ] Los 8 tipos de inconsistencia se detectan y se pueden filtrar.
- [ ] La comparación SAP vs NS muestra los tres conjuntos (ambos, solo NS, solo SAP).
- [ ] Los 7 estados funcionan, con sus reglas (comentario obligatorio en "No aplica").
- [ ] El drawer abre sin perder contexto, muestra la bitácora completa y permite todas las acciones.
- [ ] Todos los filtros funcionan, se reflejan en la URL y se pueden guardar como vista.
- [ ] La exportación respeta los filtros activos e incluye metadatos.
- [ ] Ningún valor monetario aparece sin moneda; ningún total mezcla monedas sin declararlo.
- [ ] Cada tabla implementa los cuatro estados (carga, vacío, error, con datos).
- [ ] Todo es navegable por teclado y ningún semáforo depende solo del color.
