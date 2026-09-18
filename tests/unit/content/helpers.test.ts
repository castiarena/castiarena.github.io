import { describe, expect, it, vi } from 'vitest'

import type { Experiment, Project } from '@/content/types'

function makeProject(
  overrides: Partial<Project> & Pick<Project, 'slug' | 'order' | 'featured'>,
): Project {
  return {
    title: overrides.slug,
    summary: 'summary',
    role: 'role',
    problem: 'problem',
    approach: [],
    outcomes: [],
    stack: [],
    cover: { src: '/images/profile.jpg', alt: 'cover' },
    links: {},
    ...overrides,
  }
}

function makeExperiment(
  overrides: Partial<Experiment> & Pick<Experiment, 'slug' | 'year'>,
): Experiment {
  return {
    title: overrides.slug,
    description: 'description',
    href: 'https://example.com',
    tags: [],
    ...overrides,
  }
}

vi.mock('@/content/projects', () => ({
  projects: [
    makeProject({ slug: 'd', order: 4, featured: true }),
    makeProject({ slug: 'a', order: 1, featured: true }),
    makeProject({ slug: 'b', order: 2, featured: false }),
    makeProject({ slug: 'c', order: 3, featured: true }),
    makeProject({ slug: 'e', order: 5, featured: true }),
  ],
}))

vi.mock('@/content/experiments', () => ({
  experiments: [
    makeExperiment({ slug: 'old', year: 2019, tags: ['css', 'Canvas'] }),
    makeExperiment({ slug: 'new-1', year: 2025, tags: ['webgl', 'css'] }),
    makeExperiment({ slug: 'mid', year: 2022, tags: ['audio'] }),
    makeExperiment({ slug: 'new-2', year: 2025, tags: ['canvas2d'] }),
    makeExperiment({ slug: 'older', year: 2018, tags: [] }),
    makeExperiment({ slug: 'mid-2', year: 2023, tags: ['webgl'] }),
  ],
}))

const {
  getAllProjectSlugs,
  getExperimentTags,
  getFeaturedProjects,
  getLatestExperiments,
  getProjectBySlug,
} = await import('@/content')

describe('getFeaturedProjects', () => {
  it('returns featured projects sorted by order, limited to 3 by default', () => {
    expect(getFeaturedProjects().map((p) => p.slug)).toEqual(['a', 'c', 'd'])
  })

  it('respects a custom limit', () => {
    expect(getFeaturedProjects(1).map((p) => p.slug)).toEqual(['a'])
    expect(getFeaturedProjects(10).map((p) => p.slug)).toEqual(['a', 'c', 'd', 'e'])
  })

  it('never includes non-featured projects', () => {
    expect(getFeaturedProjects(10).every((p) => p.featured)).toBe(true)
  })

  it('returns an empty array for a non-positive limit', () => {
    expect(getFeaturedProjects(0)).toEqual([])
    expect(getFeaturedProjects(-1)).toEqual([])
  })
})

describe('getProjectBySlug', () => {
  it('finds a project by slug', () => {
    expect(getProjectBySlug('b')?.order).toBe(2)
  })

  it('returns undefined for an unknown slug', () => {
    expect(getProjectBySlug('missing')).toBeUndefined()
  })
})

describe('getAllProjectSlugs', () => {
  it('returns every slug in display order', () => {
    expect(getAllProjectSlugs()).toEqual(['a', 'b', 'c', 'd', 'e'])
  })
})

describe('getLatestExperiments', () => {
  it('returns the 4 most recent experiments by default, newest first, stable on ties', () => {
    expect(getLatestExperiments().map((e) => e.slug)).toEqual(['new-1', 'new-2', 'mid-2', 'mid'])
  })

  it('respects a custom limit', () => {
    expect(getLatestExperiments(2).map((e) => e.slug)).toEqual(['new-1', 'new-2'])
    expect(getLatestExperiments(0)).toEqual([])
  })
})

describe('getExperimentTags', () => {
  it('returns unique tags sorted alphabetically', () => {
    expect(getExperimentTags()).toEqual(['audio', 'Canvas', 'canvas2d', 'css', 'webgl'])
  })
})
