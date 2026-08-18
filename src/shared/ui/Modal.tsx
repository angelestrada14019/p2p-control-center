/**
 * Modal sobre `<dialog>` nativo: el navegador resuelve gratis el atrapado de
 * foco, el cierre con `Esc` y el retorno de foco al elemento de origen — que
 * es exactamente lo que exige .claude/docs/03-diseno.md §8 (drawer/modal) y
 * §12 (foco atrapado, foco devuelto al cerrar).
 */
import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  abierto: boolean
  onCerrar: () => void
  titulo: string
  children: ReactNode
}

export function Modal({ abierto, onCerrar, titulo, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const idTitulo = useId()

  useEffect(() => {
    const dialogo = ref.current
    if (!dialogo) return
    if (abierto && !dialogo.open) dialogo.showModal()
    if (!abierto && dialogo.open) dialogo.close()
  }, [abierto])

  // showModal() nativo no cierra al hacer clic en el backdrop por sí solo:
  // el clic llega al propio <dialog> (que ocupa toda la ventana) solo cuando
  // NO golpeó ninguno de sus hijos. Ver .claude/docs/03-diseno.md §8.
  function alHacerClicEnFondo(evento: MouseEvent<HTMLDialogElement>) {
    if (evento.target === ref.current) onCerrar()
  }

  return (
    <dialog
      ref={ref}
      onClose={onCerrar}
      onCancel={onCerrar}
      onClick={alHacerClicEnFondo}
      aria-labelledby={idTitulo}
      className="rounded-modal border border-border bg-surface p-0 shadow-overlay backdrop:bg-ink/40"
    >
      <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
        <h2 id={idTitulo} className="text-h2 font-semibold text-ink">
          {titulo}
        </h2>
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          className="flex size-8 shrink-0 items-center justify-center rounded-control text-ink-muted hover:bg-surface-sunken hover:text-ink"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div className="max-h-[70vh] overflow-y-auto p-6">{children}</div>
    </dialog>
  )
}
