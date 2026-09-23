import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import { SiteFooter, SiteHeader, SkipLink, ThemeProvider } from '@/components/layout'
import { MotionProvider } from '@/components/motion'
import { geistMono, geistSans } from '@/components/shared/fonts'
import { Toaster } from '@/components/ui/sonner'
import { siteConfig } from '@/config/site'

import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    locale: siteConfig.locale,
    url: '/',
  },
}

// A <meta name="theme-color"> value can't reference a CSS custom property — the browser reads it
// outside the CSS cascade — so these mirror globals.css's --background for each theme (01
// §2/§9) as literal strings, kept in sync by convention rather than by reference (same approach
// F3 takes for its JS motion-duration constants; see docs/handoffs/F3.md).
const THEME_COLOR_LIGHT = 'oklch(1 0 0)'
const THEME_COLOR_DARK = 'oklch(0.145 0.005 285)'

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: THEME_COLOR_LIGHT },
    { media: '(prefers-color-scheme: dark)', color: THEME_COLOR_DARK },
  ],
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <ThemeProvider>
          <MotionProvider>
            <SkipLink />
            <SiteHeader />
            <main id="content" tabIndex={-1}>
              {children}
            </main>
            <SiteFooter />
            <Toaster />
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
