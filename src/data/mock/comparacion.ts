/**
 * Comparación SAP vs NS — la función central del Módulo 1.
 * Ver .claude/docs/05-modulo-1-reporteria.md §6
 */
import {
  derivarClave,
  type FilaComparacion,
  type Importe,
  type ProvisionNs,
  type ProvisionSap,
} from '@/data/contracts'
import { UMBRAL_DIFERENCIA_VALOR } from './provisiones-ns'

export function compararSapVsNs(
  filasSap: ProvisionSap[],
  filasNs: ProvisionNs[],
): FilaComparacion[] {
  const porClaveSap = new Map(filasSap.map((f) => [derivarClave(f.clave), f]))
  const porClaveNs = new Map(filasNs.map((f) => [derivarClave(f.clave), f]))
  const claves = new Set([...porClaveSap.keys(), ...porClaveNs.keys()])

  const filas: FilaComparacion[] = []
  for (const clave of claves) {
    const sap = porClaveSap.get(clave) ?? null
    const ns = porClaveNs.get(clave) ?? null

    let diferencia: Importe | null = null
    let superaUmbral = false
    if (sap && ns) {
      const delta = ns.valorEstimado.valor - sap.valorLocal.valor
      const relativa = sap.valorLocal.valor === 0 ? 0 : Math.abs(delta) / sap.valorLocal.valor
      superaUmbral = relativa > UMBRAL_DIFERENCIA_VALOR
      diferencia = { valor: Math.round(delta * 100) / 100, moneda: sap.valorLocal.moneda }
    }

    filas.push({
      clave,
      compania: sap?.compania ?? ns?.compania ?? '',
      pais: (sap?.pais ?? ns?.pais) as FilaComparacion['pais'],
      proveedor: sap?.proveedor ?? ns?.proveedor ?? '',
      ordenCompra: sap?.ordenCompra ?? ns?.ordenCompra ?? null,
      situacion: sap && ns ? 'en-ambos' : ns ? 'solo-ns' : 'solo-sap',
      valorSap: sap ? sap.valorLocal : null,
      valorNs: ns ? ns.valorEstimado : null,
      diferencia,
      superaUmbral,
    })
  }

  return filas
}
