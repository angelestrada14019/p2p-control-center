# 08 — Alertas y notificaciones

**Última actualización:** 2026-08-12
**Relacionado:** [05-módulo 1](05-modulo-1-reporteria.md) · [07-módulo 3](07-modulo-3-checklist.md) · [03-diseño](03-diseno.md)

---

## 1. Alcance

Las alertas aparecen **dentro de la aplicación**. En esta primera versión **no** se integran correos ni herramientas externas (Slack, Teams). El diseño del modelo de alertas debe permitir agregar esos canales después sin rehacerlo.

---

## 2. Catálogo de alertas

| # | Alerta | Disparador | Severidad | Dirigida a |
|---|---|---|---|---|
| 1 | **Actividad próxima a vencer** | Control del checklist a ≤2 días de su fecha límite, sin completar | Advertencia | Responsable del control |
| 2 | **Actividad vencida** | Control del checklist pasó su fecha límite sin completar | Crítica | Responsable + analista_p2p + admin |
| 3 | **Provisión proyectada no registrada** | Registro en NS sin contraparte en SAP, cerca del cierre | Crítica | Controller OVH |
| 4 | **Diferencia material entre SAP y NS** | Diferencia de valor por encima del umbral configurado | Crítica | Controller del ámbito |
| 5 | **Registro posiblemente duplicado** | Se detecta un duplicado | Crítica | Controller del ámbito |
| 6 | **Control crítico pendiente** | Control marcado como crítico sin resolver, con el cierre próximo | Crítica | analista_p2p + admin |
| 7 | **Corrección sin respuesta** | Observación en "Corrección solicitada" sin movimiento en N días | Advertencia | Responsable asignado + quien la solicitó |
| 8 | **Cambio de estado** | Cambió el estado de un registro donde el usuario está involucrado o etiquetado | Informativa | Involucrados |
| 9 | **Confirmación final del cierre** | Se ejecutó la confirmación final del periodo | Informativa | Contabilidad + admin + liderazgo |

Los umbrales (`≤2 días`, `N días sin respuesta`, umbral de diferencia material) son **configurables por `admin`** y se documentan; no se hardcodean.

---

## 3. Severidades

| Severidad | Significado | Tratamiento |
|---|---|---|
| **Crítica** | Bloquea o pone en riesgo el cierre | Destacada en el centro de alertas y contada en el resumen ejecutivo del home |
| **Advertencia** | Requiere atención pronto | Visible, no destacada |
| **Informativa** | Para enterarse | Agrupable, no interrumpe |

**Ninguna alerta interrumpe el trabajo con un modal.** Las alertas se consultan; no secuestran la pantalla. La única excepción son las confirmaciones de acciones destructivas, que no son alertas sino diálogos de confirmación.

---

## 4. Presentación

### Campana en el encabezado
- Badge con el conteo de **no leídas**, con el número exacto hasta 99 y luego "99+".
- El badge lleva `aria-label` describiendo el conteo.

### Centro de alertas (`/alertas`)
- Lista cronológica, agrupada por severidad y luego por fecha.
- Filtros: severidad, tipo, leídas/no leídas, ámbito (compañía/país).
- Cada alerta muestra: qué pasó, cuándo, a qué registro o control se refiere, y **un enlace directo al elemento afectado con su contexto ya filtrado**.
- Marcar como leída, individual o masivamente.

### Resumen ejecutivo del home
Muestra el **número de alertas críticas** del periodo activo, clicable hacia el centro de alertas ya filtrado por críticas.

---

## 5. Reglas de comportamiento

1. **Toda alerta es accionable.** Una alerta que no lleva a ningún sitio no se implementa. Siempre hay un destino: el registro, el control o la vista filtrada correspondiente.
2. **Alcance por rol y ámbito.** Un usuario solo ve alertas de las compañías y países que le corresponden, y de su rol. Un Controller TURBO no recibe alertas del alcance OVH.
3. **Sin duplicación.** La misma condición no genera una alerta nueva cada vez que se recalcula. Se actualiza la existente (con su fecha de última ocurrencia) hasta que se resuelva.
4. **Autorresolución.** Cuando la condición que originó la alerta deja de cumplirse, la alerta se marca como resuelta automáticamente y sale de las pendientes, pero **permanece en el historial**.
5. **El color no basta.** Cada severidad lleva ícono y texto además de color. Ver [03-diseño](03-diseno.md).
6. **Sin ruido.** Si un cambio masivo genera decenas de alertas del mismo tipo, se agrupan en una sola entrada con el conteo y el detalle desplegable.

---

## 6. Modelo de datos

Las alertas se persisten en Supabase (ver [04-datos](04-datos.md)). Campos mínimos:

`id` · `tipo` · `severidad` · `titulo` · `descripcion` · `entidadTipo` (registro | control | periodo) · `entidadId` · `rutaDestino` · `ambito` (país/compañía) · `destinatarios` (roles o usuarios) · `creadaEn` · `ultimaOcurrencia` · `resueltaEn` · `leidaPor[]`

El campo `rutaDestino` guarda la URL con filtros que materializa la regla 1.

---

## 7. Criterios de aceptación

- [ ] Los 9 tipos de alerta se generan según su disparador.
- [ ] Cada alerta enlaza a su elemento afectado con el contexto ya filtrado.
- [ ] Los umbrales son configurables, no hardcodeados.
- [ ] Un usuario solo ve las alertas de su rol y ámbito.
- [ ] Las alertas se autorresuelven y quedan en el historial.
- [ ] Ninguna alerta se presenta como modal interruptivo.
- [ ] Cada severidad se distingue por ícono y texto, no solo por color.
- [ ] El conteo de críticas del home lleva al centro de alertas ya filtrado.
