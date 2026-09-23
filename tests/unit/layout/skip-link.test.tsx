import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { SkipLink } from '@/components/layout/skip-link'

afterEach(cleanup)

describe('SkipLink', () => {
  it('jumps to #content', () => {
    render(<SkipLink />)
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute(
      'href',
      '#content',
    )
  })

  it('is visually hidden until focused', () => {
    render(<SkipLink />)
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveClass('sr-only')
  })
})
