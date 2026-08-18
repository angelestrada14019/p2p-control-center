# 12 — Bitácora de decisiones (ADR)

**Última actualización:** 2026-08-13 (ADR-16)

Registro de las decisiones estructurales del proyecto. Cada una explica **por qué**, no solo qué. Antes de cuestionar una decisión, léela: puede que la alternativa ya se haya descartado por una razón que sigue vigente.

**Formato:** una entrada por decisión, en orden cronológico. Estados: `Aceptada` · `Propuesta` · `Sustituida por ADR-XX` · `Revertida`.

---

## ADR-01 — Snowflake para reportes, Supabase para el core

**Fecha:** 2026-08-12 · **Estado:** Aceptada

**Contexto.** La aplicación necesita dos cosas distintas: leer los hechos contables que ya existen en los sistemas fuente (SAP, NS, TURBO) y persistir todo lo que el equipo genera encima de esos hechos (comentarios, estados, responsables, evidencias, confirmaciones).

**Decisión.** Dos orígenes con responsabilidades separadas: **Snowflake read-only** como fuente de los reportes, y **Supabase** como core transaccional. Se unen por clave de negocio `(periodo, compañía, documento, línea)`, no por foreign key entre bases.

**Consecuencias.**
- La app nunca escribe en Snowflake. Un hecho contable no se altera desde aquí.
- Las anotaciones sobreviven a cambios en la fuente. Si una fila desaparece de Snowflake, su anotación se muestra como "registro ya no presente en la fuente" en vez de desaparecer en silencio.
- Requiere una única función de derivación de clave, no duplicada.
- **Abre un problema sin resolver:** un frontend no puede conectarse a Snowflake con credenciales embebidas. Ver ADR-07.

**Detalle:** [04-datos](04-datos.md).

---

## ADR-02 — Identidad simulada, permisos reales

**Fecha:** 2026-08-12 · **Estado:** Aceptada

**Contexto.** No hay aún autenticación corporativa definida, pero el producto tiene 5 roles con permisos claramente distintos, y esos permisos son parte de lo que hay que validar con los usuarios.

**Decisión.** En el MVP, un **selector de rol** visible en el encabezado permite cambiar de identidad sin login. **Los permisos se implementan de verdad**: guards de ruta, visibilidad y habilitación de acciones, todo funcional. Solo la identidad es simulada.

**Alternativas descartadas.** Supabase Auth y Google SSO corporativo: ambos añaden tiempo de montaje sin aportar nada a la validación del producto en esta fase, y el SSO depende de configuración que no controlamos.

**Consecuencias.**
- Se puede probar cada rol en segundos, lo que acelera la validación con usuarios.
- El punto exacto donde se enchufa el auth real queda documentado en `src/auth/session.tsx`.
- **Riesgo asumido:** no debe desplegarse a un entorno accesible sin protección adicional mientras la identidad sea simulada. Ver [09-infraestructura](09-infraestructura.md).

---

## ADR-03 — GitHub Flow estricto

**Fecha:** 2026-08-12 · **Estado:** Aceptada

**Contexto.** Repositorio nuevo, sin commits, con equipo que crecerá.

**Decisión.** `master` → `main`. Toda tarea entra por rama con prefijo tipado y Pull Request con revisión y squash merge. Prohibido commit o push directo a `main`.

**Excepción única.** El commit inicial de bootstrap fue directo a `main` porque el repositorio no tenía commits y no existía base contra la cual abrir un PR. A partir de ahí la regla aplica sin excepciones.

**Alternativas descartadas.** Git Flow (demasiada ceremonia para un equipo de este tamaño); trunk-based sin PR (elimina la revisión, que aquí es valiosa porque el dominio contable es propenso a errores sutiles).

**Detalle:** [10-git-workflow](10-git-workflow.md).

---

## ADR-04 — No existe design system de Rappi accesible; se adopta un tema propio

**Fecha:** 2026-08-12 · **Estado:** Aceptada, sujeta a revisión

**Contexto.** Se pidió construir sobre los tokens oficiales del design system interno de Rappi. Se consultaron: las foundations del agente `rappi-dev-tools:designer` (no existen en este entorno), las skills instaladas (7, todas públicas de terceros), el plugin `rappi-dev-tools` (directorio de datos vacío), el registro npm (público, sin scope `@rappi` ni `.npmrc` privado) y la web (sin design system público).

