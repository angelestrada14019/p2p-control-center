# 03 — Diseño

**Última actualización:** 2026-08-12
**Relacionado:** [01-producto](01-producto.md) · [02-arquitectura](02-arquitectura.md) · [12-decisiones](12-decisiones.md)
**Subagentes:** `frontend-validator`, `ui-consistency`
**Skills a consultar:** `frontend-design`, `ui-ux-pro-max`, `web-design-guidelines`

---

## 0. Estado de verificación — LEER ANTES DE USAR

**No se pudo acceder a ninguna fuente del design system interno de Rappi.** Esto no es una omisión: es el hallazgo principal y define cómo debe leerse todo lo que sigue.

| Fuente consultada | Resultado |
|---|---|
| Foundations del agente `rappi-dev-tools:designer` | **No existen** en este entorno |
| Skills instaladas del proyecto | 7 skills, **todas públicas de terceros**. Ninguna de Rappi |
| Plugin `rappi-dev-tools` (directorio de datos) | **Vacío**; sin tokens ni foundations |
| Registro npm configurado | Público. **Sin scope `@rappi`**, sin `.npmrc` con registro privado |
| Búsqueda web | Sin design system público de Rappi; solo el portal de APIs |

**Consecuencia:** no hay ni un solo token marcado como oficial de Rappi. Lo que sigue **sí es la fuente de verdad del proyecto** — es la paleta que Producto definió explícitamente (naranja de marca como acción primaria) y que este documento resuelve con contrastes **calculados con la fórmula WCAG**, no citados de memoria. Ver ADR-11 en [12-decisiones.md](12-decisiones.md).

### Etiquetas usadas

| Etiqueta | Significado |
|---|---|
| **`[NO VERIFICABLE]`** | Depende del design system de Rappi y no se pudo confirmar. Requiere validación con Design System / Brand |
| **`[DECISIÓN NUESTRA]`** | Propuesta de este equipo, con justificación. Válida hasta que Rappi diga otra cosa |
| **`[VERIFICADO]`** | Comprobado mediante cálculo o estándar externo citado (WCAG 2.2) |

> **Acción previa recomendada:** pedir al equipo de Design System de Rappi (a) el paquete npm de componentes si existe, (b) los tokens del tema aplicable, (c) la guía de uso de marca. Si la respuesta es "no hay nada para herramientas internas", este documento pasa a ser la fuente de verdad y se reetiqueta completo como `[DECISIÓN NUESTRA]`. Ver §11.

---

## 1. Carácter del producto

P2P Control Center es una **herramienta de trabajo de uso diario y prolongado**, no una pieza de comunicación. Todo el diseño se subordina a esto:

- **La densidad de datos es una virtud, no un defecto.** Un Controller necesita ver muchas filas a la vez.
- **La velocidad de lectura importa más que el impacto visual.** Nada debe retrasar la comprensión de una cifra.
- **La fatiga visual es un riesgo real.** Jornadas de horas frente a tablas.
- **La seriedad es funcional.** Es una herramienta con consecuencia contable; debe transmitir precisión, no simpatía.

### Área de producto y tema

**`[NO VERIFICABLE]`** — Entre las áreas conocidas de Rappi (Consumer, RT, Merchants, Brands, Cargo, Pay, Aliados, Portal Partners, etc.) ninguna corresponde a **herramientas internas corporativas de Finanzas**. Todas son productos de cara a un usuario externo.

**`[DECISIÓN NUESTRA]`:** no forzar el encaje en un tema existente. Se adopta un tema propio, **`p2p-internal`**: base neutra optimizada para densidad de datos, con el naranja de marca Rappi como acción primaria (ADR-11) — es la dirección visual que Producto pidió explícitamente para este proyecto, resuelta con tres ajustes de accesibilidad (§2) para que funcione en una herramienta de datos densos sin perder el DNA de marca ni colisionar con el sistema de semáforos.

**Pregunta abierta:** ¿existe en Rappi un tema o kit para back-office? Su respuesta puede invalidar esta sección completa.

---

## 2. Tokens de color

**`[DECISIÓN NUESTRA]`** los valores (siguiendo el concepto estético de Producto) · **`[VERIFICADO]`** los ratios de contraste. Nombres de token: dentro del `@theme` de Tailwind v4, `--color-X` genera automáticamente las utilidades `bg-X`/`text-X`/`border-X`. Los tokens de texto usan el sufijo **`ink`** (no `text`) para que la utilidad resultante sea `text-ink`, no el redundante `text-text`.

