/**
 * Columnas del Reporte A. Se construyen con `useMemo` en `ReporteASapPage`
 * (no recrear en cada render, ver skill vercel-react-best-practices).
 */
import { createElement } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/shared/ui/Badge'
import { Semaforo } from '@/shared/ui/Semaforo'
import { formatearFecha, formatearImporte } from '@/shared/utils/formato'
import { TONO_POR_ESTADO, type EstadoRevision } from '@/shared/types/dominio'
import type { ProvisionSap } from '@/data/contracts'
import { FlagFilaAccion } from '../../components/FlagFilaAccion'
import { IconoComentarios } from '../../components/IconoComentarios'

interface OpcionesColumnasReporteA {
  onAbrirBitacora: (fila: ProvisionSap) => void
  onCambiarEstado: (fila: ProvisionSap, estadoNuevo: EstadoRevision) => void
}

export function crearColumnasReporteA({
  onAbrirBitacora,
  onCambiarEstado,
}: OpcionesColumnasReporteA): ColumnDef<ProvisionSap>[] {
  return [
    {
      id: 'flag',
      header: '',
      cell: ({ row }) =>
        createElement(FlagFilaAccion, {
          gestion: row.original.gestion,
          onCambiarEstado: (estadoNuevo) => onCambiarEstado(row.original, estadoNuevo),
        }),
    },
    {
      accessorKey: 'fechaRegistro',
      header: 'Fecha registro',
      cell: ({ getValue }) => formatearFecha(getValue<string>()),
      meta: { campoOrden: 'fechaRegistro' },
    },
    { accessorKey: 'periodo', header: 'Periodo', meta: { campoOrden: 'periodo' } },
    { accessorKey: 'compania', header: 'Compañía', meta: { campoOrden: 'compania' } },
    { accessorKey: 'pais', header: 'País', meta: { campoOrden: 'pais' } },
    { accessorKey: 'unidadNegocio', header: 'Unidad de negocio', meta: { campoOrden: 'unidadNegocio' } },
    { accessorKey: 'centroCosto', header: 'Centro de costo', meta: { campoOrden: 'centroCosto' } },
    { accessorKey: 'cuentaContable', header: 'Cuenta contable', meta: { campoOrden: 'cuentaContable' } },
    { accessorKey: 'numeroDocumento', header: 'Documento', meta: { campoOrden: 'numeroDocumento' } },
    {
      accessorKey: 'ordenCompra',
      header: 'Orden de compra',
      cell: ({ getValue }) => getValue<string | null>() ?? '—',
    },
    { accessorKey: 'proveedor', header: 'Proveedor', meta: { campoOrden: 'proveedor' } },
    { accessorKey: 'concepto', header: 'Concepto', meta: { campoOrden: 'concepto' } },
    { accessorKey: 'usuarioRegistro', header: 'Usuario registro', meta: { campoOrden: 'usuarioRegistro' } },
    {
      accessorKey: 'valorLocal',
      header: 'Valor local',
      cell: ({ getValue }) =>
        createElement(
          'span',
          { className: 'block text-right tabular-nums' },
          formatearImporte(getValue<ProvisionSap['valorLocal']>()),
        ),
    },
    {
      accessorKey: 'valorUsd',
      header: 'Valor USD',
      cell: ({ getValue }) =>
        createElement(
          'span',
          { className: 'block text-right tabular-nums' },
          formatearImporte(getValue<ProvisionSap['valorUsd']>()),
        ),
    },
    { accessorKey: 'tipoProvision', header: 'Tipo de provisión', meta: { campoOrden: 'tipoProvision' } },
    {
      id: 'inconsistencias',
      header: 'Inconsistencias',
      cell: ({ row }) =>
        createElement(
          'div',
          { className: 'flex flex-wrap gap-1' },
          row.original.gestion.inconsistencias.length === 0
            ? '—'
            : row.original.gestion.inconsistencias.map((tipo) =>
                createElement(Badge, { key: tipo, children: tipo }),
              ),
        ),
    },
    {
      id: 'responsable',
      header: 'Responsable',
      cell: ({ row }) => row.original.gestion.responsable ?? '—',
    },
    {
      id: 'estadoRevision',
      header: 'Estado',
      cell: ({ row }) =>
        createElement(Semaforo, {
          tono: TONO_POR_ESTADO[row.original.gestion.estadoRevision],
          etiqueta: row.original.gestion.estadoRevision,
        }),
    },
    {
      id: 'fechaCorreccion',
      header: 'Fecha corrección',
      cell: ({ row }) => {
        const fecha = row.original.gestion.fechaCorreccion
        return fecha ? formatearFecha(fecha) : '—'
      },
    },
    {
      id: 'comentario',
      header: 'Bitácora',
      cell: ({ row }) =>
        createElement(IconoComentarios, {
          cantidad: row.original.gestion.bitacora.length,
          onAbrir: () => onAbrirBitacora(row.original),
        }),
    },
  ]
}
