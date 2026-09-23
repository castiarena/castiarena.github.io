'use client'

import { useEffect, useState } from 'react'

const SCROLL_THRESHOLD_PX = 8

/**
 * `true` once the page has scrolled past `SCROLL_THRESHOLD_PX`. Reads are batched to one per
 * animation frame so the scroll listener never runs the header's background/blur style update
 * more than once per frame (03-page-specs.md: "a small client hook, throttled with
 * requestAnimationFrame").
 */
export function useHeaderScrolled(threshold = SCROLL_THRESHOLD_PX): boolean {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let frame = 0

    const measure = () => {
      frame = 0
      setScrolled(window.scrollY > threshold)
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(measure)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [threshold])

  return scrolled
}
