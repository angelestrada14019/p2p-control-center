/** Ícono de fila que abre el drawer en la pestaña de bitácora. */
import { MessageSquare } from 'lucide-react'
import type { MouseEvent } from 'react'

export function IconoComentarios({ cantidad, onAbrir }: { cantidad: number; onAbrir: () => void }) {
  function alHacerClic(evento: MouseEvent) {
    // Evita que también dispare el `onClicFila` de la fila (que abre "detalle").
    evento.stopPropagation()
    onAbrir()
  }

  return (
    <button
      type="button"
      onClick={alHacerClic}
      aria-label={`Ver bitácora (${cantidad} ${cantidad === 1 ? 'entrada' : 'entradas'})`}
      className="relative flex size-8 items-center justify-center rounded-control text-ink-muted hover:bg-surface-sunken hover:text-ink"
    >
      <MessageSquare className="size-4" aria-hidden="true" />
      {cantidad > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-primary-ink">
          {cantidad > 9 ? '9+' : cantidad}
        </span>
      )}
    </button>
  )
}