**Decisión.** Se adopta un tema propio, `p2p-internal`, sobre una base neutra para densidad de datos. Todos los tokens quedan etiquetados como `[DECISIÓN NUESTRA]` o `[NO VERIFICABLE]`; ninguno como oficial. **No se inventó ningún nombre de paquete interno** de Rappi.

**Consecuencias.**
- Utilizable hoy, pero **sujeto a retrabajo** si aparece un design system oficial.
- Hay 4 preguntas bloqueantes abiertas para Design System / Brand / Frontend Platform. Ver [03-diseño §13](03-diseno.md).
- Si la respuesta es "no hay nada para herramientas internas", este documento pasa a ser la fuente de verdad y se reetiqueta.

---

## ADR-05 — Acción primaria azul, no naranja Rappi

**Fecha:** 2026-08-12 · **Estado:** Sustituida por ADR-11

> **Nota de 2026-08-12 (más tarde el mismo día):** Producto entregó un concepto estético explícito para el proyecto, con el naranja de marca como acción primaria — lo contrario de lo que proponía este ADR. Ver ADR-11. Esta entrada se conserva íntegra porque documenta un análisis de contraste real (el naranja sin ajustar falla AA) que sigue siendo relevante: ADR-11 no ignora este hallazgo, lo resuelve con un tratamiento distinto (texto slate en vez de blanco) en lugar de cambiar de color.

**Contexto.** Un producto Rappi invita a usar el naranja de marca como color de acción primaria.

**Evidencia medida.** El naranja `#FF441F` (valor que circula públicamente, **sin confirmar oficialmente**) da **3.44:1** contra blanco, en ambas direcciones. **No cumple WCAG AA** (4.5:1) para texto normal: un botón naranja con texto blanco es inaccesible. Además es un rojo-naranja, que en una pantalla donde el rojo significa "crítico" y el ámbar "requiere atención" compite directamente con el sistema de semáforos.

**Decisión.** Acción primaria en azul `#1D4ED8` (6.70:1 ✅). El naranja se reserva para logo, favicon y acento decorativo mínimo.

**Consecuencias.** La aplicación se verá menos "Rappi" de lo que alguien podría esperar. Es un intercambio deliberado: accesibilidad y claridad semántica sobre presencia de marca, en una herramienta interna que nadie externo verá.

**Pendiente.** Aval explícito de Product y Brand. Pregunta abierta: ¿existe un naranja oscurecido aprobado para uso funcional? Uno alrededor de `#B33518` alcanzaría AA, pero **alterar un color de marca sin aprobación no es una decisión nuestra**.

---

## ADR-06 — El color no puede ser el único portador del semáforo

**Fecha:** 2026-08-12 · **Estado:** Aceptada

**Contexto.** El producto usa semáforos verde/ámbar/rojo/gris por todas partes.

**Evidencia medida.** El contraste **entre** los colores del semáforo es de ~1.02:1 en todos los pares. Los cuatro estados tienen prácticamente la misma luminancia y se distinguen solo por tono. Para deuteranopía o protanopía (~8% de los hombres), o en impresión en escala de grises, **son indistinguibles**.

**Decisión.** Ningún semáforo comunica su estado solo con color. Cada indicador lleva siempre ícono con forma distinta o etiqueta de texto.

**Consecuencias.** Toda columna de estado reserva ancho para ícono + texto, no para un punto de color. Es una restricción de layout, no solo una recomendación estética. Cobra más peso si se confirma que las vistas se imprimen o exportan a PDF (pregunta abierta 10 de [03-diseño](03-diseno.md)).

---

## ADR-07 — El acceso a Snowflake requiere un intermediario servidor

**Fecha:** 2026-08-12 · **Estado:** Propuesta — pendiente de definir

**Contexto.** Vite inyecta toda variable `VITE_` en el bundle del cliente. Cualquier credencial de Snowflake puesta ahí queda visible para cualquiera que abra el navegador.

