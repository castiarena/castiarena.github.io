import Link from 'next/link'

import { cn } from '@/lib/utils'
import { siteConfig } from '@/config/site'

export interface LogoProps {
  className?: string
}

/** `● agustin castiarena` — links home, the dot scales up on hover (02-component-specs.md). */
export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        'group inline-flex items-center gap-2 rounded-sm font-mono text-sm text-foreground lowercase',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="size-2 shrink-0 rounded-full bg-brand-3 transition-transform duration-(--dur-ui) ease-(--ease-brand) group-hover:scale-[1.15] motion-reduce:group-hover:scale-100"
      />
      {siteConfig.name}
    </Link>
  )
}
