/**
 * Catálogos de los datos simulados.
 *
 * @mock-boundary: Snowflake — dimensiones de compañía, proveedor, cuenta contable
 *                 y centro de costo
 * @mock-boundary: Supabase — tabla `usuarios` (responsables)
 *
 * Todo aquí es INVENTADO y verosímil. No se copian datos productivos reales:
 * ni proveedores, ni montos, ni documentos. Ver .claude/docs/04-datos.md §5.7
 */
import { MONEDA_POR_PAIS, PAISES, type Moneda, type Pais } from '@/shared/types/dominio'
import type { Compania } from '@/data/contracts'

/* ─────────────────────────────────────────────────────────────
   Compañías — 2 o 3 por país
   ───────────────────────────────────────────────────────────── */

const COMPANIAS_POR_PAIS: Record<Pais, string[]> = {
  Colombia: ['Rappi Colombia SAS', 'Rappi Pay Colombia SAS', 'Rappi Turbo Colombia SAS'],
  México: ['Rappi México S de RL', 'Rappi Turbo México S de RL'],
  Brasil: ['Rappi Brasil Ltda', 'Rappi Turbo Brasil Ltda', 'Rappi Log Brasil Ltda'],
  Chile: ['Rappi Chile SpA', 'Rappi Turbo Chile SpA'],
  Perú: ['Rappi Perú SAC', 'Rappi Turbo Perú SAC'],
  Argentina: ['Rappi Argentina SRL', 'Rappi Turbo Argentina SRL'],
  Ecuador: ['Rappi Ecuador Cía Ltda'],
  Uruguay: ['Rappi Uruguay SA'],
  'Costa Rica': ['Rappi Costa Rica SRL'],
}

/**
 * Prefijo ISO 3166-1 alpha-2 por país. NO se deriva con `slice(0, 2)`: eso
 * producía "CO" tanto para Colombia como para Costa Rica y generaba IDs de
 * compañía duplicados (mismo id en dos países), lo que a su vez rompía la
 * clave de negocio (`ClaveNegocio.compania`) y las `key` de React en los
 * selectores. Detectado en la verificación visual del home.
 */
const PREFIJO_PAIS: Record<Pais, string> = {
  Colombia: 'CO',
  México: 'MX',
  Brasil: 'BR',
  Chile: 'CL',
  Perú: 'PE',
  Argentina: 'AR',
  Ecuador: 'EC',
  Uruguay: 'UY',
  'Costa Rica': 'CR',
}

export const COMPANIAS: Compania[] = PAISES.flatMap((pais) =>
  (COMPANIAS_POR_PAIS[pais] ?? []).map((nombre, indice) => ({
    id: `${PREFIJO_PAIS[pais]}-${String(indice + 1).padStart(2, '0')}`,
    nombre,
    pais,
  })),
)

export function monedaDe(pais: Pais): Moneda {
  return MONEDA_POR_PAIS[pais]
}

/* ─────────────────────────────────────────────────────────────
   Órdenes de magnitud realistas por moneda
   ─────────────────────────────────────────────────────────────
   Un gasto de oficina no cuesta lo mismo en COP que en USD. Sin esto, los
   filtros por monto y los totales por país serían absurdos y el equipo no
   podría validar nada con ellos. Rango aproximado de una provisión típica. */

export const RANGO_POR_MONEDA: Record<Moneda, [number, number]> = {
  COP: [800_000, 420_000_000],
  MXN: [4_000, 2_100_000],
  BRL: [1_200, 620_000],
  CLP: [190_000, 98_000_000],
  PEN: [800, 420_000],
  ARS: [210_000, 110_000_000],
  USD: [200, 110_000],
  UYU: [8_000, 4_300_000],
  CRC: [110_000, 56_000_000],
}

/** Tasa aproximada a USD, solo para consolidar. Es una tasa de reporte fija. */
export const TASA_A_USD: Record<Moneda, number> = {
  COP: 1 / 4100,
  MXN: 1 / 19.2,
  BRL: 1 / 5.6,
  CLP: 1 / 940,
  PEN: 1 / 3.75,
  ARS: 1 / 1050,
  USD: 1,
  UYU: 1 / 40.5,
  CRC: 1 / 520,
}

/* ─────────────────────────────────────────────────────────────
   Proveedores
   ───────────────────────────────────────────────────────────── */

export const PROVEEDORES = [
  'Servicios Logísticos Andinos',
  'Tecnología Corporativa del Sur',
  'Marketing Digital Región',
  'Consultoría Financiera Integral',
  'Suministros de Oficina Central',
  'Mantenimiento Industrial Total',
  'Cloud Infraestructura Global',
  'Seguridad Privada Metropolitana',
  'Transportes Refrigerados Express',
  'Agencia Creativa Latitud',
  'Legal y Cumplimiento Asociados',
  'Energía y Servicios Públicos SA',
  'Telecomunicaciones Empresariales',
  'Reclutamiento y Talento Global',
  'Arrendamientos Comerciales Prime',
  'Auditoría y Riesgos Corporativos',
  'Insumos de Empaque Sostenible',
  'Capacitación Profesional Continua',
  'Software de Gestión Empresarial',
  'Limpieza y Aseo Institucional',
  'Publicidad Exterior Metropolitana',
  'Mensajería y Courier Nacional',
] as const

