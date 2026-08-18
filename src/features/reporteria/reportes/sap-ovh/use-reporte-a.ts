/**
 * Datos del Reporte A (SAP OVH): patrón calcado de `use-panel.ts` con
 * TanStack Query. `keepPreviousData` evita que la tabla se vacíe entre
 * páginas/filtros mientras la paginación es server-side (vía el mock que ya
 * pagina). Ver .claude/docs/05-modulo-1-reporteria.md §3 y §10
 */
import { useEffect } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { repositorios } from '@/data'
import { useAmbito } from '@/shared/hooks/use-ambito'
import { useCompanias } from '@/shared/hooks/use-companias'
import { useConsultaUrl } from '../../hooks/use-consulta-url'

export function useReporteA() {
  const { ambito } = useAmbito()
  const { data: companias = [] } = useCompanias()
  const consultaUrl = useConsultaUrl()

  const nombreCompania = ambito?.companiaId
    ? companias.find((c) => c.id === ambito.companiaId)?.nombre
    : undefined

  const consulta = {
    ...consultaUrl.filtros,
    periodo: ambito?.periodo ?? '',
    paises: ambito?.pais ? [ambito.pais] : undefined,
    companias: nombreCompania ? [nombreCompania] : undefined,
  }

  // El ámbito global (periodo, país, compañía) vive fuera de la URL, así que
  // cambiarlo no dispara el reseteo de página que sí ocurre para los filtros
  // de la tabla — sin esto, cambiar de país estando en la página 5 podía caer
  // en una página vacía sin explicación.
  useEffect(() => {
    consultaUrl.setPagina(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ambito?.periodo, ambito?.pais, ambito?.companiaId])

  const registros = useQuery({
    queryKey: ['reporte-a', consulta],
    queryFn: () => repositorios.provisiones.listarRegistradasSap(consulta),
    enabled: ambito !== null,
    placeholderData: keepPreviousData,
  })

  const resumen = useQuery({
    queryKey: ['reporte-a-resumen', consulta],
    queryFn: () => repositorios.provisiones.resumir(consulta),
    enabled: ambito !== null,
  })

  return { registros, resumen, consulta, consultaUrl }
}
