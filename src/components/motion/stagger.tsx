'use client'

import type { Variants } from 'motion/react'
import * as m from 'motion/react-m'
import { type ReactNode, useRef } from 'react'

import { type RevealCustom, revealVariants, revealViewport, useArmedReveal } from './shared'

export interface StaggerProps {
  children: ReactNode
  /** Delay in seconds between children. */
  stagger?: number
  className?: string
  as?: 'div' | 'section' | 'ul' | 'ol'
}

export interface StaggerItemProps {
  children: ReactNode
  className?: string
  /** Use `li` inside `<Stagger as="ul">` / `<Stagger as="ol">`. */
  as?: 'div' | 'li'
  /** Initial vertical offset in px. */
  y?: number
}

// Static member access keeps unused `m.*` elements tree-shakable.
const staggerTags = {
  div: m.div,
  section: m.section as typeof m.div,
  ul: m.ul as typeof m.div,
  ol: m.ol as typeof m.div,
}
const itemTags = { div: m.div, li: m.li as typeof m.div }

const staggerVariants: Variants = {
  hidden: { transition: { duration: 0 } },
  visible: (stagger: number) => ({ transition: { staggerChildren: stagger } }),
}

/**
 * Reveals its `StaggerItem` children one after another when the group scrolls into view.
 * Same hydration rules as `Reveal`: groups that are on screen at load stay static.
 */
export function Stagger({ children, stagger = 0.06, as = 'div', className }: StaggerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const armed = useArmedReveal(ref)
  const Component = staggerTags[as]

  return (
    <Component
      ref={ref}
      className={className}
      variants={staggerVariants}
      custom={stagger}
      initial={false}
      animate={armed ? 'hidden' : undefined}
      whileInView={armed ? 'visible' : undefined}
      viewport={revealViewport}
    >
      {children}
    </Component>
  )
}

/** A child of `Stagger`. It inherits the parent's `hidden`/`visible` state and uses the Reveal variants. */
export function StaggerItem({ children, className, as = 'div', y = 16 }: StaggerItemProps) {
  const Component = itemTags[as]
  const custom: RevealCustom = { y }

  return (
    <Component className={className} variants={revealVariants} custom={custom}>
      {children}
    </Component>
  )
}
