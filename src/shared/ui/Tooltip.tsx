/**
 * Tooltip accesible: visible con hover Y con foco de teclado.
 * Ver .claude/docs/03-diseno.md §8 (tooltips) y §12 (accesibilidad)
 *
 * El elemento hijo DEBE ser nativamente enfocable (botón, enlace, input) —
 * un tooltip que solo aparece con el mouse deja fuera a quien navega con
 * teclado, y aquí el teclado es un flujo principal.
 */
import { cloneElement, useId, type ReactElement, type ReactNode } from 'react'

interface TooltipProps {
  contenido: ReactNode
  children: ReactElement<{ 'aria-describedby'?: string }>
  posicion?: 'arriba' | 'abajo'
}

const CLASES_POSICION = {
  arriba: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
  abajo: 'top-full left-1/2 mt-2 -translate-x-1/2',
} as const

export function Tooltip({ contenido, children, posicion = 'arriba' }: TooltipProps) {
  const id = useId()

  return (
    <span className="group/tooltip relative inline-flex">
      {
        // El trigger recibe aria-describedby para que su nombre accesible
        // incluya el contenido del tooltip cuando un lector de pantalla lo enfoque.
        cloneElement(children, { 'aria-describedby': id })
      }
      <span
        role="tooltip"
        id={id}
        className={`pointer-events-none absolute z-50 max-w-64 rounded-control bg-ink px-2.5 py-1.5 text-caption text-ink-inverse opacity-0 shadow-raised transition-opacity duration-150 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100 ${CLASES_POSICION[posicion]}`}
      >
        {contenido}
      </span>
    </span>
  )
}