**Decisión propuesta.** El acceso a Snowflake pasará por un intermediario del lado servidor (Edge Function de Supabase o servicio backend) que autentique al usuario, aplique el filtro de ámbito por rol/país y consulte Snowflake con credenciales que nunca salen del servidor.

**Consecuencias.** Añade un componente que hoy no existe. **Bloquea toda integración real de reportes** hasta que se resuelva. Es la decisión técnica pendiente de mayor impacto.

---

## ADR-08 — shadcn/ui + TanStack Table como base de componentes

**Fecha:** 2026-08-12 · **Estado:** Aceptada

**Contexto.** No se pudo confirmar la existencia de una librería de componentes interna de Rappi (ADR-04). Hay que empezar con algo.

**Decisión.** **shadcn/ui + Radix UI** sobre Tailwind, y **TanStack Table v8** para las tablas.

**Por qué.** shadcn/ui **copia el código de los componentes al repositorio** en vez de instalarlos como dependencia. Si mañana aparece una librería oficial de Rappi, se migra componente por componente sin pelear contra una dependencia externa. Es la opción de **menor coste de reversión**, que es exactamente la propiedad que se necesita bajo esta incertidumbre. Radix aporta accesibilidad de teclado y ARIA ya resueltas.

**Alternativa descartada.** Material UI: lenguaje visual fuertemente opinado, costoso de sobrescribir, y densidad por defecto no pensada para tablas contables.

---

## ADR-09 — ui-ux-pro-max instalada tras auditoría

**Fecha:** 2026-08-12 · **Estado:** Aceptada

**Contexto.** La skill `ui-ux-pro-max` (312K instalaciones) **falló** la auditoría de Gen Agent Trust Hub en skills.sh, aunque pasó Socket y Snyk.

**Auditoría propia.** Se clonó el repositorio y se revisó con la skill `skill-auditor` sobre 9 categorías. Resultado: **🟡 CAUTION**, sin hallazgos maliciosos. Sin llamadas de red, sin exfiltración, sin ofuscación, sin dependencias externas (solo stdlib de Python), sin escalada de privilegios — de hecho prohíbe explícitamente ejecutar gestores de paquetes. Única advertencia: escribe `design-system/<slug>/MASTER.md` en el proyecto con `--persist`, comportamiento declarado, opt-in y no destructivo por defecto.

**Decisión.** Instalada, con la regla de ejecutarla siempre con `--output-dir` apuntando a la raíz del proyecto y **sin `--force`**, para que nunca pise decisiones de diseño ya tomadas.

**Nota.** El repositorio de origen contiene 7 skills; solo se instaló `ui-ux-pro-max`.

---

## ADR-10 — Modo oscuro pospuesto

**Fecha:** 2026-08-12 · **Estado:** Aceptada

**Contexto.** La paleta de modo oscuro está diseñada y con contrastes verificados.

**Decisión.** No se implementa en la v1. Duplica la matriz de QA visual y el producto es desktop/tablet en entorno de oficina.

**Consecuencias.** La paleta queda documentada en [03-diseño §2.6](03-diseno.md) para cuando se retome. Queda una deuda conocida: falta un `border-strong` de modo oscuro que alcance 3:1.

---

## ADR-11 — Naranja de marca como acción primaria, con texto slate

**Fecha:** 2026-08-12 · **Estado:** Aceptada · Sustituye a ADR-05

**Contexto.** Producto entregó un concepto estético explícito para el proyecto ("Interfaz clara, moderna... transmitir seguridad en operaciones financieras P2P mientras conserva el carácter accesible y dinámico de la marca Rappi"), con el naranja de marca (`#FF441F`) como color de acción primaria — lo opuesto a lo que proponía ADR-05.

**Decisión.** Se adopta el naranja como `--color-primary`, con tres ajustes de accesibilidad resueltos con cálculo real, no por intuición:

