# 04 — Capa de datos

**Última actualización:** 2026-08-13
**Relacionado:** [02-arquitectura](02-arquitectura.md) · [09-infraestructura](09-infraestructura.md) · [12-decisiones](12-decisiones.md)
**Guardián:** subagente `data-layer-guardian`

---

## 1. Estado actual: TODO ES SIMULADO

> **No existe ninguna integración real.** No hay conexión con SAP, NS, TURBO, Snowflake ni Supabase. Todos los datos que ve la aplicación provienen de `src/data/mock/`.
>
> Nunca afirmes —ni en la UI, ni en un comentario de código, ni en una respuesta al usuario— que un dato viene de un sistema real. Esta es una regla dura.

## 2. Arquitectura de dos orígenes

Cuando se conecten las fuentes reales, la aplicación leerá de **dos lugares distintos con responsabilidades distintas**:

```
┌──────────────────────────────────────────────────────────────┐
│                        Aplicación React                       │
│         (solo conoce contratos, nunca adaptadores)            │
└───────────────────────────┬──────────────────────────────────┘
                            │
                  src/data/contracts/
                            │
        ┌───────────────────┴────────────────────┐
        │                                        │
┌───────▼─────────────────┐          ┌───────────▼──────────────┐
│  SNOWFLAKE  (lectura)   │          │   SUPABASE  (lectura y   │
│                         │          │        escritura)        │
│ Fuente de los reportes: │          │ Core transaccional:      │
│ • SAP (Reporte A)       │          │ • Usuarios y roles       │
│ • NS  (Reporte B)       │          │ • Bitácora y comentarios │
│ • SAP TURBO (Reporte C) │          │ • Estados y responsables │
│ • No provisionables     │          │ • Checklist y evidencias │
│                         │          │ • Archivos adjuntos      │
│ READ-ONLY. La app nunca │          │ • Confirmación final     │
│ escribe en Snowflake.   │          │ • Historial de auditoría │
└─────────────────────────┘          └──────────────────────────┘
```

### Regla de frontera

- **Snowflake = el hecho contable.** Es la verdad de lo que pasó en los sistemas fuente. La aplicación **solo lee**. Un dato de Snowflake nunca se modifica desde la app.
- **Supabase = lo que el equipo hace con ese hecho.** Anotaciones, estados, responsables, evidencias, aprobaciones. Todo lo que genera el usuario vive aquí.
- **La unión se hace por clave de negocio**, no por foreign key entre bases: `(periodo, compañía, número de documento, línea)`. Ese identificador compuesto es lo que permite pegar una anotación de Supabase a una fila de Snowflake. Se define una única función de derivación de clave y **no se duplica**.

### Consecuencia importante

Una fila de reporte puede aparecer, cambiar o desaparecer en Snowflake entre dos consultas (porque el sistema fuente cambió). Las anotaciones en Supabase **sobreviven** a ese cambio. Cuando una anotación queda huérfana (su fila ya no existe en Snowflake), la app la muestra como **"registro ya no presente en la fuente"** en vez de ocultarla. Un comentario o una corrección jamás se borra en silencio.

## 3. Contratos

Todo acceso a datos pasa por una interfaz en `src/data/contracts/`. La interfaz es idéntica para el adaptador mock y para el real; el consumidor no puede distinguirlos.

```ts
// src/data/contracts/provisiones.contract.ts
export interface ProvisionesRepository {
  /** Reporte A — SAP, provisiones registradas (OVH) */
  listarRegistradasSap(q: ConsultaReporte): Promise<Pagina<ProvisionSap>>;
  /** Reporte B — NS, provisiones proyectadas a fin de mes (OVH) */
  listarProyectadasNs(q: ConsultaReporte): Promise<Pagina<ProvisionNs>>;
  /** Reporte C — SAP TURBO, provisiones registradas (TURBO) */
  listarRegistradasTurbo(q: ConsultaReporte): Promise<Pagina<ProvisionTurbo>>;
  /** Pestaña global de exclusiones, unificada SAP + NS + TURBO */
  listarNoProvisionables(q: ConsultaReporte): Promise<Pagina<RegistroNoProvisionable>>;
  /** Única puerta de escritura sobre la gestión (bitácora, estado, riesgo…) de un registro */
  actualizarGestion(clave: ClaveNegocio, cambio: CambioGestion): Promise<Gestion>;
}
```

### 3.1 El primer método de escritura del contrato

