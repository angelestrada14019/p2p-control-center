/**
 * Adaptador mock de `ProvisionesRepository`.
 * Ver .claude/docs/04-datos.md §3 y §5
 */
import type {
  CambioGestion,
  ClaveNegocio,
  ConsultaReporte,
  FilaComparacion,
  Gestion,
  Importe,
  Pagina,
  ProvisionNs,
  ProvisionSap,
  ProvisionTurbo,
  ProvisionesRepository,
  RegistroNoProvisionable,
  ResumenConsulta,
} from '@/data/contracts'
import { TAMANO_PAGINA_POR_DEFECTO, derivarClave } from '@/data/contracts'
import { MONEDA_REPORTE } from '@/shared/types/dominio'
import { filtrarYPaginar, filtrar, type Accesores } from './filtros'
import {
  CENTROS_COSTO,
  CUENTAS_CONTABLES,
  PROVEEDORES,
  RESPONSABLES,
  TASA_A_USD,
} from './catalogos'
import { obtenerUniverso } from './universo'
import { aplicarCambioGestion } from './mutar-gestion'

const accSap: Accesores<ProvisionSap> = {
  periodo: (f) => f.periodo,
  pais: (f) => f.pais,
  compania: (f) => f.compania,
  proveedor: (f) => f.proveedor,
  cuentaContable: (f) => f.cuentaContable,
  centroCosto: (f) => f.centroCosto,
  gestion: (f) => f.gestion,
  fecha: (f) => f.fechaRegistro,
  textoBusqueda: (f) => [f.numeroDocumento, f.proveedor, f.concepto, f.usuarioRegistro],
}

const accNs: Accesores<ProvisionNs> = {
  periodo: (f) => f.periodo,
  pais: (f) => f.pais,
  compania: (f) => f.compania,
  proveedor: (f) => f.proveedor,
  cuentaContable: (f) => f.cuentaContable,
  centroCosto: (f) => f.centroCosto,
  gestion: (f) => f.gestion,
  fecha: (f) => f.fechaEsperadaRegistro,
  textoBusqueda: (f) => [f.clave.documento, f.proveedor, f.concepto],
}

const accTurbo: Accesores<ProvisionTurbo> = {
  periodo: (f) => f.periodo,
  pais: (f) => f.COUNTRY,
  compania: (f) => f.SOCIETY,
  proveedor: (f) => f.THIRD_NAME,
  cuentaContable: (f) => f.ACCOUNT,
  centroCosto: (f) => f.ACCOUNT, // TURBO no modela centro de costo propio.
  gestion: (f) => f.gestion,
  fecha: (f) => f.COMPENSATION_DATE ?? f.gestion.fechaCorreccion ?? '',
  textoBusqueda: (f) => [f.DOCUMENT_NUMBER, f.THIRD_NAME, f.descripcionCoupa, f.CREATED_BY],
}

const accNoProvisionable: Accesores<RegistroNoProvisionable> = {
  periodo: (f) => f.periodo,
  pais: (f) => f.pais,
  compania: (f) => f.compania,
  proveedor: (f) => f.proveedor,
  // No-provisionable no modela cuenta/centro propios: son campos del sistema
  // origen (SAP/NS/TURBO), no de la vista unificada de exclusiones.
  cuentaContable: () => '',
  centroCosto: () => '',
  gestion: (f) => f.gestion,
  fecha: (f) => f.fechaExclusion,
  textoBusqueda: (f) => [f.proveedor, f.concepto, f.motivoExclusion, f.excluidoPor],
}

function convertirAUsd(importe: Importe): number {
  return importe.moneda === MONEDA_REPORTE
    ? importe.valor
    : importe.valor * (TASA_A_USD[importe.moneda] ?? 1)
}

/**
 * Calcula el resumen sobre TODO el conjunto filtrado (`todos`), no sobre la
 * página actual: los indicadores de cabecera deben reflejar los filtros
 * activos completos, no solo las filas visibles en la tabla.
 */
function resumirGenerico<T>(
  todos: T[],
  getGestion: (item: T) => Gestion,
  getValorUsd: (item: T) => number,
): ResumenConsulta {
  const total = todos.length
  const valorTotal = todos.reduce((suma, item) => suma + getValorUsd(item), 0)
  const conInconsistencia = todos.filter((item) => {
    const g = getGestion(item)
    return g.estadoRevision !== 'Sin revisar' && g.estadoRevision !== 'Validado'
  }).length
  const criticos = todos.filter((item) => getGestion(item).nivelRiesgo === 'crítico').length
  const sinResponsable = todos.filter((item) => getGestion(item).responsable === null).length
  const corregidos = todos.filter((item) => {
    const estado = getGestion(item).estadoRevision
    return estado === 'Corregido' || estado === 'Validado'
  }).length

  return {
    totalRegistros: total,
    valorTotal: { valor: Math.round(valorTotal), moneda: MONEDA_REPORTE },
    conInconsistencia,
    criticos,
    sinResponsable,
    avanceCorreccion: conInconsistencia === 0 ? 1 : corregidos / (conInconsistencia + corregidos),
  }
}

