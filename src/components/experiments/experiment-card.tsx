import { ArrowUpRightIcon } from 'lucide-react'
import Image from 'next/image'

import { HoverLift } from '@/components/motion'
import { CoverGradient, TagList } from '@/components/shared'
import type { Experiment } from '@/content'
import { isTodoCopy } from '@/components/projects/todo-copy'
import { cn } from '@/lib/utils'

export interface ExperimentCardProps {
  experiment: Experiment
  /** Set on the first row's cards so a real screenshot isn't lazy-loaded below the LCP. */
  priority?: boolean
}

/**
 * Experiment card from screen 05: the same shell as `ProjectCard`, but the cover carries a
 * 2-letter monogram derived from the title and an ↗ badge, and the footer pairs the tag list with
 * the year.
 *
 * The card body is a single link whose accessible name is the title, so screen-reader users get
 * one "Portfolio v1, link" rather than a cover/title/tag pile-up. `sourceHref` therefore renders
 * as a sibling link *below* the card body — nesting it inside would produce an invalid `<a>` in
 * `<a>` and an axe violation.
 */
export function ExperimentCard({ experiment, priority = false }: ExperimentCardProps) {
  const { title, description, href, sourceHref, image, tags, year } = experiment
  const isPlaceholder = isTodoCopy(title)

  return (
    <HoverLift className="h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 flex-col focus-visible:outline-none"
        >
          <div className="relative aspect-[16/10] shrink-0 overflow-hidden rounded-t-lg">
            {image ? (
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority={priority}
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              <CoverGradient seed={experiment.slug} label={title} monogram />
            )}
            <ArrowUpRightIcon
              aria-hidden="true"
              className="absolute top-3 right-3 size-4 text-white/80"
            />
          </div>

          <div className="flex flex-1 flex-col gap-3 p-5">
            <h3
              className={cn(
                'text-h3 text-balance',
                isPlaceholder ? 'text-muted-foreground' : 'text-foreground',
              )}
            >
              {title}
              <span className="sr-only"> (opens in a new tab)</span>
            </h3>
            <p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
            <div className="mt-auto flex items-center justify-between gap-3 pt-1">
              <TagList tags={tags} max={3} label={`Tags for ${title}`} />
              <span className="shrink-0 font-mono text-xs text-muted-foreground">
                {/* En dash, not a hyphen — `02-component-specs.md`: "Missing year renders an en dash". */}
                {year ? year : '–'}
              </span>
            </div>
          </div>
        </a>

        {sourceHref ? (
          <div className="px-5 pb-5">
            <a
              href={sourceHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-brand hover:underline"
            >
              Source
              <span className="sr-only"> code for {title} (opens in a new tab)</span>
            </a>
          </div>
        ) : null}
      </article>
    </HoverLift>
  )
}
