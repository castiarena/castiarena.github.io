import type { Route } from 'next'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { ParallaxLayer, Reveal } from '@/components/motion'
import { TagList } from '@/components/shared'
import type { Project } from '@/content'
import { cn } from '@/lib/utils'

import { isTodoCopy } from './todo-copy'

interface ProjectIndexRowProps {
  project: Project
  index: number
  /** Cover on the right / text on the left — alternates per row. */
  reversed: boolean
}

function metaLine(project: Project): string {
  return project.period ? `${project.role} · ${project.period}` : project.role
}

function ProjectIndexRow({ project, index, reversed }: ProjectIndexRowProps) {
  const indexLabel = String(index).padStart(2, '0')

  return (
    <Reveal as="li" className="list-none">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-12">
        {/* DOM order is always text-then-cover (screen-reader order); the visual side swap and
            the mobile cover-first stacking are both done with `order`, never by duplicating markup. */}
        <div
          className={cn(
            'order-2 flex flex-col gap-4 lg:basis-5/12',
            reversed ? 'lg:order-1' : 'lg:order-2',
          )}
        >
          <p className="font-mono text-xs text-muted-foreground">{indexLabel}</p>
          <h2
            className={cn(
              'text-h2 font-semibold text-balance',
              isTodoCopy(project.title) && 'text-muted-foreground',
            )}
          >
            {project.title}
          </h2>
          <p className="max-w-[58ch] text-base text-pretty text-muted-foreground">
            {project.summary}
          </p>
          <p className="font-mono text-xs text-muted-foreground">{metaLine(project)}</p>
          <TagList tags={project.stack} />
          <Link
            href={`/projects/${project.slug}/` as Route}
            className="group inline-flex w-fit items-center gap-1 text-sm font-medium text-brand"
          >
            Read case study
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform duration-200 ease-(--ease-brand) group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0"
            />
          </Link>
        </div>

        <div
          className={cn(
            'relative order-1 aspect-[16/10] overflow-hidden rounded-lg lg:aspect-[4/3] lg:basis-7/12',
            reversed ? 'lg:order-2' : 'lg:order-1',
          )}
        >
          <ParallaxLayer offset={24} className="absolute inset-0">
            {/* Sized with `aspect-*` (needs only a definite width, which a block box always has),
                not `size-full`/percentage `inset-0`: once motion applies its translate, `
                ParallaxLayer`'s inner `m.div` gets a `transform`, which makes it a new CSS
                containing block — but `m.div` has no *height* of its own (it only sizes to
                in-flow content), so a percentage-height descendant collapses to 0 against it. */}
            <div className="relative aspect-[16/10] w-full lg:aspect-[4/3]">
              <Image
                src={project.cover.src}
                alt={project.cover.alt}
                fill
                sizes="(min-width: 1024px) 58vw, 100vw"
                // `cover`: the placeholder SVGs are flat gradients with nothing to crop, so the
                // artwork fills the frame edge to edge as reference screen 06 shows.
                className="object-cover"
              />
            </div>
          </ParallaxLayer>
        </div>
      </div>
    </Reveal>
  )
}

export interface ProjectsIndexProps {
  projects: Project[]
  className?: string
}

/** The `/projects/` alternating rows (`03-page-specs.md` → Projects index), sorted by `order`. */
export function ProjectsIndex({ projects, className }: ProjectsIndexProps) {
  const sorted = [...projects].sort((a, b) => a.order - b.order)

  return (
    <ol className={cn('flex flex-col gap-12 lg:gap-24', className)}>
      {sorted.map((project, position) => (
        <ProjectIndexRow
          key={project.slug}
          project={project}
          index={position + 1}
          reversed={position % 2 === 1}
        />
      ))}
    </ol>
  )
}
