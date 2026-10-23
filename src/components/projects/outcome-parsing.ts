export interface ParsedOutcome {
  value: number
  unit: '%' | 'x' | '+'
  label: string
}

// Matches a leading number + unit, e.g. "35% more platform scalability…" or "2x faster builds".
const NUMERIC_OUTCOME = /^(\d+(?:\.\d+)?)\s*(%|x|\+)\s+(.+)$/i

/**
 * `Project.outcomes` is unstructured CV prose (`src/content/schema.ts`), not `{ value, unit,
 * label }`. Outcomes that open with a number render as a `StatTile`; everything else falls back
 * to a text card in `project-outcomes.tsx` (dashed and muted only for `TODO(agustin)` placeholders).
 */
export function parseOutcome(outcome: string): ParsedOutcome | null {
  const match = NUMERIC_OUTCOME.exec(outcome.trim())
  if (!match) return null
  const [, value, unit, label] = match
  return { value: Number(value), unit: unit as ParsedOutcome['unit'], label: label! }
}
