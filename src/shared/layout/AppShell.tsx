/**
 * Estructura raíz de la aplicación. Ver .claude/docs/03-diseno.md §7 y §9
 *
 * Por debajo de 768px la app NO es soportada: se muestra un mensaje
 * explicativo en vez de un layout roto o con scroll horizontal.
 */
import { MonitorSmartphone } from 'lucide-react'
import { Outlet } from 'react-router'
import { Encabezado } from './Encabezado'
import { NavegacionModulos } from './NavegacionModulos'

export function AppShell() {
  return (
    <>
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center md:hidden">
        <MonitorSmartphone className="size-8 text-ink-muted" aria-hidden="true" />
        <p className="text-h3 font-semibold text-ink">Esta herramienta requiere una pantalla más grande</p>
        <p className="max-w-sm text-body text-ink-muted">
          P2P Control Center está diseñado para escritorio y tablet (768px de ancho o más). Ábrelo
          desde un equipo o una tablet en orientación horizontal.
        </p>
      </div>

      <div className="hidden h-dvh flex-col bg-canvas md:flex">
        <a
          href="#contenido-principal"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-control focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-ink"
        >
          Saltar al contenido principal
        </a>

        <Encabezado />

        {/* min-h-0 impide que los hijos flex desborden al padre cuando el
            contenido es más alto que el viewport — patrón app-shell. */}
        <div className="flex min-h-0 flex-1">
          <NavegacionModulos />
          <main
            id="contenido-principal"
            className="min-w-0 flex-1 overflow-y-auto px-6 py-6"
          >
            <Outlet />
          </main>
        </div>
      </div>
    </>
  )
}
