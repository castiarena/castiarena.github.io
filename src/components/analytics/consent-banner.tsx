'use client'

import Link from 'next/link'

import { Container } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { setConsent, useConsent } from '@/lib/analytics'

/**
 * Opt-in consent bar. Non-blocking by design: no overlay and no focus trap, so the page stays
 * usable while it is up and a visitor who ignores it is simply never measured.
 *
 * The `aria-live` wrapper is always in the DOM — including in the static export — because screen
 * readers only announce additions to a live region that already existed. The bar itself appears
 * after hydration, once the consent store has read `localStorage`.
 */
export function ConsentBanner() {
  const { bannerOpen } = useConsent()

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
      {bannerOpen ? (
        <section
          aria-label="Cookie preferences"
          className="pointer-events-auto border-t border-border bg-card/95 backdrop-blur-sm"
        >
          <Container
            as="div"
            className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="max-w-prose text-sm text-muted-foreground">
              This site uses Google Analytics to count visits and see which work people look at.
              Nothing is loaded or stored until you accept.{' '}
              <Link href="/privacy" className="text-brand underline-offset-4 hover:underline">
                What this collects
              </Link>
              .
            </p>
            {/* Equal visual weight on both answers: declining is not the quiet option. */}
            <div className="flex shrink-0 items-center gap-2">
              <Button type="button" variant="secondary" onClick={() => setConsent('denied')}>
                Decline
              </Button>
              <Button type="button" variant="secondary" onClick={() => setConsent('granted')}>
                Accept
              </Button>
            </div>
          </Container>
        </section>
      ) : null}
    </div>
  )
}
