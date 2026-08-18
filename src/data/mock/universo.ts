/**
 * Generación única y memoizada de todo el universo de datos simulados.
 *
 * Se genera UNA vez por sesión de la aplicación y se reutiliza: regenerar en
 * cada llamada rompería el determinismo entre pantallas (un registro visto en
 * la tabla debe seguir siendo el mismo al abrir su drawer de detalle).
 */
import { crearAleatorio, SEMILLA } from './aleatorio'
import { generarProvisionesSap } from './provisiones-sap'
import { generarProvisionesNs } from './provisiones-ns'
import { generarProvisionesTurbo } from './provisiones-turbo'
import { generarNoProvisionables } from './no-provisionables'
import { compararSapVsNs } from './comparacion'
import type {
  FilaComparacion,
  ProvisionNs,
  ProvisionSap,
  ProvisionTurbo,
  RegistroNoProvisionable,
} from '@/data/contracts'

export interface Universo {
  sap: ProvisionSap[]
  ns: ProvisionNs[]
  turbo: ProvisionTurbo[]
  noProvisionables: RegistroNoProvisionable[]
  comparacion: FilaComparacion[]
}

let cache: Universo | null = null

export function obtenerUniverso(): Universo {
  if (cache) return cache

  const rnd = crearAleatorio(SEMILLA)
  const sap = generarProvisionesSap(rnd)
  const ns = generarProvisionesNs(rnd, sap)
  const turbo = generarProvisionesTurbo(rnd)
  const noProvisionables = generarNoProvisionables(rnd)
  const comparacion = compararSapVsNs(sap, ns)

  cache = { sap, ns, turbo, noProvisionables, comparacion }
  return cache
}

/** Solo para tests: fuerza una regeneración limpia. */
export function reiniciarUniverso(): void {
  cache = null
}