1. **El texto sobre el botón va en slate (`#0F172A`), nunca blanco.** Blanco sobre `#FF441F` da 3.44:1 y falla AA (4.5:1); slate da 5.18:1. Se ajusta el color del texto, no el naranja — así se conserva el hex de marca exacto.
2. **El verde menta de marca (`#10B981`) no es legible como texto** (2.54:1 sobre blanco). Se conserva para relleno decorativo y se añaden variantes oscuras (`success-ink` `#047857`, `success-solid` `#0B8457`) para texto y puntos de estado.
3. **Acción y estado se distinguen por tratamiento, no por tono.** El naranja de acción y el rojo de error dan 1.40:1 entre sí — casi indistinguibles solo por color. La regla: acción = relleno sólido + texto slate; estado = badge pastel + ícono. Nunca se usa el mismo tratamiento visual para ambos conceptos.

**Alternativas descartadas.** Oscurecer el naranja para poder usar texto blanco (p. ej. `#DB3210`, que sí cumple AA con blanco): se descartó porque alteraría el color de marca sin aprobación de Brand, exactamente lo que ADR-05 ya advertía que no nos corresponde decidir.

**Consecuencias.**
- El naranja ahora aparece en: botones primarios, foco de teclado, fila/tab seleccionado. Ver [03-diseño §6](03-diseno.md) para dónde SÍ y dónde NO.
- La navegación lateral usa naranja para el tab activo — es correcto bajo esta decisión (es una superficie de acción/navegación, no un estado del negocio), aunque contradice literalmente una frase de una versión anterior de 03-diseño ("nunca con naranja"), ya corregida en este mismo cambio.
- Todos los valores quedan verificados con tests automatizados de contraste (`src/styles/tokens.test.ts`, 33 casos) que fallan si un cambio futuro de color rompe alguno de estos tres ajustes.
- El hex `#FF441F` sigue sin confirmación oficial de Brand (ver pregunta abierta en [03-diseño §13](03-diseno.md)).

---

## ADR-12 — Tailwind CSS v4 con `@theme` y convención de sufijo "ink"

**Fecha:** 2026-08-12 · **Estado:** Aceptada

**Contexto.** Al inicializar el proyecto, la versión disponible de Tailwind es la 4, que reemplaza `tailwind.config.js` por un bloque `@theme` en CSS: cada variable `--color-X` dentro de `@theme` genera automáticamente las utilidades `bg-X`/`text-X`/`border-X`.

**Decisión.** Se adopta Tailwind v4 con configuración 100% CSS-first (`src/styles/tokens.css`), sin archivo de configuración JS. Los tokens de color de texto usan el sufijo **`ink`** en vez de `text` (`--color-ink`, `--color-ink-secondary`…) para que la utilidad generada sea `text-ink`, no el redundante y confuso `text-text`.

**Alternativas descartadas.** Tailwind v3 con `tailwind.config.js`: hubiera exigido mantener dos fuentes de verdad (el JS de configuración y el CSS de la app) para lo mismo.

**Consecuencias.**
- Un único archivo (`tokens.css`) es la fuente de verdad de todo el sistema de diseño, consistente con la instrucción de `03-diseño §0`.
- Cualquier persona que lea `tokens.css` puede predecir el nombre de la clase Tailwind resultante sin consultar documentación aparte.
- La escala de espaciado no usa tokens nombrados individualmente: un único `--spacing: 0.25rem` alimenta toda la escala numérica de Tailwind (`p-1`, `gap-4`...), ya alineada a la base de 4px pedida.

---

## ADR-13 — Inter servida localmente, no desde Google Fonts

**Fecha:** 2026-08-12 · **Estado:** Aceptada

**Contexto.** La tipografía elegida (Inter, ver [03-diseño §3.1](03-diseno.md)) necesita soporte de numerales tabulares y cero cortado. La forma más común de cargarla es un `<link>` a Google Fonts.

**Decisión.** Se sirve localmente vía el paquete `@fontsource-variable/inter`, importado en `src/styles/globals.css`.

**Alternativas descartadas.** Google Fonts por CDN: es una herramienta interna corporativa: no conviene una dependencia de red externa en cada carga de página, ni el tiempo de negociación TLS adicional que implica un origen distinto.

**Consecuencias.** La build incluye los archivos de fuente (~220KB en total, ver `dist/assets/inter-*.woff2` tras `npm run build`); a cambio, la aplicación no depende de que `fonts.googleapis.com` esté disponible ni de enviar la IP del usuario a un tercero en cada carga.

---

## ADR-14 — Componentes construidos a mano en vez de `shadcn@latest init`

