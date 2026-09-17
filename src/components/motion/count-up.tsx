'use client'

import { useInView } from 'motion/react'
import { useEffect, useMemo, useRef } from 'react'

import { MOTION_EASE, useArmedReveal, useIsomorphicLayoutEffect } from './shared'

export interface CountUpProps {
  value: number
  suffix?: string
  className?: string
  /** Count duration in seconds. */
  duration?: number
}

const loadAnimate = () => import('./animate-number')

function createFormatter(value: number) {
  const decimals = Math.min(String(value).split('.')[1]?.length ?? 0, 20)
  const nf = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  return (n: number) => nf.format(n)
}

/**
 * Counts from 0 up to `value` when it scrolls into view.
 *
 * The server HTML (and no-JS users, crawlers and reduced motion) always shows the final value.
 * Screen readers get the final value once, from visually hidden text; the animated digits are
 * `aria-hidden`. Like `Reveal`, only counters that start below the fold are animated, so a value
 * that is already on screen at load never flickers back to 0. Digits are written straight to the
 * DOM each frame, so counting does not re-render React, and Motion's `animate()` is loaded on demand.
 */
export function CountUp({ value, suffix = '', className, duration = 0.7 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const digitsRef = useRef<HTMLSpanElement>(null)
  const armed = useArmedReveal(ref)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const format = useMemo(() => createFormatter(value), [value])
  const finalText = format(value)

  // Before paint, reset armed (off-screen) counters to 0 and start fetching the animation code.
  useIsomorphicLayoutEffect(() => {
    if (!armed || inView || !digitsRef.current) return
    digitsRef.current.textContent = format(0)
    void loadAnimate()
  }, [armed, inView, format])

  useEffect(() => {
    const node = digitsRef.current
    if (!armed || !inView || !node) return
    let cancelled = false
    let stop: (() => void) | undefined
    loadAnimate()
      .then(({ animate }) => {
        if (cancelled) return
        const controls = animate(0, value, {
          duration,
          ease: MOTION_EASE,
          onUpdate: (latest) => {
            node.textContent = format(latest)
          },
        })
        stop = () => controls.stop()
      })
      .catch(() => {
        if (!cancelled) node.textContent = finalText
      })
    return () => {
      cancelled = true
      stop?.()
      node.textContent = finalText
    }
  }, [armed, inView, value, duration, format, finalText])

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">
        {finalText}
        {suffix}
      </span>
      <span aria-hidden="true" data-count-up="">
        <span key={value} ref={digitsRef}>
          {finalText}
        </span>
        {suffix}
      </span>
    </span>
  )
}