Criterios de construcción:
1. Fondo de app ligeramente gris, no blanco puro — reduce fatiga en jornadas largas.
2. **Acción primaria: el naranja de marca Rappi (`#FF441F`)**, con texto slate encima — no blanco. Ver ADR-11 en [12-decisiones.md](12-decisiones.md) para el porqué completo.
3. Cada estado semántico con trío: fondo sutil (badge), texto/ícono (`ink`), sólido (punto).
4. **Acción y estado usan tratamientos visuales distintos** (relleno sólido vs. badge pastel) para no confundirse entre sí pese a compartir familia cromática con `danger`.

### 2.1 Superficies

| Token | Hex | Uso | Contraste |
|---|---|---|---|
| `--color-canvas` | `#F8F9FA` | Fondo global. Off-white: sin deslumbramiento | texto `ink` 16.94:1 |
| `--color-surface` | `#FFFFFF` | Tarjetas, filas de tabla, paneles, inputs | texto `ink` 17.85:1 |
| `--color-surface-sunken` | `#F1F5F9` | Encabezado de tabla, zonas de filtro | texto `ink` 16.30:1 |
| `--color-border` | `#E2E8F0` | Gridlines, divisores | 1.23:1 — decorativo |
| `--color-border-strong` | `#64748B` | Bordes de input, selección, separadores con significado | 4.76:1 ✅ |

> **`--color-border` (1.23:1) no cumple** WCAG 1.4.11 — es aceptable **solo** porque las gridlines son decorativas: la estructura de la tabla se comunica por alineación y espaciado, no por la línea. Cualquier borde que comunique estado (foco, error, selección) **debe** usar `--color-border-strong` o un color semántico.

### 2.2 Texto ("ink")

| Token | Hex | Uso | Contraste (canvas / surface / sunken) |
|---|---|---|---|
| `--color-ink` | `#0F172A` | Cifras, encabezados, contenido de celda | 16.94 / 17.85 / 16.30:1 ✅ |
| `--color-ink-secondary` | `#475569` | Etiquetas, encabezados de columna | 7.19 / 7.58 / 6.92:1 ✅ |
| `--color-ink-muted` | `#5F6B7A` | Metadatos, timestamps, ayuda | 5.15 / 5.43 / 4.95:1 ✅ |
| `--color-ink-disabled` | `#94A3B8` | Controles deshabilitados | 2.56:1 sobre surface — ver nota |
| `--color-ink-inverse` | `#FFFFFF` | Texto sobre superficies sólidas oscuras | — |

> **`--color-ink-muted` se oscureció desde el `#64748B` de la paleta de marca**: ese valor daba 4.34:1 sobre `--color-surface-sunken` (el encabezado de tabla, donde más metadatos aparecen) y fallaba AA justo ahí. `#5F6B7A` cumple en las **tres** superficies. `#64748B` sigue vigente para `--color-border-strong`, donde el mínimo es 3:1 y sí cumple.
>
> **`--color-ink-disabled` (2.56:1) no cumple AA.** Es intencional: WCAG 2.2 exime a los componentes deshabilitados (SC 1.4.3). **Nunca uses este token para comunicar información**, solo para controles genuinamente inertes. Un dato "no disponible" va en `--color-ink-muted`, no en disabled.

### 2.3 Acción primaria

| Token | Hex | Contraste |
|---|---|---|
| `--color-primary` | `#FF441F` | naranja de marca, exacto, sin alterar |
| `--color-primary-hover` | `#F03A15` | — |
| `--color-primary-ink` | `#0F172A` | 5.18:1 sobre `primary` ✅ · 4.52:1 sobre `primary-hover` ✅ |
| `--color-primary-subtle` | `#FFF1ED` | fondo de fila seleccionada / tab activo |
| `--color-focus` | `#FF441F` | 3.44:1 sobre surface ✅ (mínimo 3:1 no-textual) |

> **El botón primario lleva texto slate (`primary-ink`), nunca blanco.** Blanco sobre `#FF441F` da **3.44:1** y falla AA (4.5:1) para texto normal; slate da **5.18:1**. Preservar el naranja exacto y cambiar el color del texto —no oscurecer el naranja— es lo que permite no alterar el color de marca. A partir de `#E63512` el texto slate ya cae por debajo de AA (4.15:1), así que el estado `pressed` se resuelve con una sombra interior (`--inset-pressed`), no oscureciendo más el relleno.
>
> **Secundaria** — borde sin relleno: fondo `--color-surface`, borde `--color-border-strong`, texto `--color-ink`. Hover: fondo `--color-surface-sunken`.
> **Terciaria** — solo texto: `--color-primary-ink` sobre transparente, subrayado en hover. Para acciones de baja consecuencia dentro de filas densas.
> **Destructiva** — fondo `--color-danger-solid` (`#DC2626`), texto blanco (4.83:1 ✅). Nunca como acción primaria por defecto; **siempre requiere confirmación explícita** dado el dominio contable.

