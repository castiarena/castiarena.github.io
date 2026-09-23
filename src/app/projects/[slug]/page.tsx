import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ProjectDetail } from '@/components/projects'
import { getAllProjectSlugs, getProjectBySlug } from '@/content'
import type { Project } from '@/content'

// Explicit props type (instead of the generated global `PageProps<'/projects/[slug]'>`) so
// `pnpm typecheck` works on a fresh clone before `.next/types` exists. In Next 16 `params` is a Promise.
interface ProjectPageProps {
  params: Promise<{ slug: string }>
}

export const dynamicParams = false

export function generateStaticParams(): { slug: string }[] {
  return getAllProjectSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) return {}

  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}/` },
    openGraph: {
      title: project.title,
      description: project.summary,
      images: [{ url: project.cover.src }],
    },
  }
}

/** `prev`/`next` in display order (`order`, ascending) — `null` at either end of the list. */
function getAdjacentProjects(slug: string): { prev: Project | null; next: Project | null } {
  const orderedSlugs = getAllProjectSlugs()
  const position = orderedSlugs.indexOf(slug)
  const prevSlug = position > 0 ? orderedSlugs[position - 1] : undefined
  const nextSlug =
    position >= 0 && position < orderedSlugs.length - 1 ? orderedSlugs[position + 1] : undefined

  return {
    prev: prevSlug ? (getProjectBySlug(prevSlug) ?? null) : null,
    next: nextSlug ? (getProjectBySlug(nextSlug) ?? null) : null,
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) notFound()

  const { prev, next } = getAdjacentProjects(slug)

  return <ProjectDetail project={project} prev={prev} next={next} />
}
