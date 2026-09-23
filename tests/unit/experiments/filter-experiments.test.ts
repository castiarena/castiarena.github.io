import { describe, expect, it } from 'vitest'

import { filterExperiments } from '@/components/experiments'
import type { Experiment } from '@/content'

function experiment(slug: string, tags: string[]): Experiment {
  return {
    slug,
    title: slug,
    description: slug,
    href: `https://example.com/${slug}`,
    tags,
    year: 2026,
  }
}

const EXPERIMENTS = [
  experiment('a', ['Vite']),
  experiment('b', ['TypeScript']),
  experiment('c', ['Vite', 'TypeScript']),
  experiment('d', []),
]

const slugs = (list: Experiment[]) => list.map((item) => item.slug)

describe('filterExperiments', () => {
  it('returns everything, including untagged entries, for an empty selection', () => {
    expect(slugs(filterExperiments(EXPERIMENTS, []))).toEqual(['a', 'b', 'c', 'd'])
  })

  it('keeps only entries carrying the selected tag', () => {
    expect(slugs(filterExperiments(EXPERIMENTS, ['Vite']))).toEqual(['a', 'c'])
  })

  it('intersects rather than unions two tags (AND, not OR)', () => {
    expect(slugs(filterExperiments(EXPERIMENTS, ['Vite', 'TypeScript']))).toEqual(['c'])
  })

  it('is empty when no entry carries every selected tag', () => {
    expect(filterExperiments(EXPERIMENTS, ['Vite', 'Rust'])).toEqual([])
  })

  it('preserves the source order of the experiments it keeps', () => {
    const reversed = [...EXPERIMENTS].reverse()
    expect(slugs(filterExperiments(reversed, ['Vite']))).toEqual(['c', 'a'])
  })

  it('does not mutate its input', () => {
    const input = [...EXPERIMENTS]
    filterExperiments(input, ['Vite'])
    expect(slugs(input)).toEqual(['a', 'b', 'c', 'd'])
  })
})
