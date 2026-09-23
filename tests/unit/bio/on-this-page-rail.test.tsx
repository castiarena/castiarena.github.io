import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { OnThisPageRail } from '@/components/bio'

type IOCallback = (entries: Partial<IntersectionObserverEntry>[]) => void

let ioCallback: IOCallback | undefined

class MockIntersectionObserver {
  constructor(callback: IOCallback) {
    ioCallback = callback
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

function renderSections() {
  for (const id of ['about', 'experience', 'achievements', 'skills', 'training']) {
    const section = document.createElement('section')
    section.id = id
    const heading = document.createElement('h2')
    heading.textContent = id
    section.append(heading)
    document.body.append(section)
  }
}

beforeEach(() => {
  ioCallback = undefined
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
  renderSections()
})

afterEach(() => {
  cleanup()
  document.querySelectorAll('section').forEach((el) => el.remove())
  vi.unstubAllGlobals()
})

describe('OnThisPageRail', () => {
  it('renders a link for every section, starting with About active', () => {
    render(<OnThisPageRail />)
    const nav = screen.getByRole('navigation', { name: 'On this page' })
    expect(nav.querySelectorAll('a')).toHaveLength(5)
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'true')
  })

  it('marks the section reported by the intersection observer as active', () => {
    render(<OnThisPageRail />)
    expect(ioCallback).toBeDefined()

    const experienceSection = document.getElementById('experience')!
    act(() => {
      ioCallback?.([
        {
          target: experienceSection,
          isIntersecting: true,
          boundingClientRect: { top: 0 } as DOMRect,
        },
      ])
    })

    expect(screen.getByRole('link', { name: 'Experience' })).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('link', { name: 'About' })).not.toHaveAttribute('aria-current')
  })

  it('moves focus to the section heading when a link is activated', () => {
    render(<OnThisPageRail />)
    const skillsSection = document.getElementById('skills')!
    skillsSection.scrollIntoView = vi.fn()

    fireEvent.click(screen.getByRole('link', { name: 'Skills' }))

    const heading = skillsSection.querySelector('h2')!
    expect(heading).toHaveFocus()
  })
})
