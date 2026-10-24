'use client'

import { useEffect } from 'react'

import { describeLinkClick, track } from '@/lib/analytics'

/**
 * One document-level listener for every outbound click and project-card click on the site.
 *
 * The alternative — an `onClick` on each link — would turn project cards, experiment cards, the
 * bio timeline and the CV page into Client Components purely to measure them, and `/bio/`'s links
 * live in a page that has to stay a Server Component for its `metadata` export. Instead those
 * links carry `data-analytics-*` attributes, which cost nothing, and this reads them.
 *
 * Capture phase, so a handler that stops propagation can't silently drop the measurement.
 * `auxclick` covers middle-click "open in new tab"; button 1 only, since button 2 is a context
 * menu rather than a navigation.
 *
 * Note this duplicates what GA4 enhanced measurement would do for outbound clicks — the owner
 * checklist in `docs/analytics-plan.md` turns that off so events aren't counted twice.
 */
export function LinkTracker() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.type === 'auxclick' && event.button !== 1) return

      const target = event.target
      if (!(target instanceof Element)) return

      const anchor = target.closest('a[href]')
      if (!(anchor instanceof HTMLAnchorElement)) return

      const intent = describeLinkClick(anchor, window.location.origin)
      if (!intent) return

      if (intent.kind === 'outbound') {
        track('click', intent.params)
      } else {
        track('select_content', { content_type: 'project', content_id: intent.contentId })
      }
    }

    document.addEventListener('click', handleClick, true)
    document.addEventListener('auxclick', handleClick, true)
    return () => {
      document.removeEventListener('click', handleClick, true)
      document.removeEventListener('auxclick', handleClick, true)
    }
  }, [])

  return null
}
