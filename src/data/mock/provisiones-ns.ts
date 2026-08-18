/**
 * Generador del Reporte B — NS, provisiones proyectadas a fin de mes (vista OVH).
 *
 * @mock-boundary: fuente "NS" — el sistema exacto y su mecanismo de
 * integración están por confirmar. Ver .claude/docs/04-datos.md §6
 *
 * Se deriva de las filas SAP ya generadas: la mayoría de las provisiones
 * proyectadas coinciden con lo registrado, algunas difieren en valor más allá
 * del umbral, y un grupo adicional NO tiene contraparte en SAP — son las
 * provisiones esperadas que todavía no se registran.
 */
import type { Aleatorio } from './aleatorio'
import { PERIODO_ACTUAL, COMPANIAS_OVH } from './ambito'
import { generarGestion } from './bitacora'
import { CONCEPTOS, PROVEEDORES, RANGO_POR_MONEDA, monedaDe } from './catalogos'
import type { ProvisionNs, ProvisionSap } from '@/data/contracts'

/** Diferencia relativa a partir de la cual se considera material. */
export const UMBRAL_DIFERENCIA_VALOR = 0.05

/** Cuántas provisiones proyectadas NO tienen aún contraparte en SAP. */
const TOTAL_SOLO_NS = 380

function fechaEsperadaEn(rnd: Aleatorio, periodo: string): string {
  const [anio, mes] = periodo.split('-').map(Number) as [number, number]
  return new Date(Date.UTC(anio, mes - 1, rnd.entero(20, 28))).toISOString()
}

/**
 * Genera el Reporte B. Muta las filas SAP recibidas para tagear
 * "Diferencia de valor" en ambos lados cuando corresponde — es la misma
 * inconsistencia vista desde los dos reportes, no dos hallazgos distintos.
 */
export function generarProvisionesNs(rnd: Aleatorio, filasSap: ProvisionSap[]): ProvisionNs[] {
  const filas: ProvisionNs[] = []

  // Candidatas a emparejar: solo del periodo activo, para que la comparación
  // "SAP vs NS del periodo" tenga sentido de negocio.
  const candidatasEmparejar = filasSap.filter((f) => f.periodo === PERIODO_ACTUAL)
  const aEmparejar = rnd.barajar(candidatasEmparejar).slice(
    0,
    Math.floor(candidatasEmparejar.length * 0.72),
  )

  for (const sap of aEmparejar) {
    const conDiferencia = rnd.probabilidad(0.06)
    const valorEstimado = conDiferencia
      ? Math.round(sap.valorLocal.valor * rnd.decimal(1.1, 1.45, 3))
      : Math.round(sap.valorLocal.valor * rnd.decimal(0.98, 1.02, 3))

    if (conDiferencia) {
      sap.gestion.inconsistencias = [...sap.gestion.inconsistencias, 'Diferencia de valor']
    }

    filas.push({
      clave: sap.clave,
      periodo: sap.periodo,
      compania: sap.compania,
      pais: sap.pais,
      centroCosto: sap.centroCosto,
      cuentaContable: sap.cuentaContable,
      proveedor: sap.proveedor,
      ordenCompra: sap.ordenCompra,
      concepto: sap.concepto,
      valorEstimado: { valor: valorEstimado, moneda: sap.valorLocal.moneda },
      fechaEsperadaRegistro: fechaEsperadaEn(rnd, sap.periodo),
      gestion: generarGestion({
        rnd,
        fechaBaseIso: sap.fechaRegistro,
        inconsistencias: conDiferencia ? ['Diferencia de valor'] : [],
        nivelRiesgo: conDiferencia ? 'alto' : null,
        estadoFinal: conDiferencia ? 'En análisis' : 'Validado',
        sinResponsable: false,
      }),
    })
  }

  for (let i = 0; i < TOTAL_SOLO_NS; i++) {
    const compania = rnd.elemento(COMPANIAS_OVH)
    const moneda = monedaDe(compania.pais)
    const [min, max] = RANGO_POR_MONEDA[moneda]
    const documento = `NS-${String(500000 + i).padStart(7, '0')}`

    filas.push({
      clave: {
        periodo: PERIODO_ACTUAL,
        compania: compania.id,
        documento,
        linea: 1,
      },
      periodo: PERIODO_ACTUAL,
      compania: compania.nombre,
      pais: compania.pais,
      centroCosto: 'CC-1000',
      cuentaContable: '5130100',
      proveedor: rnd.elemento(PROVEEDORES),
      ordenCompra: rnd.probabilidad(0.6) ? `OC-${rnd.entero(100000, 999999)}` : null,
      concepto: rnd.elemento(CONCEPTOS),
      valorEstimado: { valor: rnd.decimal(min, max, 0), moneda },
      fechaEsperadaRegistro: fechaEsperadaEn(rnd, PERIODO_ACTUAL),
      gestion: generarGestion({
        rnd,
        fechaBaseIso: fechaEsperadaEn(rnd, PERIODO_ACTUAL),
        inconsistencias: ['Provisión esperada no registrada'],
        nivelRiesgo: 'crítico',
        estadoFinal: rnd.probabilidad(0.4) ? 'Corrección solicitada' : 'Sin revisar',
        sinResponsable: rnd.probabilidad(0.3),
      }),
    })
  }

  return filas
}
