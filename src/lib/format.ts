import type { ISODateMonth } from '@/content/types'

const MONTH_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/

const monthFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

function parseMonth(value: string): { year: number; month: number } {
  const match = MONTH_PATTERN.exec(value)
  if (!match) {
    throw new RangeError(`Invalid month "${value}": expected the format YYYY-MM (e.g. "2023-02").`)
  }
  return { year: Number(match[1]), month: Number(match[2]) }
}

function monthIndex(value: ISODateMonth | 'present', now: Date): number {
  if (value === 'present') return now.getUTCFullYear() * 12 + now.getUTCMonth()
  const { year, month } = parseMonth(value)
  return year * 12 + (month - 1)
}

/** `'2023-02'` → `'Feb 2023'`. Throws a `RangeError` for anything that isn't `YYYY-MM`. */
export function formatMonth(value: ISODateMonth): string {
  const { year, month } = parseMonth(value)
  return monthFormatter.format(new Date(Date.UTC(year, month - 1, 1)))
}

/** `('2023-02', '2026-07')` → `'Feb 2023 — Jul 2026'`; `end = 'present'` → `'Feb 2023 — Present'`. */
export function formatRange(start: ISODateMonth, end: ISODateMonth | 'present'): string {
  const endLabel = end === 'present' ? 'Present' : formatMonth(end)
  return `${formatMonth(start)} — ${endLabel}`
}

function plural(count: number, singular: string, pluralLabel: string): string {
  return `${count} ${count === 1 ? singular : pluralLabel}`
}

/**
 * Whole months between `start` and `end` (end month not counted), e.g.
 * `('2023-02', '2026-07')` → `'3 yrs 5 mos'`, `('2020-01', '2021-01')` → `'1 yr'`.
 * Same-month ranges return `'1 mo'`. `'present'` resolves against `now` (UTC), which defaults to today.
 */
export function durationLabel(
  start: ISODateMonth,
  end: ISODateMonth | 'present',
  now: Date = new Date(),
): string {
  const months = monthIndex(end, now) - monthIndex(start, now)
  if (months < 0) {
    throw new RangeError(`Invalid range: end "${end}" is before start "${start}".`)
  }
  if (months === 0) return '1 mo'

  const years = Math.floor(months / 12)
  const rest = months % 12
  const parts: string[] = []
  if (years > 0) parts.push(plural(years, 'yr', 'yrs'))
  if (rest > 0) parts.push(plural(rest, 'mo', 'mos'))
  return parts.join(' ')
}
