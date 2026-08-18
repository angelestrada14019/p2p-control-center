/**
 * Selector de compañía / país / entidad, en el encabezado.
 * Ver .claude/docs/01-producto.md §7
 */
import { useMemo, useRef, useState } from 'react'
import { Building2, ChevronDown, Search } from 'lucide-react'
import { useClicAfuera } from '@/shared/hooks/use-clic-afuera'
import { useAmbito } from '@/shared/hooks/use-ambito'
import { useCompanias } from '@/shared/hooks/use-companias'
import { normalizarParaBusqueda } from '@/shared/utils/texto'
import { PAISES, type Pais } from '@/shared/types/dominio'

export function SelectorAmbito() {
  const { ambito, setPais, setCompaniaId } = useAmbito()
  const { data: companias = [] } = useCompanias()
  const [abierto, setAbierto] = useState(false)
  const [busquedaPais, setBusquedaPais] = useState('')
  const [busquedaCompania, setBusquedaCompania] = useState('')
  const contenedorRef = useRef<HTMLDivElement>(null)

  useClicAfuera(contenedorRef, () => {
    setAbierto(false)
    setBusquedaPais('')
    setBusquedaCompania('')
  })

  const paises = useMemo(() => {
    const presentes = new Set(companias.map((c) => c.pais))
    return PAISES.filter((pais) => presentes.has(pais))
  }, [companias])

  const paisesFiltrados = useMemo(() => {
    const termino = normalizarParaBusqueda(busquedaPais.trim())
    if (!termino) return paises
    return paises.filter((p) => normalizarParaBusqueda(p).includes(termino))
  }, [paises, busquedaPais])

  const companiasDelPais = ambito?.pais
    ? companias.filter((c) => c.pais === ambito.pais)
    : companias

  const companiasFiltradas = useMemo(() => {
    const termino = normalizarParaBusqueda(busquedaCompania.trim())
    if (!termino) return companiasDelPais
    return companiasDelPais.filter((c) =>
      normalizarParaBusqueda(c.nombre).includes(termino),
    )
  }, [companiasDelPais, busquedaCompania])

  const companiaActual = companias.find((c) => c.id === ambito?.companiaId)

  const etiquetaActual = useMemo(() => {
    if (!ambito?.pais) return 'Todas las compañías'
    if (!ambito.companiaId) return ambito.pais
    return companiaActual ? `${ambito.pais} · ${companiaActual.nombre}` : ambito.pais
  }, [ambito, companiaActual])

  function cerrar() {
    setAbierto(false)
    setBusquedaPais('')
    setBusquedaCompania('')
  }

  return (
    <div ref={contenedorRef} className="relative">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={abierto}
        aria-label={`Ámbito: ${etiquetaActual}`}
        onClick={() => setAbierto(!abierto)}
        className="flex h-8 max-w-56 items-center gap-1.5 rounded-full border border-border-strong bg-surface px-3 text-caption text-ink hover:bg-surface-sunken"
      >
        <Building2 className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate font-medium">{etiquetaActual}</span>
        <ChevronDown
          className={`size-3.5 shrink-0 transition-transform duration-120 ${abierto ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {abierto && (
        <div className="absolute left-0 top-full z-30 mt-1.5 w-72 overflow-hidden rounded-control border border-border-strong bg-surface shadow-raised">
          {/* Sección País */}
          <div className="border-b border-border">
            <div className="flex items-center gap-1.5 px-3 py-2">
              <span className="text-caption font-medium uppercase tracking-wider text-ink-muted">
                País
              </span>
            </div>
            <div className="relative border-t border-border">
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-ink-muted"
                aria-hidden="true"
              />
              <input
                type="text"
                value={busquedaPais}
                onChange={(e) => setBusquedaPais(e.target.value)}
                placeholder="Buscar país…"
                className="h-8 w-full border-0 bg-transparent pl-8 pr-3 text-body text-ink placeholder:text-ink-muted focus:outline-none"
              />
            </div>
            <ul
              role="listbox"
              aria-label="País"
              className="max-h-36 overflow-y-auto py-1"
            >
              <li
                role="option"
                aria-selected={!ambito?.pais}
                onClick={() => {
                  setPais(null)
                  setCompaniaId(null)
                  setBusquedaPais('')
                  setBusquedaCompania('')
                }}
                className={`flex h-8 cursor-pointer items-center px-3 text-body ${
                  !ambito?.pais
                    ? 'bg-primary-subtle font-medium text-ink'
                    : 'text-ink hover:bg-surface-sunken'
                }`}
              >
                Todos los países
              </li>
              {paisesFiltrados.map((pais) => (
                <li
                  key={pais}
                  role="option"
                  aria-selected={pais === ambito?.pais}
                  onClick={() => {
                    setPais(pais as Pais)
                    setCompaniaId(null)
                    setBusquedaCompania('')
                  }}
                  className={`flex h-8 cursor-pointer items-center px-3 text-body ${
                    pais === ambito?.pais
                      ? 'bg-primary-subtle font-medium text-ink'
                      : 'text-ink hover:bg-surface-sunken'
                  }`}
                >
                  {pais}
                </li>
              ))}
              {paisesFiltrados.length === 0 && (
                <li className="px-3 py-2 text-caption text-ink-muted">Sin resultados</li>
              )}
            </ul>
          </div>

          {/* Sección Compañía */}
          <div>
            <div className="flex items-center gap-1.5 px-3 py-2">
              <span className="text-caption font-medium uppercase tracking-wider text-ink-muted">
                {ambito?.pais ? `Compañías en ${ambito.pais}` : 'Compañía'}
              </span>
            </div>
            <div className="relative border-t border-border">
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-ink-muted"
                aria-hidden="true"
              />
              <input
                type="text"
                value={busquedaCompania}
                onChange={(e) => setBusquedaCompania(e.target.value)}
                placeholder="Buscar compañía…"
                className="h-8 w-full border-0 bg-transparent pl-8 pr-3 text-body text-ink placeholder:text-ink-muted focus:outline-none"
              />
            </div>
            <ul
              role="listbox"
              aria-label="Compañía"
              className="max-h-40 overflow-y-auto py-1"
            >
              <li
                role="option"
                aria-selected={!ambito?.companiaId}
                onClick={() => {
                  setCompaniaId(null)
                  cerrar()
                }}
                className={`flex h-8 cursor-pointer items-center px-3 text-body ${
                  !ambito?.companiaId
                    ? 'bg-primary-subtle font-medium text-ink'
                    : 'text-ink hover:bg-surface-sunken'
                }`}
              >
                Todas las compañías
              </li>
              {companiasFiltradas.map((c) => (
                <li
                  key={c.id}
                  role="option"
                  aria-selected={c.id === ambito?.companiaId}
                  onClick={() => {
                    setCompaniaId(c.id)
                    cerrar()
                  }}
                  className={`flex h-8 cursor-pointer items-center px-3 text-body ${
                    c.id === ambito?.companiaId
                      ? 'bg-primary-subtle font-medium text-ink'
                      : 'text-ink hover:bg-surface-sunken'
                  }`}
                >
                  {c.nombre}
                </li>
              ))}
              {companiasFiltradas.length === 0 && (
                <li className="px-3 py-2 text-caption text-ink-muted">Sin resultados</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
