/**
 * Contratos del Módulo 1 — Reportería y Control Preventivo de Provisiones.
 *
 * Los nombres de campo del Reporte C van en MAYÚSCULAS y en inglés tal como
 * los define el negocio. NO se traducen ni se renombran: son los nombres del
 * sistema fuente y los usuarios los reconocen así.
 * Ver .claude/docs/05-modulo-1-reporteria.md §5
 */
import { z } from 'zod'
import {
  ESTADOS_REVISION,
  MONEDAS,
  NIVELES_RIESGO,
  PAISES,
  SISTEMAS,
  TIPOS_INCONSISTENCIA,
  periodoSchema,
} from '@/shared/types/dominio'
import {
  claveNegocioSchema,
  importeSchema,
  type ClaveNegocio,
  type ConsultaReporte,
  type Pagina,
  type ResumenConsulta,
} from './comunes'

/* ─────────────────────────────────────────────────────────────
   Gestión — lo que el equipo anota sobre un hecho contable
   ─────────────────────────────────────────────────────────────
   Vive en Supabase, no en Snowflake. Sobrevive a que el registro cambie o
   desaparezca en la fuente. Ver .claude/docs/04-datos.md §2 */

export const entradaBitacoraSchema = z.object({
  id: z.string(),
  autor: z.string(),
  fecha: z.string(),
  /** `comentario` es una nota; `cambio-estado` documenta una transición. */
  tipo: z.enum(['comentario', 'cambio-estado', 'asignacion', 'cambio-riesgo']),
  texto: z.string(),
  estadoAnterior: z.enum(ESTADOS_REVISION).optional(),
  estadoNuevo: z.enum(ESTADOS_REVISION).optional(),
  /** Personas etiquetadas en la entrada. */
  menciones: z.array(z.string()).default([]),
})
export type EntradaBitacora = z.infer<typeof entradaBitacoraSchema>

export const gestionSchema = z.object({
  inconsistencias: z.array(z.enum(TIPOS_INCONSISTENCIA)).default([]),
  nivelRiesgo: z.enum(NIVELES_RIESGO).nullable(),
  estadoRevision: z.enum(ESTADOS_REVISION),
  responsable: z.string().nullable(),
  fechaCompromiso: z.string().nullable(),
  fechaCorreccion: z.string().nullable(),
  comentario: z.string().nullable(),
  bitacora: z.array(entradaBitacoraSchema).default([]),
})
export type Gestion = z.infer<typeof gestionSchema>

/**
 * Un cambio de gestión a la vez, para que cada acción del drawer sea una
 * mutación atómica que deja UNA entrada de bitácora clara con su autor.
 * Ver .claude/docs/05-modulo-1-reporteria.md §7 y §8
 */
export type CambioGestion =
  | { tipo: 'comentario'; autor: string; texto: string; menciones?: string[] }
  | {
      tipo: 'cambio-estado'
      autor: string
      estadoNuevo: (typeof ESTADOS_REVISION)[number]
      /** Obligatorio cuando `estadoNuevo` está en ESTADOS_QUE_EXIGEN_COMENTARIO. */
      comentario?: string
    }
  | { tipo: 'asignacion'; autor: string; responsable: string }
  | { tipo: 'fecha-compromiso'; autor: string; fecha: string }
  | { tipo: 'cambio-riesgo'; autor: string; nivelRiesgo: (typeof NIVELES_RIESGO)[number] }
  | { tipo: 'correccion-completada'; autor: string; fechaCorreccion: string }
  /** Solo registra metadata en bitácora: no existe backend de archivos aún. */
  | { tipo: 'adjunto'; autor: string; nombreArchivo: string }

/* ─────────────────────────────────────────────────────────────
   Reporte A — SAP, provisiones registradas (vista OVH)
   ───────────────────────────────────────────────────────────── */

