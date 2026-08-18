/**
 * Contratos de la capa de datos.
 *
 * Esto es lo ÚNICO que la interfaz conoce. Los adaptadores (mock, Snowflake,
 * Supabase) implementan estas interfaces y son intercambiables sin que ningún
 * componente se entere. Ver .claude/docs/04-datos.md §3
 */
export * from './comunes'
export * from './provisiones.contract'
export * from './panel.contract'

import type { AlertasRepository, PanelRepository } from './panel.contract'
import type { ProvisionesRepository } from './provisiones.contract'

/** El conjunto de repositorios que la aplicación consume. */
export interface Repositorios {
  provisiones: ProvisionesRepository
  panel: PanelRepository
  alertas: AlertasRepository
}
