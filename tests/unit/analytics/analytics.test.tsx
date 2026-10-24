import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { ConsentChoice } from '@/lib/analytics/consent'

const STORAGE_KEY = 'castiarena:consent'
const MEASUREMENT_ID = 'G-TEST12345'

// Stands in for the real loader so the test can assert *whether* it renders without any script
// ever being requested. What it renders is covered by @next/third-parties itself.
vi.mock('@next/third-parties/google', () => ({
  GoogleAnalytics: ({ gaId }: { gaId: string }) => <div data-testid="ga" data-ga-id={gaId} />,
}))

async function renderAnalytics(choice: ConsentChoice | null) {
  window.localStorage.clear()
  if (choice) {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ choice, timestamp: Date.now(), version: 1 }),
    )
  }
  vi.resetModules()
  const { Analytics } = await import('@/components/analytics/analytics')
  return render(<Analytics />)
}

const ga = () => screen.queryByTestId('ga')

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_DEPLOY_ENV', 'production')
  vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', MEASUREMENT_ID)
})

afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
})

describe('<Analytics>', () => {
  it('loads GA4 when it is configured and the visitor has accepted', async () => {
    await renderAnalytics('granted')
    expect(ga()).toHaveAttribute('data-ga-id', MEASUREMENT_ID)
  })

  it('loads nothing before the visitor has answered', async () => {
    await renderAnalytics(null)
    expect(ga()).not.toBeInTheDocument()
  })

  it('loads nothing after a Decline', async () => {
    await renderAnalytics('denied')
    expect(ga()).not.toBeInTheDocument()
  })

  it('loads nothing without a measurement ID, even with consent', async () => {
    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', undefined)
    await renderAnalytics('granted')
    expect(ga()).not.toBeInTheDocument()
  })

  it('loads nothing outside the production deploy, even with consent', async () => {
    vi.stubEnv('NEXT_PUBLIC_DEPLOY_ENV', undefined)
    await renderAnalytics('granted')
    expect(ga()).not.toBeInTheDocument()
  })
})
