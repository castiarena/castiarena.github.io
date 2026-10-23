import type { MetadataRoute } from 'next'

import { siteConfig } from '@/config/site'

// Compiles to a plain robots.txt file at build time (docs/…/file-conventions/01-metadata/robots.md).
// `output: 'export'` requires this route be explicitly static. Every crawler is welcome, including
// AI assistants and training bots (GPTBot, ClaudeBot, PerplexityBot, etc.) — this is a public
// portfolio and there's nothing here worth gatekeeping.
export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  }
}
