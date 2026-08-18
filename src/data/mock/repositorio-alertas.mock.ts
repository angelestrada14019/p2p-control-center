/**
 * Adaptador mock de `AlertasRepository`.
 * Ver .claude/docs/08-alertas.md
 *
 * @mock-boundary: Supabase — tabla `alertas`
 */
import type { Alerta, AlertasRepository, Ambito } from '@/data/contracts'
import { formatearFecha } from '@/shared/utils/formato'
import { AHORA_SIMULADO } from './ambito'
import { obtenerUniverso } from './universo'

function filtrarPorPais<T extends { pais: string }>(items: T[], ambito: Ambito): T[] {
  return ambito.pais ? items.filter((i) => i.pais === ambito.pais) : items
}

function generarAlertas(ambito: Ambito): Alerta[] {
  const { sap, ns } = obtenerUniverso()
  const alertas: Alerta[] = []
  let id = 0

  const sapCriticos = filtrarPorPais(
    sap.filter(
      (f) =>
        f.periodo === ambito.periodo &&
        f.gestion.nivelRiesgo === 'crítico' &&
        f.gestion.estadoRevision !== 'Validado',
    ),
    ambito,
  ).slice(0, 8)

  for (const f of sapCriticos) {
    alertas.push({
      id: `alerta-${++id}`,
      tipo: f.gestion.inconsistencias.includes('Duplicado')
        ? 'posible-duplicado'
        : 'control-critico-pendiente',
      severidad: 'critica',
      titulo: `Registro crítico sin resolver — ${f.proveedor}`,
      descripcion: `${f.compania}: ${f.gestion.inconsistencias.join(', ')}`,
      rutaDestino: `/reporteria?busqueda=${encodeURIComponent(f.numeroDocumento)}`,
      pais: f.pais,
      creadaEn: f.fechaRegistro,
      ultimaOcurrencia: f.fechaRegistro,
      resueltaEn: null,
      leida: false,
    })
  }

  const nsPendientes = filtrarPorPais(
    ns.filter(
      (f) =>
        f.periodo === ambito.periodo &&
        f.gestion.inconsistencias.includes('Provisión esperada no registrada'),
    ),
    ambito,
  ).slice(0, 6)

  for (const f of nsPendientes) {
    alertas.push({
      id: `alerta-${++id}`,
      tipo: 'proyectada-no-registrada',
      severidad: 'critica',
      titulo: `Provisión proyectada aún no registrada — ${f.proveedor}`,
      descripcion: `${f.compania}: se esperaba en SAP antes del ${formatearFecha(f.fechaEsperadaRegistro)}`,
      rutaDestino: `/reporteria/ns?busqueda=${encodeURIComponent(f.proveedor)}`,
      pais: f.pais,
      creadaEn: f.fechaEsperadaRegistro,
      ultimaOcurrencia: f.fechaEsperadaRegistro,
      resueltaEn: null,
      leida: false,
    })
  }

  alertas.push({
    id: `alerta-${++id}`,
    tipo: 'confirmacion-final',
    severidad: 'informativa',
    titulo: 'El checklist de precierre aún no se ha confirmado',
    descripcion: 'Quedan controles obligatorios pendientes para este periodo.',
    rutaDestino: '/checklist',
    pais: null,
    creadaEn: AHORA_SIMULADO,
    ultimaOcurrencia: AHORA_SIMULADO,
    resueltaEn: null,
    leida: false,
  })

  return alertas
}

async function retardoSimulado(): Promise<void> {
  await new Promise((resolver) => setTimeout(resolver, 120))
}

export function crearAlertasRepositoryMock(): AlertasRepository {
  return {
    async listar(ambito: Ambito): Promise<Alerta[]> {
      await retardoSimulado()
      return generarAlertas(ambito)
    },
    async contarNoLeidas(ambito: Ambito): Promise<number> {
      await retardoSimulado()
      return generarAlertas(ambito).filter((a) => !a.leida).length
    },
  }
}
