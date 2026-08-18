/**
 * Generador pseudoaleatorio DETERMINISTA.
 *
 * Los mocks deben producir exactamente los mismos datos en cada ejecución: un
 * reporte que cambia en cada refresh es imposible de revisar, y este producto
 * existe precisamente para revisar reportes.
 *
 * Por eso `Math.random()` está prohibido en `src/data/mock/`.
 * Ver .claude/docs/04-datos.md §5.4
 */

/** Mulberry32: rápido, con buena distribución y estado de 32 bits. */
export function crearAleatorio(semilla: number) {
  let estado = semilla >>> 0

  /** Número en [0, 1). */
  function siguiente(): number {
    estado = (estado + 0x6d2b79f5) >>> 0
    let t = estado
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  return {
    siguiente,

    /** Entero en [min, max], ambos inclusive. */
    entero(min: number, max: number): number {
      return Math.floor(siguiente() * (max - min + 1)) + min
    },

    /** Decimal en [min, max) redondeado a `decimales`. */
    decimal(min: number, max: number, decimales = 2): number {
      const factor = 10 ** decimales
      return Math.round((siguiente() * (max - min) + min) * factor) / factor
    },

    /** Un elemento del array. Lanza si está vacío: un mock vacío es un defecto. */
    elemento<T>(items: readonly T[]): T {
      if (items.length === 0) {
        throw new Error('crearAleatorio().elemento recibió un array vacío')
      }
      // `noUncheckedIndexedAccess` obliga a la aserción; el índice es válido
      // porque acabamos de comprobar la longitud.
      return items[Math.floor(siguiente() * items.length)] as T
    },

    /** `true` con la probabilidad indicada (0 a 1). */
    probabilidad(p: number): boolean {
      return siguiente() < p
    },

    /** Baraja una copia del array sin mutar el original (Fisher-Yates). */
    barajar<T>(items: readonly T[]): T[] {
      const copia = [...items]
      for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(siguiente() * (i + 1))
        const tmp = copia[i] as T
        copia[i] = copia[j] as T
        copia[j] = tmp
      }
      return copia
    },
  }
}

export type Aleatorio = ReturnType<typeof crearAleatorio>

/**
 * Semilla fija del proyecto. Cambiarla regenera TODOS los datos simulados;
 * hazlo solo a propósito, porque invalida cualquier captura de pantalla o
 * hallazgo que el equipo haya reportado sobre un registro concreto.
 */
export const SEMILLA = 20260812
