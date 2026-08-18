/**
 * Navegación lateral, colapsable. Ver .claude/docs/03-diseno.md §7 y §9
 *
 * Por defecto se colapsa a íconos entre 1024–1439px y se expande a partir de
 * 1440px, igual que documenta §9. El botón permite forzar lo contrario en
 * cualquier ancho — el ancho en sí nunca se anima (§10: solo `transform`/`opacity`).
 */
import { useState } from 'react'
import { NavLink } from 'react-router'
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Gauge,
  LayoutGrid,
  ListChecks,
  TableProperties,
} from 'lucide-react'
import { useMediaQuery } from '@/shared/hooks/use-media-query'

const ENLACES = [
  { a: '/', etiqueta: 'Inicio', icono: LayoutGrid, fin: true },
  { a: '/reporteria', etiqueta: 'Reportería', icono: TableProperties, fin: false },
  { a: '/kpis', etiqueta: 'KPIs P2P', icono: Gauge, fin: false },
  { a: '/checklist', etiqueta: 'Checklist de precierre', icono: ListChecks, fin: false },
  { a: '/alertas', etiqueta: 'Alertas', icono: Bell, fin: false },
] as const

export function NavegacionModulos() {
  const expandidaPorDefecto = useMediaQuery('(min-width: 1440px)')
  const [forzada, setForzada] = useState<boolean | null>(null)
  const expandida = forzada ?? expandidaPorDefecto

  return (
    <nav
      aria-label="Navegación de módulos"
      className={`flex shrink-0 flex-col border-r border-border bg-surface ${expandida ? 'w-56' : 'w-14'}`}
    >
      <div
        className={`flex h-10 shrink-0 items-center border-b border-border px-2 ${expandida ? 'justify-between' : 'justify-center'}`}
      >
        {expandida && (
          <span className="text-caption font-medium uppercase tracking-wider text-ink-muted">
            Menú
          </span>
        )}
        <button
          type="button"
          onClick={() => setForzada(!expandida)}
          aria-label={expandida ? 'Colapsar navegación' : 'Expandir navegación'}
          className="flex items-center gap-1 rounded-control p-1.5 text-caption text-ink-muted hover:bg-surface-sunken"
        >
          {expandida ? (
            <ChevronLeft className="size-4 shrink-0" aria-hidden="true" />
          ) : (
            <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
          )}
        </button>
      </div>

      <ul className="flex flex-col gap-1 p-2">
        {ENLACES.map(({ a, etiqueta, icono: Icono, fin }) => (
          <li key={a}>
            <NavLink
              to={a}
              end={fin}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-control px-2.5 py-2 text-body ${
                  isActive
                    ? 'border-l-[3px] border-primary bg-primary-subtle pl-[7px] font-medium text-ink'
                    : 'text-ink-secondary hover:bg-surface-sunken hover:text-ink'
                }`
              }
            >
              <Icono className="size-4.5 shrink-0" aria-hidden="true" />
              {expandida && <span>{etiqueta}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
