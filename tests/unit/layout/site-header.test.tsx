import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { MotionProvider } from '@/components/motion'
import { siteConfig } from '@/config/site'

import { mockReducedMotion } from '../motion/test-utils'

const usePathnameMock = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
}))

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

beforeEach(() => {
  mockReducedMotion(false)
})

async function renderHeader() {
  const { SiteHeader } = await import('@/components/layout/site-header')
  return render(
    <MotionProvider>
      <SiteHeader />
    </MotionProvider>,
  )
}

describe('SiteHeader', () => {
  it('renders every siteConfig.nav entry, plus Home', async () => {
    usePathnameMock.mockReturnValue('/')
    await renderHeader()

    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(within(nav).getByRole('link', { name: 'Home' })).toBeInTheDocument()
    for (const item of siteConfig.nav) {
      expect(within(nav).getByRole('link', { name: item.label })).toBeInTheDocument()
    }
  })

  it('marks the active route with aria-current, mocking usePathname', async () => {
    usePathnameMock.mockReturnValue('/bio/')
    await renderHeader()

    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(within(nav).getByRole('link', { name: 'Bio' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current')
  })

  it('hides the nav, theme toggle and hamburger on the 404 variant', async () => {
    usePathnameMock.mockReturnValue('/404')
    await renderHeader()

    expect(screen.queryByRole('navigation', { name: 'Main' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Open menu' })).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/^Theme:/)).not.toBeInTheDocument()
  })

  it('keeps the logo and Contact trigger visible on the 404 variant', async () => {
    usePathnameMock.mockReturnValue('/404')
    await renderHeader()

    expect(screen.getByRole('link', { name: siteConfig.name })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Contact' })).toBeInTheDocument()
  })
})
