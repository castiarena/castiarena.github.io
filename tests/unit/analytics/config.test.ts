import { afterEach, describe, expect, it, vi } from 'vitest'

import { getAnalyticsConfig } from '@/lib/analytics/config'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('getAnalyticsConfig', () => {
  it('is enabled only on the production deploy with a measurement ID', () => {
    vi.stubEnv('NEXT_PUBLIC_DEPLOY_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', 'G-TEST12345')

    expect(getAnalyticsConfig()).toEqual({ enabled: true, measurementId: 'G-TEST12345' })
  })

  it('stays off without a measurement ID', () => {
    vi.stubEnv('NEXT_PUBLIC_DEPLOY_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', undefined)

    expect(getAnalyticsConfig()).toEqual({ enabled: false })
  })

  it('stays off outside the production deploy, even with an ID — CI, previews, local dev', () => {
    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', 'G-TEST12345')

    vi.stubEnv('NEXT_PUBLIC_DEPLOY_ENV', undefined)
    expect(getAnalyticsConfig()).toEqual({ enabled: false })

    vi.stubEnv('NEXT_PUBLIC_DEPLOY_ENV', 'preview')
    expect(getAnalyticsConfig()).toEqual({ enabled: false })
  })

  it('treats a whitespace-only ID as unset', () => {
    vi.stubEnv('NEXT_PUBLIC_DEPLOY_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', '   ')

    expect(getAnalyticsConfig()).toEqual({ enabled: false })
  })
})
