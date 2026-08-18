/**
 * Roles del sistema. Ver .claude/docs/01-producto.md §5
 *
 * La identidad es SIMULADA en este MVP (ADR-02): no hay login. Los permisos
 * que se derivan de estos roles son reales y se aplican de verdad.
 */
export const ROLES = ['admin', 'controller', 'analista_p2p', 'contabilidad', 'consulta'] as const
export type Rol = (typeof ROLES)[number]

export const ETIQUETA_ROL: Record<Rol, string> = {
  admin: 'Administrador',
  controller: 'Controller',
  analista_p2p: 'Analista P2P',
  contabilidad: 'Contabilidad',
  consulta: 'Consulta / Liderazgo',
}

/**
 * Sub-perfiles del rol `controller`. NO son roles adicionales: determinan qué
 * alcance de reportes ve un Controller, no qué puede hacer.
 * Ver .claude/docs/05-modulo-1-reporteria.md §2
 */
export const SUBPERFILES_CONTROLLER = ['OVH', 'TURBO'] as const
export type SubperfilController = (typeof SUBPERFILES_CONTROLLER)[number]
