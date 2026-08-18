/**
 * Selector de compañía / país / entidad, en el encabezado.
 * Ver .claude/docs/01-producto.md §7
 */
import { useMemo } from 'react'
import { Building2 } from 'lucide-react'
import { useAmbito } from '@/shared/hooks/use-ambito'
import { useCompanias } from '@/shared/hooks/use-companias'
import { PAISES, type Pais } from '@/shared/types/dominio'

export function SelectorAmbito() {
  const { ambito, setPais, setCompaniaId } = useAmbito()
  const { data: companias = [] } = useCompanias()

  const paises = useMemo(() => {
    // Orden canónico de PAISES, no alfabético: es el mismo orden que ya usan
    // catalogos.ts y la documentación de negocio en todos los demás catálogos.
    const presentes = new Set(companias.map((c) => c.pais))
    return PAISES.filter((pais) => presentes.has(pais))
  }, [companias])
  const companiasDelPais = ambito?.pais
    ? companias.filter((c) => c.pais === ambito.pais)
    : companias

  return (
    <div className="flex items-center gap-2 text-caption text-ink-secondary">
      <Building2 className="size-4 shrink-0" aria-hidden="true" />
      <label className="flex items-center gap-1">
        <span className="sr-only">País</span>
        <select
          aria-label="País"
          value={ambito?.pais ?? ''}
          onChange={(evento) => setPais((evento.target.value || null) as Pais | null)}
          className="h-8 rounded-control border border-border-strong bg-surface px-2 text-body text-ink"
        >
          <option value="">Todos los países</option>
          {paises.map((pais) => (
            <option key={pais} value={pais}>
              {pais}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-1">
        <span className="sr-only">Compañía</span>
        <select
          aria-label="Compañía"
          value={ambito?.companiaId ?? ''}
          onChange={(evento) => setCompaniaId(evento.target.value || null)}
          className="h-8 rounded-control border border-border-strong bg-surface px-2 text-body text-ink"
        >
          <option value="">Todas las compañías</option>
          {companiasDelPais.map((compania) => (
            <option key={compania.id} value={compania.id}>
              {compania.nombre}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
