# 01 — Producto

**Última actualización:** 2026-08-13
**Relacionado:** [02-arquitectura](02-arquitectura.md) · [05-módulo 1](05-modulo-1-reporteria.md) · [06-módulo 2](06-modulo-2-kpis.md) · [07-módulo 3](07-modulo-3-checklist.md)

---

## 1. El problema

Hoy no existe una herramienta centralizada para consultar, analizar y hacer seguimiento diario al proceso P2P (Purchase-to-Pay). La información vive dispersa entre SAP, la fuente NS, SAP TURBO, reportes sueltos y archivos manuales. Eso produce cinco fallas concretas:

1. Los registros incorrectos se detectan **después** del cierre contable, cuando corregirlos es caro.
2. No se pueden comparar de forma sistemática las provisiones **registradas** durante el mes contra las **proyectadas** para el cierre.
3. No hay seguimiento a los KPIs del proceso.
4. Los pendientes, inconsistencias y riesgos se identifican tarde.
5. El checklist de precierre se ejecuta y documenta de manera informal, sin trazabilidad ni evidencia.

Y sobre todo: **Contabilidad no recibe una confirmación formal y auditable** de que P2P revisó el proceso y lo entrega listo para el cierre.

## 2. Qué construimos

Una aplicación web corporativa que se usa **todos los días** y se convierte en la fuente única de seguimiento operativo del proceso P2P. Debe:

1. Centralizar la información relevante del proceso.
2. Facilitar el análisis diario de los Controllers.
3. Permitir detectar y corregir registros **antes** del cierre.
4. Monitorear los KPIs mínimos del proceso.
5. Gestionar el checklist de precierre mensual.
6. Registrar responsables, comentarios, evidencias y confirmaciones.
7. Garantizar a Contabilidad que las validaciones de P2P se completaron.
8. Mantener trazabilidad e historial de todas las acciones.

**Criterio de diseño rector:** es una herramienta de uso diario y prolongado, no un dashboard de presentación. Prioriza densidad de información legible, velocidad de análisis y claridad de estado sobre el impacto visual.

## 3. Módulos

| # | Módulo | Qué resuelve | Documento |
|---|---|---|---|
| 1 | **Reportería y Control Preventivo de Provisiones** | Auditar y corregir registros antes del cierre | [05](05-modulo-1-reporteria.md) |
| 2 | **KPIs P2P** | Monitorear el desempeño del proceso. **Redirige a una app externa** | [06](06-modulo-2-kpis.md) |
| 3 | **Checklist de precierre** | Ejecutar, documentar y confirmar las validaciones del cierre | [07](07-modulo-3-checklist.md) |

## 4. Usuarios

| Usuario | Qué necesita |
|---|---|
| **Controllers** | Analizar registros, encontrar inconsistencias y gestionar correcciones antes del cierre. Se subdividen en **Controller OVH** (reportes A y B) y **Controller TURBO** (reporte C) |
| **Equipo P2P** | Monitorear el desempeño diario, revisar pendientes y completar las validaciones del precierre |
| **Contabilidad** | Consultar el avance del cierre y recibir la confirmación de que P2P ejecutó todos los controles |
| **Líderes y gerencia** | Ver rápido el estado general, KPIs, riesgos y bloqueos |

## 5. Roles y permisos

Cinco roles. La columna "Identidad" es simulada en el MVP (ver [04-datos](04-datos.md)); **los permisos se implementan de verdad**.

| Rol | Código | Descripción |
|---|---|---|
| Administrador | `admin` | Control total, incluida la configuración y la gestión de usuarios |
| Controller | `controller` | Analiza y gestiona correcciones sobre los reportes. Tiene sub-perfil `OVH` o `TURBO` |
| Analista P2P | `analista_p2p` | Ejecuta el checklist de precierre y da seguimiento a pendientes |
| Contabilidad | `contabilidad` | Consulta el avance y recibe la confirmación final. No corrige |
| Consulta / Liderazgo | `consulta` | Solo lectura sobre resúmenes y KPIs |

### Matriz de permisos

| Acción | admin | controller | analista_p2p | contabilidad | consulta |
|---|:--:|:--:|:--:|:--:|:--:|
| Ver home y resumen ejecutivo | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ver Módulo 1 (reportes) | ✅ | ✅ | ✅ | ✅ | ✅ (sin detalle sensible) |
| Marcar estado de un registro (flagging) | ✅ | ✅ | ✅ | ❌ | ❌ |
| Comentar en la bitácora | ✅ | ✅ | ✅ | ✅ | ❌ |
| Asignar responsable | ✅ | ✅ | ✅ | ❌ | ❌ |
| Cambiar estado de una observación | ✅ | ✅ | ✅ | ❌ | ❌ |
| Marcar un registro como Validado (estado terminal) | ✅ | ✅ | ❌ | ❌ | ❌ |
| Cambiar el nivel de riesgo de un registro | ✅ | ✅ | ❌ | ❌ | ❌ |
| Marcar corrección como completada | ✅ | ✅ | ❌ | ❌ | ❌ |
| Descargar Excel/CSV | ✅ | ✅ | ✅ | ✅ | ❌ |
| Guardar vistas/filtros | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ver Módulo 3 (checklist) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ejecutar un control del checklist | ✅ | ✅ | ✅ | ❌ | ❌ |
| Adjuntar evidencia | ✅ | ✅ | ✅ | ❌ | ❌ |
| Aprobar un control | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Ejecutar la confirmación final del periodo** | ✅ | ❌ | ❌ | ❌ | ❌ |
| Ver historial de auditoría | ✅ | ✅ | ✅ | ✅ | ❌ |
| Configurar metas de KPI y catálogo de controles | ✅ | ❌ | ❌ | ❌ | ❌ |

