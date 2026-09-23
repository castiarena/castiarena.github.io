import { ProseList, TagList } from '@/components/shared'
import { Reveal } from '@/components/motion'
import type { Experience } from '@/content/types'
import { durationLabel, formatRange } from '@/lib/format'

export interface TimelineNodeProps {
  experience: Experience
  /** Last node in the list draws no connector below its dot. */
  last?: boolean
}

/** One role in the experience timeline: date gutter, rail dot, title, intro, bullets and stack. */
export function TimelineNode({ experience, last = false }: TimelineNodeProps) {
  const range = formatRange(experience.start, experience.end)
  const duration = durationLabel(experience.start, experience.end)

  return (
    <Reveal
      as="li"
      className="relative grid grid-cols-[28px_1fr] gap-x-4 pb-12 last:pb-0 lg:grid-cols-[140px_28px_1fr] lg:gap-x-6"
    >
      <div className="hidden flex-col gap-0.5 font-mono text-xs text-muted-foreground lg:flex">
        <span>{range}</span>
        <span>{duration}</span>
      </div>

      <div className="relative flex justify-center">
        {!last ? (
          <span aria-hidden="true" className="absolute top-3 bottom-0 w-px bg-signature" />
        ) : null}
        <span
          aria-hidden="true"
          className="relative z-10 mt-[5px] size-2 rounded-full bg-brand-3 ring-2 ring-background"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-0.5 font-mono text-xs text-muted-foreground lg:hidden">
          <span>{range}</span>
          <span>{duration}</span>
        </div>
        <h3 className="text-[17px] font-semibold">{experience.title}</h3>
        {experience.companyUrl ? (
          <a
            href={experience.companyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit text-sm text-muted-foreground hover:text-foreground"
          >
            {experience.company}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          <p className="text-sm text-muted-foreground">{experience.company}</p>
        )}
        {experience.intro ? (
          <p className="text-[15px] text-foreground">{experience.intro}</p>
        ) : null}
        <ProseList items={experience.highlights} className="mt-1" />
        {experience.stack?.length ? <TagList tags={experience.stack} className="mt-1" /> : null}
      </div>
    </Reveal>
  )
}
