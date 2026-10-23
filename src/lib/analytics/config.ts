export interface AnalyticsConfig {
  /** `true` only when a measurement ID is configured *and* this is the production deploy. */
  enabled: boolean
  /** The `G-XXXXXXXXXX` measurement ID, present whenever `enabled` is `true`. */
  measurementId?: string
}

const PRODUCTION_DEPLOY_ENV = 'production'

/**
 * Reads the build-time config (inlined by `next build`, the site has no server). Analytics stay
 * off unless both values are set, so CI, Vercel previews and local dev never report to GA — see
 * `docs/analytics-plan.md`. `NEXT_PUBLIC_DEPLOY_ENV` is set only by `deploy-pages.yml`.
 *
 * Read on every call rather than captured in a module constant, so tests can stub the env.
 */
export function getAnalyticsConfig(): AnalyticsConfig {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim()
  const isProduction = process.env.NEXT_PUBLIC_DEPLOY_ENV === PRODUCTION_DEPLOY_ENV
  if (!measurementId || !isProduction) return { enabled: false }
  return { enabled: true, measurementId }
}
