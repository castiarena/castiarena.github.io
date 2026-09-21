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
//   --route <path>      required, e.g. /bio/ or /styleguide/
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
  await context.addInitScript((mode) => {
    window.localStorage.setItem('theme', mode)
  }, theme)

  const page = await context.newPage()
  await page.goto(new URL(route, baseUrl).toString(), { waitUntil: 'networkidle' })
  await waitForFontsAndImages(page)

  const file = path.join(out, `${slug}-${viewport.width}-${theme}.png`)
  await page.screenshot({ path: file, fullPage: true })
  await context.close()
  return file
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const slug = routeSlug(args.route)
  mkdirSync(args.out, { recursive: true })

  const browser = await chromium.launch()
  try {
    for (const viewport of VIEWPORTS) {
      for (const theme of THEMES) {
        const file = await shootOne(browser, {
          baseUrl: args.baseUrl,
          route: args.route,
          out: args.out,
          slug,
          viewport,
          theme,
        })
        console.log(`✓ ${file}`)
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
