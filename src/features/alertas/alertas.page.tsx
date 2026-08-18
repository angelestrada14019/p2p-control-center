/**
 * Centro de alertas. Ver .claude/docs/08-alertas.md §4
 */
import { Link } from 'react-router'
import { Semaforo } from '@/shared/ui/Semaforo'
import { Skeleton } from '@/shared/ui/Skeleton'
import { EstadoError } from '@/shared/ui/EstadoError'
import { EstadoVacio } from '@/shared/ui/EstadoVacio'
import { EnlaceVolverInicio } from '@/shared/ui/EnlaceVolverInicio'
import { useAlertas } from '@/shared/hooks/use-panel'
import { formatearRelativo } from '@/shared/utils/formato'
import type { SeveridadAlerta } from '@/data/contracts'

const TONO_POR_SEVERIDAD: Record<SeveridadAlerta, 'error' | 'advertencia' | 'info'> = {
  critica: 'error',
  advertencia: 'advertencia',
  informativa: 'info',
}

const ETIQUETA_SEVERIDAD: Record<SeveridadAlerta, string> = {
  critica: 'Crítica',
  advertencia: 'Advertencia',
  informativa: 'Informativa',
}

export function AlertasPage() {
  // `isLoading` de TanStack Query es `false` mientras la query está
  // `enabled: false` (ambito aún no resuelto) — sin este OR, ese instante
  // no cae en ninguno de los cuatro estados y la página queda en blanco.
  const { data: alertas, isLoading, isError, refetch } = useAlertas()
  const cargando = isLoading || (!alertas && !isError)

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 py-12">
      <EnlaceVolverInicio />

      <h1 className="text-h1 font-semibold text-ink">Centro de alertas</h1>

      {cargando && (
        <div className="space-y-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {!cargando && isError && (
        <EstadoError
          descripcion="No se pudieron cargar las alertas del periodo."
          onReintentar={() => void refetch()}
        />
      )}

      {!cargando && !isError && alertas && alertas.length === 0 && (
        <EstadoVacio
          titulo="Sin alertas para este ámbito"
          descripcion="No hay actividades vencidas, diferencias materiales ni controles críticos pendientes en el periodo y compañía seleccionados."
        />
      )}

      {!cargando && !isError && alertas && alertas.length > 0 && (
        <ul className="flex flex-col gap-2">
          {alertas.map((alerta) => (
            <li key={alerta.id}>
              <Link
                to={alerta.rutaDestino}
                className="flex flex-col gap-1.5 rounded-card border border-border bg-surface p-4 hover:bg-surface-sunken"
              >
                <div className="flex items-center justify-between gap-2">
                  <Semaforo
                    tono={TONO_POR_SEVERIDAD[alerta.severidad]}
                    etiqueta={ETIQUETA_SEVERIDAD[alerta.severidad]}
                  />
                  <span className="text-caption text-ink-muted">
                    {formatearRelativo(alerta.ultimaOcurrencia)}
                  </span>
                </div>
                <p className="text-body font-medium text-ink">{alerta.titulo}</p>
                <p className="text-caption text-ink-muted">{alerta.descripcion}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