> **Nota sobre la confirmación final:** solo `admin` la ejecuta. `analista_p2p` y `controller` la preparan (completan controles); `contabilidad` la recibe y la consulta.
>
> **Nota sobre "Marcar como Validado" y "Cambiar nivel de riesgo":** son acciones más restrictivas que el resto de la gestión de una observación en el Módulo 1 — un `analista_p2p` puede mover una observación entre la mayoría de los estados, pero no marcarla como Validado ni tocar su nivel de riesgo. En código son las acciones `validar-registro` y `cambiar-nivel-riesgo` de `auth/permisos.ts`.

### Vista por sub-perfil de Controller

- **Controller OVH** → ve únicamente los reportes **A** (SAP – Provisiones Registradas) y **B** (NS – Provisiones Proyectadas).
- **Controller TURBO** → ve únicamente el reporte **C** (SAP TURBO).
- `admin` ve ambas vistas.

## 6. Alcance del MVP

**Dentro:**
- Home / centro de control con resumen ejecutivo, selectores y alertas.
- Módulo 1 completo con datos simulados.
- Módulo 2 como tarjeta que redirige a la app externa de KPIs.
- Módulo 3 completo con datos simulados, incluida la confirmación final.
- Alertas in-app.
- Permisos por rol con identidad simulada.

**Fuera:**
- Integración real con SAP, NS, TURBO, Snowflake o Supabase (ver [04-datos](04-datos.md)).
- Autenticación real (SSO corporativo).
- Envío de correos o integración con herramientas externas de notificación.
- Aplicación móvil.
- Construcción del dashboard de KPIs (vive en otra app).

## 7. Home — centro de control

La página principal **no se sobrecarga**: muestra primero el resumen y permite profundizar mediante clics.

**Encabezado:**
- Nombre de la aplicación
- Selector de compañía / país / entidad
- Selector de periodo contable
- Fecha y hora de la última actualización de datos
- Identificación del usuario (y selector de rol en el MVP)
- Campana de notificaciones / alertas
- Indicador general del estado del proceso

**Resumen ejecutivo:**
- Estado general del periodo
- Número de alertas críticas
- Número de registros pendientes de corrección
- Avance del checklist (%)
- Fecha límite del cierre
- Principales riesgos
- Acciones pendientes **del usuario actual**

**Tres tarjetas grandes e independientes** — una por módulo. Al hacer clic, el módulo se abre y despliega su información progresivamente. Siempre debe ser fácil volver al inicio o cambiar de módulo.

## 8. Glosario

| Término | Significado |
|---|---|
| **P2P** | Purchase-to-Pay. El proceso desde la compra hasta el pago al proveedor |
| **Provisión** | Registro contable que reconoce un gasto o pasivo estimado antes de recibir/pagar la factura |
| **Provisión registrada** | La que ya está contabilizada en SAP durante el periodo |
| **Provisión proyectada** | La que se estima registrar al cierre del mes, según la fuente NS |
| **Precierre** | Fase previa al cierre contable donde se ejecutan las validaciones de control |
| **Cierre** | Cierre contable mensual del periodo |
| **OVH** | Overhead. Alcance operativo/contable de gastos generales. Reportes A y B |
| **TURBO** | Alcance operativo/contable del negocio Turbo. Reporte C |
| **NS** | Identificador de la fuente de las provisiones proyectadas. **El sistema exacto y su mecanismo de integración están por confirmar** (ver [04-datos](04-datos.md)) |
| **Coupa** | Plataforma de compras; origen de la descripción en el reporte TURBO |
| **OC / Orden de compra** | Purchase Order. Documento que respalda la compra |
| **Centro de costo** | Unidad organizacional a la que se imputa el gasto |
| **Cuenta contable** | Cuenta del plan contable donde se registra el movimiento |
| **Compensación** | Documento y fecha en que una partida se cruza/liquida contra otra |
| **Moneda local (ML1/ML2)** | Monedas de reporte de la sociedad, además de la moneda del documento |
| **Aging** | Antigüedad de un pendiente, medida en días desde su detección |
| **Semáforo** | Indicador visual de estado: verde / ámbar / rojo / gris |
| **Bitácora** | Historial cronológico de comentarios y cambios de estado sobre un registro |
| **Excepción** | Hallazgo identificado al ejecutar un control del checklist |

## 9. Principios de producto

1. **Preventivo, no forense.** El valor está en encontrar el error antes del cierre, no en explicarlo después.
2. **Todo tiene dueño.** Ningún pendiente existe sin responsable asignado.
3. **Todo deja rastro.** Cada cambio de estado, comentario y confirmación queda en el historial con autor y fecha/hora.
4. **La confirmación se gana.** No se puede marcar un control como completo sin haberlo ejecutado realmente (ver [07](07-modulo-3-checklist.md)).
5. **Honestidad sobre los datos.** La aplicación nunca presenta como real un dato o una integración que no lo es (ver [04-datos](04-datos.md)).
