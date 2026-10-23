import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { ConsentChoice, StoredConsent } from '@/lib/analytics/consent'

const STORAGE_KEY = 'castiarena:consent'
const DAY_MS = 24 * 60 * 60 * 1000

/**
 * The store caches its state in module scope on purpose (`useSyncExternalStore` needs a stable
 * snapshot), so every test gets a fresh copy rather than a reset hook.
 */
async function loadStore() {
  vi.resetModules()
  return import('@/lib/analytics/consent')
}

function store(choice: ConsentChoice, ageMs = 0, version = 1) {
  const stored: StoredConsent = { choice, timestamp: Date.now() - ageMs, version }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
}

function wipeCookies() {
  for (const pair of document.cookie.split(';')) {
    const name = pair.split('=')[0]?.trim()
    if (name) document.cookie = `${name}=; path=/; max-age=0`
  }
}

beforeEach(() => {
  window.localStorage.clear()
  wipeCookies()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('consent store — reading', () => {
  it('opens the banner when nothing has been stored', async () => {
    const { getConsentState } = await loadStore()
    expect(getConsentState()).toEqual({ choice: null, bannerOpen: true })
  })

  it('renders nothing on the server, so hydration has no banner to match', async () => {
    const { getServerConsentState } = await loadStore()
    expect(getServerConsentState()).toEqual({ choice: null, bannerOpen: false })
  })

  it('returns the same snapshot reference until something changes', async () => {
    const { getConsentState } = await loadStore()
    expect(getConsentState()).toBe(getConsentState())
  })

  it.each([
    ['granted', 300 * DAY_MS],
    ['denied', 100 * DAY_MS],
  ] as const)('honours a stored %s choice inside its lifetime', async (choice, age) => {
    store(choice, age)
    const { getConsentState } = await loadStore()
    expect(getConsentState()).toEqual({ choice, bannerOpen: false })
  })

  it('re-asks once an Accept passes 12 months', async () => {
    store('granted', 366 * DAY_MS)
    const { getConsentState } = await loadStore()
    expect(getConsentState()).toEqual({ choice: null, bannerOpen: true })
  })

  it('re-asks once a Decline passes 6 months', async () => {
    store('denied', 183 * DAY_MS)
    const { getConsentState } = await loadStore()
    expect(getConsentState()).toEqual({ choice: null, bannerOpen: true })
  })

  it('re-asks everyone when CONSENT_VERSION moves on', async () => {
    const { CONSENT_VERSION } = await loadStore()
    store('granted', 0, CONSENT_VERSION - 1)

    const { getConsentState } = await loadStore()
    expect(getConsentState()).toEqual({ choice: null, bannerOpen: true })
  })

  it.each([
    ['malformed JSON', 'not json at all'],
    ['an unexpected shape', JSON.stringify({ choice: 'maybe', timestamp: 1, version: 1 })],
    ['a missing timestamp', JSON.stringify({ choice: 'granted', version: 1 })],
  ])('treats %s as no answer', async (_label, raw) => {
    window.localStorage.setItem(STORAGE_KEY, raw)
    const { getConsentState } = await loadStore()
    expect(getConsentState()).toEqual({ choice: null, bannerOpen: true })
  })

  it('treats unreadable storage as no answer instead of throwing', async () => {
    vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })

    const { getConsentState } = await loadStore()
    expect(getConsentState()).toEqual({ choice: null, bannerOpen: true })
  })
})

describe('consent store — writing', () => {
  it('persists an Accept with a timestamp and the current version, and closes the banner', async () => {
    const { getConsentState, setConsent, CONSENT_VERSION } = await loadStore()

    setConsent('granted')

    expect(getConsentState()).toEqual({ choice: 'granted', bannerOpen: false })
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')
    expect(stored).toMatchObject({ choice: 'granted', version: CONSENT_VERSION })
    expect(stored.timestamp).toBeGreaterThan(0)
  })

  it('persists a Decline the same way', async () => {
    const { getConsentState, setConsent } = await loadStore()

    setConsent('denied')

    expect(getConsentState()).toEqual({ choice: 'denied', bannerOpen: false })
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')).toMatchObject({
      choice: 'denied',
    })
  })

  it('notifies subscribers, and stops once unsubscribed', async () => {
    const { setConsent, subscribeToConsent, openConsentBanner } = await loadStore()
    const listener = vi.fn()

    const unsubscribe = subscribeToConsent(listener)
    setConsent('granted')
    expect(listener).toHaveBeenCalledTimes(1)

    unsubscribe()
    openConsentBanner()
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('still applies the choice for this page view when storage refuses the write', async () => {
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })

    const { getConsentState, setConsent } = await loadStore()

    expect(() => setConsent('granted')).not.toThrow()
    expect(getConsentState()).toEqual({ choice: 'granted', bannerOpen: false })
  })

  it('reopens the banner from the footer, without touching the stored choice', async () => {
    store('granted')
    const { getConsentState, openConsentBanner } = await loadStore()

    openConsentBanner()

    expect(getConsentState()).toEqual({ choice: 'granted', bannerOpen: true })
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')).toMatchObject({
      choice: 'granted',
    })
  })
})

describe('consent store — revoking', () => {
  it('deletes the GA cookies and reloads when a granted choice becomes denied', async () => {
    const reload = vi.fn()
    vi.stubGlobal('location', { ...window.location, hostname: 'localhost', reload })
    document.cookie = '_ga=GA1.1.1234'
    document.cookie = '_ga_ABC123=GS1.1.1'
    document.cookie = 'theme=dark'
    store('granted')

    const { setConsent } = await loadStore()
    setConsent('denied')

    expect(document.cookie).not.toContain('_ga')
    expect(document.cookie).toContain('theme=dark')
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('leaves the page alone for every other transition', async () => {
    const reload = vi.fn()
    vi.stubGlobal('location', { ...window.location, hostname: 'localhost', reload })

    const { setConsent } = await loadStore()
    setConsent('denied') // unknown -> denied: nothing was ever loaded
    setConsent('granted') // denied -> granted
    setConsent('granted') // granted -> granted

    expect(reload).not.toHaveBeenCalled()
  })
})
