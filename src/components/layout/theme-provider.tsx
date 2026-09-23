'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ReactNode } from 'react'

export interface ThemeProviderProps {
  children: ReactNode
}

/**
 * `class` strategy toggles `.dark`/`.light` on <html> to match `globals.css` (F1). Dark is the
 * default (01 §2) so first-time visitors with no stored preference and no OS preference still land
 * on dark. `enableSystem` keeps "system" selectable from `ThemeToggle`'s three-way cycle even
 * though it is not the initial default.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