### 2.4 Estados semánticos — el sistema de semáforos

Bloque crítico del producto.

| Estado | Fondo sutil (`subtle`) | Texto/ícono (`ink`) | Sólido (punto) | Contraste ink/subtle | Contraste solid/surface |
|---|---|---|---|---|---|
| **Éxito** | `#E6F4EA` | `#047857` | `#0B8457` | 4.83:1 ✅ | 4.72:1 ✅ |
| **Advertencia** | `#FEF3C7` | `#92400E` | `#D97706` | 6.37:1 ✅ | 3.19:1 ✅ |
| **Error** | `#FEE2E2` | `#B91C1C` | `#DC2626` | 5.30:1 ✅ | 4.83:1 ✅ |
| **Info** | `#DBEAFE` | `#1D4ED8` | `#2563EB` | 5.49:1 ✅ | 5.17:1 ✅ |
| **Neutro** | `#F1F5F9` | `#475569` | `#64748B` | 6.92:1 ✅ | 4.76:1 ✅ |

> **El verde menta de marca (`#10B981`) no es legible como texto** (2.54:1 sobre blanco, 2.23:1 sobre su propio badge). Se conserva como `--color-success` para relleno decorativo (barras de progreso, series de gráfico) y se usan las variantes oscuras (`success-ink`/`success-solid`) de la tabla para texto y puntos.

#### Hallazgo crítico: el color por sí solo NO puede codificar el semáforo

Contraste **entre** los colores sólidos del semáforo:

| Par | Ratio |
|---|---|
| éxito vs advertencia | 1.48:1 |
| éxito vs error | 1.02:1 |
| advertencia vs error | 1.52:1 |

Los estados tienen **luminancias muy cercanas** entre sí (éxito y error son casi indistinguibles, 1.02:1). Para una persona con deuteranopía o protanopía (~8% de los hombres), o en una impresión en escala de grises —plausible en un cierre contable que se imprime o se pega en un correo—, **verde y rojo son prácticamente indistinguibles**.

> **REGLA OBLIGATORIA.** Ningún semáforo de esta aplicación comunica su estado solo con color. Cada indicador lleva **siempre** al menos uno de: ícono con forma distinta (círculo lleno / triángulo / octágono) o etiqueta de texto. Es WCAG 1.4.1 y aquí es además un requisito funcional. El componente `Semaforo` (`src/shared/ui/Semaforo.tsx`) es la única forma aprobada de mostrar un estado — nunca un punto de color aislado.
>
> **Implicación de layout:** toda columna de estado reserva ancho para **ícono + texto**, no para un punto de color.

#### Tratamiento acción vs. estado — por qué naranja y rojo no se confunden

**`--color-primary` (naranja) y `--color-danger-solid` (rojo) dan 1.40:1 entre sí** — comparten familia cromática y el color por sí solo no los distingue. La separación es de **tratamiento**, no de tono:

> **Acción = relleno sólido con texto `primary-ink`. Estado = badge pastel (`subtle` + `ink` + ícono).**

Dos lenguajes visuales reconocibles incluso en escala de grises: un botón se ve como botón (relleno, esquinas de control), un estado se ve como etiqueta (píldora pequeña con ícono). Ver ADR-11.

### 2.5 Niveles de riesgo

Los 4 niveles de [05-modulo-1-reporteria.md §6](05-modulo-1-reporteria.md) usan 4 tonos **distintos** a propósito — no reutilizan 1 a 1 el vocabulario verde/ámbar/rojo/gris de arriba, porque nivel de riesgo y estado son ejes distintos:

| Nivel | Tono | Por qué |
|---|---|---|
| Crítico | `error` (rojo) | El más grave, mismo tono que un error de estado |
| Alto | `advertencia` (ámbar) | Distinto de crítico — antes ambos usaban `error` y eran indistinguibles entre sí, violación directa de la regla de arriba |
| Medio | `info` (azul) | Distinto de alto y bajo |
| Bajo | `neutro` (gris) | El de menor severidad |

### 2.6 Modo oscuro

**Pospuesto** para después de esta fase — ver ADR-10 en [12-decisiones.md](12-decisiones.md). No hay tokens de modo oscuro implementados todavía.

---

## 3. Tipografía

### 3.1 Familia

**`[NO VERIFICABLE]`** — No se pudo confirmar la tipografía oficial de Rappi ni si hay licencia corporativa para herramientas internas. **Es la brecha más importante después de los colores**, porque cambiar de familia afecta a todo el layout de tablas.

