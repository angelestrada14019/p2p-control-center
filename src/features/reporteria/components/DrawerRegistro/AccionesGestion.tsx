/**
 * Acciones de gestión sobre el registro. Cada acción está detrás de `<Puede>`
 * (versión deshabilitada + tooltip cuando no aplica, nunca oculta sin más —
 * ver .claude/docs/05-modulo-1-reporteria.md §11).
 */
import { useState, type ReactNode } from 'react'
import { Boton } from '@/shared/ui/Boton'
import { Modal } from '@/shared/ui/Modal'
import { Tooltip } from '@/shared/ui/Tooltip'
import { usePuede } from '@/auth/Puede'
import { useSesion } from '@/auth/session'
import {
  ESTADOS_REVISION,
  ESTADOS_QUE_EXIGEN_COMENTARIO,
  ESTADOS_TERMINALES,
  NIVELES_RIESGO,
  type EstadoRevision,
  type NivelRiesgo,
} from '@/shared/types/dominio'
import type { CambioGestion, Gestion } from '@/data/contracts'

interface AccionSeccionProps {
  titulo: string
  permitido: boolean
  motivo: string
  children: ReactNode
}

function AccionSeccion({ titulo, permitido, motivo, children }: AccionSeccionProps) {
  const contenido = (
    <div className={`flex flex-col gap-2 ${permitido ? '' : 'pointer-events-none opacity-50'}`}>
      <p className="text-caption font-medium text-ink-secondary">{titulo}</p>
      {children}
    </div>
  )
  return permitido ? contenido : <Tooltip contenido={motivo}>{contenido}</Tooltip>
}

interface AccionesGestionProps {
  gestion: Gestion
  onMutar: (cambio: CambioGestion) => void
  mutando: boolean
}

