import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export interface GradientTextProps {
  children: ReactNode
  className?: string
}

/** Inline text filled with the signature brand gradient (`text-signature`). */
export function GradientText({ children, className }: GradientTextProps) {
  return <span className={cn('text-signature', className)}>{children}</span>
}
