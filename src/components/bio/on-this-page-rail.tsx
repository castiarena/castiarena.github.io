'use client'

import type { MouseEvent } from 'react'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

const SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'skills', label: 'Skills' },
  { id: 'training', label: 'Training' },
] as const

/**
 * Sticky "on this page" rail (`lg` and up). Tracks which section is active with an
 * `IntersectionObserver` and moves focus to the section heading when a link is activated.
 */
export function OnThisPageRail() {
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id)

  useEffect(() => {
    const sections = SECTIONS.map(({ id }) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    )
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting)
        if (visible.length === 0) return
        const topmost = visible.reduce((a, b) =>
          a.boundingClientRect.top <= b.boundingClientRect.top ? a : b,
        )
        setActiveId(topmost.target.id)
      },
      { rootMargin: '-96px 0px -60% 0px', threshold: 0 },
    )

    for (const section of sections) observer.observe(section)
    return () => observer.disconnect()
  }, [])

  function handleClick(event: MouseEvent<HTMLAnchorElement>, id: string) {
    const section = document.getElementById(id)
    if (!section) return
    event.preventDefault()

    section.scrollIntoView({ block: 'start' })
    window.history.pushState(null, '', `#${id}`)

    const heading = section.querySelector('h2')
    if (heading) {
      if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1')
      heading.focus()
    }
  }

  return (
    <nav aria-label="On this page" className="sticky top-24 hidden w-[180px] shrink-0 lg:block">
      <p className="font-mono text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">
        On this page
      </p>
      <ul className="mt-4 flex flex-col gap-1">
        {SECTIONS.map(({ id, label }) => {
          const active = activeId === id
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(event) => handleClick(event, id)}
                aria-current={active ? 'true' : undefined}
                className={cn(
                  'block border-l-2 py-1 pl-3 text-[13px] transition-colors duration-(--dur-ui) ease-(--ease-brand)',
                  active
                    ? 'border-brand font-medium text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
