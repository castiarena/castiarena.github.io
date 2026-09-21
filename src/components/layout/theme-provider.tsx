'use client'

import type { ReactNode } from 'react'

export interface ThemeProviderProps {
  children: ReactNode
}

// STUB — implemented by agent 2.1 (next-themes, class strategy)
export function ThemeProvider({ children }: ThemeProviderProps) {
  return <>{children}</>
}
