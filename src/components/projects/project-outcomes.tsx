import { StatTile, type StatTileAccent } from '@/components/shared'

import { parseOutcome } from './outcome-parsing'
import { splitTodoCopy } from './todo-copy'

// Same accent order as the Home impact strip (`03-page-specs.md` → Home §2).
const ACCENTS: StatTileAccent[] = ['brand', 'brand-2', 'brand-4', 'brand-3']

export interface ProjectOutcomesProps {
  outcomes: string[]
}

/**
 * `h2` + a grid of outcome cards (`03-page-specs.md` → Project detail §5):
 * - an outcome with a leading number renders as a `StatTile`;
 * - a `TODO(agustin)` placeholder renders as a dashed, muted card, so it reads as unfinished;
 * - any other real text outcome renders as a solid card on the same surface as
 *   `StatTile variant="card"`, with the text in `--foreground` at body size.
 */
export function ProjectOutcomes({ outcomes }: ProjectOutcomesProps) {
  if (outcomes.length === 0) return null

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {outcomes.map((outcome, index) => {
        const parsed = parseOutcome(outcome)
        if (parsed) {
          return (
            <StatTile
              key={`${index}-${outcome}`}
              variant="card"
              value={parsed.value}
              unit={parsed.unit}
              label={parsed.label}
              accent={ACCENTS[index % ACCENTS.length]!}
            />
          )
        }

        const todo = splitTodoCopy(outcome)
        if (!todo) {
          return (
            <div
              key={`${index}-${outcome}`}
              data-slot="outcome-card"
              className="flex flex-col rounded-lg border border-border bg-card p-5"
            >
              <p className="text-[15px] text-pretty text-foreground">{outcome}</p>
            </div>
          )
        }

        return (
          <div
            key={`${index}-${outcome}`}
            data-slot="outcome-todo"
            className="flex flex-col gap-2 rounded-lg border border-dashed border-muted-foreground/40 p-5"
          >
            <p className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
              {todo.eyebrow}
            </p>
            <p className="text-sm text-muted-foreground">{todo.body}</p>
          </div>
        )
      })}
    </div>
  )
}
