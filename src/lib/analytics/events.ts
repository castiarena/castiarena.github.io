/**
 * The whole event catalog, in one place. `track()` is typed off this, so an event that isn't
 * here — or params that don't match — is a type error rather than a silently malformed hit.
 *
 * GA4 recommended events keep their documented names and param shapes (`generate_lead`, `click`,
 * `select_content`); everything else is custom snake_case. Never add a param that could carry
 * what a visitor typed: no form values, no email addresses, no free text.
 */

/** Where a contact interaction started. One per entry point, so sources stay comparable. */
export type ContactSource = 'header' | 'mobile_nav' | 'hero' | 'contact_band' | 'cta' | 'form'

/**
 * Why a send failed. These are the reasons the code actually produces: `SubmitFailureReason`
 * from `form-endpoint.ts`, plus `validation` for a submit the schema rejected before any request.
 */
export type ContactErrorReason = 'captcha' | 'rate_limited' | 'failed' | 'validation'

export type ThemeMode = 'light' | 'dark' | 'system'

/** Tags an outbound link with the kind of thing it points at. Optional — not every link has one. */
export type OutboundContentType = 'experiment' | 'project' | 'social' | 'employer'

/** GA4's recommended shape for an outbound link click. */
export interface OutboundClickParams {
  link_url: string
  link_domain: string
  outbound: true
  content_type?: OutboundContentType
}

/** Event name → its params. `undefined` means the event carries none. */
export interface AnalyticsEvents {
  contact_open: { source: ContactSource }
  generate_lead: { method: 'form' }
  contact_error: { reason: ContactErrorReason }
  contact_mailto: { source: ContactSource }
  contact_copy_email: { source: ContactSource }
  click: OutboundClickParams
  select_content: { content_type: 'project'; content_id: string }
  theme_change: { theme: ThemeMode }
}

export type AnalyticsEventName = keyof AnalyticsEvents

/** `[name]` for an event with no params, `[name, params]` otherwise. */
export type TrackArgs<N extends AnalyticsEventName> = AnalyticsEvents[N] extends undefined
  ? [name: N]
  : [name: N, params: AnalyticsEvents[N]]
