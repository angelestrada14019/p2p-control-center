/**
 * Cálculo de contraste WCAG 2.x.
 *
 * Existe para que las afirmaciones de accesibilidad del proyecto sean
 * verificables y no citas de memoria. Lo usa `tokens.test.ts`, que falla si
 * algún token cae por debajo de su mínimo.
 *
 * Referencia: https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio
 */

/** Mínimos exigidos por WCAG 2.2 nivel AA. */
export const MINIMO = {
  /** Texto normal: < 18pt, o < 14pt en negrita. */
  textoNormal: 4.5,
  /** Texto grande: >= 18pt (24px), o >= 14pt (18.66px) en negrita. */
  textoGrande: 3,
  /** Componentes de interfaz y elementos gráficos (SC 1.4.11). */
  noTextual: 3,
} as const

function canalLineal(valor: number): number {
  const v = valor / 255
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
}

/** Luminancia relativa de un color hexadecimal (`#RRGGBB` o `RRGGBB`). */
export function luminancia(hex: string): number {
  const limpio = hex.replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(limpio)) {
    throw new Error(`Color hexadecimal inválido: "${hex}". Se espera #RRGGBB.`)
  }
  const r = canalLineal(parseInt(limpio.slice(0, 2), 16))
  const g = canalLineal(parseInt(limpio.slice(2, 4), 16))
  const b = canalLineal(parseInt(limpio.slice(4, 6), 16))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Ratio de contraste entre dos colores, de 1 (idénticos) a 21 (negro y blanco).
 * El orden de los argumentos es indiferente.
 */
export function contraste(colorA: string, colorB: string): number {
  const a = luminancia(colorA)
  const b = luminancia(colorB)
  const claro = Math.max(a, b)
  const oscuro = Math.min(a, b)
  return (claro + 0.05) / (oscuro + 0.05)
}

/** Redondea a dos decimales, para reportes legibles. */
export function ratio(colorA: string, colorB: string): number {
  return Math.round(contraste(colorA, colorB) * 100) / 100
}
