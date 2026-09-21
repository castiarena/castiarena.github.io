import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { CoverGradient, getCoverGradientStops } from '@/components/shared'

afterEach(cleanup)

describe('getCoverGradientStops', () => {
  it('is a pure function of the seed: same seed, same stops, every call', () => {
    const a = getCoverGradientStops('riverside-project')
    const b = getCoverGradientStops('riverside-project')
    expect(b).toEqual(a)
  })

  it('picks two distinct stops from the brand ramp', () => {
    const { from, to } = getCoverGradientStops('anything')
    expect(['--brand', '--brand-2', '--brand-3', '--brand-4']).toContain(from)
    expect(['--brand', '--brand-2', '--brand-3', '--brand-4']).toContain(to)
    expect(from).not.toBe(to)
  })

  it('varies across seeds', () => {
    const a = getCoverGradientStops('project-one')
    const b = getCoverGradientStops('project-two')
    expect(a).not.toEqual(b)
  })
})

describe('CoverGradient', () => {
  it('renders identical inline styles for the same seed across separate mounts (SSR/browser stability)', () => {
    const first = render(<CoverGradient seed="stable-seed" />)
    const firstStyle = first.container.firstElementChild?.getAttribute('style')
    first.unmount()

    const second = render(<CoverGradient seed="stable-seed" />)
    const secondStyle = second.container.firstElementChild?.getAttribute('style')

    expect(firstStyle).toBe(secondStyle)
    expect(firstStyle).toContain('linear-gradient(135deg')
  })

  it('renders a monogram derived from the label when monogram is set', () => {
    const { getByText } = render(<CoverGradient seed="x" label="Neon Garden" monogram />)
    expect(getByText('NG')).toBeInTheDocument()
  })

  it('is decorative (aria-hidden) without a label', () => {
    const { container } = render(<CoverGradient seed="x" />)
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
  })
})
