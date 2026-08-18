/**
 * Tarjeta grande de módulo, en el home. Ver .claude/docs/03-diseno.md §7
 * Las tres tarjetas tienen el mismo peso visual.
 */
import type { LucideIcon } from 'lucide-react'
import { Tarjeta, TarjetaClicable } from '@/shared/ui/Tarjeta'
import { Semaforo } from '@/shared/ui/Semaforo'
import { Skeleton } from '@/shared/ui/Skeleton'
import { EstadoError } from '@/shared/ui/EstadoError'
import type { ResumenModulo } from '@/data/contracts'

interface TarjetaModuloProps {
  titulo: string
  descripcion: string
  icono: LucideIcon
  onClick: () => void
  resumen?: ResumenModulo
  cargando?: boolean
  /** Un `catch` sin manejo visible es un defecto — ver .claude/docs/02-arquitectura.md §8. */
  error?: boolean
  onReintentar?: () => void
}

export function TarjetaModulo({
  titulo,
  descripcion,
  icono: Icono,
  onClick,
  resumen,
  cargando = false,
  error = false,
  onReintentar,
}: TarjetaModuloProps) {
  const encabezado = (
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-2.5">
        <Icono className="size-5 shrink-0 text-ink-secondary" aria-hidden="true" />
        <h2 className="text-h2 font-semibold text-ink">{titulo}</h2>
      </div>
      {resumen && <Semaforo tono={resumen.tono} etiqueta={resumen.etiqueta} />}
    </div>
  )

  // Con error no se envuelve en TarjetaClicable: contendría un botón
  // (Reintentar) dentro de otro botón, HTML inválido e inaccesible.
  if (error) {
    return (
      <Tarjeta className="flex flex-col gap-3 p-5">
        {encabezado}
        <p className="text-body text-ink-muted">{descripcion}</p>
        <EstadoError
          titulo="No se pudo cargar el resumen"
          descripcion="Intenta de nuevo en unos segundos."
          onReintentar={onReintentar}
        />
      </Tarjeta>
    )
  }

  return (
    <TarjetaClicable onClick={onClick} aria-label={`Abrir ${titulo}`} className="flex flex-col gap-3 p-5">
      {encabezado}
      <p className="text-body text-ink-muted">{descripcion}</p>
      <div className="mt-auto flex flex-wrap gap-5 border-t border-border pt-3">
        {cargando || !resumen ? (
          <>
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-20" />
          </>
        ) : (
          resumen.indicadores.map((indicador, indice) => (
            <div key={indice}>
              <p className="text-h3 font-semibold text-ink tabular-nums">{indicador.valor}</p>
              <p className="text-caption text-ink-muted">{indicador.etiqueta}</p>
            </div>
          ))
        )}
      </div>
    </TarjetaClicable>
  )
}