export const provisionSapSchema = z.object({
  clave: claveNegocioSchema,
  // Contexto
  fechaRegistro: z.string(),
  periodo: periodoSchema,
  compania: z.string(),
  pais: z.enum(PAISES),
  unidadNegocio: z.string(),
  centroCosto: z.string(),
  cuentaContable: z.string(),
  // Documento
  numeroDocumento: z.string(),
  /** Opcional: su ausencia dispara la inconsistencia "Sin orden de compra". */
  ordenCompra: z.string().nullable(),
  proveedor: z.string(),
  concepto: z.string(),
  usuarioRegistro: z.string(),
  // Valores. Las dos monedas conviven; nunca se suman entre sí.
  valorLocal: importeSchema,
  valorUsd: importeSchema,
  // Auditoría
  tipoProvision: z.string(),
  gestion: gestionSchema,
})
export type ProvisionSap = z.infer<typeof provisionSapSchema>

/* ─────────────────────────────────────────────────────────────
   Reporte B — NS, provisiones proyectadas a fin de mes (vista OVH)
   ─────────────────────────────────────────────────────────────
   "NS" es el identificador de la FUENTE, no del sistema. El sistema exacto y
   su mecanismo de integración están por confirmar.
   Ver .claude/docs/04-datos.md §6 */

export const provisionNsSchema = z.object({
  clave: claveNegocioSchema,
  // Contexto
  periodo: periodoSchema,
  compania: z.string(),
  pais: z.enum(PAISES),
  centroCosto: z.string(),
  cuentaContable: z.string(),
  // Detalle
  proveedor: z.string(),
  ordenCompra: z.string().nullable(),
  concepto: z.string(),
  // Proyección
  valorEstimado: importeSchema,
  fechaEsperadaRegistro: z.string(),
  // Gestión
  gestion: gestionSchema,
})
export type ProvisionNs = z.infer<typeof provisionNsSchema>

/* ─────────────────────────────────────────────────────────────
   Reporte C — SAP TURBO, provisiones registradas (vista TURBO)
   ───────────────────────────────────────────────────────────── */

export const provisionTurboSchema = z.object({
  clave: claveNegocioSchema,
  periodo: periodoSchema,
  // Ubicación y entidad
  COUNTRY: z.enum(PAISES),
  SOCIETY: z.string(),
  ACCOUNT: z.string(),
  ACCOUNT_NAME: z.string(),
  // Terceros y origen
  descripcionCoupa: z.string(),
  THIRD: z.string(),
  THIRD_NAME: z.string(),
  // Soporte contable
  DOCUMENT_NUMBER: z.string(),
  DOCUMENT_TYPE: z.string(),
  FISCAL_YEAR: z.number().int(),
  PERIOD: z.number().int().min(1).max(12),
  REFERENCE_DOCUMENT: z.string().nullable(),
  PURCHASE_DOCUMENT: z.string().nullable(),
  /* Importes. LAS TRES COLUMNAS NUNCA SE SUMAN ENTRE SÍ: AMOUNT_DOCUMENT está
     en CURRENCY_DOCUMENT, y ML1/ML2 en las monedas locales de la sociedad.
     Cada una lleva su moneda visible en el encabezado. */
  CURRENCY_DOCUMENT: z.enum(MONEDAS),
  AMOUNT_DOCUMENT: importeSchema,
  AMOUNT_ML1: importeSchema,
  AMOUNT_ML2: importeSchema,
  // Auditoría y compensación
  CREATED_BY: z.string(),
  COMPENSATION_DOCUMENT: z.string().nullable(),
  COMPENSATION_DATE: z.string().nullable(),
  gestion: gestionSchema,
})
export type ProvisionTurbo = z.infer<typeof provisionTurboSchema>

/* ─────────────────────────────────────────────────────────────
   Pestaña global — No provisionable
   ─────────────────────────────────────────────────────────────
   Vista unificada de SAP + NS + TURBO. No es un archivo muerto: existe para
   auditar OMISIONES ERRÓNEAS — lo que se excluyó y no debía excluirse.
   Ver .claude/docs/05-modulo-1-reporteria.md §2 */

