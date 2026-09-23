import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { MotionProvider } from '@/components/motion'
import { getCoverGradientStops } from '@/components/shared'
import type { Experiment } from '@/content'

import { mockReducedMotion } from '../motion/test-utils'

const BASE: Experiment = {
  slug: 'portfolio-v1',
  title: 'Portfolio v1',
  description: 'Previous portfolio built with Vite and TypeScript.',
  href: 'https://example.com/portfolio-v1',
  tags: ['Vite', 'TypeScript'],
  year: 2024,
}

afterEach(cleanup)
beforeEach(() => mockReducedMotion(false))

async function renderCard(overrides: Partial<Experiment> = {}) {
  const { ExperimentCard } = await import('@/components/experiments')
  return render(
    <MotionProvider>
      <ExperimentCard experiment={{ ...BASE, ...overrides }} />
    </MotionProvider>,
  )
}

describe('ExperimentCard', () => {
  it('is one link named after the title, opening safely in a new tab', async () => {
    await renderCard()
    const link = screen.getByRole('link', { name: /^Portfolio v1/ })
    expect(link).toHaveAttribute('href', 'https://example.com/portfolio-v1')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link.getAttribute('rel')).toContain('noopener')
  })

  it('derives the cover monogram from the title', async () => {
    await renderCard()
    // `CoverGradient monogram` takes the initials of the first two words: Portfolio v1 → "PV".
    expect(screen.getByText('PV')).toBeInTheDocument()
  })

  it('renders a cover deterministic in the slug', async () => {
    expect(getCoverGradientStops('portfolio-v1')).toEqual(getCoverGradientStops('portfolio-v1'))
    await renderCard()
    const cover = screen.getByRole('img', { name: 'Portfolio v1' })
    const { from, to } = getCoverGradientStops('portfolio-v1')
    expect(cover.getAttribute('style')).toContain(from)
    expect(cover.getAttribute('style')).toContain(to)
  })

  it('renders the year, falling back to an en dash', async () => {
    await renderCard()
    expect(screen.getByText('2024')).toBeInTheDocument()

    cleanup()
    await renderCard({ year: 0 })
    expect(screen.getByText('–')).toBeInTheDocument()
  })

  it('keeps the Source link outside the card link so the two never nest', async () => {
    await renderCard({ sourceHref: 'https://example.com/source' })
    const source = screen.getByRole('link', { name: /^Source/ })
    expect(source).toHaveAttribute('href', 'https://example.com/source')
    expect(source.closest('a[href="https://example.com/portfolio-v1"]')).toBeNull()
  })

  it('omits the Source link when the experiment has no sourceHref', async () => {
    await renderCard()
    expect(screen.queryByRole('link', { name: /^Source/ })).not.toBeInTheDocument()
  })

  it('renders a real screenshot instead of the gradient when one exists', async () => {
    await renderCard({ image: { src: '/images/experiments/demo.png', alt: 'Demo screenshot' } })
    expect(screen.getByRole('img', { name: 'Demo screenshot' })).toBeInTheDocument()
    expect(screen.queryByText('PV')).not.toBeInTheDocument()
  })

  it('mutes placeholder titles so TODO copy reads as unfinished', async () => {
    await renderCard({ title: 'TODO(agustin): Experiment title' })
    const heading = screen.getByRole('heading', { level: 3 })
    expect(heading.className).toContain('text-muted-foreground')
  })
})
