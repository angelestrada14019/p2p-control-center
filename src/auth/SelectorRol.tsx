/**
 * Selector de identidad simulada, en el encabezado. Ver ADR-02.
 *
 * Permite probar los cinco roles sin login. Cuando el rol es `controller`,
 * también se puede elegir el sub-perfil OVH/TURBO.
 */
import { User } from 'lucide-react'
import { ETIQUETA_ROL, ROLES, SUBPERFILES_CONTROLLER, type Rol } from './roles'
import { useSesion } from './session'

export function SelectorRol() {
  const { rol, subperfil, cambiarRol, cambiarSubperfil } = useSesion()

  return (
    <div className="flex items-center gap-2 text-caption text-ink-secondary">
      <User className="size-4 shrink-0" aria-hidden="true" />
      <label className="flex items-center gap-1">
        <span className="sr-only">Rol simulado</span>
        <select
          aria-label="Rol simulado"
          value={rol}
          onChange={(evento) => cambiarRol(evento.target.value as Rol)}
          className="h-8 rounded-control border border-border-strong bg-surface px-2 text-body text-ink"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ETIQUETA_ROL[r]}
            </option>
          ))}
        </select>
      </label>
      {rol === 'controller' && (
        <label className="flex items-center gap-1">
          <span className="sr-only">Sub-perfil de Controller</span>
          <select
            aria-label="Sub-perfil de Controller"
            value={subperfil}
            onChange={(evento) => cambiarSubperfil(evento.target.value as typeof subperfil)}
            className="h-8 rounded-control border border-border-strong bg-surface px-2 text-body text-ink"
          >
            {SUBPERFILES_CONTROLLER.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  )
}
