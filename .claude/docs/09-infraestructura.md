# 09 — Infraestructura

**Última actualización:** 2026-08-12
**Relacionado:** [02-arquitectura](02-arquitectura.md) · [04-datos](04-datos.md) · [10-git-workflow](10-git-workflow.md)

---

## 1. Entornos

| Entorno | Propósito | Fuente de datos |
|---|---|---|
| **local** | Desarrollo en la máquina del desarrollador | `mock` |
| **preview** | Despliegue por PR, para revisión | `mock` |
| **staging** | Validación con datos reales de prueba | `real` (cuando exista) |
| **producción** | Uso diario del equipo P2P | `real` |

Hoy solo existen **local** y, cuando se despliegue, **preview**. Staging y producción se habilitan cuando haya integraciones reales.

---

## 2. Variables de entorno

Todas con prefijo `VITE_` para ser expuestas al cliente. **Ninguna variable con prefijo `VITE_` puede contener un secreto** — Vite las inyecta en el bundle y quedan visibles para cualquiera que abra el navegador.

| Variable | Valores | Descripción |
|---|---|---|
| `VITE_DATA_SOURCE` | `mock` \| `real` | Selector de adaptador de datos. Ver [04-datos](04-datos.md) |
| `VITE_KPIS_URL` | URL | Destino del Módulo 2. Sin ella, la tarjeta muestra estado explicativo |
| `VITE_SUPABASE_URL` | URL | Endpoint del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | clave pública | Clave anónima. **Pública por diseño**; la seguridad real la da RLS |
| `VITE_APP_ENV` | `local`\|`preview`\|`staging`\|`prod` | Etiqueta de entorno mostrada en la UI |

`.env.example` se versiona con las claves y valores de ejemplo. `.env` y `.env.*` reales **nunca** se versionan.

### Snowflake: advertencia de arquitectura

> **Un frontend no debe conectarse directamente a Snowflake.** Cualquier credencial de Snowflake puesta en una variable `VITE_` queda expuesta en el bundle.
>
> El acceso a Snowflake requerirá un intermediario del lado servidor (Edge Function de Supabase, o un servicio backend) que autentique al usuario, aplique el filtro de ámbito por rol/país y consulte Snowflake con credenciales que nunca salen del servidor.
>
> **Esta decisión está pendiente.** Ver [12-decisiones.md](12-decisiones.md) y [04-datos §7](04-datos.md).

---

## 3. Manejo de secretos

Reglas duras:

1. **Ningún secreto en el repositorio.** Ni en código, ni en docs, ni en archivos de configuración versionados, ni en un comentario, ni en un mensaje de commit.
2. Los secretos viven en el gestor de secretos del entorno de despliegue y en el `.env` local de cada desarrollador, que está en `.gitignore`.
3. `.claude/settings.local.json` **no se versiona**: contiene permisos y configuración de la máquina local.
4. `.mcp.json` **sí se versiona**: solo contiene la URL del servidor MCP y el `project_ref` público del proyecto Supabase. No hay credenciales en él. Si alguna vez fuera a contener un token, deja de versionarse.
5. Antes de cada commit se revisa el diff completo. El subagente `branch-pr-agent` incluye esta verificación.
6. Si un secreto se filtra: se **rota inmediatamente** y luego se limpia el historial. Rotar primero — reescribir el historial no revoca una credencial ya expuesta.

---

## 4. Scripts del proyecto

Previstos en `package.json` cuando se inicialice el proyecto:

```
dev          Servidor de desarrollo con HMR
build        Compilación de producción (incluye typecheck)
preview      Sirve el build localmente
typecheck    tsc --noEmit
lint         ESLint
format       Prettier
test         Vitest
test:watch   Vitest en modo watch
```

---

## 5. Servidor MCP

`.mcp.json` declara el servidor MCP de Supabase:

```json
{ "mcpServers": { "supabase": { "type": "http", "url": "https://mcp.supabase.com/mcp?project_ref=..." } } }
```

**Requiere autorización interactiva.** En sesiones no interactivas las herramientas de Supabase no están disponibles. Para autorizarlo se usa `/mcp` desde una sesión interactiva de `claude`, o `claude mcp` desde la terminal.

---

## 6. Despliegue

**Pendiente de definir.** Candidatos según lo que use el equipo: Vercel, Netlify, o infraestructura interna de Rappi. Requisitos que debe cumplir la opción elegida:

- Despliegue automático por PR (preview) — hace útil el flujo de revisión de [10-git-workflow](10-git-workflow.md).
- Variables de entorno por entorno.
- Acceso restringido: es una herramienta interna con datos financieros. **No debe ser públicamente accesible sin autenticación**, ni siquiera en preview.
- HTTPS obligatorio.

Se registra como decisión en [12-decisiones.md](12-decisiones.md) cuando se defina.

---

## 7. Repositorio

- **Remoto:** `https://github.com/rappi-prototyping/P2P_APP.git`
- **Rama principal:** `main`
- **Acceso restringido por IP allow list.** Las operaciones contra el remoto (`fetch`, `push`, `ls-remote`) fallan con `403` sin la **VPN corporativa activa**. Si aparece ese error, no es un problema de credenciales: es la VPN.

---

## 8. Calidad en CI

Cuando se configure CI, el mínimo obligatorio antes de permitir el merge de un PR:

1. `typecheck` sin errores
2. `lint` sin errores
3. `test` en verde
4. `build` exitoso
5. Escaneo de secretos en el diff

---

## 9. Pendientes de infraestructura

| # | Pendiente | Bloquea |
|---|---|---|
| 1 | Definir plataforma de despliegue | Previews por PR |
| 2 | Definir el intermediario para Snowflake | Toda integración real de reportes |
| 3 | Definir autenticación corporativa (SSO) | Salir de la identidad simulada |
| 4 | Configurar CI | Automatización de calidad |
| 5 | Definir política de retención del historial de auditoría | Modelo de datos en Supabase |
