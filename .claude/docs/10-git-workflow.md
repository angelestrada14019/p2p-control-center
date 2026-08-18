# 10 — Flujo de Git (GitHub Flow)

**Última actualización:** 2026-08-12
**Relacionado:** [09-infraestructura](09-infraestructura.md) · [11-agentes-y-reglas](11-agentes-y-reglas.md)
**Subagente:** `branch-pr-agent`

---

## 1. La regla

> **`main` es intocable. Nunca se commitea ni se hace push directamente a `main`.**
>
> Todo cambio —incluidas correcciones de una línea y cambios de documentación— entra por una rama y un Pull Request.

`main` siempre debe estar en un estado desplegable.

---

## 2. El ciclo

```
main ──┬─────────────────────────────────────► main
       │                                      ▲
       └── feat/nombre-descriptivo ───────────┘
             commits → push → PR → review → squash merge
```

1. **Partir de `main` actualizado**
   ```bash
   git checkout main && git pull origin main
   ```
2. **Crear la rama**
   ```bash
   git checkout -b feat/tabla-provisiones-sap
   ```
3. **Commitear** con mensajes convencionales (§4)
4. **Push de la rama**
   ```bash
   git push -u origin feat/tabla-provisiones-sap
   ```
5. **Abrir el PR** hacia `main` (§5)
6. **Revisión** — al menos una aprobación
7. **Squash merge** y borrado de la rama

---

## 3. Nombres de rama

`<tipo>/<descripción-en-kebab-case>`

| Prefijo | Para |
|---|---|
| `feat/` | Funcionalidad nueva |
| `fix/` | Corrección de un defecto |
| `docs/` | Solo documentación |
| `refactor/` | Cambio interno sin alterar comportamiento |
| `chore/` | Configuración, dependencias, herramientas |
| `test/` | Solo pruebas |

Descripciones concretas: `feat/drawer-bitacora`, no `feat/cambios`. Una rama = un propósito. Si te descubres tocando dos cosas sin relación, son dos ramas.

---

## 4. Mensajes de commit

Formato convencional:

```
<tipo>(<alcance>): <descripción en imperativo>

[cuerpo opcional: por qué, no qué]
```

Alcances del proyecto: `m1`, `m2`, `m3`, `home`, `datos`, `diseño`, `auth`, `alertas`, `docs`, `infra`.

```
feat(m1): agregar drawer de bitácora en la tabla de provisiones
fix(datos): corregir el formato de moneda para COP
docs(m3): documentar las reglas de completitud de controles
chore(infra): configurar Vitest
```

Reglas:
- Descripción en **imperativo** ("agregar", no "agregado" ni "agrega").
- Sin punto final.
- El **cuerpo explica el porqué**; el qué ya está en el diff.
- **Nunca** un secreto, credencial o dato productivo real en el mensaje.
- Commits atómicos: un cambio coherente por commit.

---

## 5. Pull Requests

### Descripción — plantilla

```markdown
## Qué cambia
<Resumen en 2-3 líneas>

## Por qué
<El problema o la necesidad>

## Documentación actualizada
- [ ] Se actualizaron los documentos de `.claude/docs` afectados
- [ ] Se registró la decisión en `12-decisiones.md` (si aplica)
- [ ] Se actualizó el `CHANGELOG.md`

## Verificación
<Cómo se probó. Comandos ejecutados y su resultado>

## Checklist
- [ ] `typecheck`, `lint` y `test` pasan
- [ ] No hay secretos ni datos productivos reales en el diff
- [ ] La UI cumple `03-diseno.md` (si aplica)
- [ ] La capa de datos respeta la frontera de `04-datos.md` (si aplica)
- [ ] Los subagentes de validación correspondientes se ejecutaron
```

### Reglas
- **Un PR = un propósito.** PRs grandes y mezclados no se revisan bien.
- Si supera ~400 líneas de cambio real, se parte.
- **Squash merge**, para mantener el historial de `main` legible.
- Se borra la rama tras el merge.
- **Nadie mergea su propio PR sin revisión.**

---

## 6. Protección de `main` en GitHub

Configuración recomendada, a aplicar desde la web del repositorio (Settings → Branches → Add rule sobre `main`):

- ✅ Require a pull request before merging
- ✅ Require approvals: **1**
- ✅ Dismiss stale approvals when new commits are pushed
- ✅ Require status checks to pass (cuando exista CI): typecheck, lint, test, build
- ✅ Require branches to be up to date before merging
- ✅ Block force pushes
- ✅ Restrict deletions

---

## 7. Acceso al remoto

El repositorio `rappi-prototyping/P2P_APP` tiene **IP allow list**. Sin la **VPN corporativa activa**, cualquier operación contra el remoto falla con:

```
remote: The repository owner has an IP allow list enabled, and <tu-ip> is not permitted to access this repository.
fatal: ... The requested URL returned error: 403
```

Ese error **no es de credenciales**: es la VPN. Conéctate y reintenta.

---

## 8. Prohibido

- `git push` directo a `main`.
- `git push --force` sobre `main` o sobre una rama que otro esté usando. Si hay que reescribir tu propia rama, `--force-with-lease`.
- `git commit --no-verify` para saltar hooks.
- Commitear `.env`, credenciales, `node_modules/` o `.claude/settings.local.json`.
- Mergear con CI en rojo.
- Reescribir el historial de `main`.

---

## 9. Nota sobre el arranque del repositorio

El repositorio se creó vacío (sin commits). Por eso el primer commit —el bootstrap con `.gitignore` y `README.md`— fue directo a `main`: no existía una base contra la cual abrir un PR. **A partir de ese commit la regla de §1 aplica sin excepciones.** La fundación del proyecto (documentación, subagentes, CLAUDE.md) entró por la rama `chore/setup-fundacion` y su PR.
