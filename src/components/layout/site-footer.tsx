'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Container, ExternalLink } from '@/components/shared'
import { openConsentBanner } from '@/lib/analytics'
import { profile } from '@/content'
import { siteConfig } from '@/config/site'

const NOT_FOUND_PATHNAME = '/404'
const FOOTER_SOCIAL_LABELS = ['LinkedIn', 'GitHub', 'Email'] as const

export function SiteFooter() {
  const pathname = usePathname()
  const isNotFound = pathname === NOT_FOUND_PATHNAME
  const year = new Date().getFullYear()

  const credit = isNotFound
    ? `© ${year} ${siteConfig.name} · exported as out/404.html`
    : `© ${year} ${siteConfig.name} · Built with Next.js · Deployed on GitHub Pages`

  const socials = profile.socials.filter((social) =>
    (FOOTER_SOCIAL_LABELS as readonly string[]).includes(social.label),
  )

  return (
    <footer className="hairline-t">
      <Container
        as="div"
        className="flex flex-col items-start gap-4 py-8 font-mono text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
      >
        <p>{credit}</p>
        <div className="flex items-center gap-5">
          {socials.map((social) => (
            <ExternalLink
              key={social.label}
              href={social.href}
              className="text-brand"
              showIcon={false}
            >
              {social.label}
            </ExternalLink>
          ))}
          <Link href="/privacy" className="text-brand underline-offset-4 hover:underline">
            Privacy
          </Link>
          {/* The only way back to the banner once a choice is stored, so it lives next to the
              policy it belongs to rather than inside it. */}
          <button
            type="button"
            onClick={openConsentBanner}
            className="cursor-pointer text-brand underline-offset-4 hover:underline"
          >
            Cookie preferences
          </button>
        </div>
      </Container>
    </footer>
  )
}
