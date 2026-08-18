/**
 * Chip genérico para etiquetas que NO representan un estado del negocio
 * (filtros activos, conteos, metadatos). Para estados usa `Semaforo`.
 */
import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  className?: string
}

export function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-badge bg-neutral-subtle px-2 py-0.5 text-caption font-medium text-neutral-ink ${className}`}
    >
      {children}
    </span>
  )
}
