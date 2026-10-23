import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import BioPage from '@/app/bio/page'
import { experiences } from '@/content'

// StatTile's value is a motion CountUp, which observes visibility with IntersectionObserver.
// jsdom doesn't implement it; a no-op stub is enough since these tests only assert markup.
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)

afterEach(cleanup)

describe('BioPage', () => {
  it('has one section per rail entry, each scroll-margin-adjusted', () => {
    render(<BioPage />)
    for (const id of ['about', 'experience', 'achievements', 'skills', 'training']) {
      const section = document.getElementById(id)
      expect(section).toBeInTheDocument()
      expect(section).toHaveClass('scroll-mt-24')
    }
  })

  it('renders every role newest-first, with every CV highlight', () => {
    render(<BioPage />)
    const items = [...document.querySelectorAll<HTMLElement>('#experience > ol > li')]
    expect(items).toHaveLength(experiences.length)
    expect(
      items.map((item) => within(item).getByRole('heading', { level: 3 }).textContent),
    ).toEqual(experiences.map((experience) => experience.title))

    for (const experience of experiences) {
      for (const highlight of experience.highlights) {
        expect(screen.getByText(highlight)).toBeInTheDocument()
      }
    }
  })

  it('links the CV button with a download attribute and the profile href', () => {
    render(<BioPage />)
    const link = screen.getByRole('link', { name: /Download CV/ })
    expect(link).toHaveAttribute('href', '/cv/agustin-castiarena-resume.pdf')
    expect(link).toHaveAttribute('download')
  })

  it('never renders a phone number', () => {
    render(<BioPage />)
    const phonePattern = /\(?\+?\d[\d\s().-]{6,}\d\b/
    expect(document.body.textContent ?? '').not.toMatch(phonePattern)
  })

  it('shows no TODO(agustin) placeholder anywhere on the page', () => {
    render(<BioPage />)
    expect(document.body.textContent ?? '').not.toContain('TODO(agustin)')
  })
})
