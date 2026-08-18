/**
 * Rutas de la aplicación. Ver .claude/docs/02-arquitectura.md §6
 */
import { Navigate, Route, Routes } from 'react-router'
import { AppShell } from '@/shared/layout/AppShell'
import { HomePage } from '@/features/home/home.page'
import {
  ReporteriaPage,
  RedireccionRegistro,
  RegistroLayout,
} from '@/features/reporteria/reporteria.page'
import { GuardSubperfil } from '@/features/reporteria/components/GuardSubperfil'
import { ReporteASapPage } from '@/features/reporteria/reportes/sap-ovh/ReporteASapPage'
import { PaginaEnConstruccion } from '@/shared/ui/PaginaEnConstruccion'
import { KpisPage } from '@/features/kpis/kpis.page'
import { ChecklistPage } from '@/features/checklist/checklist.page'
import { AlertasPage } from '@/features/alertas/alertas.page'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="reporteria" element={<ReporteriaPage />}>
          <Route index element={<Navigate to="registro" replace />} />
          <Route path="registro" element={<RegistroLayout />}>
            <Route index element={<RedireccionRegistro />} />
            <Route
              path="sap-ovh"
              element={
                <GuardSubperfil alcance="OVH">
                  <ReporteASapPage />
                </GuardSubperfil>
              }
            />
            <Route
              path="ns-ovh"
              element={
                <GuardSubperfil alcance="OVH">
                  <PaginaEnConstruccion
                    titulo="Reporte B — NS: Provisiones Proyectadas"
                    descripcion="La siguiente entrega reutiliza el patrón del Reporte A para construir este reporte."
                    documentoRelacionado=".claude/docs/05-modulo-1-reporteria.md"
                  />
                </GuardSubperfil>
              }
            />
            <Route
              path="turbo"
              element={
                <GuardSubperfil alcance="TURBO">
                  <PaginaEnConstruccion
                    titulo="Reporte C — SAP TURBO"
                    descripcion="La siguiente entrega reutiliza el patrón del Reporte A para construir este reporte."
                    documentoRelacionado=".claude/docs/05-modulo-1-reporteria.md"
                  />
                </GuardSubperfil>
              }
            />
          </Route>
          <Route
            path="no-provisionable"
            element={
              <PaginaEnConstruccion
                titulo="No Provisionable"
                descripcion="Vista unificada de exclusiones de SAP, NS y TURBO — se construye en una siguiente entrega."
                documentoRelacionado=".claude/docs/05-modulo-1-reporteria.md"
              />
            }
          />
        </Route>
        <Route path="kpis" element={<KpisPage />} />
        <Route path="checklist/*" element={<ChecklistPage />} />
        <Route path="alertas" element={<AlertasPage />} />
      </Route>
    </Routes>
  )
}
