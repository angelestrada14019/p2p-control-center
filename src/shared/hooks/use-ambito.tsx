/**
 * Ámbito seleccionado en el encabezado: periodo, país y compañía.
 * Estado compartido entre pantallas → Context acotado.
 * Ver .claude/docs/02-arquitectura.md §5 y .claude/docs/01-producto.md §7
 *
 * El periodo por defecto se resuelve consultando `repositorios.panel`, NO
 * importando una constante de `data/mock`: la UI solo conoce `repositorios`.
 * Ver .claude/docs/02-arquitectura.md §4
 */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { repositorios, type Ambito } from '@/data'
import type { Pais, Periodo } from '@/shared/types/dominio'

interface ContextoAmbito {
  ambito: Ambito | null
  periodosDisponibles: Periodo[]
  setPeriodo: (periodo: Periodo) => void
  setPais: (pais: Pais | null) => void
  setCompaniaId: (companiaId: string | null) => void
}

const Contexto = createContext<ContextoAmbito | null>(null)

export function ProveedorAmbito({ children }: { children: ReactNode }) {
  const { data: periodos = [] } = useQuery({
    queryKey: ['periodos'],
    queryFn: () => repositorios.panel.listarPeriodos(),
  })

  const [periodoElegido, setPeriodoElegido] = useState<Periodo | null>(null)
  const [pais, setPais] = useState<Pais | null>(null)
  const [companiaId, setCompaniaId] = useState<string | null>(null)

  const periodo = periodoElegido ?? periodos[0] ?? null

  const valor = useMemo<ContextoAmbito>(
    () => ({
      ambito: periodo ? { periodo, pais, companiaId } : null,
      periodosDisponibles: periodos,
      setPeriodo: setPeriodoElegido,
      setPais: (p) => {
        setPais(p)
        setCompaniaId(null) // Cambiar de país invalida la compañía seleccionada.
      },
      setCompaniaId,
    }),
    [periodo, periodos, pais, companiaId],
  )

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useAmbito(): ContextoAmbito {
  const contexto = useContext(Contexto)
  if (!contexto) {
    throw new Error('useAmbito debe usarse dentro de <ProveedorAmbito>')
  }
  return contexto
}
