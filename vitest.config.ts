import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

/**
 * Configuración de test separada de `vite.config.ts` a propósito: Vitest 3
 * trae su propia copia interna de Vite, y combinar sus tipos con los plugins
 * del `vite.config.ts` de la app (`@vitejs/plugin-react`, `@tailwindcss/vite`)
 * produce un conflicto de tipos entre ambas copias de Vite. Ningún plugin es
 * necesario aquí: esbuild transforma JSX igual a partir de `tsconfig.json`.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