**`[DECISIÓN NUESTRA]`: Inter.** Justificación técnica:
- **Numerales tabulares** (`font-variant-numeric: tabular-nums`) — imprescindible al alinear miles de cifras en columna.
- **Cero cortado** (`slashed-zero`) — reduce la confusión 0/O en códigos contables y de proveedor.
- Licencia SIL OFL: sin fricción legal.
- Legible en tamaños pequeños, que es donde vive una tabla densa.

Fallback: `Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.

> Si Rappi tiene tipografía corporativa obligatoria, **verificar que tenga variante tabular antes de construir**. Si no la tiene: corporativa para títulos y encabezados, e Inter (o cualquier familia con `tnum`) exclusivamente para columnas numéricas. Es una excepción defendible ante Brand: es legibilidad de datos, no identidad.

### 3.2 Números tabulares — la regla tipográfica más importante

**`[DECISIÓN NUESTRA]`** Toda cifra en columna —importes, cantidades, porcentajes, fechas numéricas, identificadores— se renderiza con:

```css
font-variant-numeric: tabular-nums;
text-align: right;
```

Sin ancho de dígito fijo los números "bailan" verticalmente y el ojo pierde la capacidad de comparar magnitudes de un vistazo, que es exactamente la tarea de un Controller revisando provisiones. Los **encabezados** de columnas numéricas también van a la derecha, para coincidir con sus datos.

### 3.3 Escala

**`[DECISIÓN NUESTRA]`** Escala comprimida a propósito: en una herramienta densa, los saltos tipográficos grandes desperdician espacio vertical.

| Token | Tamaño / interlineado | Peso | Uso |
|---|---|---|---|
| `--text-display` | 28/36 | 600 | Título de página (uno por vista) |
| `--text-h1` | 22/30 | 600 | Sección principal |
| `--text-h2` | 18/26 | 600 | Subsección, título de tarjeta |
| `--text-h3` | 15/22 | 600 | Encabezado de grupo, título de widget KPI |
| `--text-body` | 14/20 | 400 | Texto base |
| `--text-body-strong` | 14/20 | 600 | Énfasis, totales |
| `--text-table` | 13/18 | 400 | Celdas de tabla densa |
| `--text-table-header` | 12/16 | 600 | Encabezado de columna (mayúsculas, `letter-spacing: 0.02em`) |
| `--text-caption` | 12/16 | 400 | Metadatos, ayuda |
| `--text-kpi` | 32/38 | 600 | Cifra grande de KPI, siempre con `tabular-nums` |

Solo dos pesos: **400** y **600**. Más pesos generan inconsistencia sin ganancia informativa.

> **Mínimo absoluto: 12px.** No bajar de ahí ni para caber más columnas. Si no cabe: menos columnas o scroll horizontal, nunca texto más pequeño.

---

## 4. Espaciado, radios y elevación

**`[DECISIÓN NUESTRA]`** en su totalidad.

### 4.1 Espaciado — base 4px

Un único token `--spacing: 0.25rem` (4px), el mecanismo de Tailwind v4 para toda la escala numérica (`p-1`, `gap-4`, etc. se multiplican sobre esta base). No hay tokens de espaciado nombrados individualmente: la escala completa de Tailwind (1, 2, 3, 4, 5, 6, 8, 10, 12, 16…) ya cae en múltiplos de 4px.

**Densidad de fila conmutable por el usuario** — distintos roles tienen distintas necesidades: un Analista escanea muchas filas, un Controller revisa pocas con detalle.

| Modo | Altura de fila | Padding vertical |
|---|---|---|
| Compacta | 32px | 6px |
| **Estándar (por defecto)** | 40px | 8px |
| Cómoda | 48px | 12px |

### 4.2 Radios

Tope duro de **12px** — regla anti-slop (§11). `--radius-modal` se capó a 12px durante la revisión de esta fase: la primera implementación tenía 16px y violaba el propio límite.

| Token | px | Aplicación |
|---|---|---|
| `--radius-badge` | 6 | Badges, chips, tags de estado |
| `--radius-control` | 10 | Botones, inputs, selects |
| `--radius-card` | 12 | Tarjetas, paneles, contenedor de tabla |
| `--radius-modal` | 12 | Modales y diálogos — tope del anti-slop |
| `--radius-full` | 9999 | Puntos de semáforo, avatares |

Radios contenidos a propósito: las esquinas muy redondeadas leen como producto de consumidor y restan seriedad a una herramienta financiera.

### 4.3 Elevación

| Token | Valor | Uso |
|---|---|---|
| — | `none` (borde, sin sombra) | Tablas y elementos en reposo |
| `--shadow-card` | `0 4px 12px rgba(0,0,0,0.04)` | Tarjetas, tarjetas de KPI |
| `--shadow-raised` | `0 6px 16px -2px rgba(15,23,42,0.08)` | Dropdowns, popovers, hover de tarjeta clicable |
| `--shadow-overlay` | `0 12px 28px -6px rgba(15,23,42,0.14)` | Modales, drawer lateral |
| `--inset-pressed` | `inset 0 2px 6px rgba(15,23,42,0.22)` | Estado `pressed` del botón primario (en vez de oscurecer el naranja) |

La jerarquía se comunica con **borde y superficie**, no con profundidad. El exceso de sombra ensucia una pantalla llena de tablas.

---

## 5. Componentes

### 5.1 ¿Hay un paquete interno de Rappi?

**`[NO VERIFICABLE]` — con evidencia negativa.** No se pudo confirmar la existencia de una librería interna, y **no se inventa un nombre de paquete ni un comando de instalación**: un `npm install @rappi/algo` inexistente costaría media mañana a quien lo ejecute.

Verificado en este entorno: el registro npm es el público, no hay scope `@rappi` configurado, no existe `.npmrc` de usuario con credenciales de registro privado. Si existiera una librería interna viviría en un registro privado y requeriría configuración de `.npmrc` que hoy no está.

**Acción:** preguntar a Frontend Platform *"¿Existe una librería de componentes React interna? ¿En qué registro y qué `.npmrc` necesito?"*

### 5.2 Base mientras tanto

**`[DECISIÓN NUESTRA]`** — la intención original (ADR-08) era shadcn/ui + Radix UI sobre Tailwind, por su bajo coste de reversión (copia el código en vez de instalarlo como dependencia). **En la práctica, esta fase construyó los primitivos a mano** (`src/shared/ui/`) en vez de ejecutar `npx shadcn@latest init` — ver ADR-14 para el porqué y qué cambia si se retoma la opción original.

Los primitivos actuales (`Boton`, `Badge`, `Semaforo`, `Tarjeta`, `Modal`, `Drawer`, `Tooltip`, `Skeleton`, `EstadoVacio`, `EstadoError`, `Tabla`) siguen la misma filosofía de bajo coste de reversión: son código propio del repositorio, sin dependencia de un paquete de componentes externo, listos para migrarse si aparece una librería oficial de Rappi o si se decide adoptar shadcn/ui más adelante.

**Modal y Drawer usan `<dialog>` nativo** (no Radix): el navegador resuelve gratis el atrapado de foco, el cierre con `Esc` y el retorno de foco al origen, sin una dependencia adicional.

**No se usa Material UI:** lenguaje visual fuertemente reconocible y opinado, costoso de sobrescribir, y su densidad por defecto no está pensada para tablas contables.

**Tabla de datos: TanStack Table v8** (headless), y virtualización si el volumen lo exige:

```bash
npm install @tanstack/react-table
```

> **Pendiente de producto:** ¿volumen máximo de filas en provisiones? Por debajo de ~1.000 la virtualización es innecesaria; por encima de ~5.000 es obligatoria. Cambia la arquitectura de la tabla; conviene resolverlo antes de construirla.

---

## 6. Uso del naranja Rappi

**`[NO VERIFICABLE]`** el valor exacto y los lineamientos oficiales de marca — el valor `#FF441F` viene del concepto estético que Producto entregó explícitamente para este proyecto, no de una fuente oficial de Design System/Brand confirmada. Ver ADR-11 en [12-decisiones.md](12-decisiones.md).

