/**
 * Selector de periodo contable, en el encabezado.
 * Ver .claude/docs/01-producto.md §7
 */
import { Calendar } from 'lucide-react'
import { useAmbito } from '@/shared/hooks/use-ambito'
import type { Periodo } from '@/shared/types/dominio'

const NOMBRE_MES: Record<string, string> = {
  '01': 'Enero',
  '02': 'Febrero',
  '03': 'Marzo',
  '04': 'Abril',
  '05': 'Mayo',
  '06': 'Junio',
  '07': 'Julio',
  '08': 'Agosto',
  '09': 'Septiembre',
  '10': 'Octubre',
  '11': 'Noviembre',
  '12': 'Diciembre',
}

function etiquetaPeriodo(periodo: Periodo): string {
  const [anio, mes] = periodo.split('-')
  return `${NOMBRE_MES[mes as string] ?? mes} ${anio}`
}

export function SelectorPeriodo() {
  const { ambito, periodosDisponibles, setPeriodo } = useAmbito()

  return (
    <label className="flex items-center gap-1.5 text-caption text-ink-secondary">
      <Calendar className="size-4 shrink-0" aria-hidden="true" />
      <span className="sr-only">Periodo contable</span>
      <select
        value={ambito?.periodo ?? ''}
        onChange={(evento) => setPeriodo(evento.target.value as Periodo)}
        disabled={periodosDisponibles.length === 0}
        className="h-8 rounded-control border border-border-strong bg-surface px-2 text-body text-ink disabled:opacity-50"
      >
        {periodosDisponibles.map((periodo) => (
          <option key={periodo} value={periodo}>
            {etiquetaPeriodo(periodo)}
          </option>
        ))}
      </select>
    </label>
  )
}
