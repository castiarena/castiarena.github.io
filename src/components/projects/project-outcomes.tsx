import { StatTile, type StatTileAccent } from '@/components/shared'

import { parseOutcome } from './outcome-parsing'
import { splitTodoCopy } from './todo-copy'

// Same accent order as the Home impact strip (`03-page-specs.md` → Home §2).
const ACCENTS: StatTileAccent[] = ['brand', 'brand-2', 'brand-4', 'brand-3']

export interface ProjectOutcomesProps {
  outcomes: string[]
}

/**
 * `h2` + a grid of `StatTile`s (`03-page-specs.md` → Project detail §5). An outcome with no
 * leading number (every `TODO(agustin)` placeholder in the current content, and any real
 * outcome without a shareable metric) renders as a dashed, muted fallback card instead.
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
        return (
          <div
            key={`${index}-${outcome}`}
            className="flex flex-col gap-2 rounded-lg border border-dashed border-muted-foreground/40 p-5"
          >
            {todo ? (
              <>
                <p className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
                  {todo.eyebrow}
                </p>
                <p className="text-sm text-muted-foreground">{todo.body}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{outcome}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
