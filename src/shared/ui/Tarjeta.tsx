/**
 * Tarjeta. Contenedor base para tarjetas de módulo, tarjetas de KPI y
 * paneles de resumen. Ver .claude/docs/03-diseno.md §4.3 y §7
 */
import type { ButtonHTMLAttributes, HTMLAttributes } from 'react'

const CLASES_BASE = 'rounded-card border border-border bg-surface shadow-card'

export function Tarjeta({ className = '', ...resto }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`${CLASES_BASE} ${className}`} {...resto} />
}

/**
 * Variante interactiva para las tres tarjetas de módulo del home: toda la
 * superficie es clicable, con foco visible y semántica de botón real (no un
 * `div` con `onClick`, que no es alcanzable por teclado).
 */
export function TarjetaClicable({
  className = '',
  ...resto
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`${CLASES_BASE} w-full text-left transition-shadow duration-150 hover:shadow-raised ${className}`}
      {...resto}
    />
  )
}
