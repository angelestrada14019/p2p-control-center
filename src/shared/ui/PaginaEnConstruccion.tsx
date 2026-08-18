/**
 * Placeholder explicativo para un módulo que aún no se construye en esta
 * fase (ver .claude/docs/12-decisiones.md — alcance de esta entrega).
 * Explica qué vendrá, no es una página en blanco.
 */
import { Construction } from 'lucide-react'
import type { ReactNode } from 'react'
import { EnlaceVolverInicio } from './EnlaceVolverInicio'

interface PaginaEnConstruccionProps {
  titulo: string
  descripcion: string
  /** Ruta del documento de especificación, p. ej. ".claude/docs/05-modulo-1-reporteria.md". */
  documentoRelacionado?: string
  children?: ReactNode
}

export function PaginaEnConstruccion({
  titulo,
  descripcion,
  documentoRelacionado,
  children,
}: PaginaEnConstruccionProps) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-start gap-4 py-12">
      <EnlaceVolverInicio />

      <div className="flex items-start gap-3">
        <Construction className="mt-1 size-6 shrink-0 text-warning-solid" aria-hidden="true" />
        <div>
          <h1 className="text-h1 font-semibold text-ink">{titulo}</h1>
          <p className="mt-1 text-body text-ink-muted">{descripcion}</p>
        </div>
      </div>

      {children}

      {documentoRelacionado && (
        <p className="text-caption text-ink-muted">
          Especificación completa: <span className="font-medium text-ink-secondary">{documentoRelacionado}</span>
        </p>
      )}
    </div>
  )
}
