import { useQuery } from '@tanstack/react-query'
import { repositorios } from '@/data'

export function useProveedores() {
  return useQuery({
    queryKey: ['proveedores'],
    queryFn: () => repositorios.provisiones.listarProveedores(),
    staleTime: Infinity, // Catálogo estable dentro de una sesión.
  })
}
