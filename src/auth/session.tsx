/**
 * Sesión simulada. Ver ADR-02 en .claude/docs/12-decisiones.md
 *
 * NO hay autenticación real: un selector de rol en el encabezado permite
 * cambiar de identidad. Los permisos que se derivan del rol SÍ son reales.
 * El punto de conexión con auth real (SSO corporativo, pendiente de definir)
 * es este archivo: cuando exista, se reemplaza `useState` por la sesión
 * verdadera sin que ningún componente consumidor cambie.
 */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  ETIQUETA_ROL,
  ROLES,
  SUBPERFILES_CONTROLLER,
  type Rol,
  type SubperfilController,
} from './roles'

const CLAVE_ROL = 'p2p.sesion.rol'
const CLAVE_SUBPERFIL = 'p2p.sesion.subperfil'

interface Sesion {
  rol: Rol
  /** Solo tiene sentido cuando `rol === 'controller'`. */
  subperfil: SubperfilController
  nombreUsuario: string
  cambiarRol: (rol: Rol) => void
  cambiarSubperfil: (subperfil: SubperfilController) => void
}

const ContextoSesion = createContext<Sesion | null>(null)

function leerAlmacenado<T extends string>(clave: string, valido: readonly T[], porDefecto: T): T {
  if (typeof window === 'undefined') return porDefecto
  const valor = window.localStorage.getItem(clave)
  return (valido as readonly string[]).includes(valor ?? '') ? (valor as T) : porDefecto
}

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [rol, setRol] = useState<Rol>(() => leerAlmacenado(CLAVE_ROL, ROLES, 'controller'))
  const [subperfil, setSubperfil] = useState<SubperfilController>(() =>
    leerAlmacenado(CLAVE_SUBPERFIL, SUBPERFILES_CONTROLLER, 'OVH'),
  )

  const valor = useMemo<Sesion>(
    () => ({
      rol,
      subperfil,
      // Nombre de usuario simulado, estable por rol para que la sesión "se
      // sienta" real durante la navegación sin depender de un backend.
      nombreUsuario: `${ETIQUETA_ROL[rol]} de prueba`,
      cambiarRol: (nuevoRol) => {
        setRol(nuevoRol)
        window.localStorage.setItem(CLAVE_ROL, nuevoRol)
      },
      cambiarSubperfil: (nuevo) => {
        setSubperfil(nuevo)
        window.localStorage.setItem(CLAVE_SUBPERFIL, nuevo)
      },
    }),
    [rol, subperfil],
  )

  return <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>
}

export function useSesion(): Sesion {
  const contexto = useContext(ContextoSesion)
  if (!contexto) {
    throw new Error('useSesion debe usarse dentro de <ProveedorSesion>')
  }
  return contexto
}
