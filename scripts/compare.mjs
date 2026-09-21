#!/usr/bin/env node
// Visual QA harness — 04-visual-qa-protocol.md §2.
// Renders a shot next to (above) its design reference, both scaled to the same width, as one PNG
// the agent then reads with the Read tool. Built on Playwright (already a dependency) driving a
// tiny local HTML page — no image-processing dependency needed.
//
// Usage:
//   node scripts/compare.mjs --shot <shot.png> --ref <reference.png> --out <side-by-side.png>
//
// Flags:
//   --shot <file>   required, a PNG from scripts/shoot.mjs
//   --ref <file>    required, a PNG under docs/plan/design-build/reference/
//   --out <file>    required, where to write the composite PNG
//   --width <px>    optional, target width both images are scaled to (default 960)

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import { chromium } from '@playwright/test'

function parseArgs(argv) {
  const args = { width: 960 }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--shot') args.shot = argv[++i]
    else if (arg === '--ref') args.ref = argv[++i]
    else if (arg === '--out') args.out = argv[++i]
    else if (arg === '--width') args.width = Number(argv[++i])
  }
  if (!args.shot || !args.ref || !args.out) {
    console.error('Usage: node scripts/compare.mjs --shot <file> --ref <file> --out <file>')
    process.exit(1)
  }
  return args
}

function buildHtml({ shotUrl, refUrl, shotLabel, refLabel, width }) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html, body { margin: 0; background: #18181b; }
      .stack { display: flex; flex-direction: column; width: ${width}px; }
      .label {
        font: 12px/1.4 ui-monospace, monospace;
        color: #d4d4d8;
        background: #000;
        padding: 6px 10px;
      }
      img { display: block; width: ${width}px; height: auto; }
      .divider { height: 4px; background: #f43f5e; }
    </style>
  </head>
  <body>
    <div class="stack">
      <div class="label">SHOT · ${shotLabel}</div>
      <img src="${shotUrl}" />
      <div class="divider"></div>
      <div class="label">REFERENCE · ${refLabel}</div>
      <img src="${refUrl}" />
    </div>
  </body>
</html>`
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const shotPath = path.resolve(args.shot)
  const refPath = path.resolve(args.ref)
  const outPath = path.resolve(args.out)

  const tmpDir = mkdtempSync(path.join(tmpdir(), 'compare-'))
  const htmlPath = path.join(tmpDir, 'compare.html')
  writeFileSync(
    htmlPath,
    buildHtml({
      shotUrl: pathToFileURL(shotPath).href,
      refUrl: pathToFileURL(refPath).href,
      shotLabel: path.basename(shotPath),
      refLabel: path.basename(refPath),
      width: args.width,
    }),
  )

  mkdirSync(path.dirname(outPath), { recursive: true })

  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({ viewport: { width: args.width, height: 800 } })
    await page.goto(pathToFileURL(htmlPath).href)
    await page.waitForFunction(() =>
      Array.from(document.images).every((img) => img.complete && img.naturalWidth > 0),
    )
    await page.screenshot({ path: outPath, fullPage: true })
    console.log(`✓ ${outPath}`)
  } finally {
    await browser.close()
    rmSync(tmpDir, { recursive: true, force: true })
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
