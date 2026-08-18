/**
 * Punto de entrada del adaptador mock.
 *
 * Nadie fuera de `src/data/index.ts` debe importar de aquí directamente.
 * Ver .claude/docs/04-datos.md §3 y §5.2
 */
import type { Repositorios } from '@/data/contracts'
import { crearProvisionesRepositoryMock } from './repositorio-provisiones.mock'
import { crearPanelRepositoryMock } from './repositorio-panel.mock'
import { crearAlertasRepositoryMock } from './repositorio-alertas.mock'

export { PERIODO_ACTUAL, PERIODO_ANTERIOR } from './ambito'
export { obtenerUniverso } from './universo'

export function crearRepositoriosMock(): Repositorios {
  return {
    provisiones: crearProvisionesRepositoryMock(),
    panel: crearPanelRepositoryMock(),
    alertas: crearAlertasRepositoryMock(),
  }
}
