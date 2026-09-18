'use client'

import * as m from 'motion/react-m'
import { type ReactNode, useRef } from 'react'

import { type RevealCustom, revealVariants, revealViewport, useArmedReveal } from './shared'

// Static member access keeps unused `m.*` elements tree-shakable. All tags share the same motion
// props, so they are narrowed to one signature for the ref type.
const revealTags = { div: m.div, section: m.section as typeof m.div, li: m.li as typeof m.div }

export interface RevealProps {
  children: ReactNode
  /** Delay in seconds before the reveal starts. */
  delay?: number
  /** Initial vertical offset in px. */
  y?: number
  as?: 'div' | 'section' | 'li'
  className?: string
}

/**
 * Fades its content in and slides it up when it scrolls into view.
 *
 * The server HTML is always visible. After hydration, only elements that start below the fold
 * are hidden (instantly, before paint) and revealed once 20% of them is in view. Elements that
 * are already on screen, and every element under reduced motion, are never animated.
 */
export function Reveal({ children, delay = 0, y = 16, as = 'div', className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const armed = useArmedReveal(ref)
  const Component = revealTags[as]
  const custom: RevealCustom = { y, delay }

  return (
    <Component
      ref={ref}
      className={className}
      variants={revealVariants}
      custom={custom}
      initial={false}
      animate={armed ? 'hidden' : undefined}
      whileInView={armed ? 'visible' : undefined}
      viewport={revealViewport}
    >
      {children}
    </Component>
  )
}
