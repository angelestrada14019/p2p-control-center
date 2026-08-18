/**
 * Adaptador mock de `PanelRepository`.
 *
 * El Módulo 3 (Checklist) todavía no existe como funcionalidad propia — esta
 * fase solo construye el home navegable (ver .claude/docs/12-decisiones.md).
 * Por eso `obtenerAvanceChecklist` devuelve una cifra fija y documentada como
 * @mock-boundary en vez de calcularla sobre datos reales de controles: no hay
 * controles todavía que calcular. Cuando el Módulo 3 se construya, esta
 * función se reemplaza por el cálculo real sobre sus datos.
 */
import type {
  Ambito,
  AvanceChecklist,
  Compania,
  Importe,
  PanelRepository,
  ResumenEjecutivo,
  ResumenModulo,
} from '@/data/contracts'
import { MONEDA_REPORTE } from '@/shared/types/dominio'
import { formatearImporte, formatearNumero, formatearPorcentaje } from '@/shared/utils/formato'
import { COMPANIAS, TASA_A_USD } from './catalogos'
import { AHORA_SIMULADO, PERIODO_ACTUAL, PERIODO_ANTERIOR } from './ambito'
import { obtenerUniverso } from './universo'

function convertirAUsd(importe: Importe): number {
  return importe.moneda === MONEDA_REPORTE ? importe.valor : importe.valor * (TASA_A_USD[importe.moneda] ?? 1)
}

function filtrarPorAmbito<T extends { pais: string; compania: string }>(
  items: T[],
  ambito: Ambito,
): T[] {
  return items.filter((item) => {
    if (ambito.pais && item.pais !== ambito.pais) return false
    if (ambito.companiaId) {
      const compania = COMPANIAS.find((c) => c.id === ambito.companiaId)
      if (!compania || item.compania !== compania.nombre) return false
    }
    return true
  })
}

async function retardoSimulado(): Promise<void> {
  await new Promise((resolver) => setTimeout(resolver, 120))
}

// Avance fijo del Módulo 3 (aún no construido). Un único lugar para no
// repetir el mismo número mágico en obtenerResumenModulo y obtenerAvanceChecklist.
// @mock-boundary: Supabase — tabla checklist_controles (Módulo 3, aún no construido)
const AVANCE_CHECKLIST_SIMULADO = { completados: 4, total: 11 }

