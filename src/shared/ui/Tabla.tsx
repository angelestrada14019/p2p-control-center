/**
 * Tabla genérica sobre TanStack Table (headless): ordenamiento, filtros y
 * paginación se resuelven fuera de este componente (en el contrato de
 * datos, ver .claude/docs/04-datos.md §3); esto solo renderiza filas y
 * columnas con la densidad y los estados definidos en el sistema de diseño.
 * Ver .claude/docs/03-diseno.md §8
 */
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table'
import type { KeyboardEvent, ReactNode } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { FilaSkeletonTabla } from './Skeleton'
import { EstadoError } from './EstadoError'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    /** Campo por el que se puede ordenar (ver `ordenActual`/`onOrdenar` de `Tabla`). */
    campoOrden?: string
  }
}

export type DireccionOrdenTabla = 'asc' | 'desc'

interface TablaProps<T> {
  datos: T[]
  columnas: ColumnDef<T>[]
  /** Nombre accesible de la tabla — WCAG 1.3.1. Se renderiza como `<caption>` visualmente oculto. */
  titulo: string
  cargando?: boolean
  /** Se muestra en vez de la tabla cuando falló la carga. Tiene prioridad sobre `vacio`. */
  error?: { descripcion: string; onReintentar?: () => void }
  /** Se muestra en vez de la tabla cuando no hay filas y no está cargando ni en error. */
  vacio?: ReactNode
  /** Identifica cada fila para `key` y para asociarla a su drawer de detalle. */
  idDeFila: (fila: T) => string
  /**
   * Clic (o Enter/Espacio con foco en la fila) abre el detalle del registro.
   * Las celdas con sus propias acciones (p. ej. el ícono de comentarios) deben
   * detener la propagación del evento para no disparar también esta acción.
   */
  onClicFila?: (fila: T) => void
  /** Campo y dirección de ordenamiento activos (resuelto en el servidor/mock, ver contrato). */
  ordenActual?: { campo: string; direccion: DireccionOrdenTabla }
  /** Se invoca con el `campoOrden` de la columna; alterna asc/desc lo decide quien llama. */
  onOrdenar?: (campo: string) => void
}

export function Tabla<T>({
  datos,
  columnas,
  titulo,
  cargando = false,
  error,
  vacio,
  idDeFila,
  onClicFila,
  ordenActual,
  onOrdenar,
}: TablaProps<T>) {
  const tabla = useReactTable({
    data: datos,
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
    getRowId: idDeFila,
  })

  if (error) {
    return <EstadoError descripcion={error.descripcion} onReintentar={error.onReintentar} />
  }

  if (!cargando && datos.length === 0 && vacio) {
    return <>{vacio}</>
  }

  return (
    <div className="overflow-x-auto rounded-card border border-border">
      <table className="w-full border-collapse text-table text-ink">
        <caption className="sr-only">{titulo}</caption>
        <thead className="sticky top-0 z-10 bg-surface-sunken">
          {tabla.getHeaderGroups().map((grupoEncabezado) => (
            <tr key={grupoEncabezado.id}>
              {grupoEncabezado.headers.map((encabezado) => {
                const campoOrden = encabezado.column.columnDef.meta?.campoOrden
                const activo = ordenActual?.campo === campoOrden
                return (
                  <th
                    key={encabezado.id}
                    className="border-b border-border px-3 py-2 text-left text-th font-semibold tracking-wide text-ink-secondary uppercase"
                  >
                    {encabezado.isPlaceholder ? null : campoOrden && onOrdenar ? (
                      <button
                        type="button"
                        onClick={() => onOrdenar(campoOrden)}
                        className="inline-flex items-center gap-1 normal-case hover:text-ink"
                      >
                        {flexRender(encabezado.column.columnDef.header, encabezado.getContext())}
                        {activo && ordenActual?.direccion === 'asc' && (
                          <ArrowUp className="size-3" aria-hidden="true" />
                        )}
                        {activo && ordenActual?.direccion === 'desc' && (
                          <ArrowDown className="size-3" aria-hidden="true" />
                        )}
                        {!activo && <ArrowUpDown className="size-3 opacity-40" aria-hidden="true" />}
                      </button>
                    ) : (
                      flexRender(encabezado.column.columnDef.header, encabezado.getContext())
                    )}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {cargando
            ? Array.from({ length: 6 }, (_, indice) => (
                <FilaSkeletonTabla key={indice} columnas={columnas.length} />
              ))
            : tabla.getRowModel().rows.map((fila) => (
                <tr
                  key={fila.id}
                  className={`border-b border-border last:border-0 hover:bg-surface-sunken ${
                    onClicFila ? 'cursor-pointer' : ''
                  }`}
                  {...(onClicFila && {
                    tabIndex: 0,
                    role: 'button',
                    onClick: () => onClicFila(fila.original),
                    onKeyDown: (evento: KeyboardEvent) => {
                      if (evento.key === 'Enter' || evento.key === ' ') {
                        evento.preventDefault()
                        onClicFila(fila.original)
                      }
                    },
                  })}
                >
                  {fila.getVisibleCells().map((celda) => (
                    <td key={celda.id} className="px-3 py-2">
                      {flexRender(celda.column.columnDef.cell, celda.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  )
}
