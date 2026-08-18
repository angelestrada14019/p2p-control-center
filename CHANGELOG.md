# Changelog

Registro de cambios notables del proyecto. Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

Categorías: `Añadido` · `Cambiado` · `Corregido` · `Eliminado` · `Documentación`

---

## [Sin publicar]

### Añadido — Módulo 1: Reporte A (SAP, vista OVH)

- **Reporte A completo** (`src/features/reporteria/`): tabla con filtros (país, estado, riesgo, tipo de inconsistencia, compañía, proveedor, cuenta contable, centro de costo, responsable, rango de fechas), buscador con debounce y ordenamiento por columna, todo reflejado en la URL; indicadores resumen; flagging de 1 clic por fila; drawer de detalle/bitácora con navegación anterior/siguiente y advertencia de nota sin guardar.
- **Acciones de gestión del drawer**: cambiar estado (con comentario obligatorio en "No aplica" y confirmación para transiciones terminales), asignar responsable, registrar fecha compromiso, cambiar nivel de riesgo, marcar corrección completada, adjuntar evidencia (solo metadata en bitácora — sin backend de archivos todavía). Cada una gateada por permiso, con tooltip explicativo cuando no aplica.
- **Rutas anidadas reales** para el Módulo 1 (`/reporteria` → `/reporteria/registro` → `/reporteria/registro/{sap-ovh,ns-ovh,turbo}`, más `/reporteria/no-provisionable`), reemplazando el comodín placeholder. Solo `sap-ovh` está implementado; el resto responde con una página "en construcción" explicativa.
- **Segmentación de sub-perfil** (`GuardSubperfil`): Controller OVH ve Reportes A/B, Controller TURBO ve solo C, admin ve ambos. El acceso directo por URL a un alcance no permitido muestra un estado explicativo, no un error.
- **Primer método de escritura del contrato de datos**: `actualizarGestion(clave, cambio)`, con `CambioGestion` como unión discriminada por tipo de acción (ver ADR-15). El mock simula la escritura en memoria con timestamp real, aplicando ya la regla de comentario obligatorio para "No aplica".
- `Tabla` y `Drawer` (`src/shared/ui/`) ganan soporte de ordenamiento por columna y navegación anterior/siguiente respectivamente, reutilizables por cualquier feature.

### Añadido — base técnica y home navegable

- **Proyecto inicializado**: Vite + React 19 + TypeScript en modo `strict` + Tailwind CSS v4 (configuración 100% `@theme`, ver ADR-12). ESLint(oxlint)/Prettier/Vitest configurados; build de producción verificado.
- **Sistema de tokens** (`src/styles/tokens.css`): paleta completa con el naranja de marca Rappi como acción primaria (ADR-11), tipografía Inter servida localmente (ADR-13), espaciado, radios y elevación. 33 tests automatizados (`tokens.test.ts`) recalculan cada contraste con la fórmula WCAG y fallan si un cambio de color rompe la accesibilidad.
- **Capa de datos completa** (`src/data/`): contratos con Zod para los tres reportes y el panel/alertas; generadores mock deterministas (semilla fija, sin `Math.random()` ni `new Date()` reales) con ~5.700 filas simuladas cubriendo 9 países, 9 monedas y los 8 tipos de inconsistencia del Módulo 1; adaptadores mock para provisiones, panel y alertas. 18 tests de integridad del universo simulado.
- **Sesión y permisos** (`src/auth/`): selector de rol simulado (5 roles, sub-perfil OVH/TURBO para Controller) con matriz de permisos real aplicada vía `<Puede>`.
- **Componentes compartidos** (`src/shared/ui/`) construidos a mano sobre los tokens (ADR-14): `Boton`, `Badge`, `Semaforo`, `Tarjeta`, `Modal`, `Drawer`, `Tooltip`, `Skeleton`, `EstadoVacio`, `EstadoError`, `Tabla`, selectores de ámbito/periodo/rol.
- **AppShell y home navegable**: encabezado fijo con selectores, indicador general de estado, badge de datos simulados y campana de alertas; navegación lateral con auto-colapso responsive (íconos a 1024–1439px, expandida desde 1440px); home con resumen ejecutivo y las tres tarjetas de módulo; páginas placeholder explicativas para Reportería, KPIs y Checklist; centro de alertas funcional.
- Bloqueo explícito de anchos menores a 768px con mensaje explicativo, en vez de un layout roto.

### Corregido

