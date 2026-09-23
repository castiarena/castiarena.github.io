import { describe, expect, it } from 'vitest'

import { getCoverGradientStops as componentStops } from '@/components/shared'
import { getCoverGradientStops as scriptStops } from '@/components/projects/generate-covers.mjs'
import { projects } from '@/content/projects'

// `generate-covers.mjs` deliberately re-implements `CoverGradient`'s gradient math (see its own
// header comment) because a standalone SVG has no host stylesheet to resolve `var(--brand)`
// against. This test is what keeps that copy honest if either side changes.
describe('generate-covers.mjs stays in sync with CoverGradient', () => {
  it('produces identical stops to the component, for every project slug', () => {
    for (const project of projects) {
      expect(scriptStops(project.slug)).toEqual(componentStops(project.slug))
    }
  })

  it('agrees on arbitrary seeds too, not just the current project slugs', () => {
    for (const seed of ['a', 'riverside', 'micro-frontend-migration', 'zzz-999']) {
      expect(scriptStops(seed)).toEqual(componentStops(seed))
    }
  })
})
