import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  MOTION_DURATION_REVEAL,
  MOTION_DURATION_UI,
  MOTION_EASE,
  navUnderlineTransition,
} from '@/components/motion'

// Motion budget from `01-design-tokens.md` §6: UI interactions cap at 400ms, reveals at 700ms.
const UI_CAP = 0.4
const REVEAL_CAP = 0.7

const MOTION_SRC_DIR = join(process.cwd(), 'src/components/motion')

/** Every numeric `duration:` literal (in seconds) written anywhere in the motion primitives. */
function allSourceDurations(): number[] {
  const durations: number[] = []
  for (const file of readdirSync(MOTION_SRC_DIR)) {
    if (!/\.(ts|tsx)$/.test(file)) continue
    const src = readFileSync(join(MOTION_SRC_DIR, file), 'utf8')
    for (const match of src.matchAll(/duration:\s*([\d.]+|MOTION_DURATION_\w+)/g)) {
      const literal = match[1]
      if (literal === 'MOTION_DURATION_UI') durations.push(MOTION_DURATION_UI)
      else if (literal === 'MOTION_DURATION_REVEAL') durations.push(MOTION_DURATION_REVEAL)
      else durations.push(Number(literal))
    }
  }
  return durations
}

describe('motion duration budget', () => {
  it('the shared UI and reveal constants sit within their caps', () => {
    expect(MOTION_DURATION_UI).toBeLessThanOrEqual(UI_CAP)
    expect(MOTION_DURATION_REVEAL).toBeLessThanOrEqual(REVEAL_CAP)
  })

  it('the nav underline transition uses the UI budget, not the reveal budget', () => {
    expect(navUnderlineTransition.duration).toBeLessThanOrEqual(UI_CAP)
    expect(navUnderlineTransition.ease).toEqual(MOTION_EASE)
  })

  it('every duration literal in the motion primitives stays within the reveal cap (the outer bound)', () => {
    const durations = allSourceDurations()
    expect(durations.length).toBeGreaterThan(0)
    for (const duration of durations) {
      expect(duration).toBeLessThanOrEqual(REVEAL_CAP)
    }
  })

  it('uses the approved brand easing everywhere (cubic-bezier(0.22, 1, 0.36, 1))', () => {
    expect(MOTION_EASE).toEqual([0.22, 1, 0.36, 1])
  })
})
