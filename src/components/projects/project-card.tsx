import type { Route } from 'next'
import Link from 'next/link'

import { HoverLift } from '@/components/motion'
import { CoverGradient, TagList } from '@/components/shared'
import type { Project } from '@/content'
import { cn } from '@/lib/utils'

import { isTodoCopy } from './todo-copy'

export interface ProjectCardProps {
  project: Project
  /** 1-based position, rendered as the mono index over the cover (e.g. "01"). */
  index?: number
  /**
   * Accepted for parity with `ExperimentCard`'s contract; unused here because the cover is a
   * live `CoverGradient`, not a `next/image`, so there is no LCP image to prioritise.
   */
  priority?: boolean
}

/**
 * Card used on Home's "Selected projects" (`02-component-specs.md` → ProjectCard) and reused
 * wherever a compact project preview is needed. The full projects index uses its own alternating
 * row layout instead — see `projects-index.tsx`.
 */
export function ProjectCard({ project, index }: ProjectCardProps) {
  const indexLabel = typeof index === 'number' ? String(index).padStart(2, '0') : null

  return (
    <HoverLift className="h-full">
      <Link
        href={`/projects/${project.slug}/` as Route}
        className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card focus-visible:outline-none"
      >
        <div className="relative aspect-[16/10] shrink-0 overflow-hidden rounded-t-lg">
          <CoverGradient seed={project.slug} />
          {indexLabel ? (
            <span
              aria-hidden="true"
              className="absolute bottom-3 left-3 font-mono text-xs text-white/90"
            >
              {indexLabel}
            </span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <h3
            className={cn(
              'text-[17px] font-semibold text-balance',
              isTodoCopy(project.title) && 'text-muted-foreground',
            )}
          >
            {project.title}
          </h3>
          <p className="line-clamp-3 text-sm text-muted-foreground">{project.summary}</p>
          <TagList tags={project.stack} max={3} className="mt-auto" />
        </div>
      </Link>
    </HoverLift>
  )
}
