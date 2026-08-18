/**
 * Hooks de datos del panel (home) y de alertas, sobre el ámbito actual.
 * Ver .claude/docs/01-producto.md §7
 */
import { useQuery } from '@tanstack/react-query'
import { repositorios } from '@/data'
import type { ResumenModulo } from '@/data/contracts'
import { useAmbito } from './use-ambito'

export function useResumenEjecutivo() {
  const { ambito } = useAmbito()
  return useQuery({
    queryKey: ['resumen-ejecutivo', ambito],
    queryFn: () => repositorios.panel.obtenerResumenEjecutivo(ambito!),
    enabled: ambito !== null,
  })
}

export function useResumenModulo(modulo: 'reporteria' | 'kpis' | 'checklist') {
  const { ambito } = useAmbito()
  return useQuery<ResumenModulo>({
    queryKey: ['resumen-modulo', modulo, ambito],
    queryFn: () => repositorios.panel.obtenerResumenModulo(modulo, ambito!),
    enabled: ambito !== null,
  })
}

export function useAlertasNoLeidas() {
  const { ambito } = useAmbito()
  return useQuery({
    queryKey: ['alertas-no-leidas', ambito],
    queryFn: () => repositorios.alertas.contarNoLeidas(ambito!),
    enabled: ambito !== null,
  })
}

export function useAlertas() {
  const { ambito } = useAmbito()
  return useQuery({
    queryKey: ['alertas', ambito],
    queryFn: () => repositorios.alertas.listar(ambito!),
    enabled: ambito !== null,
  })
}
