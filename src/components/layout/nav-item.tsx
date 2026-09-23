'use client'

import type { Route } from 'next'
import Link from 'next/link'
import * as m from 'motion/react-m'

import {
  NAV_UNDERLINE_LAYOUT_ID,
  navUnderlineTransition,
  useMotionAllowed,
} from '@/components/motion'
import { cn } from '@/lib/utils'

export interface NavItemProps {
  href: Route | string
  label: string
  active: boolean
  onClick?: () => void
  className?: string
}

/**
 * The active item's underline shares F3's `layoutId` so it slides between items on navigation.
 * `layoutId` itself (not just the transition) is gated on `useMotionAllowed()` — see F3's handoff:
 * without a shared `layoutId`, reduced-motion users get an instant snap instead of a suppressed
 * animation.
 */
export function NavItem({ href, label, active, onClick, className }: NavItemProps) {
  const motionAllowed = useMotionAllowed()

  return (
    <Link
      href={href as Route}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative inline-flex items-center py-2 text-sm text-muted-foreground transition-colors duration-(--dur-ui) ease-(--ease-brand) hover:text-foreground',
        active && 'text-foreground',
        className,
      )}
    >
      {label}
      {active && (
        <m.span
          aria-hidden="true"
          layoutId={motionAllowed ? NAV_UNDERLINE_LAYOUT_ID : undefined}
          transition={navUnderlineTransition}
          className="absolute inset-x-0 top-full mt-1.5 h-0.5 bg-signature"
        />
      )}
    </Link>
  )
}
