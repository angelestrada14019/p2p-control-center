import { useQuery } from '@tanstack/react-query'
import { repositorios } from '@/data'

export function useResponsables() {
  return useQuery({
    queryKey: ['responsables'],
    queryFn: () => repositorios.provisiones.listarResponsables(),
    staleTime: Infinity, // Catálogo estable dentro de una sesión.
  })
}
