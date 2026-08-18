/**
 * Matriz de permisos. Ver .claude/docs/01-producto.md §5 (tabla completa).
 *
 * Esta es la ÚNICA fuente de verdad sobre qué puede hacer cada rol. Ningún
 * componente decide visibilidad de una acción por su cuenta: todos consultan
 * `puede()` o el hook `usePuede()` de `Puede.tsx`.
 */
import type { Rol } from './roles'

export const ACCIONES = [
  'ver-home',
  'ver-modulo-reporteria',
  'marcar-estado-registro',
  'comentar-bitacora',
  'asignar-responsable',
  'cambiar-estado-observacion',
  'marcar-correccion-completada',
  'validar-registro',
  'cambiar-nivel-riesgo',
  'descargar-excel',
  'guardar-vista',
  'ver-modulo-checklist',
  'ejecutar-control-checklist',
  'adjuntar-evidencia',
  'aprobar-control',
  'confirmar-cierre-final',
  'ver-historial-auditoria',
  'configurar-metas-y-catalogo',
] as const
export type Accion = (typeof ACCIONES)[number]

type Matriz = Record<Rol, Record<Accion, boolean>>

const MATRIZ: Matriz = {
  admin: {
    'ver-home': true,
    'ver-modulo-reporteria': true,
    'marcar-estado-registro': true,
    'comentar-bitacora': true,
    'asignar-responsable': true,
    'cambiar-estado-observacion': true,
    'marcar-correccion-completada': true,
    'validar-registro': true,
    'cambiar-nivel-riesgo': true,
    'descargar-excel': true,
    'guardar-vista': true,
    'ver-modulo-checklist': true,
    'ejecutar-control-checklist': true,
    'adjuntar-evidencia': true,
    'aprobar-control': true,
    'confirmar-cierre-final': true,
    'ver-historial-auditoria': true,
    'configurar-metas-y-catalogo': true,
  },
  controller: {
    'ver-home': true,
    'ver-modulo-reporteria': true,
    'marcar-estado-registro': true,
    'comentar-bitacora': true,
    'asignar-responsable': true,
    'cambiar-estado-observacion': true,
    'marcar-correccion-completada': true,
    'validar-registro': true,
    'cambiar-nivel-riesgo': true,
    'descargar-excel': true,
    'guardar-vista': true,
    'ver-modulo-checklist': true,
    'ejecutar-control-checklist': true,
    'adjuntar-evidencia': true,
    'aprobar-control': true,
    'confirmar-cierre-final': false,
    'ver-historial-auditoria': true,
    'configurar-metas-y-catalogo': false,
  },
  analista_p2p: {
    'ver-home': true,
    'ver-modulo-reporteria': true,
    'marcar-estado-registro': true,
    'comentar-bitacora': true,
    'asignar-responsable': true,
    'cambiar-estado-observacion': true,
    'marcar-correccion-completada': false,
    'validar-registro': false,
    'cambiar-nivel-riesgo': false,
    'descargar-excel': true,
    'guardar-vista': true,
    'ver-modulo-checklist': true,
    'ejecutar-control-checklist': true,
    'adjuntar-evidencia': true,
    'aprobar-control': false,
    'confirmar-cierre-final': false,
    'ver-historial-auditoria': true,
    'configurar-metas-y-catalogo': false,
  },
  contabilidad: {
    'ver-home': true,
    'ver-modulo-reporteria': true,
    'marcar-estado-registro': false,
    'comentar-bitacora': true,
    'asignar-responsable': false,
    'cambiar-estado-observacion': false,
    'marcar-correccion-completada': false,
    'validar-registro': false,
    'cambiar-nivel-riesgo': false,
    'descargar-excel': true,
    'guardar-vista': true,
    'ver-modulo-checklist': true,
    'ejecutar-control-checklist': false,
    'adjuntar-evidencia': false,
    'aprobar-control': false,
    'confirmar-cierre-final': false,
    'ver-historial-auditoria': true,
    'configurar-metas-y-catalogo': false,
  },
  consulta: {
    'ver-home': true,
    'ver-modulo-reporteria': true,
    'marcar-estado-registro': false,
    'comentar-bitacora': false,
    'asignar-responsable': false,
    'cambiar-estado-observacion': false,
    'marcar-correccion-completada': false,
    'validar-registro': false,
    'cambiar-nivel-riesgo': false,
    'descargar-excel': false,
    'guardar-vista': true,
    'ver-modulo-checklist': true,
    'ejecutar-control-checklist': false,
    'adjuntar-evidencia': false,
    'aprobar-control': false,
    'confirmar-cierre-final': false,
    'ver-historial-auditoria': false,
    'configurar-metas-y-catalogo': false,
  },
}

export function puede(rol: Rol, accion: Accion): boolean {
  return MATRIZ[rol][accion]
}

/** Texto explicativo para el tooltip de una acción deshabilitada por rol. */
export function motivoSinPermiso(rol: Rol): string {
  return `Tu rol actual (${rol}) no tiene permiso para esta acción.`
}
