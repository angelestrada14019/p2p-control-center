# 06 — Módulo 2: KPIs del proceso P2P

**Última actualización:** 2026-08-12
**Relacionado:** [01-producto](01-producto.md) · [05-módulo 1](05-modulo-1-reporteria.md) · [03-diseño](03-diseno.md)
**Subagente:** `m2-kpis`

---

## 1. Alcance dentro de ESTA aplicación

> **El dashboard de KPIs vive en otra aplicación.** En P2P Control Center, el Módulo 2 es una **tarjeta que redirige** a esa app externa.

Lo que se construye aquí:
- La tarjeta del módulo en el home, con el mismo peso visual que las otras dos.
- Un **resumen mínimo** en la tarjeta (3–4 indicadores de cabecera) para que el usuario sepa si vale la pena entrar.
- La **redirección** a la app externa, en pestaña nueva, con el contexto actual (periodo, compañía, país) propagado si la app destino lo admite.
- Estado explícito cuando la URL de destino no está configurada: se explica que el dashboard aún no está enlazado, **no** se muestra un enlace roto.

**La URL de destino es configurable por entorno** (`VITE_KPIS_URL`), nunca hardcodeada. Ver [09-infraestructura](09-infraestructura.md).

El resto de este documento describe **qué contendrá la app externa**. Se documenta aquí porque define el vocabulario compartido, los cálculos que el Módulo 1 debe poder alimentar, y porque el checklist referencia varios de estos indicadores.

---

## 2. Los KPIs

18 indicadores mínimos para monitorear el proceso diariamente y durante el cierre.

### Provisiones — volumen y cobertura

| # | KPI | Definición | Fuente |
|---|---|---|---|
| 1 | Valor total de provisiones registradas | Suma de provisiones contabilizadas en SAP en el periodo | Reporte A |
| 2 | Valor total de provisiones proyectadas | Suma de provisiones estimadas a fin de mes | Reporte B |
| 3 | Diferencia registradas vs proyectadas | KPI 1 − KPI 2 | A y B |
| 4 | % de registradas frente a proyectadas | KPI 1 / KPI 2 | A y B |
| 5 | Número y valor de provisiones pendientes | Proyectadas que aún no se registran | A y B |

### Calidad del registro

| # | KPI | Definición | Fuente |
|---|---|---|---|
| 6 | Número y valor de posibles duplicados | Registros marcados como duplicado | Módulo 1 |
| 7 | Registros con inconsistencias | Total de registros con al menos una inconsistencia | Módulo 1 |
| 8 | Registros corregidos | Registros que pasaron a Corregido o Validado | Módulo 1 |
| 9 | % de correcciones completadas | KPI 8 / KPI 7 | Módulo 1 |
| 10 | Registros sin orden de compra | Inconsistencia tipo 6 | Módulo 1 |
| 11 | Registros con cuenta contable incorrecta | Inconsistencia tipo 4 | Módulo 1 |
| 12 | Registros con centro de costo incorrecto | Inconsistencia tipo 5 | Módulo 1 |
| 13 | Registros de periodos anteriores | Inconsistencia tipo 7 | Módulo 1 |

### Gestión de pendientes

| # | KPI | Definición | Fuente |
|---|---|---|---|
| 14 | Pendientes por responsable | Distribución de pendientes abiertos por persona | Módulo 1 |
| 15 | Pendientes por nivel de riesgo | Distribución por crítico/alto/medio/bajo | Módulo 1 |
| 16 | Aging de los pendientes | Antigüedad en días desde la detección | Módulo 1 |

### Cierre

| # | KPI | Definición | Fuente |
|---|---|---|---|
| 17 | Avance del checklist de precierre | % de controles completados sobre los obligatorios | Módulo 3 |
| 18 | Cumplimiento dentro de la fecha límite | % de actividades completadas antes de su fecha límite | Módulo 3 |

---

## 3. Ficha de cada KPI

Todo KPI se presenta con, como mínimo:

| Atributo | Descripción |
|---|---|
| **Nombre** | |
| **Valor actual** | Con su unidad y, si es monetario, su moneda |
| **Meta** | Objetivo definido para el periodo |
| **Periodo anterior** | Resultado del mes previo |
| **Variación** | Diferencia contra el periodo anterior, absoluta y relativa |
| **Tendencia** | Dirección en los últimos periodos |
| **Semáforo** | Verde / amarillo / rojo / gris |
| **Definición** | Explicación breve, disponible en tooltip |
| **Fuente** | De dónde sale el dato |
| **Última actualización** | Fecha y hora |
| **Detalle** | El KPI es **clicable** y lleva al detalle de los registros que lo componen |

La regla del clic es importante: un KPI que no se puede abrir para ver qué lo compone es un número sin utilidad operativa.

---

## 4. Semáforos

| Color | Significado |
|---|---|
| **Verde** | Dentro de la meta |
| **Amarillo** | Requiere atención |
| **Rojo** | Crítico |
| **Gris** | Sin información o no aplica |

Reglas:
- **El color nunca va solo.** Cada semáforo lleva etiqueta de texto y/o ícono. Un daltónico debe poder leer el estado.
- **Gris no es "cero".** Gris significa que no hay dato. Un KPI en cero se muestra en el color que le corresponda según su meta.
- Los umbrales de cada semáforo son **configurables por `admin`** y se documentan junto al KPI.

---

## 5. Filtros

Periodo · País · Compañía · Unidad de negocio · Responsable · Tipo de provisión

Los filtros son consistentes con los del Módulo 1: mismos catálogos, mismos nombres, mismo comportamiento.

---

## 6. Composición del dashboard

Combina cuatro elementos, en este orden de prioridad:

1. **Tarjetas de indicador** — el valor, su meta, su variación y su semáforo.
2. **Gráficos de tendencia** — evolución del indicador en el tiempo.
3. **Barras comparativas** — entre países, compañías, responsables o contra la meta.
4. **Tablas de detalle** — el respaldo del número.

> **Se prohíben los gráficos decorativos.** Si un gráfico no ayuda a tomar una decisión, no va. Nada de gráficos de dona para dos valores, ni 3D, ni animaciones que retrasen la lectura.

### Comparaciones que deben existir
- Periodo actual **vs** periodo anterior
- Resultado real **vs** meta
- Provisiones registradas **vs** proyectadas
- Resultados **entre países o compañías**

---

## 7. Reglas de moneda

Aplican íntegramente las de [04-datos §5.5](04-datos.md): todo valor monetario lleva su moneda, y ningún consolidado mezcla monedas sin declarar la moneda de reporte y la conversión aplicada. Un KPI que agrega varios países **debe** declarar en qué moneda está expresado.

---

## 8. Criterios de aceptación (para el módulo en esta app)

- [ ] La tarjeta del Módulo 2 aparece en el home con el mismo peso que las otras dos.
- [ ] Muestra un resumen mínimo de 3–4 indicadores de cabecera.
- [ ] Redirige a `VITE_KPIS_URL` en pestaña nueva, propagando el contexto si es posible.
- [ ] Si la URL no está configurada, muestra un estado explicativo, no un enlace roto.
- [ ] La URL nunca está hardcodeada en el código.
