import { useEffect, type RefObject } from 'react'

/** Invoca `onCerrar` cuando ocurre un `mousedown` fuera del elemento referenciado. */
export function useClicAfuera(ref: RefObject<HTMLElement | null>, onCerrar: () => void): void {
  useEffect(() => {
    function manejar(evento: MouseEvent) {
      if (ref.current && !ref.current.contains(evento.target as Node)) {
        onCerrar()
      }
    }
    document.addEventListener('mousedown', manejar)
    return () => document.removeEventListener('mousedown', manejar)
  }, [ref, onCerrar])
}
