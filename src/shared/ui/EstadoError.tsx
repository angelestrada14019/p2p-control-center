/**
 * Estado de error. Explica qué falló, si es recuperable, y ofrece reintentar.
 * Ver .claude/docs/02-arquitectura.md §8. Un `catch` sin manejo visible al
 * usuario es un defecto — este componente es ese manejo visible.
 */
import { OctagonX, RotateCw } from 'lucide-react'
import { Boton } from './Boton'

interface EstadoErrorProps {
  titulo?: string
  descripcion: string
  onReintentar?: () => void
}

export function EstadoError({
  titulo = 'Algo falló al cargar esto',
  descripcion,
  onReintentar,
}: EstadoErrorProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-card border border-danger-subtle bg-danger-subtle/40 px-6 py-12 text-left"
    >
      <OctagonX className="size-8 text-danger-ink" aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-h3 font-semibold text-ink">{titulo}</p>
        <p className="max-w-sm text-body text-ink-muted">{descripcion}</p>
      </div>
      {onReintentar && (
        <Boton variante="secundaria" tamano="sm" onClick={onReintentar}>
          <RotateCw className="size-4" aria-hidden="true" />
          Reintentar
        </Boton>
      )}
    </div>
  )
}
