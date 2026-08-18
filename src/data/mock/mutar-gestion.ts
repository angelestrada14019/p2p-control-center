/**
 * Aplica un `CambioGestion` a una `Gestion` existente, generando la entrada de
 * bitácora correspondiente. A diferencia de `bitacora.ts` (que genera historial
 * determinista para el universo base), esta función simula una escritura real
 * ocurriendo ahora: usa la fecha/hora actual, como haría el INSERT real.
 *
 * @mock-boundary: Supabase — tabla de bitácora/gestión (escritura)
 */
import type { CambioGestion, EntradaBitacora, Gestion } from '@/data/contracts'
import { ESTADOS_QUE_EXIGEN_COMENTARIO } from '@/shared/types/dominio'

let idSecuencia = 0
function siguienteId(): string {
  idSecuencia += 1
  return `bit-mut-${idSecuencia}`
}

/**
 * Construye la entrada de bitácora que corresponde al cambio, sin aplicar
 * todavía reglas de negocio (eso lo hace `aplicarCambioGestion`).
 */
function crearEntrada(cambio: CambioGestion, gestion: Gestion): EntradaBitacora {
  const fecha = new Date().toISOString()

  switch (cambio.tipo) {
    case 'comentario':
      return {
        id: siguienteId(),
        autor: cambio.autor,
        fecha,
        tipo: 'comentario',
        texto: cambio.texto,
        menciones: cambio.menciones ?? [],
      }
    case 'cambio-estado':
      return {
        id: siguienteId(),
        autor: cambio.autor,
        fecha,
        tipo: 'cambio-estado',
        texto: cambio.comentario ?? `Cambio de estado a "${cambio.estadoNuevo}".`,
        estadoAnterior: gestion.estadoRevision,
        estadoNuevo: cambio.estadoNuevo,
        menciones: [],
      }
    case 'asignacion':
      return {
        id: siguienteId(),
        autor: cambio.autor,
        fecha,
        tipo: 'asignacion',
        texto: `Asignado a ${cambio.responsable} para revisión.`,
        menciones: [cambio.responsable],
      }
    case 'fecha-compromiso':
      return {
        id: siguienteId(),
        autor: cambio.autor,
        fecha,
        tipo: 'comentario',
        texto: `Fecha compromiso registrada: ${cambio.fecha}.`,
        menciones: [],
      }
    case 'cambio-riesgo':
      return {
        id: siguienteId(),
        autor: cambio.autor,
        fecha,
        tipo: 'cambio-riesgo',
        texto: `Nivel de riesgo cambiado manualmente a "${cambio.nivelRiesgo}".`,
        menciones: [],
      }
    case 'correccion-completada':
      return {
        id: siguienteId(),
        autor: cambio.autor,
        fecha,
        tipo: 'comentario',
        texto: `Corrección marcada como completada (fecha: ${cambio.fechaCorreccion}).`,
        menciones: [],
      }
    case 'adjunto':
      return {
        id: siguienteId(),
        autor: cambio.autor,
        fecha,
        tipo: 'comentario',
        texto: `Evidencia adjuntada: ${cambio.nombreArchivo}.`,
        menciones: [],
      }
  }
}

/**
 * Aplica el cambio a la gestión y devuelve la `Gestion` resultante (nueva
 * copia, no muta el argumento). Rechaza un `cambio-estado` hacia un estado que
 * exige comentario si no se provee uno — la misma regla que respetaría un
 * adaptador real contra Supabase.
 */
export function aplicarCambioGestion(gestion: Gestion, cambio: CambioGestion): Gestion {
  if (
    cambio.tipo === 'cambio-estado' &&
    ESTADOS_QUE_EXIGEN_COMENTARIO.includes(cambio.estadoNuevo) &&
    !cambio.comentario?.trim()
  ) {
    throw new Error(
      `Pasar a "${cambio.estadoNuevo}" exige un comentario que lo justifique.`,
    )
  }

  const entrada = crearEntrada(cambio, gestion)
  const bitacora = [...gestion.bitacora, entrada]

  switch (cambio.tipo) {
    case 'comentario':
      return { ...gestion, bitacora, comentario: cambio.texto }
    case 'cambio-estado':
      return {
        ...gestion,
        bitacora,
        estadoRevision: cambio.estadoNuevo,
        comentario: cambio.comentario ?? gestion.comentario,
      }
    case 'asignacion':
      return { ...gestion, bitacora, responsable: cambio.responsable }
    case 'fecha-compromiso':
      return { ...gestion, bitacora, fechaCompromiso: cambio.fecha }
    case 'cambio-riesgo':
      return { ...gestion, bitacora, nivelRiesgo: cambio.nivelRiesgo }
    case 'correccion-completada':
      return { ...gestion, bitacora, fechaCorreccion: cambio.fechaCorreccion }
    case 'adjunto':
      return { ...gestion, bitacora }
  }
}
