import { useQuery } from '@tanstack/react-query'
import { repositorios } from '@/data'

export function useCentrosCosto() {
  return useQuery({
    queryKey: ['centros-costo'],
    queryFn: () => repositorios.provisiones.listarCentrosCosto(),
    staleTime: Infinity, // Catálogo estable dentro de una sesión.
  })
}
