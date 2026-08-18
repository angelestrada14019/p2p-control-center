# 07 — Módulo 3: Checklist de precierre mensual

**Última actualización:** 2026-08-12
**Relacionado:** [01-producto](01-producto.md) · [05-módulo 1](05-modulo-1-reporteria.md) · [08-alertas](08-alertas.md)
**Subagente:** `m3-checklist`

---

## 1. Objetivo

Permitir al equipo P2P **ejecutar, documentar y confirmar** las validaciones requeridas antes del cierre, y entregar a Contabilidad una confirmación formal y auditable de que el proceso fue revisado.

Este módulo es donde el trabajo del Módulo 1 se convierte en una garantía formal.

---

## 2. Anatomía de un control

Cada actividad del checklist contiene:

| Campo | Descripción |
|---|---|
| **Nombre del control** | |
| **Descripción** | Qué se valida y por qué |
| **Reporte asociado** | A qué reporte del Módulo 1 corresponde, con sus filtros |
| **Compañía o país** | Ámbito de aplicación |
| **Responsable** | Quién debe ejecutarlo |
| **Fecha límite** | |
| **Estado** | Ver §4 |
| **Nivel de riesgo** | crítico / alto / medio / bajo |
| **Resultado de la validación** | Qué se encontró |
| **Número de excepciones identificadas** | |
| **Comentarios** | |
| **Evidencias o archivos adjuntos** | |
| **Fecha de ejecución** | |
| **Usuario que realizó la validación** | |
| **Usuario que aprobó** | |
| **Fecha de aprobación** | |

El control se marca como **obligatorio** o no, y como **crítico** o no. Estos dos atributos determinan si bloquea la confirmación final (§7).

---

## 3. Catálogo inicial de controles

| # | Control | Reporte asociado | Riesgo | Obligatorio |
|---|---|---|---|:--:|
| 1 | Revisión de provisiones registradas en SAP | Reporte A, periodo activo | Alto | ✅ |
| 2 | Comparación SAP vs NS | Comparación A↔B | Crítico | ✅ |
| 3 | Identificación de provisiones faltantes | B filtrado por "solo en NS" | Crítico | ✅ |
| 4 | Revisión de posibles duplicados | A filtrado por inconsistencia = duplicado | Crítico | ✅ |
| 5 | Validación de cuentas contables | A filtrado por cuenta incorrecta | Alto | ✅ |
| 6 | Validación de centros de costo | A filtrado por centro de costo incorrecto | Medio | ✅ |
| 7 | Revisión de registros sin orden de compra | A filtrado por sin OC | Alto | ✅ |
| 8 | Validación de registros de periodos anteriores | A filtrado por otro periodo | Medio | ✅ |
| 9 | Revisión de pendientes críticos | Módulo 1, riesgo = crítico, estado ≠ terminal | Crítico | ✅ |
| 10 | Confirmación de correcciones | Módulo 1, estado = Corregido | Alto | ✅ |
| 11 | Validación final del periodo | Consolidado | Crítico | ✅ |

Para el alcance TURBO, los controles equivalentes apuntan al Reporte C.

El catálogo es **configurable por `admin`**: se pueden agregar controles, cambiar responsables y fechas límite. No está hardcodeado en el componente.

### Botón "Abrir reporte"

Cada control tiene un botón que abre su reporte correspondiente **ya filtrado** según el control. No lleva al reporte en general: lleva exactamente al subconjunto que hay que revisar. El filtro viaja en la URL (ver [02-arquitectura](02-arquitectura.md)).

---

## 4. Estados

| Estado | Significado |
|---|---|
| **No iniciado** | Nadie ha empezado |
| **En proceso** | Se está ejecutando |
| **Con observaciones** | Ejecutado, se encontraron hallazgos |
| **Pendiente de corrección** | Los hallazgos requieren ajuste y están en curso |
| **Completado** | Ejecutado y sin pendientes. Requiere cumplir §5 |
| **Aprobado** | Un aprobador validó el control. Estado terminal |
| **No aplica** | No corresponde para este ámbito. **Requiere justificación escrita** |

Reglas:
- Todo cambio de estado queda en el historial con autor y fecha/hora.
- Solo `controller` y `admin` pueden **Aprobar**.
- **No aplica** exige justificación; sin ella la acción se rechaza.
- Quien ejecuta y quien aprueba deben ser personas distintas cuando el control es crítico (segregación de funciones).

---

## 5. REGLA CENTRAL: no se completa marcando una casilla

