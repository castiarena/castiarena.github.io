'use client'

import type { ReactNode } from 'react'

export interface RevealProps {
  children: ReactNode
  /** Delay in seconds before the reveal starts. */
  delay?: number
  /** Initial vertical offset in px. */
  y?: number
  as?: 'div' | 'section' | 'li'
  className?: string
}

// STUB — implemented by agent 1.3
export function Reveal({ children, as: Tag = 'div', className }: RevealProps) {
  return <Tag className={className}>{children}</Tag>
}
