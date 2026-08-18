/**
 * Selector de adaptador de datos.
 *
 * ÚNICO archivo del proyecto que conoce los adaptadores concretos. Ningún
 * componente, hook o página importa de `data/mock`, `data/snowflake` o
 * `data/supabase` directamente — todos consumen `repositorios` desde aquí.
 * Ver .claude/docs/04-datos.md §4 y .claude/docs/02-arquitectura.md §4
 */
import type { Repositorios } from './contracts'
import { crearRepositoriosMock } from './mock'

export const FUENTE_DATOS = import.meta.env.VITE_DATA_SOURCE ?? 'mock'

/** `true` mientras la app funciona sobre datos simulados. Ver 04-datos.md §5.3 */
export const USANDO_DATOS_SIMULADOS = FUENTE_DATOS === 'mock'

function crearRepositorios(): Repositorios {
  if (FUENTE_DATOS === 'mock') {
    return crearRepositoriosMock()
  }

  // @mock-boundary: Snowflake + Supabase — adaptadores reales aún no existen.
  // Cuando se implementen, este es el ÚNICO lugar que cambia; ninguna pantalla
  // debería necesitar tocarse. Ver .claude/docs/04-datos.md §5.6
  throw new Error(
    `VITE_DATA_SOURCE="${FUENTE_DATOS}" no está implementado todavía. ` +
      'Solo "mock" está disponible en esta fase del proyecto.',
  )
}

export const repositorios: Repositorios = crearRepositorios()

export * from './contracts'
