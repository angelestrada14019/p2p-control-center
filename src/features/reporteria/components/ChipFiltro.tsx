/** Chip removible individualmente para un filtro activo. Ver .claude/docs/03-diseno.md §8 (filtros). */
import { X } from 'lucide-react'

interface ChipFiltroProps {
  etiqueta: string
  onQuitar: () => void
}

export function ChipFiltro({ etiqueta, onQuitar }: ChipFiltroProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-badge bg-primary-subtle py-0.5 pr-1 pl-2 text-caption font-medium text-ink">
      {etiqueta}
      <button
        type="button"
        onClick={onQuitar}
        aria-label={`Quitar filtro: ${etiqueta}`}
        className="flex size-5 shrink-0 items-center justify-center rounded-full hover:bg-primary/20"
      >
        <X className="size-3" aria-hidden="true" />
      </button>
    </span>
  )
}
