import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { Badge } from '@/components/ui/badge'

afterEach(cleanup)

describe('Badge', () => {
  // CCR-U3-2: the brand variant used the plain brand colour as its text on a 15% brand fill,
  // which only reaches 3.59:1 in light and 4.20:1 in dark because the tint moves the surface
  // under the text. The accessible pair is the dedicated ink token, whose contrast on that
  // composited fill is asserted in tests/unit/shared/contrast.test.ts.
  it('uses the brand ink token for text on the tinted brand fill', () => {
    render(<Badge variant="brand">Team Lead</Badge>)
    const badge = screen.getByText('Team Lead')
    expect(badge).toHaveClass('bg-brand/15')
    expect(badge.className).toContain('text-brand-ink')
  })

  it('renders as a span by default and keeps the label accessible', () => {
    render(<Badge>GraphQL</Badge>)
    expect(screen.getByText('GraphQL').tagName).toBe('SPAN')
  })
})
