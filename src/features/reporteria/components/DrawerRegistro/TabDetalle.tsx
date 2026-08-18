import { formatearFecha, formatearImporte } from '@/shared/utils/formato'
import type { ProvisionSap } from '@/data/contracts'

function Campo({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <dt className="text-caption text-ink-muted">{etiqueta}</dt>
      <dd className="text-body text-ink">{valor}</dd>
    </div>
  )
}

export function TabDetalle({ registro }: { registro: ProvisionSap }) {
  return (
    <dl className="grid grid-cols-2 gap-4">
      <Campo etiqueta="Fecha de registro" valor={formatearFecha(registro.fechaRegistro)} />
      <Campo etiqueta="Periodo contable" valor={registro.periodo} />
      <Campo etiqueta="Compañía" valor={registro.compania} />
      <Campo etiqueta="País" valor={registro.pais} />
      <Campo etiqueta="Unidad de negocio" valor={registro.unidadNegocio} />
      <Campo etiqueta="Centro de costo" valor={registro.centroCosto} />
      <Campo etiqueta="Cuenta contable" valor={registro.cuentaContable} />
      <Campo etiqueta="Número de documento" valor={registro.numeroDocumento} />
      <Campo etiqueta="Orden de compra" valor={registro.ordenCompra ?? '—'} />
      <Campo etiqueta="Proveedor" valor={registro.proveedor} />
      <Campo etiqueta="Concepto" valor={registro.concepto} />
      <Campo etiqueta="Usuario que registró" valor={registro.usuarioRegistro} />
      <Campo etiqueta="Valor en moneda local" valor={formatearImporte(registro.valorLocal)} />
      <Campo etiqueta="Valor en USD" valor={formatearImporte(registro.valorUsd)} />
      <Campo etiqueta="Tipo de provisión" valor={registro.tipoProvision} />
      <Campo
        etiqueta="Posible inconsistencia"
        valor={
          registro.gestion.inconsistencias.length > 0
            ? registro.gestion.inconsistencias.join(', ')
            : 'Ninguna'
        }
      />
      <Campo etiqueta="Responsable de revisión" valor={registro.gestion.responsable ?? '—'} />
      <Campo etiqueta="Estado de la revisión" valor={registro.gestion.estadoRevision} />
      <Campo
        etiqueta="Fecha de corrección"
        valor={registro.gestion.fechaCorreccion ? formatearFecha(registro.gestion.fechaCorreccion) : '—'}
      />
      <Campo etiqueta="Comentarios" valor={registro.gestion.comentario ?? '—'} />
    </dl>
  )
}
