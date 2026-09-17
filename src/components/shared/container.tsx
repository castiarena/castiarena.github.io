import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export interface ContainerProps {
  children: ReactNode
  className?: string
  as?: 'div' | 'section' | 'header' | 'footer' | 'nav' | 'article'
}

/** Page-width wrapper: max-w-6xl (72rem), centred, 16px mobile gutter (24px from `sm`). */
export function Container({ children, className, as: Tag = 'div' }: ContainerProps) {
  return <Tag className={cn('container-page', className)}>{children}</Tag>
}
