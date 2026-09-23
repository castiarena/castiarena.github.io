import { describe, expect, it } from 'vitest'

import { getTimelineGapNotes } from '@/components/bio/timeline-gap'
import type { Experience } from '@/content/types'

function role(overrides: Partial<Experience>): Experience {
  return {
    id: 'role',
    company: 'Co',
    title: 'Engineer',
    start: '2020-01',
    end: '2020-12',
    intro: '',
    highlights: ['Did a thing'],
    ...overrides,
  }
}

describe('getTimelineGapNotes', () => {
  it('returns nothing for back-to-back roles', () => {
    const experiences = [
      role({ id: 'newer', start: '2021-01', end: 'present' }),
      role({ id: 'older', start: '2020-01', end: '2020-12' }),
    ]
    expect(getTimelineGapNotes(experiences)).toEqual([])
  })

  it('flags an unrepresented gap between two roles, regardless of input order', () => {
    const experiences = [
      role({ id: 'newer', start: '2020-01', end: 'present' }),
      role({ id: 'older', start: '2015-11', end: '2018-10' }),
    ]
    const notes = getTimelineGapNotes(experiences)
    expect(notes).toHaveLength(1)
    expect(notes[0]).toContain('TODO(agustin)')
    expect(notes[0]).toContain('Oct 2018')
    expect(notes[0]).toContain('Jan 2020')
  })

  it('does not flag a gap when the earlier role is still ongoing', () => {
    const experiences = [role({ id: 'only', start: '2020-01', end: 'present' })]
    expect(getTimelineGapNotes(experiences)).toEqual([])
  })
})
