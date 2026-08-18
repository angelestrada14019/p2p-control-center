/**
 * Generador del Reporte A — SAP, provisiones registradas (vista OVH).
 *
 * @mock-boundary: Snowflake — vista SAP_PROVISIONES_REGISTRADAS
 * Ver .claude/docs/05-modulo-1-reporteria.md §3
 */
import type { Aleatorio } from './aleatorio'
import { PERIODO_ACTUAL, PERIODO_ANTERIOR, COMPANIAS_OVH } from './ambito'
import { generarGestion } from './bitacora'
import {
  CENTROS_COSTO,
  CONCEPTOS,
  CUENTAS_CONTABLES,
  CUENTAS_PLAUSIBLES_POR_CENTRO,
  PROVEEDORES,
  RANGO_POR_MONEDA,
  TASA_A_USD,
  TIPOS_PROVISION,
  UNIDADES_NEGOCIO,
  USUARIOS_REGISTRO,
  monedaDe,
} from './catalogos'
import type { ProvisionSap } from '@/data/contracts'
import type { EstadoRevision, TipoInconsistencia } from '@/shared/types/dominio'

const TIPOS_QUE_EXIGEN_OC: readonly string[] = [
  'Servicio recurrente',
  'Servicio puntual',
  'Contrato marco',
]

const ESTADOS_POSIBLES: EstadoRevision[] = [
  'Sin revisar',
  'En análisis',
  'Corrección solicitada',
  'En corrección',
  'Corregido',
  'Validado',
  'No aplica',
]

/** Cuántos registros SAP-OVH tiene el reporte. Ver .claude/docs/04-datos.md §5.4. */
export const TOTAL_PROVISIONES_SAP = 2600

function fechaRegistroEn(rnd: Aleatorio, periodo: string): string {
  const [anio, mes] = periodo.split('-').map(Number) as [number, number]
  const dia = rnd.entero(1, 28)
  return new Date(Date.UTC(anio, mes - 1, dia, rnd.entero(8, 18), rnd.entero(0, 59))).toISOString()
}

function numeroDocumento(rnd: Aleatorio, indice: number): string {
  return `51${String(2000000 + indice).padStart(9, '0')}${rnd.entero(0, 9)}`
}

interface FilaBase {
  centroCosto: (typeof CENTROS_COSTO)[number]
  cuentaContable: (typeof CUENTAS_CONTABLES)[number]
  unidadNegocio: string
  ordenCompra: string | null
  tipoProvision: string
  proveedor: string
  concepto: string
}

function generarCampoContable(rnd: Aleatorio): {
  fila: FilaBase
  inconsistenciasEstructurales: TipoInconsistencia[]
} {
  const centroCosto = rnd.elemento(CENTROS_COSTO)
  const tipoProvision = rnd.elemento(TIPOS_PROVISION)
  const inconsistencias: TipoInconsistencia[] = []

  // Cuenta contable: normalmente dentro del conjunto plausible para el centro
  // de costo; con baja probabilidad se elige una fuera de ese conjunto y se
  // marca la inconsistencia. Es un desajuste real, no una elección al azar.
  const plausibles = CUENTAS_PLAUSIBLES_POR_CENTRO[centroCosto.codigo] ?? []
  const cuentaIncorrecta = rnd.probabilidad(0.05)
  const candidatas = cuentaIncorrecta
    ? CUENTAS_CONTABLES.filter((c) => !plausibles.includes(c.codigo))
    : CUENTAS_CONTABLES.filter((c) => plausibles.includes(c.codigo))
  const cuentaContable = rnd.elemento(candidatas.length > 0 ? candidatas : CUENTAS_CONTABLES)
  if (cuentaIncorrecta) inconsistencias.push('Cuenta contable posiblemente incorrecta')

  // Unidad de negocio: normalmente la del centro de costo; con baja
  // probabilidad se declara una distinta y se marca la inconsistencia.
  const centroIncorrecto = rnd.probabilidad(0.05)
  const unidadNegocio = centroIncorrecto
    ? rnd.elemento(UNIDADES_NEGOCIO.filter((u) => u !== centroCosto.unidad))
    : centroCosto.unidad
  if (centroIncorrecto) inconsistencias.push('Centro de costo posiblemente incorrecto')

  const requiereOc = TIPOS_QUE_EXIGEN_OC.includes(tipoProvision)
  const tieneOc = rnd.probabilidad(0.82)
  const ordenCompra = tieneOc ? `OC-${rnd.entero(100000, 999999)}` : null
  if (!tieneOc && requiereOc) inconsistencias.push('Sin orden de compra')

  return {
    fila: {
      centroCosto,
      cuentaContable,
      unidadNegocio,
      ordenCompra,
      tipoProvision,
      proveedor: rnd.elemento(PROVEEDORES),
      concepto: rnd.elemento(CONCEPTOS),
    },
    inconsistenciasEstructurales: inconsistencias,
  }
}

