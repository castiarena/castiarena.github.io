#!/usr/bin/env node
// Verifies the static export in ./out before it is tested or deployed.
// Pure Node (no dependencies). See docs/plan/03-deployment-flow.md §4.
//
// Usage:  node scripts/verify-export.mjs [outDir]
// Env:    VERIFY_STRICT=1  -> missing sitemap.xml / robots.txt is an error instead of a warning
//
// Exit code 0 when every check passes, 1 otherwise.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.resolve(repoRoot, process.argv[2] ?? 'out')
const projectsSource = path.join(repoRoot, 'src/content/projects.ts')
const strict = process.env.VERIFY_STRICT === '1'

// The site is a GitHub Pages *user* site served from the domain root, so no basePath.
const BASE_PATH_LEAK = /(?:href|src)="\/castiarena\.github\.io\//
// Any asset URL that nests /_next/ under a path prefix (e.g. "/foo/_next/static/...").
const NESTED_NEXT = /(?:href|src|srcset)="\/[^"/]+\/_next\//

const REQUIRED_FILES = [
  'index.html',
  '404.html',
  'bio/index.html',
  'experiments/index.html',
  'projects/index.html',
  'cv/agustin-castiarena-resume.pdf',
]
// Required from Wave 3 (agent 3.1) onward; warnings until VERIFY_STRICT=1.
const SEO_FILES = ['sitemap.xml', 'robots.txt']
// `next build` also writes out/404/index.html and out/_not-found/ next to out/404.html. They are
// harmless build extras: GitHub Pages only uses 404.html, so they are neither required nor errors.

const passed = []
const warnings = []
const errors = []

const rel = (p) => path.relative(repoRoot, p) || '.'

function isNonEmptyFile(p) {
  try {
    const s = statSync(p)
    return s.isFile() && s.size > 0
  } catch {
    return false
  }
}

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, files)
    else if (entry.isFile()) files.push(full)
  }
  return files
}

function checkRequiredFiles() {
  for (const file of REQUIRED_FILES) {
    const full = path.join(outDir, file)
    if (isNonEmptyFile(full)) passed.push(`${file} exists`)
    else errors.push(`missing or empty: ${rel(full)}`)
  }
}

function checkSeoFiles() {
  for (const file of SEO_FILES) {
    const full = path.join(outDir, file)
    if (isNonEmptyFile(full)) passed.push(`${file} exists`)
    else if (strict) errors.push(`missing or empty: ${rel(full)} (VERIFY_STRICT=1)`)
    else warnings.push(`missing: ${rel(full)} (becomes an error with VERIFY_STRICT=1)`)
  }
}

function checkNextStatic() {
  const dir = path.join(outDir, '_next/static')
  let ok = false
  try {
    ok = statSync(dir).isDirectory() && readdirSync(dir).length > 0
  } catch {
    ok = false
  }
  if (ok) passed.push('_next/static/ exists and is not empty')
  else errors.push(`missing or empty directory: ${rel(dir)}/`)
}

function checkProjects() {
  let source
  try {
    source = readFileSync(projectsSource, 'utf8')
  } catch {
    errors.push(`cannot read ${rel(projectsSource)} to count project slugs`)
    return
  }
  const slugs = [...source.matchAll(/\bslug\s*:\s*(['"`])([^'"`]+)\1/g)].map((m) => m[2])
  const expectedCount = (source.match(/\bslug\s*:/g) ?? []).length

  const projectsOut = path.join(outDir, 'projects')
  const exported = existsSync(projectsOut)
    ? readdirSync(projectsOut, { withFileTypes: true })
        .filter(
          (d) => d.isDirectory() && isNonEmptyFile(path.join(projectsOut, d.name, 'index.html')),
        )
        .map((d) => d.name)
        .sort()
    : []

  if (exported.length === expectedCount) {
    passed.push(
      `projects/<slug>/index.html: ${exported.length} exported = ${expectedCount} in source`,
    )
  } else {
    errors.push(
      `project pages: ${exported.length} exported (${exported.join(', ') || 'none'}) but ` +
        `${expectedCount} \`slug:\` entries in ${rel(projectsSource)}`,
    )
  }
  for (const slug of slugs) {
    if (!exported.includes(slug))
      errors.push(`missing project page: out/projects/${slug}/index.html`)
  }
  for (const dir of exported) {
    if (!slugs.includes(dir)) errors.push(`unexpected project page: out/projects/${dir}/index.html`)
  }
}

function checkBasePathLeaks() {
  const htmlFiles = walk(outDir).filter((f) => f.endsWith('.html'))
  let leaks = 0
  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8')
    const leak = html.match(BASE_PATH_LEAK) ?? html.match(NESTED_NEXT)
    if (leak) {
      leaks++
      errors.push(`basePath leak in ${rel(file)}: ${leak[0]}`)
    }
  }
  if (leaks === 0) passed.push(`no basePath leaks in ${htmlFiles.length} HTML files`)
}

function main() {
  console.log(`verify-export: checking ${rel(outDir)}/ (strict=${strict ? 'on' : 'off'})\n`)

  if (!existsSync(outDir) || !statSync(outDir).isDirectory()) {
    console.error(`✗ ${rel(outDir)}/ does not exist. Run \`pnpm build\` first.`)
    process.exit(1)
  }

  checkRequiredFiles()
  checkSeoFiles()
  checkNextStatic()
  checkProjects()
  checkBasePathLeaks()

  for (const msg of passed) console.log(`✓ ${msg}`)
  for (const msg of warnings) console.log(`⚠ ${msg}`)
  for (const msg of errors) console.error(`✗ ${msg}`)

  console.log(`\n${passed.length} passed, ${warnings.length} warning(s), ${errors.length} error(s)`)
  if (errors.length > 0) {
    console.error('verify-export: FAILED')
    process.exit(1)
  }
  console.log('verify-export: OK')
}

main()
