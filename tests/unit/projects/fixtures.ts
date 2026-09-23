import type { Project } from '@/content'

/**
 * `next/link` normalises away the trailing slash outside a real Next.js router context (there is
 * no `next.config`'s `trailingSlash: true` to read here) — the app itself renders it correctly,
 * verified at build time by `verify-export.mjs`. Tests match either form so they don't couple to
 * that test-harness quirk.
 */
export function projectHrefPattern(slug: string): RegExp {
  return new RegExp(`^/projects/${slug}/?$`)
}

/** A fully-populated project, deliberately free of `TODO(agustin)` copy, for isolated tests. */
export function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    slug: 'test-project',
    title: 'Test project',
    summary: 'A short summary of the test project.',
    role: 'Senior Engineer',
    period: 'Jan 2020 — Feb 2021',
    problem: 'A real problem statement, taken straight from the CV.',
    approach: ['Did the first thing.', 'Did the second thing.', 'Did the third thing.'],
    outcomes: ['35% faster page loads.', 'Shipped without a single incident.'],
    stack: ['React', 'TypeScript', 'GraphQL', 'Node'],
    cover: { src: '/images/projects/test-project.svg', alt: 'Test project cover' },
    links: {},
    featured: true,
    order: 1,
    ...overrides,
  }
}
