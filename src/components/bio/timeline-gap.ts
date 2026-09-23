import type { Experience } from '@/content/types'
import { formatRange } from '@/lib/format'

function monthIndex(value: string): number {
  const [year = 0, month = 0] = value.split('-').map(Number)
  return year * 12 + month
}

/**
 * Detects gaps between consecutive roles (`experiences` is newest-first; this sorts a copy
 * chronologically) that the CV doesn't account for, and returns a `TODO(agustin)` note per gap
 * so an undocumented gap surfaces on the page instead of silently vanishing between two dates.
 */
export function getTimelineGapNotes(experiences: Experience[]): string[] {
  const chronological = [...experiences].sort((a, b) => monthIndex(a.start) - monthIndex(b.start))
  const notes: string[] = []

  for (let i = 1; i < chronological.length; i++) {
    const previous = chronological[i - 1]
    const current = chronological[i]
    if (!previous || !current || previous.end === 'present') continue
    if (monthIndex(current.start) - monthIndex(previous.end) > 1) {
      notes.push(
        `TODO(agustin): confirm whether the ${formatRange(previous.end, current.start)} gap should be shown.`,
      )
    }
  }

  return notes
}
