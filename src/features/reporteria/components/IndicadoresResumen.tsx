/**
 * Tarjetas compactas de indicadores, sobre `ResumenConsulta` — responden a
 * los filtros activos. Ver .claude/docs/05-modulo-1-reporteria.md §10
 */
import { Tarjeta } from '@/shared/ui/Tarjeta'
import { Skeleton } from '@/shared/ui/Skeleton'
import { formatearImporte, formatearNumero, formatearPorcentaje } from '@/shared/utils/formato'
import type { ResumenConsulta } from '@/data/contracts'

interface IndicadoresResumenProps {
  resumen: ResumenConsulta | undefined
  cargando: boolean
}

interface Indicador {
  etiqueta: string
  valor: string
}

export function IndicadoresResumen({ resumen, cargando }: IndicadoresResumenProps) {
  const indicadores: Indicador[] = resumen
    ? [
        { etiqueta: 'Total de registros', valor: formatearNumero(resumen.totalRegistros) },
        { etiqueta: 'Valor total', valor: formatearImporte(resumen.valorTotal) },
        { etiqueta: 'Con inconsistencia', valor: formatearNumero(resumen.conInconsistencia) },
        { etiqueta: 'Críticos', valor: formatearNumero(resumen.criticos) },
        { etiqueta: 'Sin responsable', valor: formatearNumero(resumen.sinResponsable) },
        { etiqueta: 'Avance de corrección', valor: formatearPorcentaje(resumen.avanceCorreccion) },
      ]
    : []

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {(cargando ? Array.from({ length: 6 }) : indicadores).map((indicador, indice) => (
        <Tarjeta key={indice} className="p-3">
          {cargando || !indicador ? (
            <>
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-2 h-5 w-16" />
            </>
          ) : (
            <>
              <p className="text-caption text-ink-muted">{(indicador as Indicador).etiqueta}</p>
              <p className="text-h3 font-semibold tabular-nums text-ink">{(indicador as Indicador).valor}</p>
            </>
          )}
        </Tarjeta>
      ))}
    </div>
  )
}
