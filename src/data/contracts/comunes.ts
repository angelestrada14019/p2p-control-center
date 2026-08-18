/**
 * Tipos comunes de la capa de datos.
 * Ver .claude/docs/04-datos.md
 */
import { z } from 'zod'
import {
  ESTADOS_REVISION,
  MONEDAS,
  NIVELES_RIESGO,
  PAISES,
  TIPOS_INCONSISTENCIA,
  periodoSchema,
} from '@/shared/types/dominio'

/* ─────────────────────────────────────────────────────────────
   Importe: una cifra NUNCA viaja sin su moneda
   ───────────────────────────────────────────────────────────── */

/**
 * Un valor monetario y su moneda, inseparables.
 *
 * Modelarlos juntos es deliberado: hace imposible, por construcción, mostrar
 * una cifra sin su moneda o sumar monedas distintas por descuido. Ver la regla
 * en .claude/docs/04-datos.md §5.5
 */
export const importeSchema = z.object({
  valor: z.number(),
  moneda: z.enum(MONEDAS),
})
export type Importe = z.infer<typeof importeSchema>

/* ─────────────────────────────────────────────────────────────
   Clave de negocio
   ───────────────────────────────────────────────────────────── */

/**
 * Identificador compuesto que une un hecho de Snowflake con sus anotaciones en
 * Supabase. NO es una foreign key entre bases: es una clave de negocio.
 * Ver .claude/docs/04-datos.md §2
 */
export const claveNegocioSchema = z.object({
  periodo: periodoSchema,
  compania: z.string().min(1),
  documento: z.string().min(1),
  linea: z.number().int().nonnegative(),
})
export type ClaveNegocio = z.infer<typeof claveNegocioSchema>

/**
 * Única función de derivación de clave del proyecto. NO se duplica: si aparece
 * otra forma de construir este identificador, las anotaciones dejan de casar
 * con sus registros y el histórico se rompe en silencio.
 */
export function derivarClave(clave: ClaveNegocio): string {
  return `${clave.periodo}|${clave.compania}|${clave.documento}|${clave.linea}`
}

/* ─────────────────────────────────────────────────────────────
   Paginación
   ───────────────────────────────────────────────────────────── */

/**
 * Ningún método del contrato devuelve un array crudo. Los reportes manejan
 * miles de filas y la paginación es parte del contrato, no del componente.
 */
export interface Pagina<T> {
  items: T[]
  total: number
  pagina: number
  porPagina: number
}

export const TAMANOS_PAGINA = [25, 50, 100, 200] as const
export const TAMANO_PAGINA_POR_DEFECTO = 50

/* ─────────────────────────────────────────────────────────────
   Consulta
   ───────────────────────────────────────────────────────────── */

export type DireccionOrden = 'asc' | 'desc'

/**
 * Filtros de .claude/docs/05-modulo-1-reporteria.md §10.
 * Se aplican en el origen, nunca en el cliente sobre el dataset completo.
 */
export const consultaReporteSchema = z.object({
  periodo: periodoSchema,
  paises: z.array(z.enum(PAISES)).optional(),
  companias: z.array(z.string()).optional(),
  proveedores: z.array(z.string()).optional(),
  cuentasContables: z.array(z.string()).optional(),
  centrosCosto: z.array(z.string()).optional(),
  responsables: z.array(z.string()).optional(),
  estados: z.array(z.enum(ESTADOS_REVISION)).optional(),
  nivelesRiesgo: z.array(z.enum(NIVELES_RIESGO)).optional(),
  tiposInconsistencia: z.array(z.enum(TIPOS_INCONSISTENCIA)).optional(),
  desde: z.string().optional(),
  hasta: z.string().optional(),
  /** Búsqueda de texto libre sobre los campos textuales. */
  busqueda: z.string().optional(),
  ordenarPor: z.string().optional(),
  direccion: z.enum(['asc', 'desc']).optional(),
  pagina: z.number().int().positive().default(1),
  porPagina: z.number().int().positive().default(TAMANO_PAGINA_POR_DEFECTO),
})
export type ConsultaReporte = z.infer<typeof consultaReporteSchema>

/* ─────────────────────────────────────────────────────────────
   Indicadores resumen de una consulta
   ───────────────────────────────────────────────────────────── */

/**
 * Responden a los filtros activos, no al dataset completo.
 * Ver .claude/docs/05-modulo-1-reporteria.md §10
 */
export interface ResumenConsulta {
  totalRegistros: number
  /** Consolidado en la moneda de reporte, declarada explícitamente. */
  valorTotal: Importe
  conInconsistencia: number
  criticos: number
  sinResponsable: number
  /** Proporción de 0 a 1. */
  avanceCorreccion: number
}
