import { useSyncExternalStore } from 'react'

/** Suscripción reactiva a un media query CSS (p. ej. `(min-width: 1440px)`). */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (notificar) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', notificar)
      return () => mql.removeEventListener('change', notificar)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}
