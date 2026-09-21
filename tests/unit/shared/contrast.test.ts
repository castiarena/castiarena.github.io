import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { parse, wcagContrast } from 'culori'
import { describe, expect, it } from 'vitest'

const css = readFileSync(resolve(process.cwd(), 'src/app/globals.css'), 'utf8').replace(
  /\/\*[\s\S]*?\*\//g,
  '',
)

/** Collects `--name: value;` declarations from the first rule whose selector matches exactly. */
function readTokens(selector: string): Record<string, string> {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = new RegExp(`(?:^|\\})\\s*${escaped}\\s*\\{([^}]*)\\}`, 'm').exec(css)
  if (!match?.[1]) throw new Error(`No rule found for selector "${selector}"`)

  const tokens: Record<string, string> = {}
  for (const [, name, value] of match[1].matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    if (name && value) tokens[name] = value.trim()
  }
  return tokens
}

const themes = {
  light: readTokens(':root,\n.light'),
  dark: readTokens('.dark'),
}

const REQUIRED_PAIRS: [foreground: string, background: string][] = [
  ['foreground', 'background'],
  ['muted-foreground', 'background'],
  ['primary-foreground', 'primary'],
]

const EXTRA_PAIRS: [foreground: string, background: string][] = [
  ['muted-foreground', 'muted'],
  ['muted-foreground', 'card'],
  ['card-foreground', 'card'],
  ['popover-foreground', 'popover'],
  ['secondary-foreground', 'secondary'],
  ['accent-foreground', 'accent'],
  ['brand-foreground', 'brand'],
  ['destructive', 'background'],
  ['primary', 'background'],
]

const COLOR_TOKENS = [
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'destructive',
  'border',
  'input',
  'ring',
  'brand',
  'brand-2',
  'brand-3',
]

function color(theme: Record<string, string>, token: string) {
  const raw = theme[token]
  if (!raw) throw new Error(`Missing token --${token}`)
  const parsed = parse(raw)
  if (!parsed) throw new Error(`Unparseable colour for --${token}: ${raw}`)
  return parsed
}

describe.each(Object.entries(themes))('%s theme tokens', (_name, theme) => {
  it('defines every shadcn + brand colour token in OKLCH', () => {
    for (const token of COLOR_TOKENS) {
      expect(theme[token], `--${token}`).toMatch(/^oklch\(/)
      expect(color(theme, token).mode).toBe('oklch')
    }
  })

  it.each([...REQUIRED_PAIRS, ...EXTRA_PAIRS])('%s on %s has contrast ≥ 4.5:1', (fg, bg) => {
    const ratio = wcagContrast(color(theme, fg), color(theme, bg))
    expect(ratio, `--${fg} on --${bg} = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5)
  })
})

describe('globals.css', () => {
  it('contains no hex or rgb() colours', () => {
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,6}\b|rgba?\(/)
  })

  it('keeps the brand values from 01 §4 in the dark (default) theme', () => {
    expect(themes.dark.brand).toBe('oklch(0.63 0.19 256)')
    expect(themes.dark['brand-2']).toBe('oklch(0.72 0.17 195)')
    expect(themes.dark['brand-3']).toBe('oklch(0.66 0.24 305)')
  })
})
