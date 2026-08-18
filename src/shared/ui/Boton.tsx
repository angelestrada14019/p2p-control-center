/**
 * Botón. Ver .claude/docs/03-diseno.md §2.3
 *
 * La variante `primaria` usa el naranja de marca con texto slate — NUNCA
 * blanco: blanco sobre #FF441F da 3.44:1 y falla AA. Ver ADR-11.
 */
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'

export type VarianteBoton = 'primaria' | 'secundaria' | 'terciaria' | 'destructiva'
export type TamanoBoton = 'sm' | 'md'

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBoton
  tamano?: TamanoBoton
  cargando?: boolean
}

const CLASES_BASE =
  'inline-flex items-center justify-center gap-2 rounded-control font-medium ' +
  'transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 px-3'

const CLASES_VARIANTE: Record<VarianteBoton, string> = {
  primaria:
    'bg-primary text-primary-ink hover:bg-primary-hover active:shadow-[var(--inset-pressed)]',
  secundaria:
    'bg-surface text-ink border border-border-strong hover:bg-surface-sunken',
  terciaria: 'bg-transparent text-primary-ink underline-offset-4 hover:underline px-1',
  destructiva: 'bg-danger-solid text-ink-inverse hover:opacity-90',
}

const CLASES_TAMANO: Record<TamanoBoton, string> = {
  sm: 'h-8 text-caption',
  md: 'h-9 text-body',
}

export const Boton = forwardRef<HTMLButtonElement, BotonProps>(function Boton(
  { variante = 'primaria', tamano = 'md', cargando = false, disabled, className = '', children, ...resto },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`${CLASES_BASE} ${CLASES_VARIANTE[variante]} ${CLASES_TAMANO[tamano]} ${className}`}
      disabled={disabled || cargando}
      aria-busy={cargando}
      {...resto}
    >
      {cargando && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
})
