import { Geist, Geist_Mono } from 'next/font/google'

/**
 * Self-hosted Geist fonts (downloaded at build time by next/font).
 * Wired by agent 2.1 in `src/app/layout.tsx`:
 *   <html className={`${geistSans.variable} ${geistMono.variable}`}>
 * `globals.css` maps `--font-geist-sans` / `--font-geist-mono` to `font-sans` / `font-mono`.
 *
 * Not re-exported from `@/components/shared` on purpose: import from `@/components/shared/fonts`
 * so unit tests that import the barrel don't need the next/font compiler transform.
 */
export const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

export const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})
