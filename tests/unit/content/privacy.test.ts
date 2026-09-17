import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const CONTENT_DIR = join(ROOT, 'src/content')
const PHONE_PATTERN = /\+?\d[\d\s-]{8,}\d/
const PHONE_FRAGMENT = '311739'

function listFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    return entry.isDirectory() ? listFiles(path) : [path]
  })
}

describe('privacy', () => {
  const files = listFiles(CONTENT_DIR)

  it('scans the content files', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  it.each(files.map((file) => relative(ROOT, file)))('%s contains no phone number', (file) => {
    const source = readFileSync(join(ROOT, file), 'utf8')
    const lines = source.split('\n')
    const offending = lines
      .map((line, index) => ({ line: index + 1, text: line }))
      .filter(({ text }) => PHONE_PATTERN.test(text) || text.includes(PHONE_FRAGMENT))
      .map(({ line }) => `${file}:${line}`)
    expect(offending, 'phone-like number found (never publish the phone number)').toEqual([])
  })

  it('the patterns catch a phone number', () => {
    expect(PHONE_PATTERN.test('call +54 2944 000000')).toBe(true)
    expect(PHONE_PATTERN.test("start: '2023-02', end: '2026-07'")).toBe(false)
  })
})
