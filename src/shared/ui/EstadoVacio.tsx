/**
 * Estado vacío. NUNCA "No hay datos" a secas: explica por qué está vacío y
 * qué hacer. Ver .claude/docs/02-arquitectura.md §8 y .claude/docs/03-diseno.md §11
 * (sin ilustraciones genéricas — texto claro + acción; contenido alineado a
 * la izquierda, nunca centrado).
 */
import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import type { ReactNode } from 'react'

interface EstadoVacioProps {
  titulo: string
  descripcion: string
  icono?: LucideIcon
  accion?: ReactNode
}

export function EstadoVacio({ titulo, descripcion, icono: Icono = Inbox, accion }: EstadoVacioProps) {
  return (
    <div className="flex flex-col items-start gap-3 px-6 py-16 text-left">
      <Icono className="size-8 text-ink-muted" aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-h3 font-semibold text-ink">{titulo}</p>
        <p className="max-w-sm text-body text-ink-muted">{descripcion}</p>
      </div>
      {accion}
    </div>
  )
}