export function crearPanelRepositoryMock(): PanelRepository {
  return {
    async listarCompanias(): Promise<Compania[]> {
      await retardoSimulado()
      return COMPANIAS
    },

    async listarPeriodos() {
      await retardoSimulado()
      return [PERIODO_ACTUAL, PERIODO_ANTERIOR]
    },

    async obtenerResumenEjecutivo(ambito: Ambito): Promise<ResumenEjecutivo> {
      await retardoSimulado()
      const { sap, ns } = obtenerUniverso()

      const sapDelPeriodo = filtrarPorAmbito(
        sap.filter((f) => f.periodo === ambito.periodo),
        ambito,
      )
      const nsSoloDelPeriodo = filtrarPorAmbito(
        ns.filter((f) => f.periodo === ambito.periodo && f.gestion.inconsistencias.includes('Provisión esperada no registrada')),
        ambito,
      )

      const pendientesCorreccion = sapDelPeriodo.filter(
        (f) =>
          f.gestion.inconsistencias.length > 0 &&
          f.gestion.estadoRevision !== 'Corregido' &&
          f.gestion.estadoRevision !== 'Validado' &&
          f.gestion.estadoRevision !== 'No aplica',
      ).length

      const alertasCriticas =
        sapDelPeriodo.filter(
          (f) => f.gestion.nivelRiesgo === 'crítico' && f.gestion.estadoRevision !== 'Validado',
        ).length + nsSoloDelPeriodo.length

      const totalConInconsistencia = sapDelPeriodo.filter(
        (f) => f.gestion.inconsistencias.length > 0,
      ).length
      const estadoGeneral: ResumenEjecutivo['estadoGeneral'] =
        alertasCriticas > 20
          ? { tono: 'error', etiqueta: 'Requiere atención inmediata' }
          : alertasCriticas > 0
            ? { tono: 'advertencia', etiqueta: 'Con pendientes críticos' }
            : { tono: 'exito', etiqueta: 'En orden' }

      const [anio, mes] = ambito.periodo.split('-').map(Number) as [number, number]
      const fechaLimiteCierre = new Date(Date.UTC(anio, mes, 5)).toISOString()
      const diasParaCierre = Math.ceil(
        (new Date(fechaLimiteCierre).getTime() - new Date(AHORA_SIMULADO).getTime()) /
          (1000 * 60 * 60 * 24),
      )

      return {
        periodo: ambito.periodo,
        estadoGeneral,
        alertasCriticas,
        pendientesCorreccion,
        avanceChecklist: AVANCE_CHECKLIST_SIMULADO.completados / AVANCE_CHECKLIST_SIMULADO.total,
        fechaLimiteCierre,
        diasParaCierre,
        riesgos: nsSoloDelPeriodo.slice(0, 5).map((f) => ({
          titulo: `Provisión esperada sin registrar — ${f.proveedor}`,
          nivel: 'crítico' as const,
          detalle: `${f.compania}, ${formatearImporte(f.valorEstimado)}`,
          rutaDestino: `/reporteria/ns?busqueda=${encodeURIComponent(f.proveedor)}`,
        })),
        accionesPendientes:
          totalConInconsistencia > 0
            ? [
                {
                  titulo: 'Revisar registros con inconsistencia',
                  detalle: `${totalConInconsistencia} registros del Reporte A requieren tu revisión`,
                  rutaDestino: '/reporteria',
                  vence: fechaLimiteCierre,
                },
              ]
            : [],
        ultimaActualizacion: AHORA_SIMULADO,
      }
    },

    async obtenerResumenModulo(modulo, ambito: Ambito): Promise<ResumenModulo> {
      await retardoSimulado()
      const { sap, ns, turbo } = obtenerUniverso()

      if (modulo === 'reporteria') {
        const delPeriodo = filtrarPorAmbito(sap.filter((f) => f.periodo === ambito.periodo), ambito)
        const turboDelPeriodo = filtrarPorAmbito(
          turbo.filter((f) => f.periodo === ambito.periodo).map((f) => ({ ...f, pais: f.COUNTRY, compania: f.SOCIETY })),
          ambito,
        )
        const criticos = delPeriodo.filter((f) => f.gestion.nivelRiesgo === 'crítico').length
        const valorTotal = delPeriodo.reduce((s, f) => s + convertirAUsd(f.valorLocal), 0)
        return {
          tono: criticos > 0 ? 'error' : 'exito',
          etiqueta: criticos > 0 ? `${criticos} registros críticos` : 'Sin pendientes críticos',
          indicadores: [
            { etiqueta: 'Reporte A', valor: formatearNumero(delPeriodo.length), tono: 'neutro' },
            { etiqueta: 'Reporte C', valor: formatearNumero(turboDelPeriodo.length), tono: 'neutro' },
            {
              etiqueta: 'Valor total',
              valor: formatearImporte({ valor: Math.round(valorTotal), moneda: MONEDA_REPORTE }),
              tono: 'info',
            },
          ],
        }
      }

      if (modulo === 'checklist') {
        const { completados, total } = AVANCE_CHECKLIST_SIMULADO
        return {
          tono: 'advertencia',
          etiqueta: 'Módulo en construcción',
          indicadores: [
            { etiqueta: 'Avance', valor: formatearPorcentaje(completados / total), tono: 'advertencia' },
            { etiqueta: 'Controles completados', valor: `${completados}/${total}`, tono: 'neutro' },
          ],
        }
      }

      // modulo === 'kpis' — redirige a app externa, sin datos propios aquí.
      const nsDelPeriodo = filtrarPorAmbito(ns.filter((f) => f.periodo === ambito.periodo), ambito)
      const valorProyectado = nsDelPeriodo.reduce((s, f) => s + convertirAUsd(f.valorEstimado), 0)
      return {
        tono: 'info',
        etiqueta: 'Ver dashboard externo',
        indicadores: [
          { etiqueta: 'Provisiones proyectadas', valor: formatearNumero(nsDelPeriodo.length), tono: 'info' },
          {
            etiqueta: 'Valor proyectado',
            valor: formatearImporte({ valor: Math.round(valorProyectado), moneda: MONEDA_REPORTE }),
            tono: 'info',
          },
        ],
      }
    },

    async obtenerAvanceChecklist(_ambito: Ambito): Promise<AvanceChecklist> {
      await retardoSimulado()
      return {
        totalObligatorios: AVANCE_CHECKLIST_SIMULADO.total,
        completados: AVANCE_CHECKLIST_SIMULADO.completados,
        vencidos: 1,
        conObservaciones: 2,
        criticosPendientes: 2,
        bloqueos: [
          'Comparación SAP vs NS — pendiente de ejecutar',
          'Revisión de pendientes críticos — 2 excepciones sin responsable',
        ],
      }
    },
  }
}
