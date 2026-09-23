import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { Button } from '@/components/ui/button'

afterEach(cleanup)

describe('Button', () => {
  it('sets aria-busy and disables the button when loading', () => {
    render(<Button loading>Send message</Button>)
    const button = screen.getByRole('button', { name: 'Send message' })
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toBeDisabled()
  })

  it('is not busy or disabled by default', () => {
    render(<Button>Send message</Button>)
    const button = screen.getByRole('button', { name: 'Send message' })
    expect(button).not.toHaveAttribute('aria-busy')
    expect(button).not.toBeDisabled()
  })

  it('renders a spinner alongside the label while loading', () => {
    const { container } = render(<Button loading>Send message</Button>)
    expect(container.querySelector('svg.animate-spin')).not.toBeNull()
    expect(screen.getByRole('button')).toHaveTextContent('Send message')
  })

  // CCR-U5-1: `{loading ? <Icon/> : null}{children}` is a two-element array even when the
  // spinner is null, and Slot requires exactly one child — so `asChild` threw for every
  // link-shaped button unless the caller happened to pass `loading`.
  it('renders a link through asChild without a loading prop', () => {
    expect(() =>
      render(
        <Button asChild>
          <a href="https://example.com/case-study">Read case study</a>
        </Button>,
      ),
    ).not.toThrow()
    expect(screen.getByRole('link', { name: 'Read case study' })).toHaveAttribute(
      'href',
      'https://example.com/case-study',
    )
  })

  it('renders through asChild while loading, without a spinner in the single slot child', () => {
    const { container } = render(
      <Button asChild loading>
        <a href="https://example.com/case-study">Read case study</a>
      </Button>,
    )
    const link = screen.getByRole('link', { name: 'Read case study' })
    expect(link).toHaveAttribute('aria-busy', 'true')
    expect(container.querySelector('svg.animate-spin')).toBeNull()
  })
})
