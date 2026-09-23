import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { experiences, profile } from '@/content'

// Reads the static export written by `pnpm build`. `out/` is gitignored and this repo's standard
// gate runs `pnpm test` before `pnpm build`, so on a fresh checkout the file doesn't exist yet —
// this suite skips itself in that case rather than failing the gate, and only asserts once a build
// is actually present (run `pnpm build` first to exercise it for real). Parsed with the jsdom
// `DOMParser` the test environment already provides, so visible text can be checked without
// tripping over asset-hash digit runs that live outside `<body>`. `<script>`/`<style>` tags are
// stripped first: Next.js inlines the RSC payload (including every icon's raw SVG path data) as
// JSON inside a `<script>` in `<body>`, and `textContent` does not distinguish rendered text from
// script text, so leaving them in produces phone-shaped false positives from path coordinates.
const outFile = join(process.cwd(), 'out/bio/index.html')
const hasBuild = existsSync(outFile)

function getVisibleBodyText(html: string): string {
  const body = new DOMParser().parseFromString(html, 'text/html').body
  body.querySelectorAll('script, style').forEach((el) => el.remove())
  return body.textContent ?? ''
}

describe.skipIf(!hasBuild)('out/bio/index.html', () => {
  const html = hasBuild ? readFileSync(outFile, 'utf8') : ''
  const bodyText = hasBuild ? getVisibleBodyText(html) : ''

  it('contains every CV bullet from every role', () => {
    for (const experience of experiences) {
      for (const highlight of experience.highlights) {
        expect(bodyText).toContain(highlight)
      }
    }
  })

  it('links the CV as a download from /cv/', () => {
    expect(html).toContain(`href="${profile.cvHref}"`)
    expect(html).toMatch(/href="\/cv\/[^"]+"[^>]*\bdownload\b/)
  })

  it('contains no phone number', () => {
    const phonePattern = /\(?\+?\d[\d\s().-]{6,}\d\b/
    expect(bodyText).not.toMatch(phonePattern)
  })
})
