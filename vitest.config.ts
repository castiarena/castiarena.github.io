import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  // Vite 8 resolves tsconfig `paths` (`@/*`) natively, replacing the `vite-tsconfig-paths` plugin.
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    setupFiles: ['./tests/setup.ts'],
    css: false,
  },
})
