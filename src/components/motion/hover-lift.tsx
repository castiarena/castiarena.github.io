'use client'

import * as m from 'motion/react-m'
import type { ReactNode } from 'react'

import { joinClassNames, MOTION_DURATION_UI, useMotionAllowed } from './shared'

export interface HoverLiftProps {
  children: ReactNode
  className?: string
}

const hover = { y: -4, transition: { duration: MOTION_DURATION_UI } }
const tap = { scale: 0.98, transition: { duration: MOTION_DURATION_UI / 2 } }

/**
 * Lifts its content by 4px on hover and presses it slightly on tap. Keyboard users get the same
 * lift through CSS when focus is inside (`:focus-within`). Tailwind's `translate` utilities use
 * the standalone `translate` property, so they compose with Motion's inline `transform`.
 * Both are turned off when the user prefers reduced motion (`prefers-reduced-motion`).
 */
export function HoverLift({ children, className }: HoverLiftProps) {
  const allowed = useMotionAllowed()

  return (
    <m.div
      className={joinClassNames(
        'motion-safe:transition-[translate] motion-safe:duration-200 motion-safe:focus-within:-translate-y-1',
        className,
      )}
      whileHover={allowed ? hover : undefined}
      whileTap={allowed ? tap : undefined}
    >
      {children}
    </m.div>
  )
}
