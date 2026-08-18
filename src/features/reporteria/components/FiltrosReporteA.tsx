/**
 * Barra de filtros del Reporte A: buscador + combobox de catálogo (Estado,
 * Nivel de riesgo, Tipo de inconsistencia, Proveedor, Cuenta contable, Centro
 * de costo, Responsable) + rango de fechas, con chips removibles y "limpiar
 * todo". Filtros reflejados en la URL vía `useConsultaUrl`.
 *
 * País y Compañía NO están aquí: los controla el ámbito global del navbar
 * (`SelectorAmbito`), igual que el Periodo — ver `use-reporte-a.ts`.
 * Ver .claude/docs/05-modulo-1-reporteria.md §10
 */
import { Combobox } from '@/shared/ui/Combobox'
import { BuscadorTabla } from './BuscadorTabla'
import { ChipFiltro } from './ChipFiltro'
import { useOpcionesFiltrosReporteA } from '../hooks/use-opciones-filtros-reporte-a'
import { FILTROS_MULTIPLES, type FiltroMultiple, type UseConsultaUrl } from '../hooks/use-consulta-url'

const ETIQUETA_FILTRO: Record<FiltroMultiple, string> = {
  proveedores: 'Proveedor',
  cuentasContables: 'Cuenta contable',
  centrosCosto: 'Centro de costo',
  responsables: 'Responsable',
  estados: 'Estado',
  nivelesRiesgo: 'Nivel de riesgo',
  tiposInconsistencia: 'Tipo de inconsistencia',
}

export function FiltrosReporteA({ consultaUrl }: { consultaUrl: UseConsultaUrl }) {
  const { filtros, setFiltro, toggleFiltro, limpiarTodos, setBusqueda, setDesde, setHasta } = consultaUrl
  const opcionesFiltros = useOpcionesFiltrosReporteA()

  const chipsActivos = FILTROS_MULTIPLES.flatMap((clave) =>
    (filtros[clave] ?? []).map((valor) => ({ clave, valor: String(valor) })),
  )

  return (
    <div className="flex flex-col gap-3 rounded-card border border-border bg-surface-sunken p-3">
      <div className="flex flex-wrap items-start gap-x-6 gap-y-3">
        <BuscadorTabla valorInicial={filtros.busqueda ?? ''} onCambiar={setBusqueda} />

        <div className="flex flex-wrap items-end gap-2">
          <Combobox
            etiqueta="Estado"
            opciones={opcionesFiltros.estados.opciones}
            seleccionados={filtros.estados ?? []}
            modo="multiple"
            onCambiar={(v) => setFiltro('estados', v)}
          />
          <Combobox
            etiqueta="Nivel de riesgo"
            opciones={opcionesFiltros.nivelesRiesgo.opciones}
            seleccionados={filtros.nivelesRiesgo ?? []}
            modo="multiple"
            onCambiar={(v) => setFiltro('nivelesRiesgo', v)}
          />
          <Combobox
            etiqueta="Tipo de inconsistencia"
            opciones={opcionesFiltros.tiposInconsistencia.opciones}
            seleccionados={filtros.tiposInconsistencia ?? []}
            modo="multiple"
            onCambiar={(v) => setFiltro('tiposInconsistencia', v)}
          />
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <Combobox
            etiqueta="Proveedor"
            opciones={opcionesFiltros.proveedores.opciones}
            cargando={opcionesFiltros.proveedores.cargando}
            seleccionados={filtros.proveedores ?? []}
            modo="multiple"
            onCambiar={(v) => setFiltro('proveedores', v)}
          />
          <Combobox
            etiqueta="Cuenta contable"
            opciones={opcionesFiltros.cuentasContables.opciones}
            cargando={opcionesFiltros.cuentasContables.cargando}
            seleccionados={filtros.cuentasContables ?? []}
            modo="multiple"
            onCambiar={(v) => setFiltro('cuentasContables', v)}
          />
          <Combobox
            etiqueta="Centro de costo"
            opciones={opcionesFiltros.centrosCosto.opciones}
            cargando={opcionesFiltros.centrosCosto.cargando}
            seleccionados={filtros.centrosCosto ?? []}
            modo="multiple"
            onCambiar={(v) => setFiltro('centrosCosto', v)}
          />
          <Combobox
            etiqueta="Responsable"
            opciones={opcionesFiltros.responsables.opciones}
            cargando={opcionesFiltros.responsables.cargando}
            seleccionados={filtros.responsables ?? []}
            modo="multiple"
            onCambiar={(v) => setFiltro('responsables', v)}
          />
        </div>

        <div className="flex items-center gap-1 rounded-control border border-border-strong bg-surface p-1">
          <label className="flex items-center gap-1.5 pl-1 text-caption text-ink-secondary">
            Desde
            <input
              type="date"
              value={filtros.desde ?? ''}
              onChange={(e) => setDesde(e.target.value)}
              className="h-7 rounded-badge border-0 bg-transparent px-1 text-body text-ink"
            />
          </label>
          <label className="flex items-center gap-1.5 pl-1 text-caption text-ink-secondary">
            Hasta
            <input
              type="date"
              value={filtros.hasta ?? ''}
              onChange={(e) => setHasta(e.target.value)}
              className="h-7 rounded-badge border-0 bg-transparent px-1 text-body text-ink"
            />
          </label>
        </div>
      </div>

      {chipsActivos.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {chipsActivos.map(({ clave, valor }) => (
            <ChipFiltro
              key={`${clave}-${valor}`}
              etiqueta={`${ETIQUETA_FILTRO[clave]}: ${opcionesFiltros.etiquetaDe(valor)}`}
              onQuitar={() => toggleFiltro(clave, valor)}
            />
          ))}
          <button
            type="button"
            onClick={limpiarTodos}
            className="text-caption font-medium text-primary-ink underline-offset-2 hover:underline"
          >
            Limpiar todo
          </button>
        </div>
      )}
    </div>
  )
}
