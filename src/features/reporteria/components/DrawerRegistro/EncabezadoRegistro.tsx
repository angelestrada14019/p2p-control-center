import { Semaforo } from '@/shared/ui/Semaforo'
import { formatearImporte } from '@/shared/utils/formato'
import { TONO_POR_ESTADO } from '@/shared/types/dominio'
import type { ProvisionSap } from '@/data/contracts'

export function EncabezadoRegistro({ registro }: { registro: ProvisionSap }) {
  return (
    <div className="flex flex-col gap-2 border-b border-border pb-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-body-strong text-ink">{registro.numeroDocumento}</p>
        <Semaforo
          tono={TONO_POR_ESTADO[registro.gestion.estadoRevision]}
          etiqueta={registro.gestion.estadoRevision}
        />
      </div>
      <p className="text-body text-ink-secondary">{registro.proveedor}</p>
      <div className="flex items-center gap-3 text-caption text-ink-muted">
        <span className="tabular-nums">{formatearImporte(registro.valorUsd)}</span>
        <span aria-hidden="true">·</span>
        <span>Periodo {registro.periodo}</span>
      </div>
    </div>
  )
}
