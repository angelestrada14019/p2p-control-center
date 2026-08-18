/**
 * Drawer de bitácora y detalle del Reporte A. No pierde el contexto de la
 * tabla (la tabla sigue montada detrás). Navega anterior/siguiente sin
 * cerrar. Advierte si hay una nota sin enviar al intentar cerrar/navegar.
 * Ver .claude/docs/05-modulo-1-reporteria.md §8 y §9
 */
import { useEffect, useRef, useState } from 'react'
import { Drawer } from '@/shared/ui/Drawer'
import { Modal } from '@/shared/ui/Modal'
import { Boton } from '@/shared/ui/Boton'
import { EncabezadoRegistro } from './EncabezadoRegistro'
import { TabDetalle } from './TabDetalle'
import { TabBitacora } from './TabBitacora'
import { AccionesGestion } from './AccionesGestion'
import { useFormularioDrawer } from './use-formulario-drawer'
import { useSesion } from '@/auth/session'
import { derivarClave, type CambioGestion, type ProvisionSap } from '@/data/contracts'

type TabDrawer = 'detalle' | 'bitacora'

interface DrawerRegistroProps {
  abierto: boolean
  registro: ProvisionSap | null
  tabInicial: TabDrawer
  onCerrar: () => void
  onNavegarAnterior?: () => void
  onNavegarSiguiente?: () => void
  onMutar: (cambio: CambioGestion) => void
  mutando: boolean
}

export function DrawerRegistro({
  abierto,
  registro,
  tabInicial,
  onCerrar,
  onNavegarAnterior,
  onNavegarSiguiente,
  onMutar,
  mutando,
}: DrawerRegistroProps) {
  const [tab, setTab] = useState<TabDrawer>(tabInicial)
  const [confirmandoDescartar, setConfirmandoDescartar] = useState(false)
  const formulario = useFormularioDrawer()
  const { nombreUsuario } = useSesion()
  const accionPendiente = useRef<(() => void) | null>(null)

  useEffect(() => {
    setTab(tabInicial)
    formulario.limpiar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registro ? derivarClave(registro.clave) : null, tabInicial])

  function interceptar(accion: () => void) {
    if (formulario.esDirty) {
      accionPendiente.current = accion
      setConfirmandoDescartar(true)
    } else {
      accion()
    }
  }

  function confirmarDescarte() {
    formulario.limpiar()
    setConfirmandoDescartar(false)
    accionPendiente.current?.()
    accionPendiente.current = null
  }

  if (!registro) return null

  return (
    <>
      <Drawer
        abierto={abierto}
        onCerrar={() => interceptar(onCerrar)}
        titulo={`Registro ${registro.numeroDocumento}`}
        onNavegarAnterior={onNavegarAnterior ? () => interceptar(onNavegarAnterior) : undefined}
        onNavegarSiguiente={onNavegarSiguiente ? () => interceptar(onNavegarSiguiente) : undefined}
      >
        <div className="flex flex-col gap-4">
          <EncabezadoRegistro registro={registro} />

          <div role="tablist" aria-label="Vista del registro" className="flex gap-1 border-b border-border">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'detalle'}
              onClick={() => setTab('detalle')}
              className={`rounded-t-control px-3 py-2 text-body ${
                tab === 'detalle'
                  ? 'border-b-2 border-primary font-medium text-ink'
                  : 'text-ink-secondary hover:text-ink'
              }`}
            >
              Detalle completo
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'bitacora'}
              onClick={() => setTab('bitacora')}
              className={`rounded-t-control px-3 py-2 text-body ${
                tab === 'bitacora'
                  ? 'border-b-2 border-primary font-medium text-ink'
                  : 'text-ink-secondary hover:text-ink'
              }`}
            >
              Bitácora y acciones
            </button>
          </div>

          {tab === 'detalle' && <TabDetalle registro={registro} />}
          {tab === 'bitacora' && (
            <div className="flex flex-col gap-5">
              <TabBitacora
                bitacora={registro.gestion.bitacora}
                notaBorrador={formulario.notaBorrador}
                onCambiarNota={formulario.setNotaBorrador}
                onEnviarNota={(texto, menciones) => {
                  onMutar({ tipo: 'comentario', autor: nombreUsuario, texto, menciones })
                  formulario.limpiar()
                }}
                enviando={mutando}
              />
              <AccionesGestion gestion={registro.gestion} onMutar={onMutar} mutando={mutando} />
            </div>
          )}
        </div>
      </Drawer>

      <Modal
        abierto={confirmandoDescartar}
        onCerrar={() => setConfirmandoDescartar(false)}
        titulo="¿Descartar cambios sin guardar?"
      >
        <p className="text-body text-ink-secondary">
          Tienes una nota escrita que no se ha agregado a la bitácora. Si continúas, se descarta.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Boton variante="secundaria" tamano="sm" onClick={() => setConfirmandoDescartar(false)}>
            Seguir editando
          </Boton>
          <Boton variante="destructiva" tamano="sm" onClick={confirmarDescarte}>
            Descartar y continuar
          </Boton>
        </div>
      </Modal>
    </>
  )
}
