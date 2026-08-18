/**
 * Filtrado y paginación genéricos para los adaptadores mock.
 *
 * El adaptador REAL filtrará y paginará en el origen (Snowflake/Supabase), no
 * en el cliente. Este módulo solo simula ese comportamiento sobre el array en
 * memoria, para que el contrato `ConsultaReporte` -> `Pagina<T>` se ejerza
 * igual que lo hará la implementación real. Ver .claude/docs/04-datos.md §3
 */
import type { ConsultaReporte, Gestion, Pagina } from '@/data/contracts'
import { TAMANO_PAGINA_POR_DEFECTO } from '@/data/contracts'
import type { Pais } from '@/shared/types/dominio'

export interface Accesores<T> {
  periodo: (item: T) => string
  pais: (item: T) => Pais
  compania: (item: T) => string
  proveedor: (item: T) => string
  cuentaContable: (item: T) => string
  centroCosto: (item: T) => string
  gestion: (item: T) => Gestion
  fecha: (item: T) => string
  /** Campos de texto libre sobre los que opera el buscador. */
  textoBusqueda: (item: T) => string[]
}

function coincideAlguno<T>(valores: T[] | undefined, valor: T): boolean {
  return !valores || valores.length === 0 || valores.includes(valor)
}

/**
 * Aplica todos los filtros de `ConsultaReporte` (excepto paginación) sobre
 * `items`. Se usa tanto para paginar (`filtrarYPaginar`) como para calcular
 * indicadores resumen sobre el conjunto filtrado completo (`resumir` en
 * `repositorio-provisiones.mock.ts`) — ambos deben honrar exactamente los
 * mismos filtros activos.
 */
export function filtrar<T>(items: T[], consulta: ConsultaReporte, acc: Accesores<T>): T[] {
  let filtrados = items.filter((item) => acc.periodo(item) === consulta.periodo)

  filtrados = filtrados.filter((item) => coincideAlguno(consulta.paises, acc.pais(item)))
  filtrados = filtrados.filter((item) => coincideAlguno(consulta.companias, acc.compania(item)))
  filtrados = filtrados.filter((item) => coincideAlguno(consulta.proveedores, acc.proveedor(item)))
  filtrados = filtrados.filter((item) =>
    coincideAlguno(consulta.cuentasContables, acc.cuentaContable(item)),
  )
  filtrados = filtrados.filter((item) =>
    coincideAlguno(consulta.centrosCosto, acc.centroCosto(item)),
  )

  filtrados = filtrados.filter((item) => {
    const gestion = acc.gestion(item)
    if (!coincideAlguno(consulta.estados, gestion.estadoRevision)) return false
    if (
      consulta.nivelesRiesgo &&
      consulta.nivelesRiesgo.length > 0 &&
      (!gestion.nivelRiesgo || !consulta.nivelesRiesgo.includes(gestion.nivelRiesgo))
    ) {
      return false
    }
    if (consulta.responsables && consulta.responsables.length > 0) {
      if (!gestion.responsable || !consulta.responsables.includes(gestion.responsable)) {
        return false
      }
    }
    if (consulta.tiposInconsistencia && consulta.tiposInconsistencia.length > 0) {
      const tiene = gestion.inconsistencias.some((t) => consulta.tiposInconsistencia?.includes(t))
      if (!tiene) return false
    }
    return true
  })

  if (consulta.desde) {
    filtrados = filtrados.filter((item) => acc.fecha(item) >= (consulta.desde as string))
  }
  if (consulta.hasta) {
    filtrados = filtrados.filter((item) => acc.fecha(item) <= (consulta.hasta as string))
  }

  if (consulta.busqueda && consulta.busqueda.trim() !== '') {
    const termino = consulta.busqueda.trim().toLowerCase()
    filtrados = filtrados.filter((item) =>
      acc.textoBusqueda(item).some((campo) => campo.toLowerCase().includes(termino)),
    )
  }

  return filtrados
}

export function filtrarYPaginar<T>(
  items: T[],
  consulta: ConsultaReporte,
  acc: Accesores<T>,
): Pagina<T> {
  let filtrados = filtrar(items, consulta, acc)

  if (consulta.ordenarPor) {
    const campo = consulta.ordenarPor
    const direccion = consulta.direccion === 'desc' ? -1 : 1
    filtrados = [...filtrados].sort((a, b) => {
      const va = String((a as Record<string, unknown>)[campo] ?? '')
      const vb = String((b as Record<string, unknown>)[campo] ?? '')
      return va.localeCompare(vb) * direccion
    })
  }

  const total = filtrados.length
  const porPagina = consulta.porPagina || TAMANO_PAGINA_POR_DEFECTO
  const pagina = Math.max(1, consulta.pagina || 1)
  const inicio = (pagina - 1) * porPagina
  const items_ = filtrados.slice(inicio, inicio + porPagina)

  return { items: items_, total, pagina, porPagina }
}
