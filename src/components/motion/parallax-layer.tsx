'use client'

import { useScroll, useTransform } from 'motion/react'
import * as m from 'motion/react-m'
import { type ReactNode, useRef } from 'react'

import { useMotionAllowed } from './shared'

export interface ParallaxLayerProps {
  children: ReactNode
  /** Maximum vertical shift in px, in each direction, while the layer crosses the viewport. */
  offset?: number
  className?: string
}

/**
 * Moves its content from `+offset` to `-offset` px as the layer scrolls through the viewport.
 * Use it for decorative layers only. The outer element is the static scroll target; only the
 * inner element is translated. No transform is rendered on the server, before hydration, or
 * when reduced motion is requested.
 */
export function ParallaxLayer({ children, offset = 40, className }: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const allowed = useMotionAllowed()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset])

  return (
    <div ref={ref} className={className}>
      <m.div style={allowed ? { y } : undefined}>{children}</m.div>
    </div>
  )
}