Desde el Reporte A, `ProvisionesRepository` ya no es de solo lectura: `actualizarGestion` es la **única puerta** por la que cualquier acción del drawer (comentario, cambio de estado, asignación, fecha compromiso, cambio de riesgo, corrección completada, adjunto) modifica el campo `gestion` de un registro.

`CambioGestion` (en `data/contracts/provisiones.contract.ts`) es una **unión discriminada por `tipo`**, no un `Partial<Gestion>` genérico ni un método por acción — ver [ADR-15](12-decisiones.md). Cada variante obliga a declarar exactamente lo que cambió y quién lo hizo, y cada llamada genera **una** entrada de bitácora interpretable.

El mock que la implementa hoy (`data/mock/mutar-gestion.ts`) simula la escritura real: a diferencia del resto de `data/mock/` (determinista, semilla fija, sin `new Date()`), esta función sí usa `new Date().toISOString()` porque representa un INSERT ocurriendo ahora mismo — el mismo comportamiento que tendrá el adaptador real contra Supabase. También aplica ya la regla de negocio que exigirá el backend real: un `cambio-estado` hacia un estado de `ESTADOS_QUE_EXIGEN_COMENTARIO` (hoy, "No aplica") se rechaza si no llega un comentario.

Reglas de los contratos:

1. **Un esquema Zod por entidad**, en el mismo archivo que su tipo. El adaptador valida la respuesta contra el esquema antes de devolverla. Un dato malformado falla fuerte y visible, no se propaga silenciosamente hasta una celda.
2. **Paginación siempre.** Ningún método devuelve un array crudo; devuelve `Pagina<T>` con `items`, `total`, `pagina`, `porPagina`.
3. **Los filtros son parte del contrato** (`ConsultaReporte`), no se aplican en el cliente sobre un dataset completo.
4. **Nada de tipos `any`.** Si no se conoce la forma de un campo, se modela como `unknown` y se valida.

## 4. Selección de adaptador

```ts
// src/data/index.ts — ÚNICO archivo que conoce los adaptadores
const fuente = import.meta.env.VITE_DATA_SOURCE ?? 'mock';

export const repositorios: Repositorios =
  fuente === 'mock' ? crearRepositoriosMock() : crearRepositoriosReales();
```

Ningún otro archivo del proyecto importa desde `data/mock/`, `data/snowflake/` o `data/supabase/`.

---

## 5. REGLA DE DATOS SIMULADOS

Esta es la regla completa. Se aplica sin excepciones.

### 5.1 Aislamiento
Todo dato simulado vive **exclusivamente** en `src/data/mock/`. No hay arrays de ejemplo dentro de componentes, hooks ni páginas. Cero.

### 5.2 Marcado de fronteras
Cada punto donde un dato simulado sustituye a uno real lleva un comentario greppable:

```ts
// @mock-boundary: Snowflake — vista SAP_PROVISIONES_REGISTRADAS
// @mock-boundary: Supabase — tabla bitacora_registros
```

Verificación en cualquier momento:

```bash
grep -rn "@mock-boundary" src/
```

### 5.3 Honestidad visible
Mientras `VITE_DATA_SOURCE=mock`:
- Se muestra un **badge permanente "Datos simulados"** en el encabezado, visible en todas las pantallas.
- La fecha de "última actualización" indica que es simulada.
- Ninguna pantalla, tooltip o texto de ayuda dice o insinúa que hay conexión con SAP, NS, TURBO, Snowflake o Supabase.

### 5.4 Realismo obligatorio
Los mocks no son datos de relleno. Deben incluir:
- **Varios países** (mínimo: Colombia, México, Brasil, Chile, Perú, Argentina) y varias compañías por país.
- **Varias monedas** (COP, MXN, BRL, CLP, PEN, ARS, USD) con órdenes de magnitud realistas para cada una.
- **Proveedores, centros de costo y cuentas contables** variados y verosímiles.
- **Responsables** distintos, incluidos registros **sin responsable asignado**.
- **Casos correctos** — la mayoría de las filas deben estar bien.
- **Al menos un caso de cada tipo de inconsistencia** documentado en [05-modulo-1-reporteria.md](05-modulo-1-reporteria.md): duplicado, faltante, diferencia de valor, cuenta contable incorrecta, centro de costo incorrecto, sin orden de compra, de otro periodo, sin responsable.
- **Todos los niveles de riesgo** (crítico, alto, medio, bajo) y **todos los estados** del ciclo de vida.
- **Bitácoras con historial**: comentarios de varios autores en distintas fechas, con cambios de estado intercalados.
- Volumen suficiente para que la paginación y los filtros se ejerciten de verdad (orden de miles de filas, no docenas).

