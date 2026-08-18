/**
 * Generador del Reporte C — SAP TURBO, provisiones registradas (vista TURBO).
 *
 * @mock-boundary: Snowflake — vista SAP_TURBO_PROVISIONES
 * Los nombres de campo van en MAYÚSCULAS y en inglés, tal como los define el
 * negocio. NO se traducen. Ver .claude/docs/05-modulo-1-reporteria.md §5
 */
import type { Aleatorio } from './aleatorio'
import { PERIODO_ACTUAL, PERIODO_ANTERIOR, COMPANIAS_TURBO } from './ambito'
import { generarGestion } from './bitacora'
import {
  CONCEPTOS,
  CUENTAS_CONTABLES,
  PROVEEDORES,
  RANGO_POR_MONEDA,
  TASA_A_USD,
  USUARIOS_REGISTRO,
  monedaDe,
} from './catalogos'
import type { ProvisionTurbo } from '@/data/contracts'
import type { EstadoRevision, TipoInconsistencia } from '@/shared/types/dominio'

export const TOTAL_PROVISIONES_TURBO = 1300

const ESTADOS_POSIBLES: EstadoRevision[] = [
  'Sin revisar',
  'En análisis',
  'Corrección solicitada',
  'En corrección',
  'Corregido',
  'Validado',
  'No aplica',
]

function periodoNumero(periodo: string): number {
  return Number(periodo.split('-')[1])
}

function anioDe(periodo: string): number {
  return Number(periodo.split('-')[0])
}

export function generarProvisionesTurbo(rnd: Aleatorio): ProvisionTurbo[] {
  const filas: ProvisionTurbo[] = []

  for (let i = 0; i < TOTAL_PROVISIONES_TURBO; i++) {
    const compania = rnd.elemento(COMPANIAS_TURBO)
    const moneda = monedaDe(compania.pais)
    const [min, max] = RANGO_POR_MONEDA[moneda]
    const cuentaContable = rnd.elemento(CUENTAS_CONTABLES)

    const deOtroPeriodo = rnd.probabilidad(0.03)
    const periodo = deOtroPeriodo ? PERIODO_ANTERIOR : PERIODO_ACTUAL
    const sinResponsable = rnd.probabilidad(0.06)
    const tieneOc = rnd.probabilidad(0.8)
    const compensado = rnd.probabilidad(0.35)

    const valorDocumento = rnd.decimal(min, max, 0)
    const valorMl1 = Math.round(valorDocumento * TASA_A_USD[moneda] * 100) / 100
    const valorMl2 = Math.round(valorDocumento * TASA_A_USD[moneda] * rnd.decimal(0.98, 1.02) * 100) / 100

    const inconsistencias: TipoInconsistencia[] = []
    if (!tieneOc) inconsistencias.push('Sin orden de compra')
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

    const documento = `TB${String(700000 + i).padStart(8, '0')}`
    const fechaBase = new Date(
      Date.UTC(anioDe(periodo), periodoNumero(periodo) - 1, rnd.entero(1, 28)),
    ).toISOString()

    filas.push({
      clave: { periodo, compania: compania.id, documento, linea: 1 },
      periodo,
      COUNTRY: compania.pais,
      SOCIETY: compania.nombre,
      ACCOUNT: cuentaContable.codigo,
      ACCOUNT_NAME: cuentaContable.nombre,
      descripcionCoupa: rnd.elemento(CONCEPTOS),
      THIRD: `PROV-${rnd.entero(10000, 99999)}`,
      THIRD_NAME: rnd.elemento(PROVEEDORES),
      DOCUMENT_NUMBER: documento,
      DOCUMENT_TYPE: rnd.elemento(['KR', 'KG', 'RE'] as const),
      FISCAL_YEAR: anioDe(periodo),
      PERIOD: periodoNumero(periodo),
      REFERENCE_DOCUMENT: rnd.probabilidad(0.5) ? `REF-${rnd.entero(100000, 999999)}` : null,
      PURCHASE_DOCUMENT: tieneOc ? `${rnd.entero(4500000000, 4599999999)}` : null,
      CURRENCY_DOCUMENT: moneda,
      AMOUNT_DOCUMENT: { valor: valorDocumento, moneda },
      AMOUNT_ML1: { valor: valorMl1, moneda: 'USD' },
      AMOUNT_ML2: { valor: valorMl2, moneda: 'USD' },
      CREATED_BY: rnd.elemento(USUARIOS_REGISTRO),
      COMPENSATION_DOCUMENT: compensado ? `COMP-${rnd.entero(100000, 999999)}` : null,
      COMPENSATION_DATE: compensado ? fechaBase : null,
      gestion: generarGestion({
        rnd,
        fechaBaseIso: fechaBase,
        inconsistencias,
        nivelRiesgo,
        estadoFinal,
        sinResponsable,
      }),
    })
  }

  return filas
}
