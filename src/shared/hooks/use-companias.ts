import { useQuery } from '@tanstack/react-query'
import { repositorios } from '@/data'

export function useCompanias() {
  return useQuery({
    queryKey: ['companias'],
    queryFn: () => repositorios.panel.listarCompanias(),
    staleTime: Infinity, // Catálogo estable dentro de una sesión.
  })
}
