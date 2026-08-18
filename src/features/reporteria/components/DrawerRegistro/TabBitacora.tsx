/**
 * Timeline cronológico de la bitácora + formulario de nueva nota/mención.
 * Ver .claude/docs/05-modulo-1-reporteria.md §8
 */
import { useState } from 'react'
import { Send } from 'lucide-react'
import { Boton } from '@/shared/ui/Boton'
import { Puede } from '@/auth/Puede'
import { useSesion } from '@/auth/session'
import { formatearFechaHora } from '@/shared/utils/formato'
import type { EntradaBitacora } from '@/data/contracts'

const ETIQUETA_TIPO: Record<EntradaBitacora['tipo'], string> = {
  comentario: 'Comentario',
  'cambio-estado': 'Cambio de estado',
  asignacion: 'Asignación',
  'cambio-riesgo': 'Cambio de riesgo',
}

function EntradaTimeline({ entrada }: { entrada: EntradaBitacora }) {
  return (
    <li className="flex flex-col gap-1 border-l-2 border-border py-2 pl-4">
      <div className="flex items-center gap-2 text-caption text-ink-muted">
        <span className="font-medium text-ink-secondary">{entrada.autor}</span>
        <span aria-hidden="true">·</span>
        <span>{formatearFechaHora(entrada.fecha)}</span>
        <span aria-hidden="true">·</span>
        <span>{ETIQUETA_TIPO[entrada.tipo]}</span>
      </div>
      {entrada.tipo === 'cambio-estado' && entrada.estadoAnterior && entrada.estadoNuevo && (
        <p className="text-caption text-ink-muted">
          {entrada.estadoAnterior} → {entrada.estadoNuevo}
        </p>
      )}
      <p className="text-body text-ink">{entrada.texto}</p>
      {entrada.menciones.length > 0 && (
        <p className="text-caption text-primary-ink">
          {entrada.menciones.map((m) => `@${m}`).join(' ')}
        </p>
      )}
    </li>
  )
}

interface TabBitacoraProps {
  bitacora: EntradaBitacora[]
  notaBorrador: string
  onCambiarNota: (texto: string) => void
  onEnviarNota: (texto: string, menciones: string[]) => void
  enviando: boolean
}

export function TabBitacora({
  bitacora,
  notaBorrador,
  onCambiarNota,
  onEnviarNota,
  enviando,
}: TabBitacoraProps) {
  const { nombreUsuario } = useSesion()
  const [menciones, setMenciones] = useState('')

  function alEnviar() {
    if (!notaBorrador.trim()) return
    const listaMenciones = menciones
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean)
    onEnviarNota(notaBorrador, listaMenciones)
    setMenciones('')
  }

  return (
    <div className="flex flex-col gap-4">
      <Puede
        accion="ver-historial-auditoria"
        si={
          <p className="text-body text-ink-muted">
            Tu rol no tiene permiso para consultar el historial de este registro.
          </p>
        }
      >
        <ol className="flex flex-col">
          {bitacora.length === 0 ? (
            <p className="text-body text-ink-muted">Sin entradas de bitácora todavía.</p>
          ) : (
            bitacora.map((entrada) => <EntradaTimeline key={entrada.id} entrada={entrada} />)
          )}
        </ol>
      </Puede>

      <Puede accion="comentar-bitacora">
        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <label className="flex flex-col gap-1">
            <span className="text-caption font-medium text-ink-secondary">
              Nueva nota (autor: {nombreUsuario})
            </span>
            <textarea
              value={notaBorrador}
              onChange={(evento) => onCambiarNota(evento.target.value)}
              rows={3}
              placeholder="Escribe una observación…"
              className="rounded-control border border-border-strong bg-surface p-2 text-body text-ink"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-caption text-ink-muted">Mencionar (nombres separados por coma)</span>
            <input
              value={menciones}
              onChange={(evento) => setMenciones(evento.target.value)}
              placeholder="p. ej. Ana Beltrán, Carlos Medina"
              className="h-8 rounded-control border border-border-strong bg-surface px-2 text-caption text-ink"
            />
          </label>
          <Boton
            variante="secundaria"
            tamano="sm"
            onClick={alEnviar}
            disabled={!notaBorrador.trim()}
            cargando={enviando}
            className="self-start"
          >
            <Send className="size-4" aria-hidden="true" />
            Agregar nota
          </Boton>
        </div>
      </Puede>
    </div>
  )
}
