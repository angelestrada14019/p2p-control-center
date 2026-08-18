/**
 * Formato de moneda, fecha y número. ÚNICO lugar del proyecto donde se
 * decide cómo se ven estos valores — así el formato es idéntico en los tres
 * módulos. Ver .claude/docs/03-diseno.md §8 y .claude/docs/04-datos.md §5.5
 */
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Importe } from '@/data/contracts'

const formateadoresPorMoneda = new Map<string, Intl.NumberFormat>()

/**
 * `COP 1.234.567`. La moneda va SIEMPRE explícita como código ISO, nunca un
 * símbolo ambiguo ($ podría ser COP, MXN, ARS, CLP...). Ver .claude/docs/04-datos.md §5.5
 */
export function formatearImporte(importe: Importe): string {
  let formateador = formateadoresPorMoneda.get(importe.moneda)
  if (!formateador) {
    formateador = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: importe.moneda,
      currencyDisplay: 'code',
      maximumFractionDigits: 0,
    })
    formateadoresPorMoneda.set(importe.moneda, formateador)
  }
  return formateador.format(importe.valor)
}

/** Solo el número, sin código de moneda — para usar junto a un encabezado de columna que ya declara la moneda. */
export function formatearNumero(valor: number): string {
  return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(valor)
}

export function formatearPorcentaje(proporcion: number): string {
  return new Intl.NumberFormat('es-CO', { style: 'percent', maximumFractionDigits: 0 }).format(
    proporcion,
  )
}

export function formatearFecha(iso: string): string {
  return format(new Date(iso), 'd MMM yyyy', { locale: es })
}

export function formatearFechaHora(iso: string): string {
  return format(new Date(iso), "d MMM yyyy, HH:mm", { locale: es })
}

/** "hace 3 días" — para entradas de bitácora y alertas. */
export function formatearRelativo(iso: string): string {
  return formatDistanceToNow(new Date(iso), { locale: es, addSuffix: true })
}
