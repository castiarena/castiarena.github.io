'use client'

import type { ReactNode } from 'react'

export interface HoverLiftProps {
  children: ReactNode
  className?: string
}

// STUB — implemented by agent 1.3
export function HoverLift({ children, className }: HoverLiftProps) {
  return <div className={className}>{children}</div>
}
