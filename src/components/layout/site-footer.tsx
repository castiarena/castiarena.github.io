'use client'

import { usePathname } from 'next/navigation'

import { Container, ExternalLink } from '@/components/shared'
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
        </div>
      </Container>
    </footer>
  )
}
