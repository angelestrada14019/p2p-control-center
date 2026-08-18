/**
 * Contratos del home (centro de control), alertas y avance del checklist.
 * Ver .claude/docs/01-producto.md §7 y .claude/docs/08-alertas.md
 */
import type { NivelRiesgo, Pais, Periodo, TonoSemaforo } from '@/shared/types/dominio'

/* ─────────────────────────────────────────────────────────────
   Ámbito seleccionado en el encabezado
   ───────────────────────────────────────────────────────────── */

export interface Compania {
  id: string
  nombre: string
  pais: Pais
}

export interface Ambito {
  periodo: Periodo
  /** `null` = todas las compañías del país seleccionado. */
  companiaId: string | null
  /** `null` = todos los países. */
  pais: Pais | null
}

/* ─────────────────────────────────────────────────────────────
   Alertas
   ───────────────────────────────────────────────────────────── */

export const TIPOS_ALERTA = [
  'actividad-por-vencer',
  'actividad-vencida',
  'proyectada-no-registrada',
  'diferencia-material',
  'posible-duplicado',
  'control-critico-pendiente',
  'correccion-sin-respuesta',
  'cambio-estado',
  'confirmacion-final',
] as const
export type TipoAlerta = (typeof TIPOS_ALERTA)[number]

export type SeveridadAlerta = 'critica' | 'advertencia' | 'informativa'

export interface Alerta {
  id: string
  tipo: TipoAlerta
  severidad: SeveridadAlerta
  titulo: string
  descripcion: string
  /**
   * Toda alerta es accionable: una que no lleva a ningún sitio no se
   * implementa. Ver .claude/docs/08-alertas.md §5
   */
  rutaDestino: string
  pais: Pais | null
  creadaEn: string
  ultimaOcurrencia: string
  resueltaEn: string | null
  leida: boolean
}

/* ─────────────────────────────────────────────────────────────
   Resumen ejecutivo del home
   ───────────────────────────────────────────────────────────── */

export interface Riesgo {
  titulo: string
  nivel: NivelRiesgo
  detalle: string
  rutaDestino: string
}

export interface AccionPendiente {
  titulo: string
  detalle: string
  rutaDestino: string
  /** Fecha límite en ISO, si la tiene. */
  vence: string | null
}

export interface ResumenEjecutivo {
  periodo: Periodo
  /** Estado general del proceso en el periodo. */
  estadoGeneral: { tono: TonoSemaforo; etiqueta: string }
  alertasCriticas: number
  pendientesCorreccion: number
  /** Proporción de 0 a 1. */
  avanceChecklist: number
  /** Fecha límite del cierre, en ISO. */
  fechaLimiteCierre: string
  /** Días restantes; negativo si ya pasó. */
  diasParaCierre: number
  riesgos: Riesgo[]
  /** Acciones del usuario actual, según su rol. */
  accionesPendientes: AccionPendiente[]
  /** Marca de tiempo del último refresco de datos. */
  ultimaActualizacion: string
}

/* ─────────────────────────────────────────────────────────────
   Cabecera de cada tarjeta de módulo
   ───────────────────────────────────────────────────────────── */

export interface IndicadorCabecera {
  etiqueta: string
  valor: string
  tono: TonoSemaforo
}

export interface ResumenModulo {
  tono: TonoSemaforo
  etiqueta: string
  indicadores: IndicadorCabecera[]
}

/* ─────────────────────────────────────────────────────────────
   Avance del checklist (Módulo 3) — lo que el home necesita
   ───────────────────────────────────────────────────────────── */

export interface AvanceChecklist {
  totalObligatorios: number
  completados: number
  vencidos: number
  conObservaciones: number
  criticosPendientes: number
  /** Bloqueos vigentes de la confirmación final. */
  bloqueos: string[]
}

/* ─────────────────────────────────────────────────────────────
   Contratos
   ───────────────────────────────────────────────────────────── */

export interface PanelRepository {
  listarCompanias(): Promise<Compania[]>
  listarPeriodos(): Promise<Periodo[]>
  obtenerResumenEjecutivo(ambito: Ambito): Promise<ResumenEjecutivo>
  obtenerResumenModulo(
    modulo: 'reporteria' | 'kpis' | 'checklist',
    ambito: Ambito,
  ): Promise<ResumenModulo>
  obtenerAvanceChecklist(ambito: Ambito): Promise<AvanceChecklist>
}

export interface AlertasRepository {
  listar(ambito: Ambito): Promise<Alerta[]>
  contarNoLeidas(ambito: Ambito): Promise<number>
}
