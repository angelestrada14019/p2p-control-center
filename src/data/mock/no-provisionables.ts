/**
 * Generador de la pestaña global "No provisionable".
 *
 * Vista unificada SAP + NS + TURBO. No es un archivo muerto: existe para
 * auditar omisiones erróneas. Ver .claude/docs/05-modulo-1-reporteria.md §2
 *
 * @mock-boundary: Snowflake — vistas de exclusiones por sistema, consolidadas
 */
import type { Aleatorio } from './aleatorio'
import { PERIODO_ACTUAL, COMPANIAS_OVH, COMPANIAS_TURBO } from './ambito'
import { generarGestion } from './bitacora'
import {
  CONCEPTOS,
  MOTIVOS_EXCLUSION,
  PROVEEDORES,
  RANGO_POR_MONEDA,
  RESPONSABLES,
  monedaDe,
} from './catalogos'
import type { RegistroNoProvisionable } from '@/data/contracts'
import type { Sistema } from '@/shared/types/dominio'

const TOTAL_POR_SISTEMA = 110

export function generarNoProvisionables(rnd: Aleatorio): RegistroNoProvisionable[] {
  const filas: RegistroNoProvisionable[] = []
  const sistemas: Sistema[] = ['SAP', 'NS', 'TURBO']

  for (const sistema of sistemas) {
    const companias = sistema === 'TURBO' ? COMPANIAS_TURBO : COMPANIAS_OVH
    for (let i = 0; i < TOTAL_POR_SISTEMA; i++) {
      const compania = rnd.elemento(companias)
      const moneda = monedaDe(compania.pais)
      const [min, max] = RANGO_POR_MONEDA[moneda]
      const fecha = new Date(
        Date.UTC(2026, 7, rnd.entero(1, 28), rnd.entero(8, 18)),
      ).toISOString()

      // Una pequeña fracción son omisiones erróneas sin resolver: el motivo
      // de exclusión no se sostiene y debería revertirse a "a provisionar".
      const omisionErronea = rnd.probabilidad(0.08)

      filas.push({
        clave: {
          periodo: PERIODO_ACTUAL,
          compania: compania.id,
          documento: `${sistema}-EXCL-${rnd.entero(100000, 999999)}`,
          linea: 1,
        },
        sistema,
        periodo: PERIODO_ACTUAL,
        compania: compania.nombre,
        pais: compania.pais,
        proveedor: rnd.elemento(PROVEEDORES),
        concepto: rnd.elemento(CONCEPTOS),
        valor: { valor: rnd.decimal(min, max, 0), moneda },
        motivoExclusion: rnd.elemento(MOTIVOS_EXCLUSION),
        excluidoPor: rnd.elemento(RESPONSABLES),
        fechaExclusion: fecha,
        gestion: generarGestion({
          rnd,
          fechaBaseIso: fecha,
          inconsistencias: omisionErronea ? ['Provisión esperada no registrada'] : [],
          nivelRiesgo: omisionErronea ? 'alto' : null,
          estadoFinal: omisionErronea ? 'En análisis' : 'Validado',
          sinResponsable: false,
        }),
      })
    }
  }

  return filas
}
