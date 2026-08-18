/**
 * Enlace "Volver al inicio" usado por toda página de segundo nivel. Extraído
 * para no duplicar el mismo bloque en cada página (ver .claude/docs/02-arquitectura.md §5).
 */
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'

export function EnlaceVolverInicio() {
  return (
    <Link to="/" className="flex items-center gap-1.5 text-caption text-ink-secondary hover:text-ink">
      <ArrowLeft className="size-4" aria-hidden="true" />
      Volver al inicio
    </Link>
  )
}
