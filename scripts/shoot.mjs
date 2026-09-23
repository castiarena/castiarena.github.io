#!/usr/bin/env node
// Visual QA harness — 04-visual-qa-protocol.md §1.
// Shoots a route at two viewports × two themes (4 PNGs), with animations disabled and fonts/images
// awaited, so every UI agent gets comparable, reproducible screenshots.
//
// Usage:
//   pnpm build && pnpm start &                 # serves ./out on :4173
//   node scripts/shoot.mjs --route /bio/ --out docs/handoffs/assets/U3
//
// Flags:
//   --route <path>      required, e.g. /bio/ or /projects/
//   --out <dir>          required, created if missing
//   --base-url <url>     default http://localhost:4173
//
// Writes <slug>-1280-dark.png, <slug>-1280-light.png, <slug>-390-dark.png, <slug>-390-light.png,
// where <slug> is the route with slashes stripped ("/" -> "home", "/bio/" -> "bio").

import { mkdirSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { chromium } from '@playwright/test'

function parseArgs(argv) {
  const args = { baseUrl: 'http://localhost:4173' }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--route') args.route = argv[++i]
    else if (arg === '--out') args.out = argv[++i]
    else if (arg === '--base-url') args.baseUrl = argv[++i]
  }
  if (!args.route || !args.out) {
    console.error('Usage: node scripts/shoot.mjs --route <path> --out <dir> [--base-url <url>]')
    process.exit(1)
  }
  return args
}

function routeSlug(route) {
  const trimmed = route.replace(/^\/+|\/+$/g, '')
  return trimmed === '' ? 'home' : trimmed.replace(/\//g, '-')
}

const VIEWPORTS = [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
]
const THEMES = ['dark', 'light']

async function waitForFontsAndImages(page) {
  await page.evaluate(async () => {
    await document.fonts.ready
    const pending = Array.from(document.images)
      .filter((img) => !img.complete)
      .map(
        (img) =>
          new Promise((resolve) => {
            img.addEventListener('load', resolve, { once: true })
            img.addEventListener('error', resolve, { once: true })
          }),
      )
    await Promise.all(pending)
  })
}

async function shootOne(browser, { baseUrl, route, out, slug, viewport, theme }) {
  const context = await browser.newContext({
    viewport,
    reducedMotion: 'reduce',
    colorScheme: theme,
  })
  // Set both the localStorage key (for whenever next-themes reads it) and the `.dark` class
  // itself, before any page script runs. Nothing in the app wires next-themes yet, so relying on
  // localStorage alone silently shoots light in both "themes" — see docs/handoffs/F2.md.
  // `document.documentElement` can still be null at the moment an init script fires (it runs via
  // CDP before the parser has necessarily created <html>), so fall back to DOMContentLoaded.
  await context.addInitScript((mode) => {
    const applyDarkClass = () => {
      document.documentElement.classList.toggle('dark', mode === 'dark')
    }
    if (document.documentElement) applyDarkClass()
    else document.addEventListener('DOMContentLoaded', applyDarkClass)
    window.localStorage.setItem('theme', mode)
  }, theme)

  const page = await context.newPage()
  await page.goto(new URL(route, baseUrl).toString(), { waitUntil: 'networkidle' })
  await waitForFontsAndImages(page)

  const backgroundColor = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)

  const file = path.join(out, `${slug}-${viewport.width}-${theme}.png`)
  await page.screenshot({ path: file, fullPage: true })
  await context.close()
  return { file, backgroundColor }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const slug = routeSlug(args.route)
  mkdirSync(args.out, { recursive: true })

  const browser = await chromium.launch()
  try {
    for (const viewport of VIEWPORTS) {
      const backgroundByTheme = {}
      for (const theme of THEMES) {
        const { file, backgroundColor } = await shootOne(browser, {
          baseUrl: args.baseUrl,
          route: args.route,
          out: args.out,
          slug,
          viewport,
          theme,
        })
        console.log(`✓ ${file}`)
        backgroundByTheme[theme] = backgroundColor
      }
      // A harness that silently emits duplicate light/dark screenshots is worse than one that
      // errors: every downstream agent trusts these PNGs as proof the light theme was checked.
      if (backgroundByTheme.dark === backgroundByTheme.light) {
        throw new Error(
          `Theme switch had no effect at ${viewport.width}px: <body> background-color is ` +
            `${backgroundByTheme.dark} in both dark and light shots. The .dark class on <html> ` +
            "isn't changing the rendered page — fix the theme wiring before trusting these " +
            'screenshots.',
        )
      }
    }
  } finally {
    await browser.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
