import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PageHeader } from '@/components/shared'
import { getAllProjectSlugs, getProjectBySlug } from '@/content'

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
  }
}

// STUB — implemented by agent 2.5
export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) notFound()

  return <PageHeader eyebrow={project.role} title={project.title} description={project.summary} />
}
