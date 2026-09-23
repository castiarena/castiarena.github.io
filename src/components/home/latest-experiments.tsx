import type { Route } from 'next'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

import { Stagger, StaggerItem } from '@/components/motion'
import { SectionHeading } from '@/components/shared'
import type { Experiment } from '@/content'
import { getLatestExperiments } from '@/content'
import { cn } from '@/lib/utils'

const EXTERNAL_HREF = /^https?:\/\//

function ExperimentRow({ experiment }: { experiment: Experiment }) {
  const isExternal = EXTERNAL_HREF.test(experiment.href)
  const isTodo = experiment.title.startsWith('TODO(agustin)')

  const content = (
    <>
      <div className="flex min-w-0 flex-col gap-1">
        <p className={cn('truncate text-[15px] font-semibold', isTodo && 'text-muted-foreground')}>
          {experiment.title}
        </p>
        <p className="line-clamp-1 text-sm text-muted-foreground">{experiment.description}</p>
      </div>
      <span className="flex shrink-0 items-center gap-1.5 font-mono text-xs text-muted-foreground">
        {experiment.year ?? '–'}
        <ArrowUpRight aria-hidden="true" className="size-3.5" />
      </span>
      {isExternal ? <span className="sr-only"> (opens in a new tab)</span> : null}
    </>
  )

  const className =
    'flex items-center justify-between gap-4 rounded-lg border border-border p-4 transition-colors hover:border-brand/40 focus-visible:outline-none'

  if (isExternal) {
    return (
      <a href={experiment.href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    )
  }

  return (
    <Link href={experiment.href as Route} className={className}>
      {content}
    </Link>
  )
}

/** 4 compact rows in a 2-column grid, per Home §4. */
export function LatestExperiments() {
  const experiments = getLatestExperiments(4)

  return (
    <section className="py-16 sm:py-24">
      <div className="container-page flex flex-col gap-8">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <SectionHeading title="Latest experiments" />
          <Link
            href={'/experiments/' as Route}
            className="group inline-flex items-center gap-1 text-sm font-medium text-brand"
          >
            All experiments
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform duration-200 ease-(--ease-brand) group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0"
            />
          </Link>
        </div>

        <Stagger stagger={0.06} as="ul" className="grid gap-4 md:grid-cols-2">
          {experiments.map((experiment) => (
            <StaggerItem key={experiment.slug} as="li">
              <ExperimentRow experiment={experiment} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
