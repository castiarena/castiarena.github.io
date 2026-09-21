import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { StatTile } from '@/components/shared'

// StatTile's value is a motion CountUp, which observes visibility with IntersectionObserver.
// jsdom doesn't implement it; a no-op stub is enough since these tests only assert markup/classes.
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

describe('StatTile', () => {
  it('colours the value with the requested accent', () => {
    render(<StatTile value={40} unit="%" label="Faster releases" accent="brand-3" />)
    const value = screen.getByText('40').closest('p')
    expect(value).toHaveClass('text-brand-3')
  })

  it('falls back to the custom-property accent for brand-4', () => {
    render(<StatTile value={3} unit="x" label="Throughput" accent="brand-4" />)
    const value = screen.getByText('3').closest('p')
    expect(value).toHaveClass('text-[var(--brand-4,var(--brand-3))]')
  })

  it('renders the card shape with a border and fill', () => {
    render(<StatTile value={10} label="Teams" accent="brand" variant="card" />)
    const root = screen.getByText('Teams').closest('[data-slot="stat-tile"]')
    expect(root).toHaveAttribute('data-variant', 'card')
    expect(root).toHaveClass('border-border', 'bg-card')
  })

  it('renders the bare shape by default with no border or fill', () => {
    render(<StatTile value={10} label="Teams" accent="brand" />)
    const root = screen.getByText('Teams').closest('[data-slot="stat-tile"]')
    expect(root).toHaveAttribute('data-variant', 'bare')
    expect(root).not.toHaveClass('border-border')
  })

  it('caps the description width and renders the label under the value', () => {
    render(<StatTile value={5} label="Label" description="A short description." accent="brand-2" />)
    expect(screen.getByText('A short description.')).toHaveClass('max-w-[34ch]')
  })
})
