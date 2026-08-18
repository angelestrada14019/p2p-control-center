/**
 * Traduce los filtros, la búsqueda, el orden y la paginación de un reporte
 * hacia/desde la URL (`URLSearchParams`), para que una vista filtrada se
 * pueda compartir. Ver .claude/docs/05-modulo-1-reporteria.md §10 y
 * .claude/docs/02-arquitectura.md §5 (filtros y paginación en la URL).
 *
 * Genérico y reutilizable sin cambios por los Reportes B y C: no conoce nada
 * específico del Reporte A.
 */
import { useCallback, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router'
import {
  TAMANO_PAGINA_POR_DEFECTO,
  type ConsultaReporte,
  type DireccionOrden,
} from '@/data/contracts'
import type { EstadoRevision, NivelRiesgo, TipoInconsistencia } from '@/shared/types/dominio'

export type ConsultaSinPeriodo = Omit<ConsultaReporte, 'periodo'>

// País y Compañía NO son filtros de esta barra: los controla el ámbito global
// del navbar (`useAmbito`), igual que el Periodo. Ver ADR de unificación en
// .claude/docs/12-decisiones.md.
type FiltroMultiple =
  | 'proveedores'
  | 'cuentasContables'
  | 'centrosCosto'
  | 'responsables'
  | 'estados'
  | 'nivelesRiesgo'
  | 'tiposInconsistencia'

const PARAM_POR_FILTRO: Record<FiltroMultiple, string> = {
  proveedores: 'proveedor',
  cuentasContables: 'cuentaContable',
  centrosCosto: 'centroCosto',
  responsables: 'responsable',
  estados: 'estado',
  nivelesRiesgo: 'riesgo',
  tiposInconsistencia: 'inconsistencia',
}

const FILTROS_MULTIPLES = Object.keys(PARAM_POR_FILTRO) as FiltroMultiple[]

export interface UseConsultaUrl {
  filtros: ConsultaSinPeriodo
  /** Añade o quita `valor` del filtro multi-valor indicado. */
  toggleFiltro: (clave: FiltroMultiple, valor: string) => void
  /** Reemplaza el conjunto completo de valores seleccionados del filtro. */
  setFiltro: (clave: FiltroMultiple, valores: string[]) => void
  limpiarFiltro: (clave: FiltroMultiple) => void
  limpiarTodos: () => void
  /** Debounced (300ms): solo la escritura a la URL espera, el input no. */
  setBusqueda: (texto: string) => void
  setDesde: (fechaIso: string) => void
  setHasta: (fechaIso: string) => void
  setPagina: (n: number) => void
  setPorPagina: (n: number) => void
  setOrden: (campo: string, direccion: DireccionOrden) => void
}

function construirFiltros(params: URLSearchParams): ConsultaSinPeriodo {
  const resultado: ConsultaSinPeriodo = {
    pagina: Number(params.get('pagina')) || 1,
    porPagina: Number(params.get('porPagina')) || TAMANO_PAGINA_POR_DEFECTO,
  }

  const proveedores = params.getAll('proveedor')
  if (proveedores.length > 0) resultado.proveedores = proveedores
  const cuentasContables = params.getAll('cuentaContable')
  if (cuentasContables.length > 0) resultado.cuentasContables = cuentasContables
  const centrosCosto = params.getAll('centroCosto')
  if (centrosCosto.length > 0) resultado.centrosCosto = centrosCosto
  const responsables = params.getAll('responsable')
  if (responsables.length > 0) resultado.responsables = responsables
  const estados = params.getAll('estado')
  if (estados.length > 0) resultado.estados = estados as EstadoRevision[]
  const nivelesRiesgo = params.getAll('riesgo')
  if (nivelesRiesgo.length > 0) resultado.nivelesRiesgo = nivelesRiesgo as NivelRiesgo[]
  const tiposInconsistencia = params.getAll('inconsistencia')
  if (tiposInconsistencia.length > 0) {
    resultado.tiposInconsistencia = tiposInconsistencia as TipoInconsistencia[]
  }

  const busqueda = params.get('q')
  if (busqueda) resultado.busqueda = busqueda
  const desde = params.get('desde')
  if (desde) resultado.desde = desde
  const hasta = params.get('hasta')
  if (hasta) resultado.hasta = hasta
  const ordenarPor = params.get('orden')
  if (ordenarPor) resultado.ordenarPor = ordenarPor
  const direccion = params.get('dir')
  if (direccion === 'asc' || direccion === 'desc') resultado.direccion = direccion

  return resultado
}

export function useConsultaUrl(): UseConsultaUrl {
  const [params, setParams] = useSearchParams()
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null)

  const filtros = useMemo(() => construirFiltros(params), [params])

  const actualizar = useCallback(
    (mutar: (siguiente: URLSearchParams) => void, resetearPagina = true) => {
      setParams((actual) => {
        const siguiente = new URLSearchParams(actual)
        mutar(siguiente)
        if (resetearPagina) siguiente.delete('pagina')
        return siguiente
      })
    },
    [setParams],
  )

  const toggleFiltro = useCallback(
    (clave: FiltroMultiple, valor: string) => {
      const param = PARAM_POR_FILTRO[clave]
      actualizar((siguiente) => {
        const actuales = siguiente.getAll(param)
        siguiente.delete(param)
        const nuevos = actuales.includes(valor)
          ? actuales.filter((v) => v !== valor)
          : [...actuales, valor]
        nuevos.forEach((v) => siguiente.append(param, v))
      })
    },
    [actualizar],
  )

  const setFiltro = useCallback(
    (clave: FiltroMultiple, valores: string[]) => {
      const param = PARAM_POR_FILTRO[clave]
      actualizar((siguiente) => {
        siguiente.delete(param)
        valores.forEach((v) => siguiente.append(param, v))
      })
    },
    [actualizar],
  )

  const limpiarFiltro = useCallback(
    (clave: FiltroMultiple) => actualizar((siguiente) => siguiente.delete(PARAM_POR_FILTRO[clave])),
    [actualizar],
  )

  const limpiarTodos = useCallback(() => setParams(new URLSearchParams()), [setParams])

  const setBusqueda = useCallback(
    (texto: string) => {
      if (temporizador.current) clearTimeout(temporizador.current)
      temporizador.current = setTimeout(() => {
        actualizar((siguiente) => {
          if (texto.trim()) siguiente.set('q', texto)
          else siguiente.delete('q')
        })
      }, 300)
    },
    [actualizar],
  )

  const setDesde = useCallback(
    (fechaIso: string) =>
      actualizar((siguiente) => {
        if (fechaIso) siguiente.set('desde', fechaIso)
        else siguiente.delete('desde')
      }),
    [actualizar],
  )

  const setHasta = useCallback(
    (fechaIso: string) =>
      actualizar((siguiente) => {
        if (fechaIso) siguiente.set('hasta', fechaIso)
        else siguiente.delete('hasta')
      }),
    [actualizar],
  )

  const setPagina = useCallback(
    (n: number) => actualizar((siguiente) => siguiente.set('pagina', String(n)), false),
    [actualizar],
  )

  const setPorPagina = useCallback(
    (n: number) => actualizar((siguiente) => siguiente.set('porPagina', String(n))),
    [actualizar],
  )

  const setOrden = useCallback(
    (campo: string, direccion: DireccionOrden) =>
      actualizar((siguiente) => {
        siguiente.set('orden', campo)
        siguiente.set('dir', direccion)
      }, false),
    [actualizar],
  )

  return {
    filtros,
    toggleFiltro,
    setFiltro,
    limpiarFiltro,
    limpiarTodos,
    setBusqueda,
    setDesde,
    setHasta,
    setPagina,
    setPorPagina,
    setOrden,
  }
}

export { FILTROS_MULTIPLES, PARAM_POR_FILTRO }
export type { FiltroMultiple }
