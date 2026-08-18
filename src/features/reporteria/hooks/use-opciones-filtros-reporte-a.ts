/**
 * Mapea los catálogos de Reportería a `OpcionCombobox`, y expone un mapa
 * valor→etiqueta para que los chips activos muestren texto legible en vez de
 * códigos o valores crudos. Ver .claude/docs/05-modulo-1-reporteria.md §10
 */
import { useMemo } from 'react'
import type { OpcionCombobox } from '@/shared/ui/Combobox'
import { ESTADOS_REVISION, NIVELES_RIESGO, TIPOS_INCONSISTENCIA } from '@/shared/types/dominio'
import { useCentrosCosto } from './use-centros-costo'
import { useCuentasContables } from './use-cuentas-contables'
import { useProveedores } from './use-proveedores'
import { useResponsables } from './use-responsables'

interface GrupoOpciones<T extends string> {
  opciones: OpcionCombobox<T>[]
  cargando: boolean
}

export function useOpcionesFiltrosReporteA() {
  const { data: proveedores = [], isLoading: cargandoProveedores } = useProveedores()
  const { data: cuentas = [], isLoading: cargandoCuentas } = useCuentasContables()
  const { data: centros = [], isLoading: cargandoCentros } = useCentrosCosto()
  const { data: responsables = [], isLoading: cargandoResponsables } = useResponsables()

  return useMemo(() => {
    const opcionesEstados: OpcionCombobox[] = ESTADOS_REVISION.map((e) => ({ valor: e, etiqueta: e }))
    const opcionesRiesgo: OpcionCombobox[] = NIVELES_RIESGO.map((n) => ({ valor: n, etiqueta: n }))
    const opcionesInconsistencia: OpcionCombobox[] = TIPOS_INCONSISTENCIA.map((t) => ({
      valor: t,
      etiqueta: t,
    }))

    const grupoProveedores: GrupoOpciones<string> = {
      opciones: proveedores.map((p) => ({ valor: p, etiqueta: p })),
      cargando: cargandoProveedores,
    }
    const grupoCuentas: GrupoOpciones<string> = {
      opciones: cuentas.map((c) => ({
        valor: c.codigo,
        etiqueta: `${c.codigo} — ${c.nombre}`,
        aliasBusqueda: c.nombre,
      })),
      cargando: cargandoCuentas,
    }
    const grupoCentros: GrupoOpciones<string> = {
      opciones: centros.map((c) => ({
        valor: c.codigo,
        etiqueta: `${c.codigo} — ${c.nombre}`,
        aliasBusqueda: c.nombre,
      })),
      cargando: cargandoCentros,
    }
    const grupoResponsables: GrupoOpciones<string> = {
      opciones: responsables.map((r) => ({ valor: r, etiqueta: r })),
      cargando: cargandoResponsables,
    }

    const etiquetaPorValor = new Map<string, string>()
    for (const grupo of [grupoProveedores, grupoCuentas, grupoCentros, grupoResponsables]) {
      for (const opcion of grupo.opciones) etiquetaPorValor.set(opcion.valor, opcion.etiqueta)
    }

    return {
      estados: { opciones: opcionesEstados, cargando: false } satisfies GrupoOpciones<string>,
      nivelesRiesgo: { opciones: opcionesRiesgo, cargando: false } satisfies GrupoOpciones<string>,
      tiposInconsistencia: {
        opciones: opcionesInconsistencia,
        cargando: false,
      } satisfies GrupoOpciones<string>,
      proveedores: grupoProveedores,
      cuentasContables: grupoCuentas,
      centrosCosto: grupoCentros,
      responsables: grupoResponsables,
      /** Resuelve un valor crudo (código o texto) a su etiqueta legible, si existe. */
      etiquetaDe: (valor: string) => etiquetaPorValor.get(valor) ?? valor,
    }
  }, [proveedores, cuentas, centros, responsables, cargandoProveedores, cargandoCuentas, cargandoCentros, cargandoResponsables])
}
