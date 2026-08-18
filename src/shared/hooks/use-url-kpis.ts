/**
 * URL del dashboard externo de KPIs. NUNCA hardcodeada — configurable por
 * entorno. Ver .claude/docs/06-modulo-2-kpis.md §1 y .claude/docs/09-infraestructura.md §2
 */
import type { Ambito } from '@/data/contracts'

export function useUrlKpis(): string | null {
  const url = import.meta.env.VITE_KPIS_URL
  return url && url.trim() !== '' ? url : null
}

/**
 * Anexa el ámbito actual (periodo, país, compañía) como query params, "si la
 * app destino lo admite" (06-modulo-2-kpis.md §1). No asumimos que la app
 * externa los use: solo se los ofrecemos.
 */
export function construirUrlKpisConContexto(urlBase: string, ambito: Ambito | null): string {
  if (!ambito) return urlBase
  const parametros = new URLSearchParams({ periodo: ambito.periodo })
  if (ambito.pais) parametros.set('pais', ambito.pais)
  if (ambito.companiaId) parametros.set('companiaId', ambito.companiaId)
  const separador = urlBase.includes('?') ? '&' : '?'
  return `${urlBase}${separador}${parametros.toString()}`
}
