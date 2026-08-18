/**
 * Verificación de accesibilidad de la paleta.
 *
 * Estos tests recalculan el contraste de cada par de tokens con la fórmula
 * WCAG. Si alguien cambia un color y rompe la legibilidad, la prueba falla:
 * la accesibilidad no puede degradarse en silencio.
 *
 * Los valores viven aquí duplicados a propósito, no importados del CSS. Si un
 * token cambia en `tokens.css` sin actualizarse aquí, el test sigue midiendo
 * el valor antiguo y la revisión del PR lo detecta.
 */
import { describe, expect, it } from 'vitest'
import { MINIMO, contraste, ratio } from './contraste'

const SUPERFICIE = {
  canvas: '#F8F9FA',
  surface: '#FFFFFF',
  sunken: '#F1F5F9',
} as const

const TEXTO = {
  principal: '#0F172A',
  secundario: '#475569',
  /* Oscurecido desde el #64748B de la especificación de marca: ese daba 4.34:1
     sobre la superficie hundida y fallaba AA justo en el encabezado de tabla. */
  atenuado: '#5F6B7A',
} as const

const ACCION = {
  primary: '#FF441F',
  primaryHover: '#F03A15',
  primaryText: '#0F172A',
  focus: '#FF441F',
  bordeFuerte: '#64748B',
} as const

/** Cada estado del semáforo: fondo de badge, texto sobre ese fondo, punto sólido. */
const ESTADOS = {
  exito: { bg: '#E6F4EA', text: '#047857', solid: '#0B8457' },
  advertencia: { bg: '#FEF3C7', text: '#92400E', solid: '#D97706' },
  error: { bg: '#FEE2E2', text: '#B91C1C', solid: '#DC2626' },
  info: { bg: '#DBEAFE', text: '#1D4ED8', solid: '#2563EB' },
  neutro: { bg: '#F1F5F9', text: '#475569', solid: '#64748B' },
} as const

describe('texto sobre superficies', () => {
  const superficies = Object.entries(SUPERFICIE)
  const textos = Object.entries(TEXTO)

  for (const [nombreTexto, colorTexto] of textos) {
    for (const [nombreSup, colorSup] of superficies) {
      it(`texto ${nombreTexto} sobre ${nombreSup} cumple AA (${ratio(colorTexto, colorSup)}:1)`, () => {
        expect(contraste(colorTexto, colorSup)).toBeGreaterThanOrEqual(MINIMO.textoNormal)
      })
    }
  }
})

describe('acción primaria', () => {
  it('el label slate sobre el naranja de marca cumple AA para texto normal', () => {
    // 5.18:1. Es la razón por la que el botón NO lleva texto blanco:
    // blanco sobre #FF441F da 3.44:1 y falla. Ver ADR-11.
    expect(contraste(ACCION.primaryText, ACCION.primary)).toBeGreaterThanOrEqual(
      MINIMO.textoNormal,
    )
  })

  it('el label slate sigue cumpliendo AA en el estado hover', () => {
    expect(contraste(ACCION.primaryText, ACCION.primaryHover)).toBeGreaterThanOrEqual(
      MINIMO.textoNormal,
    )
  })

  it('el texto blanco sobre el naranja NO cumple — regresión documentada', () => {
    // Test invertido: fija por qué el botón usa texto oscuro. Si algún día el
    // naranja cambia y este par empieza a cumplir, conviene revisar ADR-11.
    expect(contraste('#FFFFFF', ACCION.primary)).toBeLessThan(MINIMO.textoNormal)
  })

  it('el anillo de foco es perceptible sobre superficie y sobre canvas', () => {
    expect(contraste(ACCION.focus, SUPERFICIE.surface)).toBeGreaterThanOrEqual(MINIMO.noTextual)
    expect(contraste(ACCION.focus, SUPERFICIE.canvas)).toBeGreaterThanOrEqual(MINIMO.noTextual)
  })

  it('el borde con significado es perceptible sobre superficie', () => {
    expect(contraste(ACCION.bordeFuerte, SUPERFICIE.surface)).toBeGreaterThanOrEqual(
      MINIMO.noTextual,
    )
  })
})

describe('estados del semáforo', () => {
  for (const [nombre, estado] of Object.entries(ESTADOS)) {
    it(`${nombre}: el texto del badge es legible sobre su fondo (${ratio(estado.text, estado.bg)}:1)`, () => {
      expect(contraste(estado.text, estado.bg)).toBeGreaterThanOrEqual(MINIMO.textoNormal)
    })

    it(`${nombre}: el punto sólido es perceptible sobre superficie (${ratio(estado.solid, SUPERFICIE.surface)}:1)`, () => {
      expect(contraste(estado.solid, SUPERFICIE.surface)).toBeGreaterThanOrEqual(MINIMO.noTextual)
    })

    it(`${nombre}: el punto sólido es perceptible sobre el canvas`, () => {
      expect(contraste(estado.solid, SUPERFICIE.canvas)).toBeGreaterThanOrEqual(MINIMO.noTextual)
    })
  }
})

describe('el color no basta para distinguir estados', () => {
  // Estos tests no comprueban que la paleta esté bien: comprueban que el
  // problema que motiva la regla ADR-06 sigue existiendo. Los estados tienen
  // luminancias casi idénticas, así que con daltonismo o en escala de grises
  // son indistinguibles entre sí. Por eso cada semáforo lleva SIEMPRE ícono o
  // texto además del color.
  const pares: Array<[string, string, string]> = [
    ['éxito vs advertencia', ESTADOS.exito.solid, ESTADOS.advertencia.solid],
    ['éxito vs error', ESTADOS.exito.solid, ESTADOS.error.solid],
    ['advertencia vs error', ESTADOS.advertencia.solid, ESTADOS.error.solid],
    ['acción primaria vs error', ACCION.primary, ESTADOS.error.solid],
  ]

  for (const [nombre, a, b] of pares) {
    it(`${nombre}: ${ratio(a, b)}:1 — insuficiente para distinguirse solo por color`, () => {
      expect(contraste(a, b)).toBeLessThan(MINIMO.noTextual)
    })
  }
})
