// `src/content` ships CV-derived copy alongside literal `TODO(agustin): …` placeholders (see
// `src/content/projects.ts`'s header comment) — content stays as-is, this just tells the two apart
// so placeholder copy can render in `--muted-foreground` per `03-page-specs.md` → Project detail.
const TODO_PREFIX = /^TODO\(agustin\):\s*/i

/** Whether `text` is (or starts with) a `TODO(agustin)` placeholder. */
export function isTodoCopy(text: string): boolean {
  return TODO_PREFIX.test(text.trim())
}

export interface SplitTodoCopy {
  eyebrow: string
  body: string
}

/** Splits `TODO(agustin): <rest>` into a mono eyebrow and the remaining body text, or `null`. */
export function splitTodoCopy(text: string): SplitTodoCopy | null {
  const trimmed = text.trim()
  const match = TODO_PREFIX.exec(trimmed)
  if (!match) return null
  return { eyebrow: 'TODO(agustin)', body: trimmed.slice(match[0].length) }
}
