import type { ReactNode } from 'react'

export interface ExternalLinkProps {
  href: string
  children: ReactNode
  className?: string
  showIcon?: boolean
}

// STUB — implemented by agent 1.1
export function ExternalLink({ href, children, className, showIcon = true }: ExternalLinkProps) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      {showIcon ? <span aria-hidden="true"> ↗</span> : null}
      <span className="sr-only"> (opens in new tab)</span>
    </a>
  )
}
