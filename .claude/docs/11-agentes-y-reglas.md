# 11 — Subagentes y reglas obligatorias

**Última actualización:** 2026-08-12
**Relacionado:** [00-índice](00-indice.md) · [04-datos](04-datos.md) · [10-git-workflow](10-git-workflow.md)

---

## 1. Reglas obligatorias

Tres reglas que no se rompen. Aplican a cualquier persona o agente que trabaje en este repositorio.

### Regla 1 — Documentación por tarea

> **Ninguna tarea se cierra sin actualizar la documentación afectada.**

Al terminar cualquier tarea que cambie comportamiento, estructura, datos o diseño, se **invoca el subagente `doc-keeper`**, que:
1. Revisa qué cambió realmente (diff, no suposiciones).
2. Actualiza los documentos de `.claude/docs/` afectados.
3. Registra la decisión en [12-decisiones.md](12-decisiones.md) si se tomó alguna.
4. Añade la entrada correspondiente al `CHANGELOG.md`.
5. Actualiza la fecha de "Última actualización" de cada documento tocado.

Una tarea cuyo único efecto es documental (corregir una errata, aclarar un párrafo) no necesita `doc-keeper`: ya *es* documentación.

**Por qué:** una documentación desactualizada es peor que no tener documentación, porque induce a error con la autoridad de una fuente oficial. Y este proyecto declara explícitamente que la documentación es la fuente de verdad.

### Regla 2 — Frontera de datos

> **Los datos simulados viven aislados y la aplicación nunca afirma tener una integración que no existe.**

Regla completa en [04-datos §5](04-datos.md). Cualquier tarea que toque `src/data/` o conecte una fuente ejecuta el subagente `data-layer-guardian`.

### Regla 3 — GitHub Flow

> **Nunca se commitea ni se hace push directamente a `main`.**

Regla completa en [10-git-workflow](10-git-workflow.md). Toda integración pasa por rama y Pull Request.

---

## 2. Catálogo de subagentes

Nueve subagentes en `.claude/agents/`. Todos leen primero [00-indice.md](00-indice.md) y los documentos de su dominio.

### Por módulo — expertos de negocio

| Subagente | Dominio | Cuándo invocarlo |
|---|---|---|
| **`m1-reporteria`** | Módulo 1: reportes A/B/C, inconsistencias, estados, bitácora, filtros | Al construir o modificar cualquier parte del Módulo 1, o al resolver una duda de sus reglas de negocio |
| **`m2-kpis`** | Módulo 2: definición y cálculo de los 18 KPIs, semáforos, enlace externo | Al trabajar con indicadores o con la tarjeta de redirección |
| **`m3-checklist`** | Módulo 3: controles, reglas de completitud, confirmación final y bloqueos | Al construir o modificar el checklist |

### Calidad frontend

| Subagente | Qué verifica | Cuándo |
|---|---|---|
| **`frontend-validator`** | Accesibilidad, contraste, foco, estados obligatorios, responsive, y que no parezca plantilla genérica de IA. Aplica las skills `frontend-design` y `web-design-guidelines` | Después de cualquier cambio de UI |
| **`ui-consistency`** | Uso correcto de tokens, semáforos coherentes entre módulos, reutilización de componentes en vez de duplicación | Después de cualquier cambio de UI |

### Guardianes

| Subagente | Qué hace | Cuándo |
|---|---|---|
| **`doc-keeper`** | Actualiza la documentación afectada, el ADR y el CHANGELOG | **Al cerrar toda tarea** (Regla 1) |
| **`spec-guardian`** | Verifica que lo implementado cumple los lineamientos de `.claude/docs`. **Reporta desviaciones, no las corrige** | Antes de dar una tarea por terminada |
| **`data-layer-guardian`** | Vigila la frontera mock/Snowflake/Supabase, que la UI no importe adaptadores, y que no se afirme integración inexistente | Al tocar `src/data/` o conectar una fuente |

### Release

| Subagente | Qué hace | Cuándo |
|---|---|---|
| **`branch-pr-agent`** | Prepara rama, commits convencionales y PR con descripción y checklist. Verifica que no haya secretos en el diff. **Nunca hace push a `main`** | Al publicar el trabajo |

---

## 3. Pipeline de calidad

Orden al cerrar una tarea de desarrollo:

```
1. spec-guardian          ¿cumple lo documentado?
2. frontend-validator  ─┐  (si tocó UI, en paralelo)
   ui-consistency      ─┘
3. data-layer-guardian    (si tocó datos)
4. doc-keeper             actualiza documentación  ← OBLIGATORIO
5. branch-pr-agent        rama, commits y PR
```

Los pasos 2 y 3 son condicionales; **el 1, el 4 y el 5 no**.

Si `spec-guardian` reporta una desviación, se corrige y se vuelve a ejecutar. No se avanza a `doc-keeper` con desviaciones abiertas, salvo que la desviación sea deliberada — en cuyo caso se documenta como decisión en [12-decisiones.md](12-decisiones.md).

---

## 4. Cómo escribir un subagente nuevo

Si hace falta uno más, sigue el patrón de los existentes:

```markdown
---
name: nombre-en-kebab-case
description: Cuándo debe usarse este subagente. Sé específico — de esta línea depende que se invoque en el momento correcto.
tools: Read, Grep, Glob        # solo lo que necesita
model: inherit
---

# Rol

<Qué es este agente y qué NO es>

## Contexto obligatorio
Lee primero `.claude/docs/00-indice.md` y luego <documentos de su dominio>.

## Qué verificas / haces
<Lista concreta y accionable>

## Formato de salida
<Estructura exacta esperada>

## Límites
<Lo que este agente no debe hacer>
```

Reglas para subagentes:
- **Permisos mínimos.** Un validador solo necesita leer; no le des `Edit` ni `Bash`.
- **Un propósito por agente.** Si describe dos trabajos, son dos agentes.
- **Salida accionable.** Un reporte que dice "revisar el diseño" no sirve; debe decir qué archivo, qué línea y qué regla se incumple.
- Se registra en este documento **y** en `CLAUDE.md`.
