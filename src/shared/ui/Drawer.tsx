/**
 * Panel lateral. Usa `<dialog>` nativo anclado al borde derecho: el navegador
 * resuelve el atrapado de foco, el cierre con `Esc` y devolver el foco al
 * origen al cerrar. Ver .claude/docs/03-diseno.md §8 y
 * .claude/docs/05-modulo-1-reporteria.md §8 (drawer de bitácora).
 *
 * Ancho ~480px en desktop; pantalla completa en tablet vertical.
 */
import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from 'react'
import { ChevronDown, ChevronUp, X } from 'lucide-react'

interface DrawerProps {
  abierto: boolean
  onCerrar: () => void
  titulo: string
  children: ReactNode
  /**
   * Navegación al registro anterior/siguiente sin cerrar el drawer. Si se
   * omite un handler, su flecha se deshabilita (p. ej. en un extremo de la
   * página actual). Ver .claude/docs/05-modulo-1-reporteria.md §8.
   */
  onNavegarAnterior?: () => void
  onNavegarSiguiente?: () => void
}

export function Drawer({
  abierto,
  onCerrar,
  titulo,
  children,
  onNavegarAnterior,
  onNavegarSiguiente,
}: DrawerProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const idTitulo = useId()

  useEffect(() => {
    const dialogo = ref.current
    if (!dialogo) return
    if (abierto && !dialogo.open) dialogo.showModal()
    if (!abierto && dialogo.open) dialogo.close()
  }, [abierto])

  // El clic en el ::backdrop nativo llega con target === el propio <dialog>,
  // nunca uno de sus hijos: así se distingue "clic fuera" de "clic dentro".
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
      className={
        'm-0 h-dvh max-h-dvh w-full max-w-full border-l border-border bg-surface p-0 shadow-overlay ' +
        'backdrop:bg-ink/40 sm:w-[480px] sm:max-w-[480px] ' +
        // Ancla el <dialog> al borde derecho de la pantalla en vez del centro.
        '[inset-inline-start:auto] [inset-inline-end:0]'
      }
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
          <h2 id={idTitulo} className="min-w-0 flex-1 truncate text-h2 font-semibold text-ink">
            {titulo}
          </h2>
          <div className="flex shrink-0 items-center gap-1">
            {(onNavegarAnterior || onNavegarSiguiente) && (
              <>
                <button
                  type="button"
                  onClick={onNavegarAnterior}
                  disabled={!onNavegarAnterior}
                  aria-label="Registro anterior"
                  className="flex size-8 items-center justify-center rounded-control text-ink-muted hover:bg-surface-sunken hover:text-ink disabled:pointer-events-none disabled:text-ink-disabled"
                >
                  <ChevronUp className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={onNavegarSiguiente}
                  disabled={!onNavegarSiguiente}
                  aria-label="Registro siguiente"
                  className="flex size-8 items-center justify-center rounded-control text-ink-muted hover:bg-surface-sunken hover:text-ink disabled:pointer-events-none disabled:text-ink-disabled"
                >
                  <ChevronDown className="size-4" aria-hidden="true" />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onCerrar}
              aria-label="Cerrar panel"
              className="flex size-8 shrink-0 items-center justify-center rounded-control text-ink-muted hover:bg-surface-sunken hover:text-ink"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </dialog>
  )
}
