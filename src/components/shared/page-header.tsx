import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { GradientText } from './gradient-text'

export interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  /** Part of `title` to render with the signature gradient (first occurrence). */
  highlight?: string
  /** Extra content under the description, e.g. CTAs. */
  children?: ReactNode
  className?: string
}

function renderTitle(title: string, highlight?: string) {
  const index = highlight ? title.indexOf(highlight) : -1
  if (!highlight || index === -1) return title

  return (
    <>
      {title.slice(0, index)}
      <GradientText>{highlight}</GradientText>
      {title.slice(index + highlight.length)}
    </>
  )
}

/** Page-level header: mono eyebrow, the page's single `h1`, and an optional lead paragraph. */
export function PageHeader({
  eyebrow,
  title,
  description,
  highlight,
  children,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-4 py-12 sm:py-16', className)}>
      {eyebrow ? (
        <p className="font-mono text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-h1 font-semibold text-balance">{renderTitle(title, highlight)}</h1>
      {description ? (
        <p className="max-w-prose text-lg text-pretty text-muted-foreground">{description}</p>
      ) : null}
      {children}
    </header>
  )
}