/* ─────────────────────────────────────────────────────────────
   Estructura contable
   ───────────────────────────────────────────────────────────── */

export const CUENTAS_CONTABLES = [
  { codigo: '5110100', nombre: 'Servicios profesionales' },
  { codigo: '5110200', nombre: 'Arrendamientos' },
  { codigo: '5110300', nombre: 'Servicios públicos' },
  { codigo: '5110400', nombre: 'Mantenimiento y reparaciones' },
  { codigo: '5120100', nombre: 'Publicidad y mercadeo' },
  { codigo: '5120200', nombre: 'Tecnología y licencias' },
  { codigo: '5130100', nombre: 'Transporte y logística' },
  { codigo: '5130200', nombre: 'Suministros y papelería' },
  { codigo: '5140100', nombre: 'Seguros' },
  { codigo: '5140200', nombre: 'Honorarios legales' },
  { codigo: '5150100', nombre: 'Capacitación de personal' },
  { codigo: '5150200', nombre: 'Servicios de aseo y vigilancia' },
] as const

export const CENTROS_COSTO = [
  { codigo: 'CC-1000', nombre: 'Operaciones', unidad: 'Operaciones' },
  { codigo: 'CC-1100', nombre: 'Logística', unidad: 'Operaciones' },
  { codigo: 'CC-2000', nombre: 'Tecnología', unidad: 'Producto y Tecnología' },
  { codigo: 'CC-2100', nombre: 'Producto', unidad: 'Producto y Tecnología' },
  { codigo: 'CC-3000', nombre: 'Mercadeo', unidad: 'Comercial' },
  { codigo: 'CC-3100', nombre: 'Ventas', unidad: 'Comercial' },
  { codigo: 'CC-4000', nombre: 'Finanzas', unidad: 'Corporativo' },
  { codigo: 'CC-4100', nombre: 'Legal y Cumplimiento', unidad: 'Corporativo' },
  { codigo: 'CC-4200', nombre: 'Talento Humano', unidad: 'Corporativo' },
  { codigo: 'CC-5000', nombre: 'Turbo', unidad: 'Turbo' },
] as const

/**
 * Cuentas contables plausibles por centro de costo. Permite que "cuenta
 * contable posiblemente incorrecta" sea un desajuste real (una cuenta fuera
 * de este conjunto) y no una elección aleatoria indistinguible de una válida.
 */
export const CUENTAS_PLAUSIBLES_POR_CENTRO: Record<string, string[]> = {
  'CC-1000': ['5130100', '5140100', '5110400'],
  'CC-1100': ['5130100', '5130200', '5110400'],
  'CC-2000': ['5120200', '5110100', '5140100'],
  'CC-2100': ['5120200', '5110100'],
  'CC-3000': ['5120100', '5130200'],
  'CC-3100': ['5120100', '5110100'],
  'CC-4000': ['5110100', '5140200', '5150100'],
  'CC-4100': ['5140200', '5110100'],
  'CC-4200': ['5150100', '5110300'],
  'CC-5000': ['5130100', '5120200', '5110400'],
}

export const UNIDADES_NEGOCIO = [
  'Operaciones',
  'Producto y Tecnología',
  'Comercial',
  'Corporativo',
  'Turbo',
] as const

export const TIPOS_PROVISION = [
  'Servicio recurrente',
  'Servicio puntual',
  'Recepción sin factura',
  'Estimación de cierre',
  'Contrato marco',
] as const

/* ─────────────────────────────────────────────────────────────
   Personas
   ───────────────────────────────────────────────────────────── */

export const RESPONSABLES = [
  'Ana Beltrán',
  'Carlos Medina',
  'Daniela Ríos',
  'Esteban Quiroga',
  'Fernanda Salas',
  'Gustavo Peña',
  'Helena Cardoso',
  'Iván Restrepo',
  'Julia Márquez',
  'Kevin Ortega',
] as const

export const USUARIOS_REGISTRO = [
  'jmoreno',
  'lcastro',
  'pgomez',
  'rvargas',
  'sdelgado',
  'tnavarro',
  'BATCH_SAP',
  'INTERFACE_COUPA',
] as const

export const CONCEPTOS = [
  'Servicio de consultoría mensual',
  'Arrendamiento de bodega',
  'Licenciamiento de software anual',
  'Campaña de mercadeo digital',
  'Mantenimiento preventivo de equipos',
  'Servicio de transporte de última milla',
  'Suministro de material de empaque',
  'Honorarios de asesoría legal',
  'Servicio de vigilancia y monitoreo',
  'Capacitación en normativa contable',
  'Infraestructura de nube — cómputo',
  'Servicio de aseo de instalaciones',
  'Publicidad en medios exteriores',
  'Reclutamiento de personal técnico',
  'Auditoría interna de procesos',
] as const

export const MOTIVOS_EXCLUSION = [
  'Factura ya recibida y contabilizada',
  'Orden de compra anulada',
  'Servicio no prestado en el periodo',
  'Corresponde a otra compañía',
  'Monto por debajo del umbral de materialidad',
  'Provisión duplicada de otro registro',
  'Contrato terminado anticipadamente',
] as const
