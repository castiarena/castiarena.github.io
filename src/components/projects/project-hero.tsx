import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import type { Project } from '@/content'
import { cn } from '@/lib/utils'

import { isTodoCopy } from './todo-copy'

/**
 * `NEXT_PUBLIC_DEPLOY_ENV` isn't wired by any agent yet (`03-page-specs.md` → Project detail §2),
 * so it is `undefined` in every environment today and the badge shows — the intended default
 * until whoever wires deploys sets it to `'production'`.
 */
const IS_DRAFT = process.env.NEXT_PUBLIC_DEPLOY_ENV !== 'production'

interface ProjectMetaCardProps {
  project: Project
}

function ProjectMetaCard({ project }: ProjectMetaCardProps) {
  return (
    <div className="flex w-full flex-col gap-5 rounded-lg border border-border bg-card p-5 lg:w-80 lg:shrink-0">
      <div className="flex flex-col gap-1">
        <p className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">Role</p>
        <p className="text-[15px] text-foreground">{project.role}</p>
      </div>
      {project.period ? (
        <div className="flex flex-col gap-1">
          <p className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
            Period
          </p>
          <p className="text-[15px] text-foreground">{project.period}</p>
        </div>
      ) : null}
      {project.stack.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
            Stack
          </p>
          <ul aria-label="Stack" className="flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <li key={tech}>
                <Badge variant="secondary">{tech}</Badge>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

export interface ProjectHeroProps {
  project: Project
}

/** Breadcrumb-adjacent hero: draft badge, title, summary, link buttons, and the meta card. */
export function ProjectHero({ project }: ProjectHeroProps) {
  const links = [
    project.links.live ? { label: 'View live', href: project.links.live } : null,
    project.links.repo ? { label: 'View source', href: project.links.repo } : null,
  ].filter((link): link is { label: string; href: string } => link !== null)

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
      <div className="flex flex-1 flex-col gap-5">
        {IS_DRAFT ? (
          <span className="inline-flex w-fit items-center rounded-full border border-warning/50 px-3 py-1 font-mono text-[11px] tracking-[0.08em] text-warning uppercase">
            Draft · Preview only
          </span>
        ) : null}
        <h1
          className={cn(
            'text-h1 font-semibold text-balance',
            isTodoCopy(project.title) && 'text-muted-foreground',
          )}
        >
          {project.title}
        </h1>
        <p className="max-w-[58ch] text-lg text-pretty text-muted-foreground">{project.summary}</p>
        {links.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {/* `buttonVariants` directly, not `<Button asChild>` — see CCR-U5-1 in docs/handoffs/U5.md:
                Button's `{loading ? <Icon/> : null}{children}` always passes 2 children to Slot
                when `asChild` is set, which throws unless `loading` is true. */}
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: 'outline' })}
              >
                {link.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ))}
          </div>
        ) : (
          <p className="inline-flex w-fit items-center rounded-md border border-dashed border-muted-foreground/40 px-4 py-2 text-sm text-muted-foreground">
            TODO(agustin): live link, if any can be public
          </p>
        )}
      </div>
      <ProjectMetaCard project={project} />
    </div>
  )
}
