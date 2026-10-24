import type { OutboundClickParams, OutboundContentType } from './events'

/**
 * Link tracking is driven by data attributes rather than `onClick`, so the components that own
 * these links — project cards, experiment cards, the bio timeline, the CV page — stay Server
 * Components. One listener (`<LinkTracker>`) reads them; see `components/analytics/link-tracker`.
 */
export const ANALYTICS_EVENT_ATTR = 'data-analytics-event'
export const ANALYTICS_CONTENT_TYPE_ATTR = 'data-analytics-content-type'
export const ANALYTICS_CONTENT_ID_ATTR = 'data-analytics-content-id'

const OUTBOUND_CONTENT_TYPES: readonly string[] = [
  'experiment',
  'project',
  'social',
  'employer',
] satisfies readonly OutboundContentType[]

export type LinkIntent =
  { kind: 'outbound'; params: OutboundClickParams } | { kind: 'select_content'; contentId: string }

function readContentType(value: string | undefined): OutboundContentType | undefined {
  return value && OUTBOUND_CONTENT_TYPES.includes(value)
    ? (value as OutboundContentType)
    : undefined
}

/**
 * What (if anything) clicking this anchor should report. `null` for everything we don't measure:
 * internal navigation, `mailto:` / `tel:` / in-page anchors, and links with no usable `href`.
 *
 * Pure on purpose — the listener is a thin wrapper so this can be tested without events.
 */
export function describeLinkClick(
  anchor: HTMLAnchorElement,
  currentOrigin: string,
): LinkIntent | null {
  if (anchor.dataset.analyticsEvent === 'select_content') {
    const contentId = anchor.dataset.analyticsContentId
    return contentId ? { kind: 'select_content', contentId } : null
  }

  const href = anchor.getAttribute('href')
  if (!href) return null

  let url: URL
  try {
    url = new URL(href, currentOrigin)
  } catch {
    return null
  }

  // `mailto:` has its own event, and an in-page or internal link is not an outbound click.
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
  if (url.origin === currentOrigin) return null

  const contentType = readContentType(anchor.dataset.analyticsContentType)

  return {
    kind: 'outbound',
    params: {
      link_url: url.href,
      link_domain: url.hostname,
      outbound: true,
      ...(contentType ? { content_type: contentType } : {}),
    },
  }
}
