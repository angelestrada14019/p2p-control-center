/**
 * Composición de providers de la aplicación.
 * Ver .claude/docs/02-arquitectura.md §1 y §5
 */
import { useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router'
import { ProveedorSesion } from '@/auth/session'
import { ProveedorAmbito } from '@/shared/hooks/use-ambito'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 30_000,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/p2p_app">
        <ProveedorSesion>
          <ProveedorAmbito>{children}</ProveedorAmbito>
        </ProveedorSesion>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
