# P2P Control Center

Aplicación web corporativa interna para el seguimiento diario del proceso **P2P (Purchase-to-Pay)** del equipo de Finanzas y Contabilidad.

Centraliza la información del proceso, permite detectar y corregir registros contables **antes** del cierre mensual, monitorea los KPIs del proceso y entrega a Contabilidad una confirmación formal y auditable de que las validaciones de P2P se ejecutaron.

> ⚠️ **Prototipo con datos simulados.** No existe ninguna integración real con SAP, NS, Snowflake ni Supabase. Todos los datos que muestra la aplicación son representativos.

---

## Módulos

| # | Módulo | Qué resuelve |
|---|---|---|
| 1 | **Reportería y Control Preventivo de Provisiones** | Auditar y corregir registros antes del cierre. Reportes SAP (OVH), NS (proyectadas) y SAP TURBO, con detección de inconsistencias, bitácora y gestión de correcciones |
| 2 | **KPIs P2P** | Monitoreo del desempeño del proceso. Redirige a una aplicación externa |
| 3 | **Checklist de precierre mensual** | Ejecutar, documentar y confirmar las validaciones del cierre, con evidencias y confirmación final auditable |

## Usuarios

Controllers (OVH y TURBO), equipo P2P, Contabilidad, y liderazgo. Cinco roles con permisos diferenciados.

---

## Stack

React · Vite · TypeScript · Tailwind CSS · TanStack Query · TanStack Table · shadcn/ui

Interfaz en español. Diseñada para desktop y tablet.

---

## Estado del proyecto

**Fase de fundación.** La documentación, las reglas de trabajo y los subagentes están establecidos. El código de la aplicación aún no se ha iniciado.

---

## Documentación

Toda la documentación del proyecto vive en [`.claude/docs/`](.claude/docs/) y es **la fuente de verdad**.

**Empieza por [`.claude/docs/00-indice.md`](.claude/docs/00-indice.md)** — es el mapa que indica qué documento leer para cada tarea.

- [Producto](.claude/docs/01-producto.md) — negocio, usuarios, roles y permisos
- [Arquitectura](.claude/docs/02-arquitectura.md) — estructura, patrones y convenciones
- [Diseño](.claude/docs/03-diseno.md) — tokens, tipografía, semáforos y accesibilidad
- [Datos](.claude/docs/04-datos.md) — contratos, mocks y las fuentes previstas
- [Decisiones (ADR)](.claude/docs/12-decisiones.md) — por qué las cosas son como son

---

## Cómo contribuir

Este repositorio sigue **GitHub Flow estricto**: `main` está protegida y todo cambio entra por rama y Pull Request.

```bash
git checkout main && git pull origin main
git checkout -b feat/descripcion-concreta
```

Antes de tu primer cambio, lee [`.claude/docs/10-git-workflow.md`](.claude/docs/10-git-workflow.md) y [`CLAUDE.md`](CLAUDE.md).

> **El acceso al repositorio remoto requiere VPN corporativa** (IP allow list). Un `403` al hacer `push` o `fetch` casi siempre significa que la VPN está desconectada, no que las credenciales estén mal.

---

## Trabajo asistido por IA

El repositorio está configurado para trabajar con Claude Code. [`CLAUDE.md`](CLAUDE.md) contiene las instrucciones permanentes, y [`.claude/agents/`](.claude/agents/) define nueve subagentes especializados: tres expertos de módulo, dos validadores de frontend, tres guardianes (documentación, especificación y capa de datos) y uno de publicación.

### Al clonar el repositorio

El contenido de las skills se versiona en `.agents/skills/`, pero los enlaces que Claude Code usa para descubrirlas son específicos de cada máquina. Regéneralos una vez tras clonar:

```bash
npx skills experimental_install
```

El servidor MCP de Supabase declarado en `.mcp.json` requiere autorización interactiva: ejecuta `/mcp` desde una sesión de `claude` en la terminal.
