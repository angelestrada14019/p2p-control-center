/**
 * Encabezado fijo de la aplicación. Ver .claude/docs/01-producto.md §7 y
 * .claude/docs/03-diseno.md §7
 */
import { Bell } from 'lucide-react'
import { Link } from 'react-router'
import { SelectorRol } from '@/auth/SelectorRol'
import { USANDO_DATOS_SIMULADOS } from '@/data'
import { Badge } from '@/shared/ui/Badge'
import { Semaforo } from '@/shared/ui/Semaforo'
import { SelectorAmbito } from '@/shared/ui/SelectorAmbito'
import { SelectorPeriodo } from '@/shared/ui/SelectorPeriodo'
import { useAlertasNoLeidas, useResumenEjecutivo } from '@/shared/hooks/use-panel'
import { formatearRelativo } from '@/shared/utils/formato'

const ETIQUETA_ENTORNO: Record<string, string> = {
  local: 'Local',
  preview: 'Preview',
  staging: 'Staging',
  prod: 'Producción',
}

function Separador() {
  return <div className="h-5 w-px bg-border-strong" aria-hidden="true" />
}

export function Encabezado() {
  const { data: resumen } = useResumenEjecutivo()
  const { data: noLeidas = 0 } = useAlertasNoLeidas()
  const entorno = import.meta.env.VITE_APP_ENV

  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-6 py-3">
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2">
          {/* Acento decorativo mínimo de marca — ver .claude/docs/03-diseno.md §6 */}
          <span className="h-6 w-1.5 rounded-full bg-primary" aria-hidden="true" />
          <span className="text-h3 font-semibold text-ink">P2P Control Center</span>
        </Link>

        {/* Indicador general del estado del proceso — visible en toda pantalla,
            no solo en el home. Ver .claude/docs/01-producto.md §7 */}
        {resumen && <Semaforo tono={resumen.estadoGeneral.tono} etiqueta={resumen.estadoGeneral.etiqueta} />}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Periodo: primer contexto global, más relevante para el seguimiento diario */}
        <SelectorPeriodo />

        <Separador />

        <SelectorAmbito />

        {(entorno && entorno !== 'prod') || USANDO_DATOS_SIMULADOS ? (
          <div className="flex items-center gap-2">
            {entorno && entorno !== 'prod' && (
              <Badge className="bg-neutral-subtle text-neutral-ink">
                {ETIQUETA_ENTORNO[entorno] ?? entorno}
              </Badge>
            )}
            {USANDO_DATOS_SIMULADOS && (
              <Badge className="bg-warning-subtle text-warning-ink">Datos simulados</Badge>
            )}
          </div>
        ) : null}

        {resumen && (
          <span className="text-caption text-ink-muted">
            Actualizado {formatearRelativo(resumen.ultimaActualizacion)}
          </span>
        )}

        <Separador />

        <Link
          to="/alertas"
          className="relative flex size-8 items-center justify-center rounded-control text-ink-secondary hover:bg-surface-sunken hover:text-ink"
          aria-label={noLeidas > 0 ? `Alertas, ${noLeidas} sin leer` : 'Alertas'}
        >
          <Bell className="size-5" aria-hidden="true" />
          {noLeidas > 0 && (
            <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-danger-solid text-caption font-semibold text-ink-inverse">
              {noLeidas > 9 ? '9+' : noLeidas}
            </span>
          )}
        </Link>

        <SelectorRol />
      </div>
    </header>
  )
}
