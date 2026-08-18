# CLAUDE.md — P2P Control Center

Instrucciones permanentes para trabajar en este repositorio. Léelas completas antes de tu primera acción en cada sesión.

---

## Qué es este proyecto

Aplicación web corporativa interna de Rappi para el proceso **P2P (Purchase-to-Pay)** del equipo de Finanzas/Contabilidad. Centraliza el seguimiento diario del proceso, permite detectar y corregir registros contables **antes** del cierre mensual, y entrega a Contabilidad una confirmación formal y auditable de que las validaciones se ejecutaron.

**Tres módulos:**
1. **Reportería y Control Preventivo de Provisiones** — reportes SAP, NS y SAP TURBO con detección de inconsistencias
2. **KPIs P2P** — tarjeta que **redirige a una aplicación externa**
3. **Checklist de precierre mensual** — controles, evidencias y confirmación final

**Stack:** React + Vite + TypeScript + Tailwind CSS. **UI en español.** Desktop y tablet.

**Estado:** fase de fundación. Aún no hay código de aplicación.

---

## 📖 Lee la documentación primero

> **Punto de entrada obligatorio: [`.claude/docs/00-indice.md`](.claude/docs/00-indice.md)**

La documentación de `.claude/docs/` es **la fuente de verdad** de este proyecto. Si el código contradice un documento, el código está mal — o el documento debe actualizarse explícitamente en la misma tarea.

| Documento | Para qué |
|---|---|
| [00-indice](.claude/docs/00-indice.md) | Mapa. Empieza aquí siempre |
| [01-producto](.claude/docs/01-producto.md) | Negocio, usuarios, roles, permisos, glosario |
| [02-arquitectura](.claude/docs/02-arquitectura.md) | Estructura, patrones, estado, convenciones |
| [03-diseño](.claude/docs/03-diseno.md) | Tokens, tipografía, tablas, semáforos, accesibilidad |
| [04-datos](.claude/docs/04-datos.md) | Contratos, mocks, Snowflake, Supabase, moneda |
| [05-módulo 1](.claude/docs/05-modulo-1-reporteria.md) | Reportería |
| [06-módulo 2](.claude/docs/06-modulo-2-kpis.md) | KPIs |
| [07-módulo 3](.claude/docs/07-modulo-3-checklist.md) | Checklist |
| [08-alertas](.claude/docs/08-alertas.md) | Notificaciones |
| [09-infraestructura](.claude/docs/09-infraestructura.md) | Entornos, variables, secretos |
| [10-git-workflow](.claude/docs/10-git-workflow.md) | Ramas, commits, PRs |
| [11-agentes-y-reglas](.claude/docs/11-agentes-y-reglas.md) | Subagentes y reglas obligatorias |
| [12-decisiones](.claude/docs/12-decisiones.md) | ADR — por qué las cosas son como son |

**No empieces a construir sin haber leído el documento del módulo correspondiente.**

---

## ⚖️ Las tres reglas obligatorias

### 1. Documentación por tarea

**Ninguna tarea se cierra sin actualizar la documentación afectada.**

Al terminar cualquier tarea que cambie comportamiento, estructura, datos o diseño, **invoca el subagente `doc-keeper`**. Actualiza los documentos afectados, registra la decisión en `12-decisiones.md` si la hubo, y añade la entrada al `CHANGELOG.md`.

*Por qué:* una documentación desactualizada induce a error con la autoridad de una fuente oficial. Y aquí la documentación **es** la fuente de verdad.

### 2. Frontera de datos

**Todo dato es simulado. La aplicación nunca afirma tener una integración que no existe.**

- Los datos simulados viven **solo** en `src/data/mock/`. Cero arrays de ejemplo en componentes.
- Cada punto de sustitución se marca con `// @mock-boundary: <origen real previsto>`.
- Badge visible **"Datos simulados"** mientras `VITE_DATA_SOURCE=mock`.
- **Nunca** afirmes —en la UI, en un comentario o en una respuesta— que hay conexión con SAP, NS, TURBO, Snowflake o Supabase. **No existe ninguna integración real.**
- **Toda cifra monetaria lleva su moneda.** Nunca sumes monedas distintas sin conversión explícita o sin declarar la moneda de reporte.
- Para conectar datos reales: se implementa el adaptador contra el mismo contrato. **Si hay que tocar un componente de UI para conectar datos, la capa estaba mal diseñada.**

Regla completa en [04-datos §5](.claude/docs/04-datos.md). Al tocar `src/data/`, invoca `data-layer-guardian`.

### 3. GitHub Flow — `main` es intocable

**Nunca commitees ni hagas push directamente a `main`.**

```bash
git checkout main && git pull origin main
git checkout -b feat/descripcion-concreta
```

- Ramas: `feat/`, `fix/`, `docs/`, `refactor/`, `chore/`, `test/`
- Commits convencionales: `feat(m1): agregar drawer de bitácora`
- Alcances: `m1`, `m2`, `m3`, `home`, `datos`, `diseño`, `auth`, `alertas`, `docs`, `infra`
- Integración **solo por Pull Request** con revisión y squash merge
- Nunca `--no-verify`, nunca `--force` sobre ramas compartidas
- **Nunca commitees** `.env`, credenciales, `node_modules/` ni `.claude/settings.local.json`

