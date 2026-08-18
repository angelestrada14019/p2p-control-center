# 02 — Arquitectura

**Última actualización:** 2026-08-13
**Relacionado:** [04-datos](04-datos.md) · [03-diseño](03-diseno.md) · [09-infraestructura](09-infraestructura.md)

---

## 1. Stack

| Capa | Tecnología | Por qué |
|---|---|---|
| Build | **Vite** | Arranque y HMR rápidos; sin la complejidad de SSR que este producto no necesita |
| UI | **React 19** | Estándar del equipo |
| Lenguaje | **TypeScript** (modo `strict`) | Los contratos de datos contables no toleran ambigüedad de tipos |
| Estilos | **Tailwind CSS** con tokens en CSS variables | Densidad y consistencia sin CSS suelto |
| Routing | **React Router** | Navegación por módulo con URLs compartibles |
| Estado servidor | **TanStack Query** | Caché, refetch e invalidación de datos remotos |
| Estado UI | React state + Context acotado | No se introduce Redux/Zustand salvo necesidad demostrada |
| Tablas | **TanStack Table** (headless) | Ordenamiento, filtros y paginación sobre miles de filas, con render propio |
| Gráficos | **Recharts** | Estable, suficiente para líneas/barras comparativas. Ver [03-diseño](03-diseno.md) |
| Formularios | **React Hook Form** + **Zod** | Validación tipada compartida con los contratos de datos |
| Fechas | **date-fns** con locale `es` | Ligera y tree-shakeable |
| Export | **SheetJS (xlsx)** | Descarga a Excel/CSV |
| Tests | **Vitest** + **Testing Library** | Mismo runtime que Vite |

> Estas elecciones son la base recomendada. Cualquier cambio o adición de dependencia se registra como decisión en [12-decisiones.md](12-decisiones.md).

## 2. Principio rector

**Arquitectura sencilla, modular y mantenible.** Organización por *feature*, no por tipo de archivo. Un módulo del producto se corresponde con una carpeta que contiene todo lo suyo. Lo compartido se promueve a `shared/` solo cuando lo usan dos o más features.

Regla práctica: **si borras la carpeta de un módulo, la app debe seguir compilando salvo por sus rutas.**

## 3. Estructura de carpetas

```
src/
  app/                      # Composición raíz
    App.tsx
    router.tsx              # Definición de rutas y guards por rol
    providers.tsx           # QueryClient, sesión, tema, alertas
  features/
    home/                   # Centro de control
      components/
      hooks/
      home.page.tsx
    reporteria/             # Módulo 1
      components/
        tabla-provisiones/
        drawer-bitacora/
        filtros/
      hooks/
      reportes/             # Config declarativa de A, B y C
      reporteria.page.tsx
    kpis/                   # Módulo 2 (tarjeta + redirección)
    checklist/              # Módulo 3
      components/
      hooks/
      controles/            # Catálogo de controles
      checklist.page.tsx
    alertas/
  shared/
    ui/                     # Primitivas: Boton, Badge, Semaforo, Tabla, Drawer, Modal…
    layout/                 # AppShell, Encabezado, NavegacionModulos
    hooks/
    utils/                  # formato de moneda, fechas, texto
    types/                  # Tipos transversales (Rol, Periodo, Pais, Moneda)
  data/                     # Capa de datos — ver 04-datos.md
    contracts/              # Interfaces de repositorio + esquemas Zod
    mock/                   # ÚNICO lugar con datos simulados
    snowflake/              # Adaptador de reportes (futuro)
    supabase/               # Adaptador del core (futuro)
    index.ts                # Selector de adaptador según VITE_DATA_SOURCE
  auth/
    session.tsx             # Sesión y rol activo (simulado en el MVP)
    permisos.ts             # Matriz de permisos de 01-producto.md
    Puede.tsx               # <Puede accion="..."> para ocultar/deshabilitar UI
  styles/
    tokens.css              # Tokens del design system — ver 03-diseno.md
    globals.css
```

## 4. Reglas de dependencia

Las capas solo pueden importar hacia abajo. Está **prohibido**:

- `shared/` → `features/`
- `features/reporteria/` → `features/checklist/` (si necesitan algo en común, va a `shared/`)
- Cualquier componente de UI → `data/mock/`, `data/snowflake/` o `data/supabase/` directamente. La UI solo consume **hooks** que consumen **contratos**.

```
features → shared → data/contracts
                 ↘ auth
data/index → (mock | snowflake | supabase)   ← el único punto que conoce los adaptadores
```

Esta última regla es la que hace posible cambiar de mock a real sin tocar una sola pantalla. La vigila el subagente `data-layer-guardian`.

## 5. Convenciones

