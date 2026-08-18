/**
 * Control de acceso declarativo sobre la matriz de permisos.
 * Ver .claude/docs/05-modulo-1-reporteria.md §11: las acciones no permitidas
 * se muestran DESHABILITADAS CON EXPLICACIÓN, no ocultas sin más — salvo que
 * el propio elemento de navegación no deba existir para ese rol.
 */
import type { ReactNode } from 'react'
import { puede, type Accion } from './permisos'
import { useSesion } from './session'

export function usePuede(accion: Accion): boolean {
  const { rol } = useSesion()
  return puede(rol, accion)
}

interface PuedeProps {
  accion: Accion
  children: ReactNode
  /**
   * Qué renderizar cuando NO hay permiso. Por defecto no renderiza nada — úsalo
   * para ocultar navegación. Para un botón de acción, pasa una versión
   * deshabilitada con tooltip en vez de omitir esta prop.
   */
  si?: ReactNode
}

export function Puede({ accion, children, si = null }: PuedeProps) {
  const permitido = usePuede(accion)
  return permitido ? <>{children}</> : <>{si}</>
}
