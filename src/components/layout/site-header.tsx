import type { Route } from 'next'
import Link from 'next/link'

import { ContactDialog } from '@/components/contact'
import { siteConfig } from '@/config/site'

// STUB — implemented by agent 2.1
export function SiteHeader() {
  return (
    <header>
      <nav aria-label="Main">
        <Link href="/">{siteConfig.name}</Link>
        <ul>
          {siteConfig.nav.map((item) => (
            <li key={item.href}>
              {/* typedRoutes only knows slash-less paths ("/bio"); the frozen siteConfig uses
                  trailing slashes to match `trailingSlash: true`, so cast explicitly. */}
              <Link href={item.href as Route}>{item.label}</Link>
            </li>
          ))}
        </ul>
        <ContactDialog />
      </nav>
    </header>
  )
}
