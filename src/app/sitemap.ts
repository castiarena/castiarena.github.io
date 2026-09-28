import type { MetadataRoute } from 'next'

import { siteConfig } from '@/config/site'
import { projects } from '@/content'

// Compiles to a plain sitemap.xml file at build time (docs/…/file-conventions/01-metadata/sitemap.md).
// `output: 'export'` requires this route be explicitly static.
export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteConfig.url}/`, changeFrequency: 'monthly', priority: 1 },
    ...siteConfig.nav.map((item) => ({
      url: `${siteConfig.url}${item.href}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${siteConfig.url}/projects/${project.slug}/`,
    changeFrequency: 'yearly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...projectRoutes]
}
