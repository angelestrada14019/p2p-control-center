/**
 * Barra de filtros del Reporte A: buscador + chips de riesgo rápidos +
 * comboboxes avanzados (Estado, Tipo, Proveedor, Cuenta, Centro, Responsable)
 * + rango de fechas, con chips removibles y "limpiar todo".
 * Filtros reflejados en la URL vía `useConsultaUrl`.
 *
 * País y Compañía NO están aquí: los controla el ámbito global del navbar
 * (`SelectorAmbito`), igual que el Periodo — ver `use-reporte-a.ts`.
 * Ver .claude/docs/05-modulo-1-reporteria.md §10
 */
import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { Combobox } from '@/shared/ui/Combobox'
import { NIVELES_RIESGO } from '@/shared/types/dominio'
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

const COLOR_CHIP_ACTIVO: Record<string, string> = {
  crítico: 'bg-danger-subtle text-danger-ink',
  alto: 'bg-warning-subtle text-warning-ink',
  medio: 'bg-surface-sunken text-ink font-medium',
  bajo: 'bg-primary-subtle text-primary-ink',
}

const FILTROS_AVANZADOS: FiltroMultiple[] = [
  'estados',
  'tiposInconsistencia',
  'proveedores',
  'cuentasContables',
  'centrosCosto',
  'responsables',
]

export function FiltrosReporteA({ consultaUrl }: { consultaUrl: UseConsultaUrl }) {
  const { filtros, setFiltro, toggleFiltro, limpiarTodos, setBusqueda, setDesde, setHasta } = consultaUrl
  const opcionesFiltros = useOpcionesFiltrosReporteA()
  const [mostrarAvanzados, setMostrarAvanzados] = useState(false)

  const chipsActivos = FILTROS_MULTIPLES.flatMap((clave) =>
    (filtros[clave] ?? []).map((valor) => ({ clave, valor: String(valor) })),
  )

  const cuentaAvanzados =
    FILTROS_AVANZADOS.flatMap((k) => filtros[k] ?? []).length +
    (filtros.desde ? 1 : 0) +
    (filtros.hasta ? 1 : 0)

  return (
    <div className="flex flex-col gap-3 rounded-card border border-border bg-surface-sunken p-3">
      {/* Fila 1: búsqueda + chips de riesgo rápidos + botón avanzados */}
      <div className="flex flex-wrap items-center gap-2">
        <BuscadorTabla valorInicial={filtros.busqueda ?? ''} onCambiar={setBusqueda} />

        <div className="flex items-center gap-1.5" role="group" aria-label="Nivel de riesgo">
          {NIVELES_RIESGO.map((nivel) => {
            const activo = (filtros.nivelesRiesgo ?? []).includes(nivel)
            return (
              <button
                key={nivel}
                type="button"
                aria-pressed={activo}
                onClick={() => toggleFiltro('nivelesRiesgo', nivel)}
                className={`flex h-7 items-center rounded-full border px-3 text-caption capitalize transition-colors ${
                  activo
                    ? `${COLOR_CHIP_ACTIVO[nivel]} border-transparent`
                    : 'border-border-strong bg-surface text-ink-muted hover:bg-surface-sunken hover:text-ink'
                }`}
              >
                {nivel}
              </button>
            )
          })}
        </div>

        <button
          type="button"
          aria-expanded={mostrarAvanzados}
          onClick={() => setMostrarAvanzados(!mostrarAvanzados)}
          className={`ml-auto flex h-8 items-center gap-1.5 rounded-control border px-3 text-caption transition-colors ${
            mostrarAvanzados || cuentaAvanzados > 0
              ? 'border-primary bg-primary-subtle text-primary-ink'
              : 'border-border-strong bg-surface text-ink-secondary hover:bg-surface-sunken hover:text-ink'
          }`}
        >
          <SlidersHorizontal className="size-3.5 shrink-0" aria-hidden="true" />
          <span>Más filtros</span>
          {cuentaAvanzados > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-caption font-semibold text-ink-inverse">
              {cuentaAvanzados}
            </span>
          )}
        </button>
      </div>

      {/* Fila 2: filtros avanzados (colapsable) */}
      {mostrarAvanzados && (
        <div className="flex flex-wrap items-end gap-2 border-t border-border pt-3">
          <Combobox
            etiqueta="Estado"
            opciones={opcionesFiltros.estados.opciones}
            seleccionados={filtros.estados ?? []}
            modo="multiple"
            onCambiar={(v) => setFiltro('estados', v)}
          />
          <Combobox
            etiqueta="Tipo de inconsistencia"
            opciones={opcionesFiltros.tiposInconsistencia.opciones}
            seleccionados={filtros.tiposInconsistencia ?? []}
            modo="multiple"
            onCambiar={(v) => setFiltro('tiposInconsistencia', v)}
          />
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

          <div className="ml-auto flex items-center gap-1 rounded-control border border-border-strong bg-surface p-1">
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
      )}

      {/* Chips de valores activos */}
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
