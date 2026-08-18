/**
 * Combobox con búsqueda tipo-ahead y selección única o múltiple. Sigue el
 * patrón WAI-ARIA APG "Combobox with List" (trigger + popover con buscador y
 * listbox). No conoce el dominio P2P: recibe opciones y valores, no los
 * busca. Ver .claude/docs/03-diseno.md §8 (filtros) y §12 (accesibilidad).
 */
import { useId, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { useClicAfuera } from '@/shared/hooks/use-clic-afuera'
import { normalizarParaBusqueda } from '@/shared/utils/texto'

export interface OpcionCombobox<T extends string = string> {
  valor: T
  etiqueta: string
  /** Texto adicional indexado por el buscador pero no mostrado en la lista. */
  aliasBusqueda?: string
}

export type ModoCombobox = 'unico' | 'multiple'

export interface ComboboxProps<T extends string> {
  /** Texto siempre visible (no sr-only): identifica el filtro sin abrirlo. */
  etiqueta: string
  opciones: OpcionCombobox<T>[]
  /** Siempre array, independientemente del modo. En modo 'unico', longitud ≤ 1. */
  seleccionados: T[]
  modo: ModoCombobox
  onCambiar: (siguientes: T[]) => void
  cargando?: boolean
  placeholder?: string
  className?: string
}

export function Combobox<T extends string>({
  etiqueta,
  opciones,
  seleccionados,
  modo,
  onCambiar,
  cargando = false,
  placeholder = 'Buscar…',
  className = '',
}: ComboboxProps<T>) {
  const [abierto, setAbierto] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [indiceActivo, setIndiceActivo] = useState(0)

  const contenedorRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const idBase = useId()
  const idListbox = `${idBase}-listbox`
  const idEtiqueta = `${idBase}-etiqueta`

  useClicAfuera(contenedorRef, () => setAbierto(false))

  const opcionesFiltradas = useMemo(() => {
    const termino = normalizarParaBusqueda(busqueda.trim())
    if (!termino) return opciones
    return opciones.filter((opcion) =>
      normalizarParaBusqueda(`${opcion.etiqueta} ${opcion.aliasBusqueda ?? ''}`).includes(termino),
    )
  }, [opciones, busqueda])

  function abrir() {
    if (cargando) return
    setAbierto(true)
    setBusqueda('')
    setIndiceActivo(0)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  function cerrar(devolverFoco: boolean) {
    setAbierto(false)
    if (devolverFoco) triggerRef.current?.focus()
  }

  function seleccionar(valor: T) {
    if (modo === 'multiple') {
      const siguientes = seleccionados.includes(valor)
        ? seleccionados.filter((v) => v !== valor)
        : [...seleccionados, valor]
      onCambiar(siguientes)
    } else {
      onCambiar([valor])
      cerrar(true)
    }
  }

  const idOpcionActiva = opcionesFiltradas[indiceActivo] ? `${idListbox}-${indiceActivo}` : undefined

  return (
    <div ref={contenedorRef} className={`relative flex flex-col gap-1 ${className}`}>
      <span id={idEtiqueta} className="text-caption text-ink-secondary">
        {etiqueta}
      </span>
      <button
        ref={triggerRef}
        type="button"
        disabled={cargando}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-labelledby={idEtiqueta}
        onClick={() => (abierto ? cerrar(false) : abrir())}
        onKeyDown={(evento) => {
          if (evento.key === 'ArrowDown' && !abierto) {
            evento.preventDefault()
            abrir()
          }
        }}
        className="flex h-9 min-w-32 items-center justify-between gap-2 rounded-control border border-border-strong bg-surface px-2.5 text-body text-ink hover:bg-surface-sunken disabled:opacity-50"
      >
        <span className="truncate">
          {etiqueta}
          {seleccionados.length > 0 ? ` (${seleccionados.length})` : ''}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-ink-muted transition-transform duration-120 ${abierto ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {abierto && (
        <div className="absolute top-full left-0 z-30 mt-1 w-64 overflow-hidden rounded-control border border-border-strong bg-surface shadow-raised">
          <div className="relative border-b border-border">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-ink-muted"
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              role="combobox"
              aria-autocomplete="list"
              aria-controls={idListbox}
              aria-expanded="true"
              aria-activedescendant={idOpcionActiva}
              value={busqueda}
              onChange={(evento) => {
                setBusqueda(evento.target.value)
                setIndiceActivo(0)
              }}
              onKeyDown={(evento) => {
                if (evento.key === 'ArrowDown') {
                  evento.preventDefault()
                  setIndiceActivo((i) => Math.min(i + 1, opcionesFiltradas.length - 1))
                } else if (evento.key === 'ArrowUp') {
                  evento.preventDefault()
                  setIndiceActivo((i) => Math.max(i - 1, 0))
                } else if (evento.key === 'Enter') {
                  evento.preventDefault()
                  const opcion = opcionesFiltradas[indiceActivo]
                  if (opcion) seleccionar(opcion.valor)
                } else if (evento.key === 'Escape') {
                  evento.preventDefault()
                  cerrar(true)
                }
              }}
              placeholder={placeholder}
              className="h-9 w-full border-0 bg-transparent pl-8 pr-3 text-body text-ink placeholder:text-ink-muted focus:outline-none"
            />
          </div>
          <ul
            role="listbox"
            id={idListbox}
            aria-multiselectable={modo === 'multiple'}
            aria-labelledby={idEtiqueta}
            className="max-h-64 overflow-y-auto py-1"
          >
            {opcionesFiltradas.length === 0 && (
              <li className="px-3 py-2 text-caption text-ink-muted">Sin resultados</li>
            )}
            {opcionesFiltradas.map((opcion, indice) => {
              const seleccionada = seleccionados.includes(opcion.valor)
              return (
                <li
                  key={opcion.valor}
                  id={`${idListbox}-${indice}`}
                  role="option"
                  aria-selected={seleccionada}
                  onMouseEnter={() => setIndiceActivo(indice)}
                  onClick={() => seleccionar(opcion.valor)}
                  className={`flex h-9 cursor-pointer items-center gap-2 px-3 text-body text-ink ${
                    indice === indiceActivo ? 'bg-surface-sunken' : ''
                  } ${seleccionada ? 'bg-primary-subtle' : ''}`}
                >
                  <Check
                    className={`size-4 shrink-0 ${seleccionada ? 'text-primary' : 'text-transparent'}`}
                    aria-hidden="true"
                  />
                  <span className="truncate">{opcion.etiqueta}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
