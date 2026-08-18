import { useQuery } from '@tanstack/react-query'
import { repositorios } from '@/data'

export function useCuentasContables() {
  return useQuery({
    queryKey: ['cuentas-contables'],
    queryFn: () => repositorios.provisiones.listarCuentasContables(),
    staleTime: Infinity, // Catálogo estable dentro de una sesión.
  })
}
