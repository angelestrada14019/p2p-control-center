/**
 * Semáforo — el indicador de estado central de la aplicación.
 * Ver .claude/docs/03-diseno.md §2.4
 *
 * REGLA DURA (ADR-06): el color nunca va solo. Cada tono lleva SIEMPRE un
 * ícono de forma distinta además del texto — con daltonismo o en escala de
 * grises, los cuatro colores son casi indistinguibles entre sí (~1.02:1).
 */
import { AlertTriangle, CheckCircle2, Info, MinusCircle, OctagonX } from 'lucide-react'
import type { TonoSemaforo } from '@/shared/types/dominio'

const ICONO_POR_TONO: Record<TonoSemaforo, typeof CheckCircle2> = {
  exito: CheckCircle2,
  advertencia: AlertTriangle,
  error: OctagonX,
  info: Info,
  neutro: MinusCircle,
}

const CLASES_POR_TONO: Record<TonoSemaforo, string> = {
  exito: 'bg-success-subtle text-success-ink',
  advertencia: 'bg-warning-subtle text-warning-ink',
  error: 'bg-danger-subtle text-danger-ink',
  info: 'bg-info-subtle text-info-ink',
  neutro: 'bg-neutral-subtle text-neutral-ink',
}

interface SemaforoProps {
  tono: TonoSemaforo
  etiqueta: string
  /** Oculta el texto visualmente pero lo conserva para lectores de pantalla. */
  soloIcono?: boolean
  className?: string
}

export function Semaforo({ tono, etiqueta, soloIcono = false, className = '' }: SemaforoProps) {
  const Icono = ICONO_POR_TONO[tono]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-badge px-2 py-0.5 text-caption font-medium ${CLASES_POR_TONO[tono]} ${className}`}
    >
      <Icono className="size-3.5 shrink-0" aria-hidden="true" />
      <span className={soloIcono ? 'sr-only' : ''}>{etiqueta}</span>
    </span>
  )
}

/**
 * El punto sólido de un semáforo, para celdas de tabla muy densas.
 *
 * NUNCA se usa solo: es `aria-hidden` a propósito porque siempre debe ir
 * acompañado de texto visible en la misma celda (o de un `title`/tooltip
 * accesible). Un punto de color sin más viola la regla de ADR-06.
 */
export function PuntoSemaforo({ tono }: { tono: TonoSemaforo }) {
  const clasePorTono: Record<TonoSemaforo, string> = {
    exito: 'bg-success-solid',
    advertencia: 'bg-warning-solid',
    error: 'bg-danger-solid',
    info: 'bg-info-solid',
    neutro: 'bg-neutral-solid',
  }
  return <span className={`inline-block size-2 rounded-full ${clasePorTono[tono]}`} aria-hidden="true" />
}
