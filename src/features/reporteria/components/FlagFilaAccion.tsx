/**
 * Indicador visual de estado (flagging), accionable en un clic.
 * Ver .claude/docs/05-modulo-1-reporteria.md §7: es un atajo visual, no
 * reemplaza al estado completo. Cambia el estado subyacente de forma
 * consistente y queda en la bitácora (la mutación la dispara el padre).
 */
import type { MouseEvent } from 'react'
import { Semaforo } from '@/shared/ui/Semaforo'
import { Tooltip } from '@/shared/ui/Tooltip'
import { usePuede } from '@/auth/Puede'
import type { Gestion } from '@/data/contracts'
import { TONO_POR_ESTADO, type EstadoRevision } from '@/shared/types/dominio'

type FlagEstado = 'con-inconsistencia' | 'en-revision' | 'validado'

function flagDeGestion(gestion: Gestion): FlagEstado {
  if (gestion.estadoRevision === 'Validado') return 'validado'
  if (gestion.estadoRevision === 'Sin revisar' && gestion.inconsistencias.length > 0) {
    return 'con-inconsistencia'
  }
  return 'en-revision'
}

const ETIQUETA_FLAG: Record<FlagEstado, string> = {
  'con-inconsistencia': 'Con inconsistencia',
  'en-revision': 'En revisión',
  validado: 'Validado',
}

interface FlagFilaAccionProps {
  gestion: Gestion
  onCambiarEstado: (estadoNuevo: EstadoRevision) => void
}

export function FlagFilaAccion({ gestion, onCambiarEstado }: FlagFilaAccionProps) {
  const puedeMarcar = usePuede('marcar-estado-registro')
  const puedeValidar = usePuede('validar-registro')
  const flag = flagDeGestion(gestion)
  const esPasoDeValidacion = flag === 'en-revision'
  const deshabilitado = !puedeMarcar || flag === 'validado' || (esPasoDeValidacion && !puedeValidar)

  function alHacerClic(evento: MouseEvent) {
    evento.stopPropagation()
    if (deshabilitado) return
    if (flag === 'con-inconsistencia') onCambiarEstado('En análisis')
    else if (flag === 'en-revision') onCambiarEstado('Validado')
  }

  const boton = (
    <button
      type="button"
      onClick={alHacerClic}
      disabled={deshabilitado}
      className="disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Semaforo tono={TONO_POR_ESTADO[gestion.estadoRevision]} etiqueta={ETIQUETA_FLAG[flag]} />
    </button>
  )

  if (!puedeMarcar) {
    return <Tooltip contenido="Tu rol no tiene permiso para marcar el estado de un registro.">{boton}</Tooltip>
  }
  if (esPasoDeValidacion && !puedeValidar) {
    return (
      <Tooltip contenido="Solo Controller o Administrador pueden marcar un registro como Validado.">
        {boton}
      </Tooltip>
    )
  }
  return boton
}
