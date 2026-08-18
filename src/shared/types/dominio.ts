/**
 * Tipos transversales del dominio P2P.
 * Ver .claude/docs/01-producto.md (glosario) y .claude/docs/05-modulo-1-reporteria.md
 */
import { z } from 'zod'

/* ─────────────────────────────────────────────────────────────
   Ámbito: países, compañías y monedas
   ───────────────────────────────────────────────────────────── */

export const PAISES = [
  'Colombia',
  'México',
  'Brasil',
  'Chile',
  'Perú',
  'Argentina',
  'Ecuador',
  'Uruguay',
  'Costa Rica',
] as const
export type Pais = (typeof PAISES)[number]

/** ISO 4217. La moneda acompaña SIEMPRE al valor: no hay cifras desnudas. */
export const MONEDAS = ['COP', 'MXN', 'BRL', 'CLP', 'PEN', 'ARS', 'USD', 'UYU', 'CRC'] as const
export type Moneda = (typeof MONEDAS)[number]

/** Moneda de reporte para consolidados entre países. */
export const MONEDA_REPORTE: Moneda = 'USD'

export const MONEDA_POR_PAIS: Record<Pais, Moneda> = {
  Colombia: 'COP',
  México: 'MXN',
  Brasil: 'BRL',
  Chile: 'CLP',
  Perú: 'PEN',
  Argentina: 'ARS',
  Ecuador: 'USD',
  Uruguay: 'UYU',
  'Costa Rica': 'CRC',
}

/* ─────────────────────────────────────────────────────────────
   Periodo contable
   ───────────────────────────────────────────────────────────── */

/** Periodo contable en formato `YYYY-MM`. */
export const periodoSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'El periodo debe tener el formato YYYY-MM')
export type Periodo = z.infer<typeof periodoSchema>

/* ─────────────────────────────────────────────────────────────
   Alcance operativo
   ───────────────────────────────────────────────────────────── */

/**
 * Sub-perfiles del rol `controller`. NO son roles: el rol determina qué puede
 * hacer un usuario, el sub-perfil qué alcance ve.
 * Ver .claude/docs/05-modulo-1-reporteria.md §2
 */
export const ALCANCES = ['OVH', 'TURBO'] as const
export type Alcance = (typeof ALCANCES)[number]

/** Sistema de origen del registro. */
export const SISTEMAS = ['SAP', 'NS', 'TURBO'] as const
export type Sistema = (typeof SISTEMAS)[number]

/* ─────────────────────────────────────────────────────────────
   Ciclo de vida de una observación
   ───────────────────────────────────────────────────────────── */

/** Ver .claude/docs/05-modulo-1-reporteria.md §7 */
export const ESTADOS_REVISION = [
  'Sin revisar',
  'En análisis',
  'Corrección solicitada',
  'En corrección',
  'Corregido',
  'Validado',
  'No aplica',
] as const
export type EstadoRevision = (typeof ESTADOS_REVISION)[number]

/** Estados terminales del ciclo. Se pueden reabrir, y la reapertura queda en bitácora. */
export const ESTADOS_TERMINALES: readonly EstadoRevision[] = ['Validado', 'No aplica']

/** Pasar a este estado exige un comentario que lo justifique. */
export const ESTADOS_QUE_EXIGEN_COMENTARIO: readonly EstadoRevision[] = ['No aplica']

export const NIVELES_RIESGO = ['crítico', 'alto', 'medio', 'bajo'] as const
export type NivelRiesgo = (typeof NIVELES_RIESGO)[number]

/* ─────────────────────────────────────────────────────────────
   Inconsistencias
   ───────────────────────────────────────────────────────────── */

/** Los 8 tipos de .claude/docs/05-modulo-1-reporteria.md §6 */
export const TIPOS_INCONSISTENCIA = [
  'Provisión esperada no registrada',
  'Duplicado',
  'Diferencia de valor',
  'Cuenta contable posiblemente incorrecta',
  'Centro de costo posiblemente incorrecto',
  'Sin orden de compra',
  'De otro periodo',
  'Sin responsable',
] as const
export type TipoInconsistencia = (typeof TIPOS_INCONSISTENCIA)[number]

/**
 * Riesgo propuesto automáticamente por tipo. Es una PROPUESTA: el Controller
 * puede cambiarlo, y el cambio queda registrado en la bitácora con su autor.
 */
export const RIESGO_POR_TIPO: Record<TipoInconsistencia, NivelRiesgo> = {
  'Provisión esperada no registrada': 'crítico',
  Duplicado: 'crítico',
  'Diferencia de valor': 'alto',
  'Cuenta contable posiblemente incorrecta': 'alto',
  'Centro de costo posiblemente incorrecto': 'medio',
  'Sin orden de compra': 'alto',
  'De otro periodo': 'medio',
  'Sin responsable': 'medio',
}

/* ─────────────────────────────────────────────────────────────
   Semáforo
   ───────────────────────────────────────────────────────────── */

/**
 * Gris NO significa cero: significa que no hay dato. Un valor en cero se
 * muestra en el color que le corresponda según su meta.
 * Ver .claude/docs/06-modulo-2-kpis.md §4
 */
export const TONOS_SEMAFORO = ['exito', 'advertencia', 'error', 'info', 'neutro'] as const
export type TonoSemaforo = (typeof TONOS_SEMAFORO)[number]

/**
 * Los 4 niveles de riesgo reciben 4 tonos DISTINTOS a propósito: "crítico" y
 * "alto" compartiendo tono (ambos `error`) los volvía indistinguibles a
 * simple vista, justo lo que ADR-06 prohíbe para cualquier semáforo.
 * "medio" e "info" no coinciden con el vocabulario verde/ámbar/rojo/gris de
 * los semáforos de ESTADO (ver 03-diseno.md §2.4) porque nivel de riesgo y
 * estado son ejes distintos — no hay una norma que los obligue a compartir
 * paleta, y con solo 3 tonos no-éxito no alcanzan 4 valores distintos.
 */
export const TONO_POR_RIESGO: Record<NivelRiesgo, TonoSemaforo> = {
  crítico: 'error',
  alto: 'advertencia',
  medio: 'info',
  bajo: 'neutro',
}

export const TONO_POR_ESTADO: Record<EstadoRevision, TonoSemaforo> = {
  'Sin revisar': 'neutro',
  'En análisis': 'info',
  'Corrección solicitada': 'advertencia',
  'En corrección': 'advertencia',
  Corregido: 'exito',
  Validado: 'exito',
  'No aplica': 'neutro',
}
