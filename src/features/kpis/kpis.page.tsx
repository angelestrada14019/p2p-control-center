/**
 * Módulo 2 — KPIs P2P.
 *
 * Este módulo REDIRIGE a una aplicación externa; no se construye un
 * dashboard aquí. Ver .claude/docs/06-modulo-2-kpis.md §1
 */
import { ExternalLink } from 'lucide-react'
import { Boton } from '@/shared/ui/Boton'
import { EstadoVacio } from '@/shared/ui/EstadoVacio'
import { EnlaceVolverInicio } from '@/shared/ui/EnlaceVolverInicio'
import { useAmbito } from '@/shared/hooks/use-ambito'
import { construirUrlKpisConContexto, useUrlKpis } from '@/shared/hooks/use-url-kpis'

export function KpisPage() {
  const urlKpis = useUrlKpis()
  const { ambito } = useAmbito()

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-start gap-4 py-12">
      <EnlaceVolverInicio />

      <h1 className="text-h1 font-semibold text-ink">KPIs del proceso P2P</h1>

      {urlKpis ? (
        <div className="space-y-4">
          <p className="text-body text-ink-muted">
            El dashboard de indicadores vive en una aplicación separada. Se abre en una pestaña
            nueva.
          </p>
          <Boton onClick={() => window.open(construirUrlKpisConContexto(urlKpis, ambito), '_blank', 'noopener')}>
            <ExternalLink className="size-4" aria-hidden="true" />
            Abrir dashboard de KPIs
          </Boton>
        </div>
      ) : (
        <EstadoVacio
          titulo="El dashboard de KPIs aún no está enlazado"
          descripcion="Configura la variable de entorno VITE_KPIS_URL para habilitar el acceso al dashboard externo de indicadores."
        />
      )}
    </div>
  )
}