**Fecha:** 2026-08-12 · **Estado:** Aceptada

**Contexto.** ADR-08 proponía shadcn/ui + Radix UI como base de componentes, por su bajo coste de reversión. Al construir la base técnica de esta fase, ejecutar `npx shadcn@latest init` de forma no interactiva era riesgoso: la CLI pregunta por estilo, color base y variables CSS, y asume un `tailwind.config.js` de Tailwind v3 — incompatible con el enfoque 100% `@theme` de ADR-12. Ejecutarla sin supervisión podía sobrescribir configuración de Tailwind ya funcionando.

**Decisión.** Se construyeron a mano los primitivos necesarios para esta fase (`Boton`, `Badge`, `Semaforo`, `Tarjeta`, `Modal`, `Drawer`, `Tooltip`, `Skeleton`, `EstadoVacio`, `EstadoError`, `Tabla`) en `src/shared/ui/`, consumiendo directamente los tokens de `tokens.css`. `Modal` y `Drawer` usan `<dialog>` nativo — resuelve gratis el atrapado de foco, `Esc` y el retorno de foco al origen, sin depender de Radix.

**Alternativas descartadas.** Ejecutar `shadcn@latest init` de todas formas: se descartó por el riesgo de romper la configuración de Tailwind v4 sin que hubiera una persona revisando el resultado interactivamente.

**Consecuencias.**
- Los componentes actuales son código propio del repositorio, sin dependencia de paquete externo — mantiene la propiedad de "bajo coste de reversión" que motivaba ADR-08, solo que por un camino distinto.
- **Pendiente:** correr `npx shadcn@latest init` interactivamente en una sesión de desarrollo (no automatizada) sigue siendo una opción válida más adelante; en ese caso, los componentes a mano se migran o conviven según convenga.
- No se adoptó Radix UI. Si un futuro componente necesita un patrón complejo que `<dialog>` nativo no resuelve (p. ej. un combobox con filtrado), evaluar Radix en ese momento.

---

## ADR-15 — Mutaciones de gestión como unión discriminada `CambioGestion`

**Fecha:** 2026-08-13 · **Estado:** Aceptada

**Contexto.** El drawer del Reporte A necesita registrar acciones de gestión heterogéneas sobre un mismo registro — comentario, cambio de estado, asignación de responsable, fecha compromiso, cambio de nivel de riesgo, corrección completada, adjunto — y cada una debe dejar **una** entrada de bitácora clara con su autor. Era el primer método de **escritura** del contrato `ProvisionesRepository` (hasta ahora, solo lectura).

**Decisión.** Un único método `actualizarGestion(clave, cambio: CambioGestion): Promise<Gestion>`, donde `CambioGestion` es una **unión discriminada por `tipo`** con una variante por acción.

**Alternativas descartadas.**
- **Un método por acción** (`asignarResponsable`, `cambiarEstado`, `cambiarRiesgo`…): multiplica la superficie del contrato en 7 métodos más, sin necesidad — todas comparten la misma forma ("cambio + autor + genera 1 entrada de bitácora").
- **`Partial<Gestion>` genérico:** permite mutaciones ambiguas (¿qué campo cambió y por qué se generó esta entrada de bitácora?) y no deja aplicar reglas específicas por tipo de cambio (p. ej. exigir comentario solo al pasar a "No aplica") sin lógica condicional dispersa.

**Consecuencias.**
- Añadir una nueva acción de gestión implica añadir un caso a la unión y a `crearEntrada`/`aplicarCambioGestion` (`data/mock/mutar-gestion.ts`), sin tocar la firma del contrato ni ningún componente de UI.
- El adaptador real (Supabase) implementará la misma unión: la UI no cambia al conectar datos reales, consistente con la regla de [04-datos §5.6](04-datos.md).
- El mock usa `new Date().toISOString()` para el timestamp de cada mutación — a diferencia del resto de `data/mock/`, que es determinista con semilla fija. Es una excepción **documentada**, no una regresión del principio de determinismo: simula una escritura ocurriendo ahora, no el universo base precargado.

---

## ADR-16 — Permisos por acción en `permisos.ts`, nunca checks de rol en componentes de UI

**Fecha:** 2026-08-13 · **Estado:** Aceptada

