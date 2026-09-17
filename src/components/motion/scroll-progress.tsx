'use client'

import { useScroll, useSpring } from 'motion/react'
import * as m from 'motion/react-m'

import { joinClassNames, useMotionAllowed } from './shared'

export interface ScrollProgressProps {
  /** Override the bar's position, height or colour (appended to the defaults). */
  className?: string
}

/**
 * A thin, decorative reading-progress bar fixed to the top of the viewport. It animates
 * `scaleX` only, and renders nothing on the server, before hydration, or when reduced motion is requested.
 */
export function ScrollProgress({ className }: ScrollProgressProps) {
  const allowed = useMotionAllowed()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 })

  if (!allowed) return null

  return (
    <m.div
      aria-hidden="true"
      className={joinClassNames(
        'pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-foreground',
        className,
      )}
      style={{ scaleX }}
    />
  )
}