**Decisión de esta fase: el naranja SÍ es la acción primaria** (botones, foco, selección) — a diferencia de la propuesta anterior del proyecto (ADR-05, azul, sustituida por ADR-11). Dos hallazgos verificados condicionan cómo se usa:

| Medición | Ratio | Implicación |
|---|---|---|
| Texto blanco sobre `#FF441F` | **3.44:1** | ❌ No cumple AA (4.5:1) para texto normal |
| Texto slate (`#0F172A`) sobre `#FF441F` | **5.18:1** | ✅ Cumple AA |
| `#FF441F` (acción) vs. `#DC2626` (estado error) | **1.40:1** | Casi indistinguibles solo por color |

**Consecuencia 1 — el texto va en slate, no en blanco.** Un botón naranja con texto blanco no cumple accesibilidad; con texto slate sí, y el naranja de marca se conserva exacto. No es una opinión de gusto, es aritmética de contraste.

**Consecuencia 2 — acción y estado se separan por tratamiento, no por tono.** El naranja de acción y el rojo de "error/crítico" comparten familia cromática (1.40:1 entre sí). La distinción es: **acción = relleno sólido con texto slate; estado = badge pastel con ícono**. Dos lenguajes visuales reconocibles aunque el tono sea parecido — nunca se usa el mismo tratamiento (relleno sólido de color vivo) para ambos conceptos.