**Contexto.** Al construir el drawer del Reporte A, spec-guardian detectó que las acciones "Marcar como Validado" y "Cambiar nivel de riesgo" tenían su lógica de autorización hardcodeada dentro de los componentes de UI (`rol === 'controller' || rol === 'admin'`), en vez de delegarla a `auth/permisos.ts` como exige el patrón de `<Puede>`. La visibilidad del historial de auditoría también era incondicional, ignorando el permiso `ver-historial-auditoria` ya documentado en la matriz.

**Decisión.** Toda decisión de visibilidad o habilitación de una acción vive **exclusivamente** en la matriz de `auth/permisos.ts`, como acciones nombradas. Los componentes de UI solo consultan `<Puede accion="...">` o `usePuede(accion)` — nunca leen el rol directamente para decidir qué mostrar. Se añaden dos acciones explícitas a la matriz: `validar-registro` (admin y controller) y `cambiar-nivel-riesgo` (admin y controller).

**Alternativas descartadas.**
- **Mantener los checks de rol en los componentes:** multiplica los puntos donde se define quién puede hacer qué. Un cambio de regla de negocio requeriría rastrear todos los componentes afectados en vez de tocar solo la matriz. Es exactamente la causa raíz del defecto detectado.

**Consecuencias.**
- La matriz en `auth/permisos.ts` es la fuente de verdad única de todos los permisos. Auditar o cambiar cualquier regla requiere tocar un único archivo.
- Como regla de implementación: cualquier `if (rol === 'X')` dentro de un componente de UI para decidir si mostrar o deshabilitar una acción es un defecto, no una preferencia de estilo. El subagente `spec-guardian` lo verifica.
- El adaptador real de autenticación solo necesita conocer el rol del usuario; la lógica de qué puede hacer ese rol ya está centralizada y no depende del mecanismo de auth.

---

## Pendientes conocidos de esta fase (no bloquean, pero no se deben perder)

Registrados aquí en vez de en un ADR propio porque son deuda técnica reconocida, no decisiones cerradas:

- **Validación Zod en los adaptadores mock:** los esquemas existen (`src/data/contracts/*.ts`) pero ningún adaptador mock los invoca con `.parse()`/`.safeParse()` antes de devolver datos, como exige [04-datos §3.1](04-datos.md). No es bloqueante porque el propio generador construye los tipos, pero el adaptador real deberá validar de verdad.
- **`panel.contract.ts` sin esquemas Zod propios** (`Compania`, `Ambito`, `Alerta`, `ResumenEjecutivo`, `ResumenModulo`, `AvanceChecklist` son solo interfaces TS).
- **Navegación en tablet (768–1023px):** hoy colapsa a íconos, igual que en 1024–1439px. `03-diseño §9` documenta un patrón de "menú desplegable" específico para ese rango que no se implementó — no produce overflow ni rompe la usabilidad, pero no es el patrón exacto documentado.
- **"Acciones pendientes" del resumen ejecutivo no se filtran por rol/usuario activo** — es dato simulado genérico; se resuelve cuando el Módulo 3 real exista.
- **El centro de alertas (`/alertas`) se adelantó parcialmente**, fuera del alcance estrictamente acordado para esta fase (que era solo "AppShell + home navegable"). Se construyó porque el repositorio mock de alertas ya existía y el costo marginal era bajo. Cumple los cuatro estados de vista y usa `Semaforo` con ícono+texto, pero **no** implementa todavía lo que exige [08-alertas.md §4](08-alertas.md) en su totalidad: sin filtros por severidad/tipo/leída, sin agrupación por severidad+fecha, sin acción "marcar como leída". Se completa junto con el Módulo 3 o en una fase dedicada a Alertas.

---

## Plantilla para nuevas entradas

```markdown
## ADR-XX — <Título en una línea>

**Fecha:** YYYY-MM-DD · **Estado:** Aceptada | Propuesta | Sustituida por ADR-YY | Revertida

**Contexto.** <Qué situación obliga a decidir>

**Decisión.** <Qué se decidió>

**Alternativas descartadas.** <Y por qué>

**Consecuencias.** <Qué implica, incluidos los costes asumidos>
```
