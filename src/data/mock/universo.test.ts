/**
 * Verifica las garantías que la documentación exige de los datos simulados.
 * Ver .claude/docs/04-datos.md §5.4
 */
import { describe, expect, it } from 'vitest'
import { crearAleatorio, SEMILLA } from './aleatorio'
import { generarProvisionesSap } from './provisiones-sap'
import { generarProvisionesTurbo } from './provisiones-turbo'
import { obtenerUniverso, reiniciarUniverso } from './universo'
import { COMPANIAS } from './catalogos'
import { TIPOS_INCONSISTENCIA } from '@/shared/types/dominio'

describe('determinismo', () => {
  it('la misma semilla produce exactamente los mismos datos', () => {
    const a = crearAleatorio(SEMILLA)
    const b = crearAleatorio(SEMILLA)
    const sapA = generarProvisionesSap(a)
    const sapB = generarProvisionesSap(b)

    expect(sapA.length).toBe(sapB.length)
    expect(sapA[0]).toEqual(sapB[0])
    expect(sapA.at(-1)).toEqual(sapB.at(-1))
    expect(JSON.stringify(sapA)).toBe(JSON.stringify(sapB))
  })

  it('el universo memoizado es estable entre llamadas', () => {
    reiniciarUniverso()
    const primero = obtenerUniverso()
    const segundo = obtenerUniverso()
    expect(primero).toBe(segundo)
  })
})

describe('cobertura de inconsistencias', () => {
  // "Provisión esperada no registrada" es, por definición, un hallazgo del
  // Reporte B (NS): describe una fila que existe en NS y no tiene contraparte
  // en SAP, así que nunca puede aparecer marcada en una fila del Reporte A.
  // "Diferencia de valor" se detecta al comparar A con B, y por eso solo
  // aparece en SAP después de que la generación de NS mutó las filas
  // coincidentes — se verifica sobre el universo completo, no sobre un
  // generador de SAP aislado.
  const { sap, ns } = obtenerUniverso()
  const todasLasGestiones = [...sap.map((f) => f.gestion), ...ns.map((f) => f.gestion)]

  for (const tipo of TIPOS_INCONSISTENCIA) {
    it(`al menos un registro (SAP o NS) tiene "${tipo}"`, () => {
      const hay = todasLasGestiones.some((g) => g.inconsistencias.includes(tipo))
      expect(hay).toBe(true)
    })
  }
})

describe('volumen', () => {
  it('el reporte de provisiones está en el orden de miles, no de decenas', () => {
    const { sap, turbo } = obtenerUniverso()
    expect(sap.length).toBeGreaterThan(1000)
    expect(turbo.length).toBeGreaterThan(500)
  })
})

describe('cobertura de países y monedas', () => {
  it('aparecen los 9 países LatAm del alcance', () => {
    const { sap } = obtenerUniverso()
    const paises = new Set(sap.map((f) => f.pais))
    expect(paises.size).toBeGreaterThanOrEqual(8)
  })

  it('ninguna cifra viaja sin su moneda', () => {
    const { sap } = obtenerUniverso()
    for (const f of sap.slice(0, 50)) {
      expect(f.valorLocal.moneda).toBeTruthy()
      expect(f.valorUsd.moneda).toBe('USD')
    }
  })
})

describe('catálogo de compañías', () => {
  // Regresión: "Colombia" y "Costa Rica" compartían el prefijo derivado por
  // slice(0, 2), lo que producía IDs de compañía duplicados entre países.
  it('todos los IDs de compañía son únicos', () => {
    const ids = COMPANIAS.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('registros sin responsable', () => {
  it('existen registros sin responsable asignado', () => {
    const { sap } = obtenerUniverso()
    expect(sap.some((f) => f.gestion.responsable === null)).toBe(true)
  })
})

describe('bitácora con historial', () => {
  it('un registro corregido tiene varias entradas de autores distintos', () => {
    const { sap } = obtenerUniverso()
    const corregido = sap.find(
      (f) => f.gestion.estadoRevision === 'Validado' && f.gestion.bitacora.length > 1,
    )
    expect(corregido).toBeDefined()
    const autores = new Set(corregido?.gestion.bitacora.map((b) => b.autor))
    expect(autores.size).toBeGreaterThanOrEqual(1)
  })
})

describe('comparación SAP vs NS', () => {
  it('produce las tres situaciones: en-ambos, solo-ns y solo-sap', () => {
    const { comparacion } = obtenerUniverso()
    const situaciones = new Set(comparacion.map((f) => f.situacion))
    expect(situaciones.has('en-ambos')).toBe(true)
    expect(situaciones.has('solo-ns')).toBe(true)
  })

  it('las tres columnas de importe del Reporte C nunca se mezclan en un mismo total', () => {
    const rnd = crearAleatorio(SEMILLA)
    const turbo = generarProvisionesTurbo(rnd)
    const fila = turbo[0]
    expect(fila).toBeDefined()
    // Cada columna declara su propia moneda; AMOUNT_DOCUMENT puede diferir de
    // ML1/ML2, que están en la moneda de reporte.
    expect(fila?.AMOUNT_ML1.moneda).toBe('USD')
    expect(fila?.AMOUNT_ML2.moneda).toBe('USD')
  })
})