export function generarProvisionesSap(rnd: Aleatorio): ProvisionSap[] {
  const filas: ProvisionSap[] = []

  for (let i = 0; i < TOTAL_PROVISIONES_SAP; i++) {
    const compania = rnd.elemento(COMPANIAS_OVH)
    const moneda = monedaDe(compania.pais)
    const [min, max] = RANGO_POR_MONEDA[moneda]
    const valorLocal = rnd.decimal(min, max, 0)
    const valorUsd = Math.round(valorLocal * TASA_A_USD[moneda] * 100) / 100

    const deOtroPeriodo = rnd.probabilidad(0.03)
    const periodo = deOtroPeriodo ? PERIODO_ANTERIOR : PERIODO_ACTUAL
    const sinResponsable = rnd.probabilidad(0.06)

    const { fila, inconsistenciasEstructurales } = generarCampoContable(rnd)
    const inconsistencias = [...inconsistenciasEstructurales]
    if (deOtroPeriodo) inconsistencias.push('De otro periodo')
    if (sinResponsable) inconsistencias.push('Sin responsable')

    const tieneInconsistencia = inconsistencias.length > 0
    const estadoFinal = tieneInconsistencia
      ? rnd.elemento(ESTADOS_POSIBLES.filter((e) => e !== 'Sin revisar'))
      : rnd.probabilidad(0.7)
        ? 'Validado'
        : 'Sin revisar'

    const nivelRiesgo = tieneInconsistencia
      ? rnd.elemento(['crítico', 'alto', 'medio', 'bajo'] as const)
      : null

    const fechaRegistro = fechaRegistroEn(rnd, periodo)

    filas.push({
      clave: {
        periodo,
        compania: compania.id,
        documento: numeroDocumento(rnd, i),
        linea: 1,
      },
      fechaRegistro,
      periodo,
      compania: compania.nombre,
      pais: compania.pais,
      unidadNegocio: fila.unidadNegocio,
      centroCosto: fila.centroCosto.codigo,
      cuentaContable: fila.cuentaContable.codigo,
      numeroDocumento: numeroDocumento(rnd, i),
      ordenCompra: fila.ordenCompra,
      proveedor: fila.proveedor,
      concepto: fila.concepto,
      usuarioRegistro: rnd.elemento(USUARIOS_REGISTRO),
      valorLocal: { valor: valorLocal, moneda },
      valorUsd: { valor: valorUsd, moneda: 'USD' },
      tipoProvision: fila.tipoProvision,
      gestion: generarGestion({
        rnd,
        fechaBaseIso: fechaRegistro,
        inconsistencias,
        nivelRiesgo,
        estadoFinal,
        sinResponsable,
      }),
    })
  }

  return injectarDuplicados(rnd, filas)
}

/**
 * Inyecta pares de duplicados explícitos: dos documentos distintos con la
 * misma compañía, proveedor, valor y periodo. Garantiza que el tipo de
 * inconsistencia "Duplicado" siempre tenga representación, sin depender de
 * que la aleatoriedad lo produzca por casualidad.
 */
function injectarDuplicados(rnd: Aleatorio, filas: ProvisionSap[]): ProvisionSap[] {
  const PARES = 4
  for (let p = 0; p < PARES; p++) {
    const indiceOriginal = rnd.entero(0, filas.length - 1)
    const original = filas[indiceOriginal] as ProvisionSap
    const nuevoIndice = filas.length + p
    const duplicado: ProvisionSap = {
      ...original,
      clave: { ...original.clave, documento: numeroDocumento(rnd, nuevoIndice + 90000) },
      numeroDocumento: numeroDocumento(rnd, nuevoIndice + 90000),
      fechaRegistro: fechaRegistroEn(rnd, original.periodo),
      gestion: generarGestion({
        rnd,
        fechaBaseIso: original.fechaRegistro,
        inconsistencias: ['Duplicado'],
        nivelRiesgo: 'crítico',
        estadoFinal: 'En análisis',
        sinResponsable: false,
      }),
    }
    // Se marca también el original, para que ambos lados del duplicado
    // aparezcan al filtrar por este tipo de inconsistencia.
    original.gestion.inconsistencias = [...original.gestion.inconsistencias, 'Duplicado']
    filas.push(duplicado)
  }
  return filas
}