### Dónde SÍ
- **Acción primaria**: botones, CTA, elementos interactivos principales (con texto `primary-ink`, nunca blanco)
- **Foco de teclado** y estados seleccionados (`primary-subtle`)
- **Tab activo de la navegación** (borde + fondo sutil, ver §7) — es una superficie de **acción/navegación**, no un estado del negocio, así que no colisiona con la regla de "estado = badge pastel"
- **Logo y marca**, favicon, acento decorativo mínimo

### Dónde NO
- **Cualquier estado de semáforo** (éxito/advertencia/error/info/neutro) — esos usan su propia paleta (§2.4), nunca el naranja
- Series de datos en gráficas de KPI donde el naranja pueda leerse como "estado" en vez de "acción"
- Texto de cuerpo extenso sobre superficie naranja

> **Principio:** el naranja identifica **la marca y la acción principal**. Nunca comunica **qué está pasando** — esa función es exclusiva de la escala de semáforos (§2.4), precisamente para que ambos sistemas no se pisen.

**Pregunta abierta para Brand:** ¿es `#FF441F` el hex oficial y hay una guía de uso formal? Esta sección se reescribe en cuanto Brand confirme o corrija el valor.

---

## 7. Layout y navegación

### Estructura

```
┌────────────────────────────────────────────────────────────┐
│ ENCABEZADO  logo · selectores · actualización · alertas · usuario │
├──────────┬─────────────────────────────────────────────────┤
│          │                                                  │
│ NAV      │  CONTENIDO                                        │
│ LATERAL  │                                                  │
│          │                                                  │
└──────────┴─────────────────────────────────────────────────┘
```

- **Encabezado fijo**, siempre visible: nombre de la app, selector de compañía/país/entidad, selector de periodo contable, fecha y hora de última actualización, badge de datos simulados, campana de alertas, identificación de usuario (y selector de rol en el MVP), indicador general del estado del proceso.
- **Navegación lateral** con los tres módulos y el centro de alertas. Colapsable — automáticamente a íconos entre 1024–1439px, expandida desde 1440px (ver §9), con un botón para forzar lo contrario en cualquier ancho. El módulo activo se marca con fondo `--color-primary-subtle` y una barra de 3px en `--color-primary`: el naranja es correcto aquí porque un tab activo es una superficie de **acción/navegación**, no un estado del negocio (§6).
- **Migas de pan** dentro de un módulo con más de un nivel.
- Siempre debe ser trivial **volver al inicio** y **cambiar de módulo**.

### Home — tres tarjetas

Las tarjetas de módulo son **grandes, independientes y de igual peso visual**. Cada una muestra: nombre, descripción de una línea, 2–4 indicadores de cabecera propios, y su estado (semáforo con ícono y texto). Toda la tarjeta es clicable, con foco visible y `aria-label` descriptivo.

**El home no se sobrecarga.** Primero el resumen ejecutivo, luego las tarjetas. El detalle se alcanza con clics, no amontonando información en la portada.

### Progresividad

Al abrir un módulo, la información se despliega progresivamente: primero los indicadores resumen, luego los filtros, luego la tabla. Nunca se muestra un muro de datos de golpe.

---

## 8. Patrones de componente

### Tablas
- Encabezado **fijo** al hacer scroll (`--shadow-md` cuando está pegado).
- Filas con **zebra sutil** o solo gridlines — nunca ambos.
- Hover de fila con `--color-surface-sunken`; fila seleccionada con `--color-primary-subtle` y borde izquierdo de 3px en `--color-primary`.
- **Columnas numéricas a la derecha con `tabular-nums`.** Texto a la izquierda. Nada centrado salvo íconos de estado.
- **Toda cifra monetaria lleva su moneda.** El código de moneda va en el encabezado de columna cuando toda la columna comparte moneda; en la celda cuando varía.
- **Importes negativos** con paréntesis o signo explícito, no solo color rojo — convención contable que estos usuarios ya conocen.
- Columnas de estado: **ícono + texto**, con el ancho reservado (§2.4).
- Acciones de fila alineadas a la derecha, en una columna fija.
- Densidad conmutable (§4.1).

### Badges de estado
Fondo sutil + texto/borde semántico + ícono. Nunca solo un punto de color. Radio `--radius-sm`, `--text-caption`, padding `2px 8px`.

### Drawer lateral
Ancho ~480px en desktop, pantalla completa en tablet vertical. `--shadow-lg`. Cierra con `Esc` y clic fuera. **El foco entra al abrir y vuelve al origen al cerrar.** Advierte si hay cambios sin guardar.

