import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { parse, wcagContrast } from 'culori'
import { describe, expect, it } from 'vitest'

const css = readFileSync(resolve(process.cwd(), 'src/app/globals.css'), 'utf8').replace(
  /\/\*[\s\S]*?\*\//g,
  '',
)

/**
 * Collects `--name: value;` declarations from the first rule whose (comma-separated) selector
 * list includes the given selector exactly — e.g. `:root` matches `:root, .light { … }`, but not
 * a later unrelated `:root { … }` (the reduced-motion override).
 */
function readTokens(selector: string): Record<string, string> {
  const tokens: Record<string, string> = {}
  for (const [, selectorList, body] of css.matchAll(/([^;{}]+)\{([^{}]*)\}/gm)) {
    if (!selectorList || !body) continue
    const selectors = selectorList.split(',').map((s) => s.trim())
    if (!selectors.includes(selector)) continue

    for (const [, name, value] of body.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
      if (name && value) tokens[name] = value.trim()
    }
    return tokens
  }
  throw new Error(`No rule found for selector "${selector}"`)
}

const themes = {
  light: readTokens(':root'),
  dark: readTokens('.dark'),
}

const COLOR_TOKENS = [
  'background',
  'foreground',
  'card',
  'muted',
  'muted-foreground',
  'border',
  'input',
  'ring',
  'brand',
  'brand-2',
  'brand-3',
  'brand-4',
  'brand-foreground',
  'destructive',
  'warning',
]

/** Resolves a token's value, following `var(--x)` references (e.g. `--ring: var(--brand)`). */
function resolveValue(
  theme: Record<string, string>,
  token: string,
  seen = new Set<string>(),
): string {
  const raw = theme[token]
  if (!raw) throw new Error(`Missing token --${token}`)
  const ref = /^var\(--([\w-]+)\)$/.exec(raw)
  if (!ref?.[1]) return raw
  if (seen.has(token)) throw new Error(`Circular reference for --${token}`)
  seen.add(token)
  return resolveValue(theme, ref[1], seen)
}

function color(theme: Record<string, string>, token: string) {
  const raw = resolveValue(theme, token)
  const parsed = parse(raw)
  if (!parsed) throw new Error(`Unparseable colour for --${token}: ${raw}`)
  return parsed
}

// 01-design-tokens.md §10 — contrast floor, both themes.
const TEXT_PAIRS: [foreground: string, background: string][] = [
  ['foreground', 'background'],
  ['muted-foreground', 'background'],
  ['muted-foreground', 'card'],
  ['brand-foreground', 'brand'],
  ['brand', 'background'], // brand link text on background
]

// Focus ring against both surfaces — 3:1, not the 4.5:1 text floor.
const RING_PAIRS: [foreground: string, background: string][] = [
  ['ring', 'background'],
  ['ring', 'card'],
]

describe.each(Object.entries(themes))('%s theme tokens', (_name, theme) => {
  it('defines every colour token in OKLCH', () => {
    for (const token of COLOR_TOKENS) {
      const raw = resolveValue(theme, token)
      expect(raw, `--${token}`).toMatch(/^oklch\(/)
      expect(color(theme, token).mode).toBe('oklch')
    }
  })

  it.each(TEXT_PAIRS)('%s on %s has contrast ≥ 4.5:1', (fg, bg) => {
    const ratio = wcagContrast(color(theme, fg), color(theme, bg))
    expect(ratio, `--${fg} on --${bg} = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5)
  })

  it.each(RING_PAIRS)('%s on %s has contrast ≥ 3:1', (fg, bg) => {
    const ratio = wcagContrast(color(theme, fg), color(theme, bg))
    expect(ratio, `--${fg} on --${bg} = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(3)
  })
})

describe('globals.css', () => {
  it('contains no hex or rgb() colours', () => {
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,6}\b|rgba?\(/)
  })

  it('keeps the brand hues from 01 §1 in the dark (default) theme', () => {
    expect(themes.dark.brand).toBe('oklch(0.63 0.19 256)')
    expect(themes.dark['brand-2']).toBe('oklch(0.72 0.17 195)')
    expect(themes.dark['brand-3']).toBe('oklch(0.66 0.24 305)')
    expect(themes.dark['brand-4']).toBe('oklch(0.66 0.21 285)')
  })

  it('only darkens the light-theme brand lightness, keeping hue and chroma (01 §2 note)', () => {
    expect(themes.light.brand).toBe('oklch(0.56 0.19 256)')
  })
})