async function retardoSimulado(): Promise<void> {
  // Simula latencia de red mínima para que los estados de carga sean visibles
  // y se puedan verificar en desarrollo. Ver .claude/docs/03-diseno.md §8.
  await new Promise((resolver) => setTimeout(resolver, 120))
}

export function crearProvisionesRepositoryMock(): ProvisionesRepository {
  return {
    async listarRegistradasSap(consulta: ConsultaReporte): Promise<Pagina<ProvisionSap>> {
      await retardoSimulado()
      return filtrarYPaginar(obtenerUniverso().sap, consulta, accSap)
    },

    async listarProyectadasNs(consulta: ConsultaReporte): Promise<Pagina<ProvisionNs>> {
      await retardoSimulado()
      return filtrarYPaginar(obtenerUniverso().ns, consulta, accNs)
    },

    async listarRegistradasTurbo(consulta: ConsultaReporte): Promise<Pagina<ProvisionTurbo>> {
      await retardoSimulado()
      return filtrarYPaginar(obtenerUniverso().turbo, consulta, accTurbo)
    },

    async listarNoProvisionables(
      consulta: ConsultaReporte,
    ): Promise<Pagina<RegistroNoProvisionable>> {
      await retardoSimulado()
      return filtrarYPaginar(obtenerUniverso().noProvisionables, consulta, accNoProvisionable)
    },

    async compararSapVsNs(consulta: ConsultaReporte): Promise<Pagina<FilaComparacion>> {
      await retardoSimulado()
      let filtradas = obtenerUniverso().comparacion.filter((f) =>
        f.clave.startsWith(`${consulta.periodo}|`),
      )
      if (consulta.paises && consulta.paises.length > 0) {
        filtradas = filtradas.filter((f) => consulta.paises?.includes(f.pais))
      }
      if (consulta.proveedores && consulta.proveedores.length > 0) {
        filtradas = filtradas.filter((f) => consulta.proveedores?.includes(f.proveedor))
      }

      const porPagina = consulta.porPagina || TAMANO_PAGINA_POR_DEFECTO
      const pagina = Math.max(1, consulta.pagina || 1)
      const inicio = (pagina - 1) * porPagina
      return {
        items: filtradas.slice(inicio, inicio + porPagina),
        total: filtradas.length,
        pagina,
        porPagina,
      }
    },

    async resumir(consulta: ConsultaReporte): Promise<ResumenConsulta> {
      await retardoSimulado()
      const filtrados = filtrar(obtenerUniverso().sap, consulta, accSap)
      return resumirGenerico(
        filtrados,
        (f) => f.gestion,
        (f) => convertirAUsd(f.valorLocal),
      )
    },

    async listarProveedores(): Promise<string[]> {
      await retardoSimulado()
      return [...PROVEEDORES] // @mock-boundary: Snowflake — dimensión proveedor
    },

    async listarCuentasContables() {
      await retardoSimulado()
      return CUENTAS_CONTABLES.map((c) => ({ ...c })) // @mock-boundary: Snowflake — dimensión cuenta contable
    },

    async listarCentrosCosto() {
      await retardoSimulado()
      return CENTROS_COSTO.map((c) => ({ ...c })) // @mock-boundary: Snowflake — dimensión centro de costo
    },

    async listarResponsables(): Promise<string[]> {
      await retardoSimulado()
      return [...RESPONSABLES] // @mock-boundary: Supabase — tabla usuarios (responsables)
    },

    async actualizarGestion(clave: ClaveNegocio, cambio: CambioGestion): Promise<Gestion> {
      await retardoSimulado()
      const claveBuscada = derivarClave(clave)
      // Reporte A únicamente en esta fase; al construir B/C, sumar sus
      // arrays a esta búsqueda (misma clave de negocio, distinto universo).
      const registro = obtenerUniverso().sap.find((f) => derivarClave(f.clave) === claveBuscada)
      if (!registro) {
        throw new Error(`No se encontró el registro con clave "${claveBuscada}".`)
      }
      registro.gestion = aplicarCambioGestion(registro.gestion, cambio)
      return registro.gestion
    },
  }
}
