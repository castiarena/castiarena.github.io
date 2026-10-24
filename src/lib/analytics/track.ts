import { sendGAEvent } from '@next/third-parties/google'

import { getAnalyticsConfig } from './config'
import { getConsentState } from './consent'
import type { AnalyticsEventName, AnalyticsEvents, TrackArgs } from './events'

/**
 * Sends one event, if and only if analytics are configured for this build *and* the visitor has
 * accepted. Otherwise it logs in dev (so call sites are verifiable without a GA property) and
 * no-ops everywhere else.
 *
 * Never throws: analytics are not allowed to break an interaction, so the whole body is guarded.
 * Callers can treat it as fire-and-forget.
 */
export function track<N extends AnalyticsEventName>(...args: TrackArgs<N>): void {
  const [name, params] = args as [N, AnalyticsEvents[N] | undefined]

  try {
    const config = getAnalyticsConfig()
    const granted = getConsentState().choice === 'granted'

    if (config.enabled && granted) {
      sendGAEvent('event', name, params ?? {})
      return
    }

    if (process.env.NODE_ENV === 'development') {
      console.debug('[analytics]', name, params ?? {})
    }
  } catch {
    // A failed measurement is never worth surfacing to the visitor.
  }
}
