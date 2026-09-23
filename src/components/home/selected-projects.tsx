import { ArrowRight } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'

import { Stagger, StaggerItem } from '@/components/motion'
import { ProjectCard } from '@/components/projects'
import { SectionHeading } from '@/components/shared'
import { getFeaturedProjects } from '@/content'

/**
 * `SectionHeading` (F2, `shared/section-heading.tsx`) doesn't take an action-slot prop even
 * though `02-component-specs.md` describes one ("optional right-aligned action slot") — this
 * wraps it in a flex row instead of forking the component. Flagged as a CCR in the handoff so F2
 * can add the slot for every section that needs an "All X →" link, not just this one.
 */
export function SelectedProjects() {
  const projects = getFeaturedProjects(3)

  return (
    <section className="py-16 sm:py-24">
      <div className="container-page flex flex-col gap-8">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <SectionHeading title="Selected projects" />
          <Link
            href={'/projects/' as Route}
            className="group inline-flex items-center gap-1 text-sm font-medium text-brand"
          >
            All projects
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform duration-200 ease-(--ease-brand) group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0"
            />
          </Link>
        </div>

        <Stagger stagger={0.06} as="ul" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <StaggerItem key={project.slug} as="li">
              <ProjectCard project={project} index={index + 1} />
            </StaggerItem>
          ))}
        </Stagger>

        <p className="font-mono text-xs text-muted-foreground">
          Covers are generated placeholders until real case-study assets land.
        </p>
      </div>
    </section>
  )
}
