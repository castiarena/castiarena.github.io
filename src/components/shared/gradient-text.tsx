import type { ReactNode } from 'react'

export interface GradientTextProps {
  children: ReactNode
  className?: string
}

// STUB — implemented by agent 1.1
export function GradientText({ children, className }: GradientTextProps) {
  return <span className={className}>{children}</span>
}
