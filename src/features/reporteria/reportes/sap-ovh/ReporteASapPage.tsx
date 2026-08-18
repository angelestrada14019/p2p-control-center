/**
 * Reporte A — SAP: Provisiones Registradas (Vista OVH).
 * Vertical slice del Módulo 1: tabla + filtros + resumen + drawer de bitácora.
 * Ver .claude/docs/05-modulo-1-reporteria.md §3
 */
import { useCallback, useMemo, useState } from 'react'
import { Tabla } from '@/shared/ui/Tabla'
import { EstadoVacio } from '@/shared/ui/EstadoVacio'
import { DrawerRegistro } from '../../components/DrawerRegistro/DrawerRegistro'
import { FiltrosReporteA } from '../../components/FiltrosReporteA'
import { IndicadoresResumen } from '../../components/IndicadoresResumen'
import { useMutacionGestion } from '../../hooks/use-mutacion-gestion'
import { useReporteA } from './use-reporte-a'
import { crearColumnasReporteA } from './columnas'
import { derivarClave, type CambioGestion, type ProvisionSap } from '@/data/contracts'
import type { EstadoRevision } from '@/shared/types/dominio'

interface RegistroAbierto {
  /** Clave de negocio derivada (`derivarClave`) — única entre compañía/documento/línea. */
  clave: string
  tab: 'detalle' | 'bitacora'
}

export function ReporteASapPage() {
  const { registros, resumen, consultaUrl } = useReporteA()
  const mutacion = useMutacionGestion('reporte-a')
  const [abierto, setAbierto] = useState<RegistroAbierto | null>(null)

  const items = registros.data?.items ?? []
  const indiceAbierto = abierto ? items.findIndex((f) => derivarClave(f.clave) === abierto.clave) : -1
  const registroAbierto = indiceAbierto >= 0 ? (items[indiceAbierto] ?? null) : null

  const abrir = useCallback((fila: ProvisionSap, tab: 'detalle' | 'bitacora') => {
    setAbierto({ clave: derivarClave(fila.clave), tab })
  }, [])

  const onMutar = useCallback(
    (cambio: CambioGestion) => {
      if (!registroAbierto) return
      mutacion.mutate({ clave: registroAbierto.clave, cambio })
    },
    [mutacion, registroAbierto],
  )

  const onCambiarEstadoDesdeFlag = useCallback(
    (fila: ProvisionSap, estadoNuevo: EstadoRevision) => {
      mutacion.mutate({
        clave: fila.clave,
        cambio: { tipo: 'cambio-estado', autor: 'Sistema P2P (flagging)', estadoNuevo },
      })
    },
    [mutacion],
  )

  const columnas = useMemo(
    () =>
      crearColumnasReporteA({
        onAbrirBitacora: (fila) => abrir(fila, 'bitacora'),
        onCambiarEstado: onCambiarEstadoDesdeFlag,
      }),
    [abrir, onCambiarEstadoDesdeFlag],
  )

  // `isLoading` es `false` mientras la query está `enabled: false` (ámbito aún
  // no resuelto) — sin este OR, ese instante no cae en ninguno de los cuatro
  // estados. Mismo patrón que `alertas.page.tsx`.
  const cargando = registros.isLoading || (!registros.data && !registros.isError)

  return (
    <div className="flex flex-col gap-4">
      <IndicadoresResumen resumen={resumen.data} cargando={resumen.isLoading} />

      <FiltrosReporteA consultaUrl={consultaUrl} />

      <Tabla
        titulo="Reporte A — SAP: Provisiones Registradas"
        datos={items}
        columnas={columnas}
        idDeFila={(fila) => derivarClave(fila.clave)}
        cargando={cargando}
        error={
          registros.isError
            ? { descripcion: 'No se pudo cargar el Reporte A.', onReintentar: () => void registros.refetch() }
            : undefined
        }
        vacio={
          <EstadoVacio
            titulo="Sin registros para estos filtros"
            descripcion="Ajusta los filtros activos o limpia todos para ver el periodo completo."
          />
        }
        onClicFila={(fila) => abrir(fila, 'detalle')}
        ordenActual={
          consultaUrl.filtros.ordenarPor
            ? { campo: consultaUrl.filtros.ordenarPor, direccion: consultaUrl.filtros.direccion ?? 'asc' }
            : undefined
        }
        onOrdenar={(campo) => {
          const siguienteDireccion =
            consultaUrl.filtros.ordenarPor === campo && consultaUrl.filtros.direccion === 'asc'
              ? 'desc'
              : 'asc'
          consultaUrl.setOrden(campo, siguienteDireccion)
        }}
      />

      {registros.data && (
        <div className="flex items-center justify-between text-caption text-ink-muted">
          <span>
            {registros.data.total} registro{registros.data.total === 1 ? '' : 's'} en total
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={registros.data.pagina <= 1}
              onClick={() => consultaUrl.setPagina(registros.data!.pagina - 1)}
              className="rounded-control border border-border-strong px-2 py-1 disabled:opacity-40"
            >
              Anterior
            </button>
            <span>Página {registros.data.pagina}</span>
            <button
              type="button"
              disabled={registros.data.pagina * registros.data.porPagina >= registros.data.total}
              onClick={() => consultaUrl.setPagina(registros.data!.pagina + 1)}
              className="rounded-control border border-border-strong px-2 py-1 disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      <DrawerRegistro
        abierto={abierto !== null}
        registro={registroAbierto}
        tabInicial={abierto?.tab ?? 'detalle'}
        onCerrar={() => setAbierto(null)}
        onNavegarAnterior={
          indiceAbierto > 0
            ? () => setAbierto({ clave: derivarClave(items[indiceAbierto - 1]!.clave), tab: abierto!.tab })
            : undefined
        }
        onNavegarSiguiente={
          indiceAbierto >= 0 && indiceAbierto < items.length - 1
            ? () => setAbierto({ clave: derivarClave(items[indiceAbierto + 1]!.clave), tab: abierto!.tab })
            : undefined
        }
        onMutar={onMutar}
        mutando={mutacion.isPending}
      />
    </div>
  )
}
