import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { ExternalLink, type ExternalLinkProps } from '@/components/shared'

afterEach(cleanup)

describe('ExternalLink', () => {
  it('opens in a new tab with a safe rel', () => {
    render(<ExternalLink href="https://example.com">Example</ExternalLink>)
    const link = screen.getByRole('link')

    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('announces that it opens a new tab', () => {
    render(<ExternalLink href="https://example.com">Example</ExternalLink>)

    expect(screen.getByText('(opens in a new tab)')).toHaveClass('sr-only')
    expect(screen.getByRole('link')).toHaveAccessibleName(/^Example\s*\(opens in a new tab\)$/)
  })

  it('renders a decorative icon by default and hides it with showIcon={false}', () => {
    const { container, rerender } = render(
      <ExternalLink href="https://example.com">Example</ExternalLink>,
    )
    const icon = container.querySelector('svg')
    expect(icon).not.toBeNull()
    expect(icon).toHaveAttribute('aria-hidden', 'true')

    rerender(
      <ExternalLink href="https://example.com" showIcon={false}>
        Example
      </ExternalLink>,
    )
    expect(container.querySelector('svg')).toBeNull()
  })

  it('cannot be overridden into an unsafe link', () => {
    // target/rel are intentionally not part of ExternalLinkProps; force them in to prove they lose.
    const unsafe = { target: '_self', rel: 'opener' } as unknown as ExternalLinkProps
    render(
      <ExternalLink {...unsafe} href="https://example.com">
        Example
      </ExternalLink>,
    )
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
