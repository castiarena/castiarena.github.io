import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/shared'
import type { Project } from '@/content'

import { ProjectFooterNav } from './project-footer-nav'
import { ProjectGallery } from './project-gallery'
import { ProjectHero } from './project-hero'
import { ProjectOutcomes } from './project-outcomes'
import { ProjectProblemApproach } from './project-problem-approach'

export interface ProjectDetailProps {
  project: Project
  prev: Project | null
  next: Project | null
}

/** Full `/projects/[slug]/` composition (`03-page-specs.md` → Project detail). */
export function ProjectDetail({ project, prev, next }: ProjectDetailProps) {
  return (
    <Container as="article" className="flex flex-col gap-16 py-12 sm:py-16">
      <nav aria-label="Breadcrumb" className="font-mono text-xs">
        <ol className="flex items-center gap-2">
          <li>
            <Link href={'/projects/' as Route} className="text-brand hover:underline">
              Projects
            </Link>
          </li>
          <li aria-hidden="true" className="text-muted-foreground">
            /
          </li>
          <li aria-current="page" className="text-muted-foreground">
            {project.title}
          </li>
        </ol>
      </nav>

      <ProjectHero project={project} />

      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg sm:aspect-[21/9]">
        <Image
          src={project.cover.src}
          alt={project.cover.alt}
          fill
          sizes="100vw"
          // `cover`: the placeholder SVGs are flat gradients with nothing to crop, so the artwork
          // fills the frame edge to edge as reference screen 07 shows.
          className="object-cover"
          priority
        />
      </div>

      <ProjectProblemApproach problem={project.problem} approach={project.approach} />

      <div className="flex flex-col gap-6">
        <h2 className="text-h2 font-semibold">Outcomes</h2>
        <ProjectOutcomes outcomes={project.outcomes} />
      </div>

      <ProjectGallery project={project} />

      <ProjectFooterNav prev={prev} next={next} />
    </Container>
  )
}
