import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const usePathnameMock = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

async function renderFooter() {
  const { SiteFooter } = await import('@/components/layout/site-footer')
  return render(<SiteFooter />)
}

describe('SiteFooter', () => {
  it('shows the standard credit line and social links on an ordinary route', async () => {
    usePathnameMock.mockReturnValue('/bio/')
    await renderFooter()

    expect(screen.getByText(/Built with Next\.js · Deployed on GitHub Pages/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /LinkedIn/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /GitHub/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Email/ })).toBeInTheDocument()
  })

  it('swaps in the exported-as-404.html credit line on the 404 variant', async () => {
    usePathnameMock.mockReturnValue('/404')
    await renderFooter()

    expect(screen.getByText(/exported as out\/404\.html/)).toBeInTheDocument()
    expect(screen.queryByText(/Deployed on GitHub Pages/)).not.toBeInTheDocument()
  })
})
