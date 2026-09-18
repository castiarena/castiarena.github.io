import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface ExternalLinkProps extends Omit<
  ComponentPropsWithoutRef<'a'>,
  'href' | 'children' | 'className' | 'target' | 'rel'
> {
  href: string
  children: ReactNode
  className?: string
  showIcon?: boolean
}

/** Link that opens in a new tab with safe `rel`, an arrow icon and screen-reader context. */
export function ExternalLink({
  href,
  children,
  className,
  showIcon = true,
  ...props
}: ExternalLinkProps) {
  return (
    <a
      {...props}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-1 underline-offset-4 hover:underline [&>svg]:shrink-0',
        className,
      )}
    >
      {children}
      {showIcon ? <ArrowUpRight aria-hidden="true" className="size-[1em]" /> : null}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}
