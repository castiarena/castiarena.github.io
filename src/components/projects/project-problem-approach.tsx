import { cn } from '@/lib/utils'

import { isTodoCopy } from './todo-copy'

export interface ProjectProblemApproachProps {
  problem: string
  approach: string[]
}

/** "The problem" / "Approach" two-column section (`03-page-specs.md` → Project detail §4). */
export function ProjectProblemApproach({ problem, approach }: ProjectProblemApproachProps) {
  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-12">
      <div className="flex flex-col gap-4">
        <h2 className="text-h2 font-semibold">The problem</h2>
        <p
          className={cn(
            'text-[15px] leading-relaxed text-pretty',
            isTodoCopy(problem) ? 'text-muted-foreground' : 'text-foreground',
          )}
        >
          {problem}
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-h2 font-semibold">Approach</h2>
        <ol className="flex list-none flex-col gap-4">
          {approach.map((item, position) => (
            <li key={`${position}-${item}`} className="flex gap-3">
              <span aria-hidden="true" className="pt-0.5 font-mono text-xs text-muted-foreground">
                {String(position + 1).padStart(2, '0')}
              </span>
              <span
                className={cn(
                  'text-[15px]',
                  isTodoCopy(item) ? 'text-muted-foreground' : 'text-foreground',
                )}
              >
                {item}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
