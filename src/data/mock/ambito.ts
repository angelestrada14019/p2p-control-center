/**
 * Separación de compañías por sub-perfil de Controller.
 *
 * @mock-boundary: Snowflake — el alcance real se determina por la estructura
 * contable de cada sociedad, no por el nombre. Aquí se aproxima con el patrón
 * "Turbo" en el nombre de la compañía, suficiente para datos simulados.
 * Ver .claude/docs/05-modulo-1-reporteria.md §2
 */
import { COMPANIAS } from './catalogos'

export const PERIODO_ACTUAL = '2026-08'
export const PERIODO_ANTERIOR = '2026-07'

/**
 * "Ahora" simulado. Los mocks deben ser deterministas: dos recargas seguidas
 * producen exactamente los mismos datos, incluidas marcas de tiempo como
 * "última actualización". Usar `new Date()`/`Date.now()` aquí rompería esa
 * garantía sin ninguna ganancia — el adaptador real sí devolverá la hora
 * real del servidor. Ver .claude/docs/04-datos.md §5.4
 */
export const AHORA_SIMULADO = '2026-08-12T09:00:00.000Z'

export const COMPANIAS_OVH = COMPANIAS.filter((c) => !c.nombre.includes('Turbo'))
export const COMPANIAS_TURBO = COMPANIAS.filter((c) => c.nombre.includes('Turbo'))
