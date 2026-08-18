/**
 * Selector de identidad simulada, en el encabezado. Ver ADR-02.
 *
 * Permite probar los cinco roles sin login. Cuando el rol es `controller`,
 * también se puede elegir el sub-perfil OVH/TURBO.
 */
import { useRef, useState } from 'react'
import { ChevronDown, User } from 'lucide-react'
import { useClicAfuera } from '@/shared/hooks/use-clic-afuera'
import {
  ETIQUETA_ROL,
  ROLES,
  SUBPERFILES_CONTROLLER,
  type Rol,
  type SubperfilController,
} from './roles'
import { useSesion } from './session'

export function SelectorRol() {
  const { rol, subperfil, cambiarRol, cambiarSubperfil } = useSesion()
  const [abierto, setAbierto] = useState(false)
  const contenedorRef = useRef<HTMLDivElement>(null)

  useClicAfuera(contenedorRef, () => setAbierto(false))

  return (
    <div ref={contenedorRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-label={`Rol: ${ETIQUETA_ROL[rol]}`}
        onClick={() => setAbierto(!abierto)}
        className="flex h-8 items-center gap-1.5 rounded-full border border-border-strong bg-surface px-3 text-caption text-ink hover:bg-surface-sunken"
      >
        <User className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="font-medium">{ETIQUETA_ROL[rol]}</span>
        {rol === 'controller' && subperfil && (
          <span className="rounded-badge bg-surface-sunken px-1.5 py-0.5 text-caption text-ink-muted">
            {subperfil}
          </span>
        )}
        <ChevronDown
          className={`size-3.5 shrink-0 transition-transform duration-120 ${abierto ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {abierto && (
        <div className="absolute right-0 top-full z-30 mt-1.5 w-52 overflow-hidden rounded-control border border-border-strong bg-surface shadow-raised">
          <ul role="listbox" aria-label="Rol simulado" className="py-1">
            {ROLES.map((r) => (
              <li
                key={r}
                role="option"
                aria-selected={r === rol}
                onClick={() => {
                  cambiarRol(r as Rol)
                  if (r !== 'controller') setAbierto(false)
                }}
                className={`flex h-9 cursor-pointer items-center px-3 text-body ${
                  r === rol
                    ? 'bg-primary-subtle font-medium text-ink'
                    : 'text-ink hover:bg-surface-sunken'
                }`}
              >
                {ETIQUETA_ROL[r as Rol]}
              </li>
            ))}
          </ul>

          {rol === 'controller' && (
            <>
              <div className="border-t border-border px-3 py-2">
                <span className="text-caption font-medium uppercase tracking-wider text-ink-muted">
                  Sub-perfil
                </span>
              </div>
              <ul role="listbox" aria-label="Sub-perfil de Controller" className="pb-1">
                {SUBPERFILES_CONTROLLER.map((s) => (
                  <li
                    key={s}
                    role="option"
                    aria-selected={s === subperfil}
                    onClick={() => {
                      cambiarSubperfil(s as SubperfilController)
                      setAbierto(false)
                    }}
                    className={`flex h-9 cursor-pointer items-center px-3 text-body ${
                      s === subperfil
                        ? 'bg-primary-subtle font-medium text-ink'
                        : 'text-ink hover:bg-surface-sunken'
                    }`}
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  )
}