### Filtros
Barra sobre la tabla. Filtros activos como **chips removibles** con "limpiar todo". Contador de resultados siempre visible. Debounce de ~300ms en el buscador.

### Gráficos
- Paleta derivada de los tokens semánticos. **El color de una serie nunca contradice el significado del semáforo.**
- Ejes etiquetados, con unidad y moneda.
- Tooltips con el valor exacto formateado.
- **Sin decoración:** nada de 3D, donas para dos valores, ni animaciones que retrasen la lectura.
- Todo gráfico es clicable y filtra la tabla.
- Cuando una serie codifica estado, se refuerza con patrón o etiqueta además del color.

### Estados obligatorios
Toda vista que carga datos implementa **cuatro**:

| Estado | Requisito |
|---|---|
| **Carga** | Skeleton con la altura final del contenido (evita saltos de layout) |
| **Vacío** | Explica **por qué** está vacío y **qué hacer**. Nunca "No hay datos" a secas |
| **Error** | Qué falló, si es recuperable, y botón de reintento |
| **Con datos** | El contenido |

### Confirmaciones
Las acciones irreversibles o de consecuencia contable (confirmación final, marcar como validado, eliminar) requieren **diálogo de confirmación que describe la consecuencia concreta**, no un "¿Estás seguro?".

### Tooltips
Obligatorios para: definición de cada KPI, significado de cada tipo de inconsistencia, criterio de cada semáforo, y toda abreviatura del dominio. Accesibles por teclado (foco), no solo por hover.

---

## 9. Responsive

Desktop y tablet. **No hay versión móvil.**

| Rango | Comportamiento |
|---|---|
| ≥1440px | Layout completo, nav lateral expandida, todas las columnas |
| 1024–1439px | Nav lateral colapsada a íconos; columnas secundarias ocultables |
| 768–1023px (tablet) | Nav en menú desplegable; tablas con scroll horizontal y primera columna fija; drawer a pantalla completa |
| <768px | **No soportado.** Se muestra un mensaje explicativo, no un layout roto |

**En tablet el uso es táctil:** todo control interactivo debe alcanzar **44×44px de área táctil** aunque su tamaño visual sea menor (se logra con padding transparente). Es el punto que más se pasa por alto al diseñar en pantalla grande.

---

## 10. Movimiento

Sobrio y funcional. La animación **orienta**, no decora.

| Uso | Duración | Curva |
|---|---|---|
| Hover, foco, cambios de color | 120ms | `ease-out` |
| Drawer, dropdown, popover | 200ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Modal | 240ms | `cubic-bezier(0.16, 1, 0.3, 1)` |

- **Nada supera 300ms.** Una herramienta de uso diario no puede hacer esperar.
- Se anima `transform` y `opacity`, nunca `width`/`height`/`top`.
- **`prefers-reduced-motion: reduce` se respeta siempre**: las transiciones se reducen a cambios instantáneos.
- Las tablas **no** animan la entrada de filas: parpadearía en cada refetch.

---

## 11. Anti-"AI slop": lo que NO puede parecer

Esta aplicación no debe verse como una plantilla genérica generada por IA. Prohibido:

- **Gradientes morados/violeta**, y gradientes en general sobre superficies o botones.
- **Tarjetas flotantes con sombras grandes** por todas partes. Aquí la jerarquía es borde y superficie.
- **Emojis como íconos estructurales.** Se usa una librería de íconos vectoriales (Lucide o Phosphor), consistente en trazo y tamaño.
- **Íconos decorativos junto a cada título.**
- **Esquinas muy redondeadas** (>12px) en contenedores.
- **Ilustraciones genéricas** en estados vacíos. Un estado vacío es texto claro + acción, no un dibujo.
- **Texto centrado** en bloques de contenido; el contenido se alinea a la izquierda.
- **Mayúsculas decorativas** fuera de los encabezados de columna.
- **Micro-animaciones de entrada escalonadas** en listas y tarjetas.
- **Un color de acento por módulo.** Un solo sistema de color para toda la app.
- **Métricas inventadas de relleno** para que un dashboard "se vea completo". Si un dato no existe, se muestra el estado vacío.

Antes de construir cualquier pantalla nueva se consulta la skill **`frontend-design`**; para auditar una ya construida, **`web-design-guidelines`** vía el subagente `frontend-validator`.

---

## 12. Accesibilidad

Requisito, no mejora opcional. Referencia: **WCAG 2.2 nivel AA**.

### Contraste

