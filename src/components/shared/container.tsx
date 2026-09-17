import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export interface ContainerProps {
  children: ReactNode
  className?: string
  as?: 'div' | 'section' | 'header' | 'footer' | 'nav' | 'article'
}

// STUB — implemented by agent 1.1
export function Container({ children, className, as: Tag = 'div' }: ContainerProps) {
  return <Tag className={cn('mx-auto max-w-6xl px-4', className)}>{children}</Tag>
}
