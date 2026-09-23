import type { Route } from 'next'
import Link from 'next/link'

import type { Project } from '@/content'

export interface ProjectFooterNavProps {
  prev: Project | null
  next: Project | null
}

/** Prev / all-projects / next footer (`03-page-specs.md` → Project detail §7). */
export function ProjectFooterNav({ prev, next }: ProjectFooterNavProps) {
  return (
    <nav
      aria-label="Project navigation"
      className="flex flex-col items-center gap-6 pt-12 hairline-t sm:flex-row sm:justify-between"
    >
      <div className="order-2 w-full sm:order-1 sm:w-1/3">
        {prev ? (
          <Link href={`/projects/${prev.slug}/` as Route} className="group flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Previous</span>
            <span className="text-[15px] font-medium text-foreground group-hover:text-brand">
              {prev.title}
            </span>
          </Link>
        ) : (
          <p className="text-sm text-muted-foreground">First project</p>
        )}
      </div>

      <Link
        href={'/projects/' as Route}
        className="order-1 font-mono text-sm text-brand hover:underline sm:order-2"
      >
        All projects
      </Link>

      <div className="order-3 w-full text-right sm:w-1/3">
        {next ? (
          <Link
            href={`/projects/${next.slug}/` as Route}
            className="group flex flex-col gap-1 sm:items-end"
          >
            <span className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
              Next
            </span>
            <span className="text-[15px] font-medium text-foreground group-hover:text-brand">
              {next.title}
            </span>
          </Link>
        ) : (
          <p className="text-sm text-muted-foreground">Last project</p>
        )}
      </div>
    </nav>
  )
}
