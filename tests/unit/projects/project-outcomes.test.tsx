import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ProjectOutcomes } from '@/components/projects/project-outcomes'

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

const cardOf = (text: string) => screen.getByText(text).closest('[data-slot]')

describe('ProjectOutcomes', () => {
  it('renders a numeric outcome as a card StatTile', () => {
    render(<ProjectOutcomes outcomes={['100% on-device: zero network requests']} />)

    const tile = cardOf('on-device: zero network requests')
    expect(tile).toHaveAttribute('data-slot', 'stat-tile')
    expect(tile).toHaveAttribute('data-variant', 'card')
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('renders a TODO(agustin) outcome as a dashed, muted placeholder card', () => {
    render(<ProjectOutcomes outcomes={['TODO(agustin): Add 2–4 outcomes.']} />)

    const card = cardOf('Add 2–4 outcomes.')
    expect(card).toHaveAttribute('data-slot', 'outcome-todo')
    expect(card).toHaveClass('border-dashed')
    expect(screen.getByText('Add 2–4 outcomes.')).toHaveClass('text-muted-foreground')
    expect(screen.getByText('TODO(agustin)')).toBeInTheDocument()
  })

  it('renders any other text outcome as a solid card with foreground text', () => {
    const outcome = 'Published on the Chrome Web Store'
    render(<ProjectOutcomes outcomes={[outcome]} />)

    const card = cardOf(outcome)
    expect(card).toHaveAttribute('data-slot', 'outcome-card')
    expect(card).not.toHaveClass('border-dashed')
    expect(card).toHaveClass('border-border', 'bg-card', 'rounded-lg', 'p-5')
    expect(screen.getByText(outcome)).toHaveClass('text-foreground')
    expect(screen.getByText(outcome)).not.toHaveClass('text-muted-foreground')
  })

  it('renders nothing for an empty list', () => {
    const { container } = render(<ProjectOutcomes outcomes={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