| Elemento | Mínimo | Estado |
|---|---|---|
| Texto normal (<18pt / <14pt bold) | 4.5:1 | ✅ Todos los tokens `ink` activos |
| Texto grande | 3:1 | ✅ |
| Componentes de UI y gráficos | 3:1 | ✅ Con `--color-border-strong` y los sólidos semánticos |
| Gridlines decorativas | sin requisito | Excepción consciente documentada (`--color-border`) |
| Texto deshabilitado | exento (SC 1.4.3) | 2.56:1 (`--color-ink-disabled`), solo en controles inertes |

### Tamaños de click
WCAG 2.2 SC 2.5.8 exige **24×24px**. **`[DECISIÓN NUESTRA]`:** mínimo **32×32px** para controles interactivos, y 24×24px solo en filas de tabla en modo compacto, donde existe alternativa accesible (menú de acciones de fila). **En tablet, 44×44px de área táctil.**

### Foco
1. Todo elemento interactivo con indicador visible. Nunca `outline: none` sin sustituto.
2. Anillo de 2px en `--color-focus` (naranja de marca, 3.44:1 ✅) con 2px de offset.
3. El orden de tabulación sigue el orden visual.
4. Foco atrapado en modales; al cerrar, **vuelve al elemento que los abrió**.
5. Enlace "Saltar al contenido principal" como primer elemento enfocable.
6. En tablas, las celdas interactivas son alcanzables por teclado y los encabezados ordenables son **botones reales**, no `div` con `onClick`.

### Reglas específicas de este producto
1. **El color nunca es el único portador de significado** (WCAG 1.4.1). Obligatorio en todo semáforo — ver §2.4.
2. Columnas numéricas con `tabular-nums` y alineación derecha.
3. Tablas con `<caption>` o `aria-label` descriptivo.
4. Estados de carga anunciados con `aria-live="polite"`.
5. Errores de validación asociados al campo con `aria-describedby`, nunca comunicados solo con borde rojo.
6. Importes negativos con paréntesis o signo explícito, no solo color.

---

## 13. Preguntas abiertas

Ninguna se resuelve desde ingeniería o diseño en solitario.

### Bloqueantes — resolver antes de congelar este documento
1. **¿Existe un design system de Rappi accesible para herramientas internas?** Si existe, este documento se reescribe sobre sus tokens. → Design System
2. **¿Existe una librería de componentes React interna?** Nombre, registro y `.npmrc`. → Frontend Platform
3. **¿Cuál es la tipografía corporativa y tiene variante de numerales tabulares?** Afecta a todo el layout de tablas. → Design System / Brand
4. **¿Cuál es el hex oficial del naranja y su guía de uso?** ¿Hay variante oscurecida aprobada para uso funcional? → Brand

### De producto
5. ~~¿Es aceptable que la acción primaria sea azul y no naranja?~~ **Resuelta:** Producto definió naranja explícitamente (ADR-11). El documento ya refleja esa decisión.
6. **¿Volumen máximo de filas en provisiones?** Los mocks ya generan miles de filas (2.500+ Reporte A); falta decidir si la tabla real necesita virtualización con TanStack Virtual desde el inicio o puede esperar. → Product + Data
7. **¿Modo oscuro en v1?** Se recomienda posponerlo. → Product
8. **¿Los roles ven densidades distintas?** ¿La densidad es preferencia de usuario o atributo de rol? → Product
9. **¿Hay normativa de accesibilidad más allá de AA?** → Legal / Compliance
10. **¿Se imprimen o exportan a PDF estas vistas?** Si el cierre se archiva impreso, el hallazgo de §2.4 pasa de importante a crítico. → Contabilidad

---

## 14. Resumen accionable

Ya implementado en `src/styles/tokens.css` y `src/shared/ui/`:

- ✅ Paleta completa con contraste verificado y naranja de marca como acción primaria (ADR-11)
- ✅ Escala tipográfica y regla de numerales tabulares (Inter local, ADR-13)
- ✅ Espaciado, radios (tope 12px) y elevación
- ✅ Componentes base construidos a mano sobre estos tokens (`Boton`, `Badge`, `Semaforo`, `Tarjeta`, `Modal`, `Drawer`, `Tabla`…) — **no se ejecutó `shadcn@latest init`** en esta fase; ver ADR-14 sobre por qué y qué cambia si se retoma
- ✅ Reglas de accesibilidad, layout, estados y anti-slop, verificadas con `frontend-validator`
- ⛔ Sin nombres de paquetes internos de Rappi — no hay datos verificables
- ⚠️ Todo token de color y tipografía sujeto a revisión cuando Design System de Rappi responda

**Riesgo principal:** si Rappi tiene un design system interno y no se consulta, habrá retrabajo. El coste de preguntar es una conversación; el de no preguntar, un rediseño. Las preguntas 1–4 deberían salir cuanto antes.
