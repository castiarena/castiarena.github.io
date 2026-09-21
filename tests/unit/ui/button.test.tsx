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
})
