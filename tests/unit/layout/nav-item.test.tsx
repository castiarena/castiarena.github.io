import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { NavItem } from '@/components/layout/nav-item'
import { MotionProvider } from '@/components/motion'

import { mockReducedMotion } from '../motion/test-utils'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

beforeEach(() => {
  mockReducedMotion(false)
})

describe('NavItem', () => {
  it('renders the label as a link to href', () => {
    render(
      <MotionProvider>
        <NavItem href="/bio/" label="Bio" active={false} />
      </MotionProvider>,
    )
    const link = screen.getByRole('link', { name: 'Bio' })
    // next/link's own href resolution in this test environment does not apply the app's
    // `trailingSlash: true` build config (that's a Next build/runtime concern, not a component
    // one) — assert the path, not the exact trailing slash.
    expect(link.getAttribute('href')).toMatch(/^\/bio\/?$/)
  })

  it('sets aria-current="page" only when active', () => {
    render(
      <MotionProvider>
        <NavItem href="/bio/" label="Bio" active={true} />
      </MotionProvider>,
    )
    expect(screen.getByRole('link', { name: 'Bio' })).toHaveAttribute('aria-current', 'page')
  })

  it('has no aria-current when inactive', () => {
    render(
      <MotionProvider>
        <NavItem href="/bio/" label="Bio" active={false} />
      </MotionProvider>,
    )
    expect(screen.getByRole('link', { name: 'Bio' })).not.toHaveAttribute('aria-current')
  })
})
