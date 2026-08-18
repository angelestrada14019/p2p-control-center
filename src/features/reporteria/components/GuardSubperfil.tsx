/**
 * Segmentación por sub-perfil de Controller.
 * Ver .claude/docs/05-modulo-1-reporteria.md §2: "Controller OVH" y "Controller
 * TURBO" no son roles distintos, son sub-perfiles del rol `controller` — el
 * rol determina qué puede hacer, el sub-perfil qué alcance ve. Un Controller
 * TURBO que entra a una ruta OVH recibe un estado explicativo, no un error.
 */
import type { ReactNode } from 'react'
import { EstadoVacio } from '@/shared/ui/EstadoVacio'
import { useSesion } from '@/auth/session'
import type { Alcance } from '@/shared/types/dominio'
import type { Rol, SubperfilController } from '@/auth/roles'

/**
 * `admin` siempre ve ambos alcances. `controller` ve solo el alcance de su
 * sub-perfil. El resto de roles (analista_p2p, contabilidad, consulta) no
 * están segmentados por alcance en el documento de negocio: ven ambos,
 * sujeto al permiso general `ver-modulo-reporteria`.
 */
export function puedeVerAlcance(rol: Rol, subperfil: SubperfilController, alcance: Alcance): boolean {
  if (rol === 'admin') return true
  if (rol === 'controller') return subperfil === alcance
  return true
}

interface GuardSubperfilProps {
  alcance: Alcance
  children: ReactNode
}

export function GuardSubperfil({ alcance, children }: GuardSubperfilProps) {
  const { rol, subperfil } = useSesion()

  if (!puedeVerAlcance(rol, subperfil, alcance)) {
    return (
      <EstadoVacio
        titulo="Este reporte no está disponible para tu sub-perfil"
        descripcion={`Tu sub-perfil actual es Controller ${subperfil}. Los reportes de alcance ${alcance} son visibles solo para Controller ${alcance} y para Administrador.`}
      />
    )
  }

  return <>{children}</>
}
