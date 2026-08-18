/**
 * Resumen ejecutivo del home. Ver .claude/docs/01-producto.md §7
 */
import { Link } from 'react-router'
import { AlertTriangle, CalendarClock, ClipboardList, ListTodo } from 'lucide-react'
import { Tarjeta } from '@/shared/ui/Tarjeta'
import { Semaforo } from '@/shared/ui/Semaforo'
import { formatearFecha, formatearPorcentaje } from '@/shared/utils/formato'
import type { ResumenEjecutivo as ResumenEjecutivoDatos } from '@/data/contracts'

interface EstadisticaProps {
  icono: typeof ClipboardList
  etiqueta: string
  valor: string
  href?: string
}

function Estadistica({ icono: Icono, etiqueta, valor, href }: EstadisticaProps) {
  const contenido = (
    <>
      <Icono className="size-5 text-ink-secondary" aria-hidden="true" />
      <div>
        {/* tabular-nums sin forzar alineación derecha: no es una celda de
            columna, es una cifra aislada — la regla de .claude/docs/03-diseno.md §3.2
            pide tabular-nums para toda cifra, y alineación derecha solo "en columna". */}
        <p className="text-h2 font-semibold text-ink tabular-nums">{valor}</p>
        <p className="text-caption text-ink-muted">{etiqueta}</p>
      </div>
    </>
  )

  if (href) {
    return (
      <Link
        to={href}
        className="flex items-center gap-3 rounded-card border border-border bg-surface p-4 hover:bg-surface-sunken"
      >
        {contenido}
      </Link>
    )
  }
  return <div className="flex items-center gap-3 rounded-card border border-border bg-surface p-4">{contenido}</div>
}

export function ResumenEjecutivo({ resumen }: { resumen: ResumenEjecutivoDatos }) {
  return (
    <section aria-label="Resumen ejecutivo del periodo" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-display font-semibold text-ink">Centro de control P2P</h1>
        <Semaforo tono={resumen.estadoGeneral.tono} etiqueta={resumen.estadoGeneral.etiqueta} />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Estadistica
          icono={AlertTriangle}
          etiqueta="Alertas críticas"
          valor={String(resumen.alertasCriticas)}
          href="/alertas"
        />
        <Estadistica
          icono={ListTodo}
          etiqueta="Pendientes de corrección"
          valor={String(resumen.pendientesCorreccion)}
          href="/reporteria"
        />
        <Estadistica
          icono={ClipboardList}
          etiqueta="Avance del checklist"
          valor={formatearPorcentaje(resumen.avanceChecklist)}
          href="/checklist"
        />
        <Estadistica
          icono={CalendarClock}
          etiqueta={
            resumen.diasParaCierre >= 0
              ? `Días para el cierre (${formatearFecha(resumen.fechaLimiteCierre)})`
              : 'Cierre vencido'
          }
          valor={String(Math.abs(resumen.diasParaCierre))}
        />
      </div>

      {resumen.riesgos.length > 0 && (
        <Tarjeta className="p-4">
          <h2 className="text-h3 font-semibold text-ink">Principales riesgos</h2>
          <ul className="mt-2 space-y-2">
            {resumen.riesgos.map((riesgo, indice) => (
              <li key={indice}>
                <Link
                  to={riesgo.rutaDestino}
                  className="flex items-center justify-between gap-2 rounded-control px-2 py-1.5 hover:bg-surface-sunken"
                >
                  <span className="text-body text-ink">{riesgo.titulo}</span>
                  <span className="text-caption text-ink-muted">{riesgo.detalle}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Tarjeta>
      )}

      {resumen.accionesPendientes.length > 0 && (
        <Tarjeta className="p-4">
          <h2 className="text-h3 font-semibold text-ink">Tus acciones pendientes</h2>
          <ul className="mt-2 space-y-2">
            {resumen.accionesPendientes.map((accion, indice) => (
              <li key={indice}>
                <Link
                  to={accion.rutaDestino}
                  className="flex items-center justify-between gap-2 rounded-control px-2 py-1.5 hover:bg-surface-sunken"
                >
                  <span className="text-body text-ink">{accion.titulo}</span>
                  <span className="text-caption text-ink-muted">{accion.detalle}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Tarjeta>
      )}
    </section>
  )
}
