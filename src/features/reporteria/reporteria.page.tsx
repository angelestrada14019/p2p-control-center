/**
 * Módulo 1 — Reportería y Control Preventivo de Provisiones.
 *
 * Dos pestañas globales (.claude/docs/05-modulo-1-reporteria.md §2): "Registro
 * y proyección" (Reportes A/B/C, según sub-perfil) y "No Provisionable"
 * (vista unificada, aún placeholder). Dentro de la primera, un segundo nivel
 * de pestañas alterna entre los reportes visibles para el sub-perfil actual.
 */
import { NavLink, Navigate, Outlet } from 'react-router'
import { useSesion } from '@/auth/session'
import { puedeVerAlcance } from './components/GuardSubperfil'

const CLASE_TAB_BASE = 'rounded-control px-3 py-2 text-body transition-colors'
const CLASE_TAB_ACTIVO = 'border-l-[3px] border-primary bg-primary-subtle pl-[9px] font-medium text-ink'
const CLASE_TAB_INACTIVO = 'text-ink-secondary hover:bg-surface-sunken hover:text-ink'

function claseTab({ isActive }: { isActive: boolean }): string {
  return `${CLASE_TAB_BASE} ${isActive ? CLASE_TAB_ACTIVO : CLASE_TAB_INACTIVO}`
}

export function ReporteriaPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-h1 font-semibold text-ink">Reportería y Control Preventivo de Provisiones</h1>
        <p className="text-body text-ink-muted">
          Detecta y corrige registros contables antes del cierre mensual.
        </p>
      </div>

      <nav aria-label="Secciones de Reportería" className="flex gap-1 border-b border-border">
        <NavLink to="registro" className={claseTab}>
          A Provisionar / Proyectado
        </NavLink>
        <NavLink to="no-provisionable" className={claseTab}>
          No Provisionable
        </NavLink>
      </nav>

      <Outlet />
    </div>
  )
}

/** Sub-navegación de la pestaña "A Provisionar / Proyectado", segmentada por sub-perfil. */
export function RegistroLayout() {
  const { rol, subperfil } = useSesion()
  const veOvh = puedeVerAlcance(rol, subperfil, 'OVH')
  const veTurbo = puedeVerAlcance(rol, subperfil, 'TURBO')

  return (
    <div className="flex flex-col gap-4">
      <nav aria-label="Reportes" className="flex gap-1">
        {veOvh && (
          <NavLink to="sap-ovh" className={claseTab}>
            Reporte A — SAP
          </NavLink>
        )}
        {veOvh && (
          <NavLink to="ns-ovh" className={claseTab}>
            Reporte B — NS
          </NavLink>
        )}
        {veTurbo && (
          <NavLink to="turbo" className={claseTab}>
            Reporte C — SAP TURBO
          </NavLink>
        )}
      </nav>

      <Outlet />
    </div>
  )
}

/** Redirige al primer reporte visible para el sub-perfil actual. */
export function RedireccionRegistro() {
  const { rol, subperfil } = useSesion()
  const destino = puedeVerAlcance(rol, subperfil, 'OVH') ? 'sap-ovh' : 'turbo'
  return <Navigate to={destino} replace />
}