- Los checks de "quién puede validar un registro" y "quién puede cambiar su nivel de riesgo" estaban hardcodeados por rol dentro de componentes de UI (`rol === 'controller' || rol === 'admin'`), en vez de vivir en la matriz única de `auth/permisos.ts` como exige [02-arquitectura](.claude/docs/02-arquitectura.md). Ahora son dos acciones de la matriz (`validar-registro`, `cambiar-nivel-riesgo`).
- La vista del historial de bitácora era visible para cualquier rol sin excepción; ahora respeta el permiso `ver-historial-auditoria` ya documentado en la matriz.
- IDs de compañía duplicados entre Colombia y Costa Rica (ambos derivaban el prefijo con `slice(0,2)` → "CO"), que rompía la clave de negocio y las `key` de React en los selectores. Ahora usa prefijos ISO 3166-1 alpha-2 explícitos.
- El avance del checklist mostraba 42% en un lugar y 36% (4/11) en otro, por dos literales desincronizados en el mock del panel. Consolidado a una única fuente.
- `--radius-modal` en 16px violaba el propio límite del anti-slop (>12px) definido en `03-diseno.md` §11. Reducido a 12px.
- Seis hallazgos bloqueantes de accesibilidad encontrados por `frontend-validator` (tamaños de click por debajo de 32px en selectores y botones de cerrar, `Tabla` sin `<caption>` ni estado de error, clic-fuera-para-cerrar ausente en Modal/Drawer, estado "cargando" infinito ante un error de red, hueco en los cuatro estados de la página de alertas) — todos corregidos y reverificados en navegador.
- Formato de moneda y fecha ad-hoc (`toLocaleString`/`toLocaleDateString`) en dos adaptadores mock, reemplazado por las utilidades centralizadas de `shared/utils/formato.ts`.
- Niveles de riesgo "crítico" y "alto" compartían el mismo tono visual (`error`), haciéndolos indistinguibles; ahora usan 4 tonos distintos.

### Documentación

- `05-modulo-1-reporteria.md` actualizado con un estado de implementación explícito (Reporte A construido; B, C, "No Provisionable", comparación SAP vs NS, vistas guardadas, exportación y gráficos, pendientes) y la ruta real del Reporte A.
- `02-arquitectura.md` §6 actualizado con la tabla de rutas anidadas real del Módulo 1.
- `01-producto.md` §5 gana dos filas en la matriz de permisos ("Marcar registro como Validado", "Cambiar nivel de riesgo") que ya existían en `05-modulo-1-reporteria.md` §11 pero no estaban en la matriz general.
- `04-datos.md` §3 documenta el primer método de escritura del contrato (`actualizarGestion`) y la excepción de determinismo en su mock (usa la fecha real, a diferencia del resto de `data/mock/`).
- **ADR-15 registrado**: unión discriminada `CambioGestion` para las mutaciones de gestión, en vez de un método por acción o un `Partial<Gestion>` genérico.
- **ADR-16 registrado**: toda lógica de permiso vive en `auth/permisos.ts` como acciones nombradas; cualquier `if (rol === 'X')` en un componente de UI para decidir visibilidad de acciones es un defecto. Decisión disparada por la corrección de `validar-registro` y `cambiar-nivel-riesgo`.
- **Trece documentos** en `.claude/docs/`, establecidos como fuente de verdad del proyecto: índice, producto, arquitectura, diseño, datos, un documento por módulo, alertas, infraestructura, flujo de Git, agentes y reglas, y bitácora de decisiones.
- **Diez decisiones registradas** en `12-decisiones.md` (ADR-01 a ADR-10).
- Hallazgo relevante documentado en `03-diseno.md`: **no se encontró ningún design system oficial de Rappi accesible** en este entorno. Todos los tokens quedan etiquetados como decisión de equipo, no como norma corporativa, con cuatro preguntas bloqueantes abiertas para Design System, Brand y Frontend Platform.
- Hallazgo de accesibilidad documentado: el naranja de marca no alcanza contraste AA (3.44:1) y los cuatro colores de semáforo tienen contraste de ~1.02:1 entre sí, lo que obliga a que ningún estado se codifique solo con color.
- **`03-diseno.md` reescrito** (§2, §4.2, §4.3, §5.2, §6, §7, §12, §13, §14) para reflejar la paleta naranja realmente implementada, con todos los contrastes recalculados sobre los valores finales — la versión anterior documentaba una propuesta de acción primaria azul que nunca se construyó.
- **Cuatro decisiones nuevas registradas** en `12-decisiones.md` (ADR-11 a ADR-14): naranja como acción primaria, Tailwind v4 con `@theme`, Inter local, y componentes construidos a mano en vez de `shadcn@latest init`. ADR-05 marcada como sustituida por ADR-11.
- Pendientes conocidos registrados explícitamente (no bloquean esta fase): validación Zod no aplicada en los adaptadores mock, `panel.contract.ts` sin esquemas Zod propios, menú desplegable de navegación en tablet no implementado, acciones pendientes del resumen ejecutivo sin filtrar por rol.

---

## Formato de las entradas

Escribe para alguien que lea este archivo dentro de seis meses sin contexto de la conversación. Una entrada útil dice qué cambió y por qué importa, no solo qué archivo se tocó.
