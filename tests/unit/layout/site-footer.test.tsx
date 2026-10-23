import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const usePathnameMock = vi.fn()
const openConsentBannerMock = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
}))

vi.mock('@/lib/analytics', () => ({
  openConsentBanner: () => openConsentBannerMock(),
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

  it('links to the privacy policy', async () => {
    usePathnameMock.mockReturnValue('/bio/')
    await renderFooter()

    // next/link does not apply the app's `trailingSlash: true` in this environment — assert the
    // path, not the exact trailing slash (same as tests/unit/layout/nav-item.test.tsx).
    expect(screen.getByRole('link', { name: 'Privacy' }).getAttribute('href')).toMatch(
      /^\/privacy\/?$/,
    )
  })

  it('reopens the consent banner from "Cookie preferences" — the only way back to it', async () => {
    usePathnameMock.mockReturnValue('/bio/')
    await renderFooter()

    screen.getByRole('button', { name: 'Cookie preferences' }).click()

    expect(openConsentBannerMock).toHaveBeenCalledTimes(1)
  })
})
