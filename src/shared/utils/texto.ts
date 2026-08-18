const INICIO_MARCAS_DIACRITICAS = 0x0300
const FIN_MARCAS_DIACRITICAS = 0x036f
const MARCAS_DIACRITICAS = new RegExp(
  `[${String.fromCharCode(INICIO_MARCAS_DIACRITICAS)}-${String.fromCharCode(FIN_MARCAS_DIACRITICAS)}]`,
  'g',
)

/** Normaliza texto para búsqueda: minúsculas y sin tildes ("México" ~ "mexico"). */
export function normalizarParaBusqueda(texto: string): string {
  return texto.toLowerCase().normalize('NFD').replace(MARCAS_DIACRITICAS, '')
}
