# Índice de documentación — P2P Control Center

> **Punto de entrada obligatorio.** Antes de trabajar en cualquier tarea de este proyecto, lee este índice y luego los documentos que apliquen a tu tarea. La documentación es la fuente de verdad: si el código contradice estos documentos, el código está mal, o el documento debe actualizarse explícitamente en la misma tarea.

**Última actualización:** 2026-08-13

---

## Mapa de la documentación

| # | Documento | Léelo cuando… |
|---|---|---|
| 01 | [Producto](01-producto.md) | Necesites entender el negocio, los usuarios, los 5 roles, los permisos o el vocabulario P2P |
| 02 | [Arquitectura](02-arquitectura.md) | Vayas a crear archivos, decidir dónde vive algo, o elegir un patrón de componente/estado |
| 03 | [Diseño](03-diseno.md) | Toques cualquier cosa visual: color, tipografía, espaciado, tablas, semáforos, accesibilidad |
| 04 | [Datos](04-datos.md) | Toques datos: contratos, mocks, Snowflake, Supabase, monedas, o la frontera mock↔real |
| 05 | [Módulo 1 — Reportería](05-modulo-1-reporteria.md) | Trabajes en reportes SAP/NS/TURBO, inconsistencias, bitácora o filtros |
| 06 | [Módulo 2 — KPIs](06-modulo-2-kpis.md) | Trabajes en indicadores, semáforos de KPI o el enlace a la app externa |
| 07 | [Módulo 3 — Checklist](07-modulo-3-checklist.md) | Trabajes en controles de precierre, evidencias o la confirmación final |
| 08 | [Alertas](08-alertas.md) | Trabajes en notificaciones, badges o el centro de alertas |
| 09 | [Infraestructura](09-infraestructura.md) | Toques build, entornos, variables de entorno, secretos o despliegue |
| 10 | [Flujo de Git](10-git-workflow.md) | Vayas a crear una rama, commitear, o abrir un PR |
| 11 | [Agentes y reglas](11-agentes-y-reglas.md) | Necesites saber qué subagente invocar y cuándo. **Contiene las reglas obligatorias** |
| 12 | [Decisiones (ADR)](12-decisiones.md) | Te preguntes "¿por qué está hecho así?" o vayas a tomar una decisión estructural |

---

## Ruta rápida por tipo de tarea

**Voy a construir una pantalla nueva**
→ 01 (qué hace) → 05/06/07 (reglas del módulo) → 03 (cómo se ve) → 02 (dónde va el archivo) → 04 (de dónde salen los datos)

**Voy a cambiar algo visual**
→ 03 → luego valida con los subagentes `frontend-validator` y `ui-consistency`

**Voy a tocar datos o conectar una fuente real**
→ 04 → luego valida con `data-layer-guardian`

**Voy a cerrar una tarea**
→ 11 (regla de documentación) → invoca `doc-keeper` → 10 (rama y PR)

---

## Las tres reglas que nunca se rompen

1. **Documentación por tarea.** Ninguna tarea se cierra sin actualizar la documentación afectada. Ver [11-agentes-y-reglas.md](11-agentes-y-reglas.md).
2. **Frontera de datos.** Los datos simulados viven aislados y la app nunca afirma tener una integración que no existe. Ver [04-datos.md](04-datos.md).
3. **GitHub Flow.** Nunca se commitea ni se hace push directo a `main`. Ver [10-git-workflow.md](10-git-workflow.md).
