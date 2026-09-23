import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { TimelineNode } from '@/components/bio'
import type { Experience } from '@/content/types'

afterEach(cleanup)

const experience: Experience = {
  id: 'riverside',
  company: 'Riverside.fm',
  companyUrl: 'https://riverside.com',
  title: 'Senior Fullstack Engineer',
  start: '2023-02',
  end: '2026-07',
  intro: 'Led technical initiatives within the Recording Studio.',
  highlights: ['Improved the platform architecture', 'Decomposed core business logic'],
  stack: ['GraphQL', 'Microservices'],
}

describe('TimelineNode', () => {
  it('renders as a list item with the role, company link and every highlight', () => {
    const { container } = render(
      <ol>
        <TimelineNode experience={experience} />
      </ol>,
    )

    const item = container.querySelector('ol > li')
    expect(item).toHaveTextContent('Senior Fullstack Engineer')

    const companyLink = screen.getByRole('link', { name: /Riverside\.fm/ })
    expect(companyLink).toHaveAttribute('href', 'https://riverside.com')
    expect(companyLink).toHaveAttribute('target', '_blank')

    for (const highlight of experience.highlights) {
      expect(screen.getByText(highlight)).toBeInTheDocument()
    }
  })

  it('formats the date range and duration from start/end', () => {
    render(
      <ol>
        <TimelineNode experience={experience} />
      </ol>,
    )
    expect(screen.getAllByText('Feb 2023 — Jul 2026').length).toBeGreaterThan(0)
    expect(screen.getAllByText('3 yrs 5 mos').length).toBeGreaterThan(0)
  })

  it('renders the company as plain text when there is no companyUrl', () => {
    render(
      <ol>
        <TimelineNode experience={{ ...experience, companyUrl: undefined }} />
      </ol>,
    )
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByText('Riverside.fm')).toBeInTheDocument()
  })

  it('skips the intro paragraph when it is empty', () => {
    render(
      <ol>
        <TimelineNode experience={{ ...experience, intro: '' }} />
      </ol>,
    )
    expect(screen.queryByText(experience.intro)).not.toBeInTheDocument()
  })
})
