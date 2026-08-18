/**
 * Estado de borrador del drawer. Por esta fase, el único campo que puede
 * quedar "sin guardar" es la nota en redacción del tab de bitácora — cada
 * acción de `AccionesGestion` dispara su mutación de inmediato, así que no
 * hay más borradores pendientes que rastrear. Ver
 * .claude/docs/05-modulo-1-reporteria.md §8 (advertencia de cambios sin guardar).
 */
import { useState } from 'react'

export function useFormularioDrawer() {
  const [notaBorrador, setNotaBorrador] = useState('')
  const esDirty = notaBorrador.trim().length > 0

  function limpiar() {
    setNotaBorrador('')
  }

  return { notaBorrador, setNotaBorrador, esDirty, limpiar }
}