> **Está prohibido permitir que un control pase a "Completado" con un simple clic en un checkbox.** Esta regla existe porque un checklist que se puede marcar sin trabajo real no garantiza nada, y el objetivo de este módulo es precisamente dar una garantía.

Antes de permitir el estado **Completado**, el sistema valida que:

1. **Se abrió o revisó el reporte correspondiente.** Se registra el evento de apertura del reporte asociado (usuario + fecha/hora). Sin ese registro, no se habilita completar.
2. **Se registró el resultado de la validación.** Campo obligatorio, no vacío.
3. **Las excepciones tienen responsable y estado.** Si el número de excepciones es mayor que cero, cada una debe tener responsable asignado y estado. No se permite "3 excepciones" sin nada más.
4. **Hay comentario cuando existen observaciones.** Si el resultado indica hallazgos, el comentario es obligatorio.
5. **Se adjuntó evidencia cuando el control la requiere.** Los controles marcados como `requiereEvidencia` no se completan sin al menos un archivo adjunto.

Si falta alguna condición, el botón de completar está **deshabilitado y explica exactamente qué falta** — no se deshabilita en silencio. Se muestra una lista de requisitos con los cumplidos marcados.

---

## 6. Vista general del checklist

Debe mostrar:

- **Porcentaje total de avance** (controles completados/aprobados sobre obligatorios)
- **Avance por compañía o país**
- **Actividades vencidas** — pasaron su fecha límite sin completarse
- **Controles con observaciones**
- **Controles críticos pendientes**
- **Responsables con actividades abiertas**

Todo elemento del resumen es clicable y filtra la lista de controles.

---

## 7. Confirmación final del periodo

Al finalizar todos los controles obligatorios se habilita la **confirmación final**.

### Resumen previo

Antes de confirmar se muestra un resumen con:
- Controles completados
- Controles no aplicables (con sus justificaciones)
- Excepciones abiertas
- Riesgos aceptados
- Comentarios finales
- Evidencias
- Usuario que confirma
- Fecha y hora

### Bloqueos

> **Si existen controles críticos pendientes, la confirmación final NO se permite.** Se muestra claramente cuáles son los bloqueos, con enlace directo a cada uno.

Condiciones de bloqueo:
- Cualquier control **crítico** en estado distinto de Completado, Aprobado o No aplica.
- Cualquier control **obligatorio** sin resolver.
- Excepciones de riesgo crítico sin responsable asignado.

Los bloqueos se listan de forma explícita y accionable: nombre del control, por qué bloquea, quién es el responsable, y un botón para ir a él.

### Riesgos aceptados

Si el equipo decide cerrar con excepciones abiertas de riesgo no crítico, debe **declararlas como riesgos aceptados** con justificación escrita. Quedan en el registro de la confirmación. No se pueden ocultar.

### Registro auditable

La confirmación final genera un **registro inmutable** que deja constancia de que P2P realizó las validaciones del periodo y entregó el proceso a Contabilidad. Contiene:
- Periodo, compañía/país
- Snapshot del estado de todos los controles al momento de confirmar
- Excepciones abiertas y riesgos aceptados
- Evidencias referenciadas
- Usuario que confirma, con su rol
- Fecha y hora
- Identificador único de la confirmación

Este registro **no se edita ni se borra**. Si se necesita rectificar, se emite una nueva confirmación que referencia a la anterior y explica el motivo. Ambas quedan en el historial.

Solo `admin` ejecuta la confirmación final (ver [01-producto §5](01-producto.md)).

---

## 8. Criterios de aceptación

- [ ] Los 11 controles del catálogo inicial existen y son configurables por `admin`.
- [ ] Cada control tiene un botón que abre su reporte **previamente filtrado**.
- [ ] Los 7 estados funcionan con sus reglas (justificación obligatoria en "No aplica").
- [ ] **Ningún control se puede completar sin cumplir las 5 condiciones de §5.**
- [ ] El botón deshabilitado explica exactamente qué falta.
- [ ] Se registra la apertura del reporte asociado como evidencia de revisión.
- [ ] La vista general muestra los 6 elementos de §6, todos clicables.
- [ ] La confirmación final está bloqueada mientras haya controles críticos pendientes, y los bloqueos se listan de forma accionable.
- [ ] La confirmación genera un registro inmutable con todo el contenido de §7.
- [ ] Solo `admin` puede ejecutar la confirmación final.
- [ ] Todo cambio de estado queda en el historial con autor y fecha/hora.
