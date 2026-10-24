'use client'

import { GoogleAnalytics } from '@next/third-parties/google'

import { getAnalyticsConfig, useConsent } from '@/lib/analytics'

/**
 * Loads GA4 — and only then. `gtag.js` is requested from the browser the moment this renders, so
 * the gate is deliberately the whole component: no Consent Mode v2 pings, nothing to
 * googletagmanager.com until the visitor has accepted (`docs/analytics-plan.md`, "Basic" mode).
 *
 * Client navigations are counted by GA4 enhanced measurement ("page changes based on browser
 * history events"), not from here.
 */
export function Analytics() {
  const { choice } = useConsent()
  const config = getAnalyticsConfig()

  if (!config.enabled || !config.measurementId || choice !== 'granted') return null

  return <GoogleAnalytics gaId={config.measurementId} />
}