### Idioma
- **UI, textos, mensajes de error y documentación: español.**
- **Identificadores de código (variables, funciones, tipos, archivos): inglés**, salvo términos de dominio sin traducción útil (`provision`, `periodo`, `centroDeCosto`) — se prefiere el término del negocio a una traducción forzada, porque los usuarios y los desarrolladores deben hablar el mismo idioma sobre los datos.
- **Nombres de campo de los reportes: exactamente como los define el negocio** (`AMOUNT_ML1`, `DOCUMENT_NUMBER`). No se renombran. Ver [05](05-modulo-1-reporteria.md).

### Archivos
- Componentes: `PascalCase.tsx` (`TablaProvisiones.tsx`)
- Hooks: `use-kebab-case.ts` (`use-provisiones.ts`)
- Páginas: `nombre.page.tsx`
- Utilidades y tipos: `kebab-case.ts`
- Tests: junto al archivo, `nombre.test.ts`

### Componentes
- Un componente = una responsabilidad. Si pasa de ~200 líneas, se parte.
- Props explícitas y tipadas; nada de `any` ni `object`.
- Sin lógica de negocio dentro de un componente: va a un hook o a `data/`.
- Los componentes de `shared/ui/` no conocen el dominio P2P: reciben datos, no los buscan.

### Estado
- **Datos remotos → TanStack Query.** Nunca en `useState`.
- **Estado de UI local → `useState`.**
- **Estado compartido entre pantallas → Context acotado** (sesión, periodo/compañía seleccionados, alertas). Un Context por preocupación, nunca uno global.
- **Filtros y paginación → en la URL** (query params). Así una vista filtrada se puede compartir por chat y el botón atrás funciona.

## 6. Routing

| Ruta | Pantalla | Acceso |
|---|---|---|
| `/` | Home / centro de control | Todos |
| `/reporteria` | Módulo 1 — pestañas globales; redirige a `registro` | Todos |
| `/reporteria/registro` | Sub-pestañas por reporte; redirige al primero visible para el sub-perfil | Todos (acciones según rol) |
| `/reporteria/registro/sap-ovh` | Reporte A — SAP (construido, ver [05](05-modulo-1-reporteria.md)) | Controller OVH, admin |
| `/reporteria/registro/ns-ovh` | Reporte B — NS (en construcción) | Controller OVH, admin |
| `/reporteria/registro/turbo` | Reporte C — SAP TURBO (en construcción) | Controller TURBO, admin |
| `/reporteria/no-provisionable` | Pestaña de exclusiones globales (en construcción) | Todos |
| `/kpis` | Tarjeta de redirección a la app externa | Todos |
| `/checklist` | Módulo 3 | Todos (acciones según rol) |
| `/checklist/:controlId` | Detalle de un control | Todos |
| `/checklist/confirmacion` | Confirmación final del periodo | Solo `admin` |
| `/alertas` | Centro de alertas | Todos |

Los guards de ruta usan `auth/permisos.ts` para acciones por rol, y `features/reporteria/components/GuardSubperfil.tsx` para el alcance OVH/TURBO por sub-perfil de Controller. Un usuario sin permiso o sin alcance ve un estado explicativo, **no** una página en blanco ni un error genérico.

## 7. Rendimiento

Los reportes manejan volúmenes altos. Reglas mínimas:

- Paginación en servidor (o simulada sobre el mock) desde el principio; **nunca** se renderizan miles de filas de golpe.
- Filtros con *debounce* (≈300 ms) sobre el buscador de texto.
- Memoización de columnas y de callbacks de fila en las tablas.
- Reserva de espacio en la carga (skeletons con la altura final) para evitar saltos de layout.
- Consultar la skill `vercel-react-best-practices` antes de optimizar por intuición.

## 8. Errores y estados

Toda vista que carga datos implementa **cuatro estados**, sin excepción:

| Estado | Qué muestra |
|---|---|
| **Carga** | Skeleton con la forma del contenido final |
| **Vacío** | Explicación de por qué está vacío y qué hacer (no "No hay datos" a secas) |
| **Error** | Qué falló, si es recuperable, y un botón de reintento |
| **Con datos** | El contenido |

Los errores nunca se silencian. Un `catch` sin manejo visible al usuario es un defecto.

## 9. Accesibilidad

Requisito, no mejora opcional. Detalle en [03-diseño](03-diseno.md). Mínimos:
- Navegación completa por teclado, con foco visible en todo control interactivo.
- Contraste conforme a WCAG AA.
- El color **nunca** es el único portador de significado: todo semáforo lleva texto o ícono.
- Etiquetas `aria` en botones de solo ícono.
- Tablas con encabezados asociados correctamente.

## 10. Testing

Prioridad, en orden:
1. **Lógica de detección de inconsistencias y cálculo de KPIs** — es donde un error tiene consecuencia contable.
2. **Reglas de permisos** — que un rol no pueda ejecutar lo que no debe.
3. **Reglas de completitud del checklist** — que no se pueda cerrar un control sin cumplir sus condiciones.
4. Componentes con estado complejo (tabla, drawer, filtros).

No se persigue cobertura por la cobertura misma. Se testea lo que, si se rompe, produce un dato contable incorrecto.
