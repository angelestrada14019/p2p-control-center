/**
 * Generador de bitácoras con historial de varios autores.
 * Ver .claude/docs/04-datos.md §5.4 (bitácoras con historial de varios autores)
 * Ver .claude/docs/05-modulo-1-reporteria.md §7 (transiciones de estado)
 *
 * @mock-boundary: Supabase — tabla bitacora_registros
 */
import type { Aleatorio } from './aleatorio'
import { RESPONSABLES } from './catalogos'
import type { EntradaBitacora, Gestion } from '@/data/contracts'
import {
  ESTADOS_TERMINALES,
  ESTADOS_QUE_EXIGEN_COMENTARIO,
  type EstadoRevision,
  type NivelRiesgo,
  type TipoInconsistencia,
} from '@/shared/types/dominio'

const COMENTARIOS_ANALISIS = [
  'Se solicita soporte documental al proveedor.',
  'Validando contra la orden de compra asociada.',
  'Pendiente confirmación del centro de costo con el área solicitante.',
  'Se identificó posible duplicado, en revisión con el equipo de NS.',
  'Monto verificado contra el contrato marco vigente.',
  'Se escaló a Contabilidad por diferencia material.',
] as const

const COMENTARIOS_NO_APLICA = [
  'Revisado: corresponde a otra compañía del grupo, no aplica corrección.',
  'La diferencia está dentro del umbral de materialidad aprobado.',
  'Confirmado con el proveedor: el registro es correcto.',
] as const

function fechaDesde(inicioIso: string, diasDespues: number): string {
  const fecha = new Date(inicioIso)
  fecha.setUTCDate(fecha.getUTCDate() + diasDespues)
  return fecha.toISOString()
}

/**
 * Construye una bitácora coherente con el estado final: si el estado terminó
 * en "Corregido" o más avanzado, hay una secuencia de transiciones previas con
 * distintos autores y fechas crecientes.
 */
export function generarGestion(params: {
  rnd: Aleatorio
  fechaBaseIso: string
  inconsistencias: TipoInconsistencia[]
  nivelRiesgo: NivelRiesgo | null
  estadoFinal: EstadoRevision
  sinResponsable: boolean
}): Gestion {
  const { rnd, fechaBaseIso, inconsistencias, nivelRiesgo, estadoFinal, sinResponsable } = params

  const responsable = sinResponsable ? null : rnd.elemento(RESPONSABLES)
  const bitacora: EntradaBitacora[] = []
  let dia = rnd.entero(1, 3)
  let idSecuencia = 0
  const siguienteId = () => `bit-${++idSecuencia}`

  if (inconsistencias.length > 0) {
    bitacora.push({
      id: siguienteId(),
      autor: 'Sistema P2P',
      fecha: fechaDesde(fechaBaseIso, 0),
      tipo: 'comentario',
      texto: `Inconsistencia detectada automáticamente: ${inconsistencias.join(', ')}.`,
      menciones: [],
    })
  }

  if (responsable) {
    bitacora.push({
      id: siguienteId(),
      autor: rnd.elemento(RESPONSABLES),
      fecha: fechaDesde(fechaBaseIso, dia),
      tipo: 'asignacion',
      texto: `Asignado a ${responsable} para revisión.`,
      menciones: [responsable],
    })
    dia += rnd.entero(1, 2)
  }

  const secuenciaHaciaEstado: EstadoRevision[] = (() => {
    switch (estadoFinal) {
      case 'Sin revisar':
        return []
      case 'En análisis':
        return ['En análisis']
      case 'Corrección solicitada':
        return ['En análisis', 'Corrección solicitada']
      case 'En corrección':
        return ['En análisis', 'Corrección solicitada', 'En corrección']
      case 'Corregido':
        return ['En análisis', 'Corrección solicitada', 'En corrección', 'Corregido']
      case 'Validado':
        return ['En análisis', 'Corrección solicitada', 'En corrección', 'Corregido', 'Validado']
      case 'No aplica':
        return ['En análisis', 'No aplica']
    }
  })()

  let estadoAnterior: EstadoRevision = 'Sin revisar'
  for (const estadoNuevo of secuenciaHaciaEstado) {
    const autor = responsable ?? rnd.elemento(RESPONSABLES)
    const exigeComentario = ESTADOS_QUE_EXIGEN_COMENTARIO.includes(estadoNuevo)
    bitacora.push({
      id: siguienteId(),
      autor,
      fecha: fechaDesde(fechaBaseIso, dia),
      tipo: 'cambio-estado',
      texto: exigeComentario
        ? rnd.elemento(COMENTARIOS_NO_APLICA)
        : rnd.elemento(COMENTARIOS_ANALISIS),
      estadoAnterior,
      estadoNuevo,
      menciones: [],
    })
    estadoAnterior = estadoNuevo
    dia += rnd.entero(1, 4)
  }

  if (nivelRiesgo === 'crítico' && rnd.probabilidad(0.3)) {
    bitacora.push({
      id: siguienteId(),
      autor: rnd.elemento(RESPONSABLES),
      fecha: fechaDesde(fechaBaseIso, dia),
      tipo: 'cambio-riesgo',
      texto: 'Nivel de riesgo confirmado manualmente como crítico tras revisión.',
      menciones: [],
    })
  }

  const ultimaEntrada = bitacora.at(-1)
  const comentario = ultimaEntrada && ultimaEntrada.tipo !== 'asignacion' ? ultimaEntrada.texto : null

  return {
    inconsistencias,
    nivelRiesgo,
    estadoRevision: estadoFinal,
    responsable,
    fechaCompromiso:
      !ESTADOS_TERMINALES.includes(estadoFinal) && responsable
        ? fechaDesde(fechaBaseIso, dia + rnd.entero(3, 10))
        : null,
    fechaCorreccion: estadoFinal === 'Corregido' || estadoFinal === 'Validado'
      ? fechaDesde(fechaBaseIso, dia)
      : null,
    comentario,
    bitacora,
  }
}