export function AccionesGestion({ gestion, onMutar, mutando }: AccionesGestionProps) {
  const { nombreUsuario } = useSesion()
  const puedeMarcarEstado = usePuede('cambiar-estado-observacion')
  const puedeAsignar = usePuede('asignar-responsable')
  const puedeMarcarCorreccion = usePuede('marcar-correccion-completada')
  const puedeAdjuntar = usePuede('adjuntar-evidencia')
  const puedeValidar = usePuede('validar-registro')
  const puedeCambiarRiesgo = usePuede('cambiar-nivel-riesgo')

  const [estadoElegido, setEstadoElegido] = useState<EstadoRevision>(gestion.estadoRevision)
  const [comentarioEstado, setComentarioEstado] = useState('')
  const [confirmando, setConfirmando] = useState(false)
  const [responsable, setResponsable] = useState('')
  const [fechaCompromiso, setFechaCompromiso] = useState('')
  const [nivelRiesgo, setNivelRiesgo] = useState<NivelRiesgo>(gestion.nivelRiesgo ?? 'medio')
  const [fechaCorreccion, setFechaCorreccion] = useState('')
  const [nombreArchivo, setNombreArchivo] = useState('')

  const exigeComentario = ESTADOS_QUE_EXIGEN_COMENTARIO.includes(estadoElegido)
  const esTransicionRestringida = estadoElegido === 'Validado' && !puedeValidar
  const cambioEstadoInvalido =
    estadoElegido === gestion.estadoRevision ||
    (exigeComentario && !comentarioEstado.trim()) ||
    esTransicionRestringida

  function confirmarCambioEstado() {
    onMutar({
      tipo: 'cambio-estado',
      autor: nombreUsuario,
      estadoNuevo: estadoElegido,
      comentario: comentarioEstado.trim() || undefined,
    })
    setComentarioEstado('')
    setConfirmando(false)
  }

  function alPulsarCambiarEstado() {
    if (cambioEstadoInvalido) return
    if (ESTADOS_TERMINALES.includes(estadoElegido)) {
      setConfirmando(true)
    } else {
      confirmarCambioEstado()
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <AccionSeccion
        titulo="Cambiar estado de la observación"
        permitido={puedeMarcarEstado}
        motivo="Tu rol no tiene permiso para cambiar el estado de la observación."
      >
        <select
          value={estadoElegido}
          onChange={(e) => setEstadoElegido(e.target.value as EstadoRevision)}
          className="h-9 rounded-control border border-border-strong bg-surface px-2 text-body text-ink"
        >
          {ESTADOS_REVISION.map((estado) => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </select>
        {exigeComentario && (
          <textarea
            value={comentarioEstado}
            onChange={(e) => setComentarioEstado(e.target.value)}
            placeholder='Comentario obligatorio para pasar a "No aplica"'
            rows={2}
            className="rounded-control border border-border-strong bg-surface p-2 text-body text-ink"
          />
        )}
        {esTransicionRestringida && (
          <p className="text-caption text-danger-ink">
            Solo Controller o Administrador pueden marcar un registro como Validado.
          </p>
        )}
        <Boton
          variante="secundaria"
          tamano="sm"
          onClick={alPulsarCambiarEstado}
          disabled={cambioEstadoInvalido}
          cargando={mutando}
          className="self-start"
        >
          Confirmar cambio de estado
        </Boton>
      </AccionSeccion>

      <AccionSeccion
        titulo="Asignar responsable"
        permitido={puedeAsignar}
        motivo="Tu rol no tiene permiso para asignar responsable."
      >
        <div className="flex gap-2">
          <input
            value={responsable}
            onChange={(e) => setResponsable(e.target.value)}
            placeholder="Nombre del responsable"
            className="h-9 flex-1 rounded-control border border-border-strong bg-surface px-2 text-body text-ink"
          />
          <Boton
            variante="secundaria"
            tamano="sm"
            disabled={!responsable.trim()}
            onClick={() => {
              onMutar({ tipo: 'asignacion', autor: nombreUsuario, responsable: responsable.trim() })
              setResponsable('')
            }}
          >
            Asignar
          </Boton>
        </div>
      </AccionSeccion>

      <AccionSeccion
        titulo="Registrar fecha compromiso"
        permitido={puedeAsignar}
        motivo="Tu rol no tiene permiso para registrar una fecha compromiso."
      >
        <div className="flex gap-2">
          <input
            type="date"
            value={fechaCompromiso}
            onChange={(e) => setFechaCompromiso(e.target.value)}
            className="h-9 rounded-control border border-border-strong bg-surface px-2 text-body text-ink"
          />
          <Boton
            variante="secundaria"
            tamano="sm"
            disabled={!fechaCompromiso}
            onClick={() => {
              onMutar({
                tipo: 'fecha-compromiso',
                autor: nombreUsuario,
                fecha: new Date(fechaCompromiso).toISOString(),
              })
              setFechaCompromiso('')
            }}
          >
            Registrar
          </Boton>
        </div>
      </AccionSeccion>

      <AccionSeccion
        titulo="Cambiar nivel de riesgo"
        permitido={puedeCambiarRiesgo}
        motivo="Solo Controller o Administrador pueden cambiar el nivel de riesgo."
      >
        <div className="flex gap-2">
          <select
            value={nivelRiesgo}
            onChange={(e) => setNivelRiesgo(e.target.value as NivelRiesgo)}
            className="h-9 rounded-control border border-border-strong bg-surface px-2 text-body text-ink"
          >
            {NIVELES_RIESGO.map((nivel) => (
              <option key={nivel} value={nivel}>
                {nivel}
              </option>
            ))}
          </select>
          <Boton
            variante="secundaria"
            tamano="sm"
            disabled={nivelRiesgo === gestion.nivelRiesgo}
            onClick={() => onMutar({ tipo: 'cambio-riesgo', autor: nombreUsuario, nivelRiesgo })}
          >
            Cambiar
          </Boton>
        </div>
      </AccionSeccion>

      <AccionSeccion
        titulo="Marcar corrección como completada"
        permitido={puedeMarcarCorreccion}
        motivo="Tu rol no tiene permiso para marcar la corrección como completada."
      >
        <div className="flex gap-2">
          <input
            type="date"
            value={fechaCorreccion}
            onChange={(e) => setFechaCorreccion(e.target.value)}
            className="h-9 rounded-control border border-border-strong bg-surface px-2 text-body text-ink"
          />
          <Boton
            variante="secundaria"
            tamano="sm"
            disabled={!fechaCorreccion}
            onClick={() => {
              onMutar({
                tipo: 'correccion-completada',
                autor: nombreUsuario,
                fechaCorreccion: new Date(fechaCorreccion).toISOString(),
              })
              setFechaCorreccion('')
            }}
          >
            Marcar completada
          </Boton>
        </div>
      </AccionSeccion>

      <AccionSeccion
        titulo="Adjuntar evidencia"
        permitido={puedeAdjuntar}
        motivo="Tu rol no tiene permiso para adjuntar evidencia."
      >
        <p className="text-caption text-ink-muted">
          Esta fase solo registra el nombre del archivo en la bitácora — no hay backend de archivos
          todavía.
        </p>
        <div className="flex gap-2">
          <input
            value={nombreArchivo}
            onChange={(e) => setNombreArchivo(e.target.value)}
            placeholder="nombre-del-archivo.pdf"
            className="h-9 flex-1 rounded-control border border-border-strong bg-surface px-2 text-body text-ink"
          />
          <Boton
            variante="secundaria"
            tamano="sm"
            disabled={!nombreArchivo.trim()}
            onClick={() => {
              onMutar({ tipo: 'adjunto', autor: nombreUsuario, nombreArchivo: nombreArchivo.trim() })
              setNombreArchivo('')
            }}
          >
            Adjuntar
          </Boton>
        </div>
      </AccionSeccion>

      <Modal
        abierto={confirmando}
        onCerrar={() => setConfirmando(false)}
        titulo={`Confirmar cambio a "${estadoElegido}"`}
      >
        <p className="text-body text-ink-secondary">
          {estadoElegido === 'Validado'
            ? 'Este es un estado terminal: el registro se considera revisado y correcto. Se puede reabrir después, y la reapertura queda en bitácora.'
            : 'Este es un estado terminal ("No aplica" indica que no era una inconsistencia real). Se puede reabrir después, y la reapertura queda en bitácora.'}
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Boton variante="secundaria" tamano="sm" onClick={() => setConfirmando(false)}>
            Cancelar
          </Boton>
          <Boton tamano="sm" onClick={confirmarCambioEstado} cargando={mutando}>
            Confirmar
          </Boton>
        </div>
      </Modal>
    </div>
  )
}
