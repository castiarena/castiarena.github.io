import { readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * Regression test for the F1×F2×F3 gate-merge regression: F1 trimmed the shadcn neutral tokens
 * from globals.css's `@theme inline` map, but several primitives kept referencing colour
 * utility classes built on removed tokens (a couple of shadcn's default fill/foreground pair,
 * plus a surface pair that no longer has its own token). Tailwind v4 silently emits zero rules
 * for a utility with no matching `--color-*` custom property — no build error, no lint error —
 * so the only way to catch this is to parse the live token map and check every component's
 * classes against it.
 *
 * Note for future edits to this file: avoid spelling out a real (prefix)-(token) utility class
 * as a contiguous string anywhere below, including in comments — Tailwind's content scanner
 * matches on raw substrings, so writing one out here would make it compile a phantom CSS rule
 * for a class no component actually uses.
 */

const COLOR_TOKEN_PATTERN =
  '(background|foreground|card(?:-foreground)?|popover(?:-foreground)?|primary(?:-foreground)?|secondary(?:-foreground)?|muted(?:-foreground)?|accent(?:-foreground)?|destructive|warning|border|input|ring|brand(?:-2|-3|-4)?(?:-foreground)?)'

const COLOR_UTILITY_PREFIXES = [
  'bg',
  'text',
  'border',
  'ring',
  'from',
  'via',
  'to',
  'fill',
  'stroke',
  'decoration',
  'outline',
  'divide',
  'caret',
  'accent',
]

const COLOR_UTILITY_RE = new RegExp(
  String.raw`\b(?:${COLOR_UTILITY_PREFIXES.join('|')})-${COLOR_TOKEN_PATTERN}\b`,
  'g',
)

function extractThemeColorTokens(css: string): Set<string> {
  const tokens = new Set<string>()
  for (const themeBlock of css.matchAll(/@theme(?:\s+inline)?\s*\{([^}]*)\}/g)) {
    const body = themeBlock[1] ?? ''
    for (const match of body.matchAll(/--color-([\w-]+)\s*:/g)) {
      if (match[1]) tokens.add(match[1])
    }
  }
  return tokens
}

function collectSourceFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      out.push(...collectSourceFiles(full))
    } else if (['.ts', '.tsx'].includes(extname(entry))) {
      out.push(full)
    }
  }
  return out
}

const root = process.cwd()
const validTokens = extractThemeColorTokens(
  readFileSync(resolve(root, 'src/app/globals.css'), 'utf8'),
)
const componentFiles = collectSourceFiles(resolve(root, 'src/components'))

describe('component colour utilities resolve against @theme inline tokens', () => {
  it('found the @theme inline colour tokens to check against', () => {
    // Guards against a silent false-pass if globals.css's @theme block is ever restructured
    // in a way this parser can no longer see (e.g. renamed away from `@theme inline`).
    expect(validTokens.size).toBeGreaterThan(0)
  })

  it.each(componentFiles.map((file) => [relative(root, file), file] as const))(
    '%s',
    (_relPath, file) => {
      const src = readFileSync(file, 'utf8')
      const missing = new Set<string>()
      for (const match of src.matchAll(COLOR_UTILITY_RE)) {
        const token = match[1]
        if (token && !validTokens.has(token)) missing.add(token)
      }
      expect(
        [...missing],
        `${relative(root, file)} references colour utilities built on token(s) not defined ` +
          `in @theme inline: ${[...missing].map((t) => `--color-${t}`).join(', ')}. ` +
          'Tailwind v4 emits zero CSS for a utility with no matching @theme token.',
      ).toEqual([])
    },
  )
})
