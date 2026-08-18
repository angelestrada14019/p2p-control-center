/**
 * Home — centro de control P2P. Ver .claude/docs/01-producto.md §7
 */
import { Gauge, ListChecks, TableProperties } from 'lucide-react'
import { useNavigate } from 'react-router'
import { EstadoError } from '@/shared/ui/EstadoError'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useAmbito } from '@/shared/hooks/use-ambito'
import { useResumenEjecutivo, useResumenModulo } from '@/shared/hooks/use-panel'
import { construirUrlKpisConContexto, useUrlKpis } from '@/shared/hooks/use-url-kpis'
import { ResumenEjecutivo } from './components/ResumenEjecutivo'
import { TarjetaModulo } from './components/TarjetaModulo'

function EsqueletoResumen() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-9 w-72" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  )
}

export function HomePage() {
  const { data: resumen, isLoading, isError, refetch } = useResumenEjecutivo()
  const reporteria = useResumenModulo('reporteria')
  const kpis = useResumenModulo('kpis')
  const checklist = useResumenModulo('checklist')
  const navigate = useNavigate()
  const urlKpis = useUrlKpis()
  const { ambito } = useAmbito()

  if (isError) {
    return (
      <EstadoError
        descripcion="No se pudo cargar el resumen ejecutivo del periodo."
        onReintentar={() => void refetch()}
      />
    )
  }

  function abrirKpis() {
    if (urlKpis) {
      window.open(construirUrlKpisConContexto(urlKpis, ambito), '_blank', 'noopener')
    } else {
      navigate('/kpis')
    }
  }

  return (
    <div className="space-y-8">
      {isLoading || !resumen ? <EsqueletoResumen /> : <ResumenEjecutivo resumen={resumen} />}

      <section aria-label="Módulos del proceso P2P" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TarjetaModulo
          titulo="Reportería y Control Preventivo"
          descripcion="Reportes SAP, NS y SAP TURBO con detección de inconsistencias antes del cierre."
          icono={TableProperties}
          onClick={() => navigate('/reporteria')}
          resumen={reporteria.data}
          cargando={reporteria.isLoading}
          error={reporteria.isError}
          onReintentar={() => void reporteria.refetch()}
        />
        <TarjetaModulo
          titulo="KPIs P2P"
          descripcion="Indicadores del proceso. Abre el dashboard en una aplicación externa."
          icono={Gauge}
          onClick={abrirKpis}
          resumen={kpis.data}
          cargando={kpis.isLoading}
          error={kpis.isError}
          onReintentar={() => void kpis.refetch()}
        />
        <TarjetaModulo
          titulo="Checklist de precierre"
          descripcion="Controles, evidencias y confirmación final auditable hacia Contabilidad."
          icono={ListChecks}
          onClick={() => navigate('/checklist')}
          resumen={checklist.data}
          cargando={checklist.isLoading}
          error={checklist.isError}
          onReintentar={() => void checklist.refetch()}
        />
      </section>
    </div>
  )
}
