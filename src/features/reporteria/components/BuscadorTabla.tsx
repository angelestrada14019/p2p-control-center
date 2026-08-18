/** Buscador de texto libre con debounce. Ver .claude/docs/05-modulo-1-reporteria.md §10 */
import { Search } from 'lucide-react'
import { useState } from 'react'

interface BuscadorTablaProps {
  valorInicial: string
  onCambiar: (texto: string) => void
}

export function BuscadorTabla({ valorInicial, onCambiar }: BuscadorTablaProps) {
  const [texto, setTexto] = useState(valorInicial)

  return (
    <label className="relative flex items-center">
      <Search className="pointer-events-none absolute left-2.5 size-4 text-ink-muted" aria-hidden="true" />
      <span className="sr-only">Buscar por documento, proveedor, concepto o usuario</span>
      <input
        type="search"
        value={texto}
        placeholder="Buscar documento, proveedor, concepto…"
        onChange={(evento) => {
          setTexto(evento.target.value)
          onCambiar(evento.target.value)
        }}
        className="h-9 w-72 rounded-control border border-border-strong bg-surface pl-8 pr-3 text-body text-ink placeholder:text-ink-muted"
      />
    </label>
  )
}
