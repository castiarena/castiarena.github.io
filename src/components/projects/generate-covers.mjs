#!/usr/bin/env node
// Generates the placeholder cover SVGs at `public/images/projects/<slug>.svg` — U5 task 1
// (docs/plan/prompts/wave-2/U5.md). Run once by hand and commit the output:
//
//   node src/components/projects/generate-covers.mjs
//
// The gradient math (hashSeed / getCoverGradientStops) is a deliberate copy of
// `src/components/shared/cover-gradient.tsx`, not an import: that component reads the brand ramp
// through CSS custom properties, which don't exist in a standalone SVG loaded via `<img src>` (no
// host stylesheet to resolve `var(--brand)` against). The brand hues are identical in light and
// dark (01-design-tokens.md §2), so the dark-theme values below are safe to bake in as literals.
// `tests/unit/projects/generate-covers.test.ts` asserts this copy stays in sync with the component.
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { projects } from '../../content/projects.ts'

const BRAND_RAMP = {
  '--brand': 'oklch(0.63 0.19 256)',
  '--brand-2': 'oklch(0.72 0.17 195)',
  '--brand-3': 'oklch(0.66 0.24 305)',
  '--brand-4': 'oklch(0.66 0.21 285)',
}
const RAMP_KEYS = Object.keys(BRAND_RAMP)

// FNV-1a — identical to cover-gradient.tsx's hashSeed.
function hashSeed(seed) {
  let hash = 0x811c9dc5
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

// Identical to cover-gradient.tsx's getCoverGradientStops.
export function getCoverGradientStops(seed) {
  const hash = hashSeed(seed)
  const fromIndex = hash % RAMP_KEYS.length
  const offset = 1 + (Math.floor(hash / RAMP_KEYS.length) % (RAMP_KEYS.length - 1))
  const toIndex = (fromIndex + offset) % RAMP_KEYS.length
  const hueRotate = (hash % 41) - 20
  return { from: RAMP_KEYS[fromIndex], to: RAMP_KEYS[toIndex], hueRotate }
}

const WIDTH = 1600
const HEIGHT = 1000

function escapeXml(value) {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;'
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '"':
        return '&quot;'
      default:
        return '&apos;'
    }
  })
}

/**
 * Gradient only — no title text, no scrim.
 *
 * The first version baked the project title into the artwork, which put the title on screen twice
 * (once in the SVG, once as the card's real heading) and forced `object-contain` at every ratio
 * other than 16:10, letterboxing the cover inside a `bg-muted` band. Reference screens 06 and 07
 * show the covers as flat edge-to-edge gradients, so the text is gone and the components use
 * `object-cover`. The accessible name still lives on the SVG for anything that loads it directly.
 */
function buildSvg(slug, title) {
  const { from, to, hueRotate } = getCoverGradientStops(slug)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="${escapeXml(title)}">
  <title>${escapeXml(title)}</title>
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${BRAND_RAMP[from]}" />
      <stop offset="100%" stop-color="${BRAND_RAMP[to]}" />
    </linearGradient>
    <filter id="hue">
      <feColorMatrix type="hueRotate" values="${hueRotate}" />
    </filter>
  </defs>
  <g filter="url(#hue)">
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#g)" />
  </g>
</svg>
`
}

function main() {
  const outDir = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../../public/images/projects',
  )
  mkdirSync(outDir, { recursive: true })

  for (const project of projects) {
    const svg = buildSvg(project.slug, project.title)
    const file = path.join(outDir, `${project.slug}.svg`)
    writeFileSync(file, svg, 'utf8')
    const bytes = Buffer.byteLength(svg, 'utf8')
    console.log(`✓ ${file} (${(bytes / 1024).toFixed(1)} KB)`)
    if (bytes > 20 * 1024) {
      throw new Error(`${file} is ${bytes} bytes, over the 20 KB budget`)
    }
  }
}

// Guarded so `tests/unit/projects/generate-covers.test.ts` can import `getCoverGradientStops`
// from this module (to assert it stays in sync with `cover-gradient.tsx`) without re-running the
// file-writing side effect on every test run — only a direct `node generate-covers.mjs` does that.
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