Los mocks son **deterministas**: misma semilla, mismos datos. Nada de `Math.random()` sin semilla — un reporte que cambia en cada refresh es imposible de revisar.

### 5.5 Moneda
- **Todo valor monetario se muestra siempre con su moneda.** No hay cifras desnudas.
- **Nunca se suman monedas distintas** sin conversión explícita. Un total mixto o se convierte a una moneda de reporte declarada, o no se muestra.
- Cuando hay conversión, se indica la **moneda de reporte y la tasa/fecha** usada.
- Los valores se alinean a la derecha con dígitos tabulares y separadores de miles según el locale `es`.

### 5.6 Cómo salir de los mocks

Procedimiento obligatorio. **No se altera ni un componente de UI para conectar datos reales**; si hace falta tocar la UI, la capa de datos estaba mal diseñada.

1. Implementar el adaptador (`data/snowflake/` o `data/supabase/`) contra el **mismo contrato** existente.
2. Escribir tests del adaptador que validen la respuesta contra el esquema Zod.
3. Configurar las variables de entorno del entorno correspondiente (ver [09-infraestructura](09-infraestructura.md)). **Ningún secreto en el repositorio.**
4. Cambiar `VITE_DATA_SOURCE` a `real` en ese entorno.
5. Ejecutar el subagente **`data-layer-guardian`**, que verifica: no quedan importaciones a `data/mock/` fuera de `data/index.ts`, no quedan `@mock-boundary` sin resolver en las rutas migradas, y ninguna pantalla cambió.
6. Retirar el badge "Datos simulados" **solo cuando todas las fuentes de esa pantalla sean reales**. Si una pantalla mezcla datos reales y simulados, el badge se mantiene y se indica cuál parte es simulada.
7. Actualizar este documento y [12-decisiones.md](12-decisiones.md) con la fecha del cambio.

### 5.7 Lo que está prohibido
- Afirmar, en cualquier medio, que existe una integración que no existe.
- Poner datos de ejemplo fuera de `src/data/mock/`.
- Usar credenciales reales en el código o en archivos versionados.
- Copiar datos productivos reales (proveedores, montos, documentos) a los mocks. Los mocks son **inventados y verosímiles**, no un extracto de producción.
- Sumar monedas distintas sin declararlo.

---

## 6. Notas sobre las fuentes

### Snowflake
- Acceso **read-only**. La app no crea, actualiza ni borra nada.
- Los reportes se consumirán como vistas o tablas ya modeladas; la app **no** hace lógica de transformación pesada en el cliente.
- Falta definir: nombres de las vistas, política de refresco (¿cada cuánto se actualiza la data de SAP en Snowflake?), y el mecanismo de autenticación desde el frontend. Un frontend no debe conectar directo a Snowflake con credenciales embebidas; lo más probable es que se necesite un intermediario (Edge Function de Supabase o servicio backend). **Esto está pendiente de decisión** — ver [12-decisiones.md](12-decisiones.md).

### Supabase
- Proyecto configurado en `.mcp.json` (`project_ref` visible, **sin credenciales**).
- Requiere **RLS activo** en todas las tablas. Sin RLS, cualquier usuario autenticado ve todo. Las políticas deben filtrar por rol y por país/compañía asignados al usuario.
- Antes de escribir cualquier SQL, migración o política, se consulta la skill `supabase-postgres-best-practices`.
- Almacenamiento de evidencias del checklist en Supabase Storage, con política de acceso por rol.

### NS
- **"NS" es el nombre de la fuente, no del sistema.** El sistema exacto y su mecanismo de integración están **por confirmar**. Se documenta como identificador de origen y se mantiene el nombre hasta que el negocio lo aclare.

## 7. Preguntas abiertas

| # | Pregunta | Impacto |
|---|---|---|
| 1 | ¿Qué sistema es realmente "NS" y cómo se integra? | Define el adaptador del Reporte B |
| 2 | ¿Cómo autentica el frontend contra Snowflake sin exponer credenciales? | Puede requerir un backend intermedio |
| 3 | ¿Con qué frecuencia se refresca la data de SAP en Snowflake? | Define el texto de "última actualización" y la política de caché |
| 4 | ¿La conversión de moneda usa una tasa del sistema fuente o una tasa de reporte propia? | Define si se pueden mostrar totales consolidados |
| 5 | ¿Qué retención necesita el historial de auditoría? | Define el modelo de la bitácora en Supabase |