export const registroNoProvisionableSchema = z.object({
  clave: claveNegocioSchema,
  sistema: z.enum(SISTEMAS),
  periodo: periodoSchema,
  compania: z.string(),
  pais: z.enum(PAISES),
  proveedor: z.string(),
  concepto: z.string(),
  valor: importeSchema,
  motivoExclusion: z.string(),
  excluidoPor: z.string(),
  fechaExclusion: z.string(),
  gestion: gestionSchema,
})
export type RegistroNoProvisionable = z.infer<typeof registroNoProvisionableSchema>

/* ─────────────────────────────────────────────────────────────
   Comparación SAP vs NS — la función central del módulo
   ───────────────────────────────────────────────────────────── */

export interface FilaComparacion {
  clave: string
  compania: string
  pais: (typeof PAISES)[number]
  proveedor: string
  ordenCompra: string | null
  /** `solo-ns` = provisión esperada que aún no se registra. */
  situacion: 'en-ambos' | 'solo-ns' | 'solo-sap'
  valorSap: z.infer<typeof importeSchema> | null
  valorNs: z.infer<typeof importeSchema> | null
  /** Presente solo cuando la fila está en ambos y los valores difieren. */
  diferencia: z.infer<typeof importeSchema> | null
  superaUmbral: boolean
}

/* ─────────────────────────────────────────────────────────────
   Catálogos para los filtros de Reportería
   ───────────────────────────────────────────────────────────── */

export interface CuentaContable {
  codigo: string
  nombre: string
}

export interface CentroCosto {
  codigo: string
  nombre: string
  unidad: string
}

/* ─────────────────────────────────────────────────────────────
   El contrato
   ───────────────────────────────────────────────────────────── */

export interface ProvisionesRepository {
  /** Reporte A — SAP, provisiones registradas (OVH). */
  listarRegistradasSap(consulta: ConsultaReporte): Promise<Pagina<ProvisionSap>>
  /** Reporte B — NS, provisiones proyectadas a fin de mes (OVH). */
  listarProyectadasNs(consulta: ConsultaReporte): Promise<Pagina<ProvisionNs>>
  /** Reporte C — SAP TURBO, provisiones registradas (TURBO). */
  listarRegistradasTurbo(consulta: ConsultaReporte): Promise<Pagina<ProvisionTurbo>>
  /** Pestaña global de exclusiones, unificada SAP + NS + TURBO. */
  listarNoProvisionables(consulta: ConsultaReporte): Promise<Pagina<RegistroNoProvisionable>>
  /** Comparación SAP vs NS del periodo. Paginada: puede cubrir miles de filas. */
  compararSapVsNs(consulta: ConsultaReporte): Promise<Pagina<FilaComparacion>>
  /** Indicadores resumen, calculados sobre los filtros activos. */
  resumir(consulta: ConsultaReporte): Promise<ResumenConsulta>
  /** Catálogo de proveedores para el filtro de Reportería. */
  listarProveedores(): Promise<string[]>
  /** Catálogo de cuentas contables para el filtro de Reportería. */
  listarCuentasContables(): Promise<CuentaContable[]>
  /** Catálogo de centros de costo para el filtro de Reportería. */
  listarCentrosCosto(): Promise<CentroCosto[]>
  /** Catálogo de responsables para el filtro de Reportería. */
  listarResponsables(): Promise<string[]>
  /**
   * Aplica un cambio de gestión al registro identificado por su clave de
   * negocio y devuelve la `Gestion` resultante, ya con la nueva entrada de
   * bitácora. Rechaza (throw) un `cambio-estado` a un estado que exige
   * comentario (ver ESTADOS_QUE_EXIGEN_COMENTARIO) si no se provee uno.
   */
  actualizarGestion(clave: ClaveNegocio, cambio: CambioGestion): Promise<Gestion>
}
