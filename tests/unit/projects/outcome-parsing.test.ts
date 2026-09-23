import { describe, expect, it } from 'vitest'

import { parseOutcome } from '@/components/projects/outcome-parsing'

describe('parseOutcome', () => {
  it('parses a leading percentage', () => {
    expect(
      parseOutcome('35% more platform scalability through the microservices architecture.'),
    ).toEqual({
      value: 35,
      unit: '%',
      label: 'more platform scalability through the microservices architecture.',
    })
  })

  it('parses "x" and "+" units', () => {
    expect(parseOutcome('2x faster builds.')).toEqual({
      value: 2,
      unit: 'x',
      label: 'faster builds.',
    })
    expect(parseOutcome('4+ teams onboarded.')).toEqual({
      value: 4,
      unit: '+',
      label: 'teams onboarded.',
    })
  })

  it('returns null for prose without a leading number', () => {
    expect(
      parseOutcome('Shipped product improvements in close partnership with stakeholders.'),
    ).toBeNull()
  })

  it('returns null for TODO(agustin) placeholders', () => {
    expect(
      parseOutcome('TODO(agustin): Add 2–4 outcomes, with numbers you can share publicly.'),
    ).toBeNull()
  })
})
