/**
 * Selector de periodo contable, en el encabezado.
 * Ver .claude/docs/01-producto.md §7
 */
import { useRef, useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { useClicAfuera } from '@/shared/hooks/use-clic-afuera'
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
  const [abierto, setAbierto] = useState(false)
  const contenedorRef = useRef<HTMLDivElement>(null)

  useClicAfuera(contenedorRef, () => setAbierto(false))

  const periodoActual = ambito?.periodo

  return (
    <div ref={contenedorRef} className="relative">
      <button
        type="button"
        disabled={periodosDisponibles.length === 0}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-label={
          periodoActual ? `Periodo: ${etiquetaPeriodo(periodoActual)}` : 'Seleccionar periodo'
        }
        onClick={() => setAbierto(!abierto)}
        className="flex h-8 items-center gap-1.5 rounded-full border border-primary bg-primary-subtle px-3 text-caption font-medium text-primary-ink hover:brightness-95 disabled:opacity-50"
      >
        <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
        <span>{periodoActual ? etiquetaPeriodo(periodoActual) : 'Periodo'}</span>
        <ChevronDown
          className={`size-3.5 shrink-0 transition-transform duration-120 ${abierto ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {abierto && (
        <ul
          role="listbox"
          aria-label="Periodo contable"
          className="absolute left-0 top-full z-30 mt-1.5 min-w-[10rem] overflow-hidden rounded-control border border-border-strong bg-surface py-1 shadow-raised"
        >
          {periodosDisponibles.map((periodo) => (
            <li
              key={periodo}
              role="option"
              aria-selected={periodo === periodoActual}
              onClick={() => {
                setPeriodo(periodo)
                setAbierto(false)
              }}
              className={`flex h-9 cursor-pointer items-center px-3 text-body ${
                periodo === periodoActual
                  ? 'bg-primary-subtle font-medium text-ink'
                  : 'text-ink hover:bg-surface-sunken'
              }`}
            >
              {etiquetaPeriodo(periodo)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
