import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  clearGoogleAnalyticsCookies,
  getGoogleAnalyticsCookieNames,
} from '@/lib/analytics/clear-cookies'

function wipeCookies() {
  for (const pair of document.cookie.split(';')) {
    const name = pair.split('=')[0]?.trim()
    if (name) document.cookie = `${name}=; path=/; max-age=0`
  }
}

beforeEach(wipeCookies)

afterEach(() => {
  wipeCookies()
  vi.unstubAllGlobals()
})

describe('getGoogleAnalyticsCookieNames', () => {
  it('picks out _ga and every _ga_<container> cookie', () => {
    const names = getGoogleAnalyticsCookieNames(
      '_ga=GA1.1.1; _ga_ABC123=GS1.1.1; theme=dark; _gid=GA1.2.3',
    )
    expect(names).toEqual(['_ga', '_ga_ABC123'])
  })

  it('ignores names that merely start with _ga', () => {
    expect(getGoogleAnalyticsCookieNames('_gat=1; _gali=x; ga=1')).toEqual([])
  })

  it('returns each name once and copes with an empty cookie jar', () => {
    expect(getGoogleAnalyticsCookieNames('_ga=a; _ga=b')).toEqual(['_ga'])
    expect(getGoogleAnalyticsCookieNames('')).toEqual([])
  })
})

describe('clearGoogleAnalyticsCookies', () => {
  it('deletes the GA cookies and leaves everything else alone', () => {
    document.cookie = '_ga=GA1.1.1234'
    document.cookie = '_ga_ABC123=GS1.1.1'
    document.cookie = 'theme=dark'

    clearGoogleAnalyticsCookies()

    expect(document.cookie).not.toContain('_ga')
    expect(document.cookie).toContain('theme=dark')
  })

  it('does nothing when there is no GA cookie', () => {
    document.cookie = 'theme=dark'

    expect(() => clearGoogleAnalyticsCookies()).not.toThrow()
    expect(document.cookie).toContain('theme=dark')
  })
})
