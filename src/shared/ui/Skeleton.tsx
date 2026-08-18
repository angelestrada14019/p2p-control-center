/**
 * Skeleton de carga. Debe reservar la altura final del contenido para no
 * provocar saltos de layout. Ver .claude/docs/03-diseno.md §8
 */
interface SkeletonProps {
  className?: string
  /** Etiqueta para lectores de pantalla; por defecto anuncia "Cargando". */
  etiqueta?: string
}

export function Skeleton({ className = 'h-4 w-full', etiqueta }: SkeletonProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={etiqueta ?? 'Cargando'}
      className={`block animate-pulse rounded-badge bg-surface-sunken ${className}`}
    />
  )
}

/** Fila de tabla en carga, con el mismo número de columnas que el contenido real. */
export function FilaSkeletonTabla({ columnas }: { columnas: number }) {
  return (
    <tr>
      {Array.from({ length: columnas }, (_, i) => (
        <td key={i} className="px-3 py-2">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}
