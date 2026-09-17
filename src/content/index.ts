import { experiments } from './experiments'
import { projects } from './projects'
import type { Experiment, Project } from './types'

export { profile } from './profile'
export { experiences } from './experience'
export { achievements, skillGroups, courses } from './skills'
export { experiments } from './experiments'
export { projects } from './projects'
export type * from './types'

function byOrder(a: Project, b: Project): number {
  return a.order - b.order
}

/** Featured projects sorted by `order` (ascending), capped at `limit`. */
export function getFeaturedProjects(limit = 3): Project[] {
  return projects
    .filter((project) => project.featured)
    .sort(byOrder)
    .slice(0, Math.max(0, limit))
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug)
}

/** All project slugs, in display order. Used by `generateStaticParams`. */
export function getAllProjectSlugs(): string[] {
  return [...projects].sort(byOrder).map((project) => project.slug)
}

/** Most recent experiments first (by `year`, stable for ties), capped at `limit`. */
export function getLatestExperiments(limit = 4): Experiment[] {
  return experiments
    .map((experiment, index) => ({ experiment, index }))
    .sort((a, b) => b.experiment.year - a.experiment.year || a.index - b.index)
    .slice(0, Math.max(0, limit))
    .map(({ experiment }) => experiment)
}

/** Unique experiment tags, sorted alphabetically (case-insensitive). */
export function getExperimentTags(): string[] {
  const tags = new Set(experiments.flatMap((experiment) => experiment.tags))
  return [...tags].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
}
