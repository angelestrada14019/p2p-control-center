/**
 * Mutación genérica sobre `actualizarGestion`, reutilizable sin cambios por
 * los Reportes B y C. Invalida por prefijo de `queryKey` (TanStack Query hace
 * match parcial de arrays) para no tener que reconstruir la consulta activa.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { repositorios } from '@/data'
import type { CambioGestion, ClaveNegocio } from '@/data/contracts'

export function useMutacionGestion(prefijoQueryKey: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ clave, cambio }: { clave: ClaveNegocio; cambio: CambioGestion }) =>
      repositorios.provisiones.actualizarGestion(clave, cambio),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [prefijoQueryKey] })
      void queryClient.invalidateQueries({ queryKey: [`${prefijoQueryKey}-resumen`] })
    },
  })
}
