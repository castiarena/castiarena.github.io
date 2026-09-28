import { profile } from '@/content'
import { siteConfig } from '@/config/site'

// Schema.org Person, site-wide: this whole site is Agustin's profile, so it belongs in the root
// layout rather than a single page. docs/…/02-guides/json-ld.md recommends a native <script> tag
// (not next/script) and escaping `<` since JSON.stringify doesn't sanitize for XSS.
export function PersonJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.role,
    description: profile.tagline,
    url: siteConfig.url,
    image: `${siteConfig.url}${profile.avatar.src}`,
    address: { '@type': 'PostalAddress', addressLocality: profile.location },
    sameAs: profile.socials
      .filter((social) => social.href.startsWith('http'))
      .map((social) => social.href),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
    />
  )
}
