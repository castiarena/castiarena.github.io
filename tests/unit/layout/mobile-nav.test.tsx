import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { MobileNav } from '@/components/layout/mobile-nav'

const items = [
  { href: '/', label: 'Home' },
  { href: '/bio/', label: 'Bio' },
]

afterEach(cleanup)

describe('MobileNav', () => {
  it('renders every item as a link, marking the active one', () => {
    render(<MobileNav open onOpenChange={vi.fn()} items={items} pathname="/bio/" />)
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Bio/ })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current')
  })

  it('closes when the route changes while open', () => {
    const onOpenChange = vi.fn()
    const { rerender } = render(
      <MobileNav open onOpenChange={onOpenChange} items={items} pathname="/" />,
    )
    expect(onOpenChange).not.toHaveBeenCalled()

    rerender(<MobileNav open onOpenChange={onOpenChange} items={items} pathname="/bio/" />)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('renders nothing (no dialog) when closed', () => {
    render(<MobileNav open={false} onOpenChange={vi.fn()} items={items} pathname="/" />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
