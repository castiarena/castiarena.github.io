import { describe, expect, it } from 'vitest'

import type { ISODateMonth } from '@/content/types'
import { durationLabel, formatMonth, formatRange } from '@/lib/format'

describe('formatMonth', () => {
  it('formats YYYY-MM as a short month and year', () => {
    expect(formatMonth('2023-02')).toBe('Feb 2023')
    expect(formatMonth('2015-11')).toBe('Nov 2015')
    expect(formatMonth('2020-01')).toBe('Jan 2020')
    expect(formatMonth('2026-12')).toBe('Dec 2026')
  })

  it('throws a readable error for malformed months', () => {
    expect(() => formatMonth('2023-13')).toThrow(/Invalid month "2023-13"/)
    expect(() => formatMonth('2023-2' as ISODateMonth)).toThrow(RangeError)
  })
})

describe('formatRange', () => {
  it('joins start and end with an em dash', () => {
    expect(formatRange('2023-02', '2026-07')).toBe('Feb 2023 — Jul 2026')
  })

  it('renders an open range as Present', () => {
    expect(formatRange('2023-02', 'present')).toBe('Feb 2023 — Present')
  })
})

describe('durationLabel', () => {
  it('returns years and months between start and end', () => {
    expect(durationLabel('2023-02', '2026-07')).toBe('3 yrs 5 mos')
    expect(durationLabel('2021-02', '2023-01')).toBe('1 yr 11 mos')
    expect(durationLabel('2015-11', '2018-10')).toBe('2 yrs 11 mos')
  })

  it('uses singular units and omits zero parts', () => {
    expect(durationLabel('2020-01', '2021-01')).toBe('1 yr')
    expect(durationLabel('2020-01', '2020-02')).toBe('1 mo')
    expect(durationLabel('2020-01', '2020-04')).toBe('3 mos')
    expect(durationLabel('2020-01', '2022-01')).toBe('2 yrs')
  })

  it('treats a same-month range as 1 mo', () => {
    expect(durationLabel('2020-05', '2020-05')).toBe('1 mo')
  })

  it('resolves present against the given date (UTC)', () => {
    const now = new Date(Date.UTC(2026, 8, 17)) // Sep 2026
    expect(durationLabel('2023-02', 'present', now)).toBe('3 yrs 7 mos')
  })

  it('throws when end is before start', () => {
    expect(() => durationLabel('2021-02', '2020-01')).toThrow(/before start/)
  })
})