> El remoto tiene **IP allow list**: sin VPN corporativa, cualquier operación contra GitHub falla con `403`. No es un problema de credenciales.

Detalle en [10-git-workflow](.claude/docs/10-git-workflow.md).

---

## 🤖 Subagentes

Nueve en `.claude/agents/`.

**Por módulo** — expertos de negocio, invócalos **antes** de construir:
- `m1-reporteria` · `m2-kpis` · `m3-checklist`

**Calidad frontend** — después de cualquier cambio de UI:
- `frontend-validator` — accesibilidad, contraste, foco, estados, responsive, anti-"AI slop"
- `ui-consistency` — tokens, semáforos coherentes entre módulos, no duplicar componentes

**Guardianes:**
- `doc-keeper` — actualiza documentación. **Obligatorio al cerrar toda tarea**
- `spec-guardian` — verifica cumplimiento de los lineamientos. Reporta, no corrige
- `data-layer-guardian` — vigila la frontera mock/Snowflake/Supabase

**Release:**
- `branch-pr-agent` — rama, commits y PR. **Nunca hace push a `main`**

### Pipeline de calidad al cerrar una tarea

```
1. spec-guardian                              ¿cumple lo documentado?
2. frontend-validator + ui-consistency        (si tocó UI)
3. data-layer-guardian                        (si tocó datos)
4. doc-keeper                                 OBLIGATORIO
5. branch-pr-agent                            rama, commits, PR
```

Los pasos 2 y 3 son condicionales; el 1, el 4 y el 5 no.

---

## 🎨 Skills

| Skill | Cuándo |
|---|---|
| **`frontend-design`** | **Antes** de construir cualquier pantalla nueva. Es la que evita la estética genérica de IA |
| **`ui-ux-pro-max`** | Decisiones de estilo, paletas, tipografía, patrones UX. Ejecútala siempre con `--output-dir` en la raíz del proyecto y **sin `--force`**, para no pisar decisiones ya tomadas |
| **`web-design-guidelines`** | Auditar UI ya construida (la usa `frontend-validator`) |
| **`vercel-react-best-practices`** | Al escribir o refactorizar React, sobre todo tablas grandes y filtros |
| **`supabase`** / **`supabase-postgres-best-practices`** | Antes de cualquier SQL, migración, RLS o índice |

---

## 🚫 Nunca hagas esto

- Afirmar que existe una integración real con SAP, NS, TURBO, Snowflake o Supabase
- Poner datos de ejemplo fuera de `src/data/mock/`
- Mostrar una cifra monetaria sin su moneda, o sumar monedas distintas sin declararlo
- Commitear o hacer push a `main`
- Commitear un secreto, una credencial o `.claude/settings.local.json`
- Poner un secreto en una variable `VITE_` (Vite las inyecta en el bundle: quedan públicas)
- Usar el naranja Rappi como acción primaria, estado, enlace o tab activo — no cumple contraste AA y compite con los semáforos ([ADR-05](.claude/docs/12-decisiones.md))
- Codificar un semáforo **solo** con color: siempre ícono o texto además ([ADR-06](.claude/docs/12-decisiones.md))
- Permitir completar un control del checklist con un simple clic en una casilla ([07-módulo 3 §5](.claude/docs/07-modulo-3-checklist.md))
- Cerrar una tarea sin actualizar la documentación
- Inventar métricas de relleno para que un dashboard "se vea completo"
- Copiar datos productivos reales a los mocks

---

## ✍️ Convenciones

- **UI, textos y documentación: español.** Identificadores de código: inglés, salvo términos de dominio (`provision`, `periodo`, `centroDeCosto`).
- **Los nombres de campo de los reportes no se traducen ni se renombran** (`DOCUMENT_NUMBER`, `AMOUNT_ML1`). Son los del sistema fuente y los usuarios los reconocen así.
- Componentes `PascalCase.tsx`, hooks `use-kebab-case.ts`, páginas `nombre.page.tsx`.
- Filtros y paginación **en la URL**, para que una vista filtrada se pueda compartir.
- Toda vista que carga datos implementa **cuatro estados**: carga, vacío, error, con datos.

---

## ⚠️ Decisiones abiertas

Hay preguntas sin resolver que afectan al diseño y a la arquitectura. **Antes de dar por cerrado un tema, revisa si está en esta lista:**

- **No se encontró ningún design system oficial de Rappi.** Todos los tokens de `03-diseno.md` son decisión de este equipo, no norma corporativa ([ADR-04](.claude/docs/12-decisiones.md))
- **La acción primaria azul en vez de naranja está propuesta, no avalada** por Product/Brand ([ADR-05](.claude/docs/12-decisiones.md))
- **El acceso a Snowflake requiere un intermediario servidor** que aún no existe ([ADR-07](.claude/docs/12-decisiones.md))
- **"NS" es el nombre de la fuente, no del sistema.** El sistema real está por confirmar
- Preguntas abiertas completas en [03-diseño §13](.claude/docs/03-diseno.md) y [04-datos §7](.claude/docs/04-datos.md)

Si una tarea depende de una de estas, **dilo antes de asumir una respuesta**.
