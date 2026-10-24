import { clearGoogleAnalyticsCookies } from './clear-cookies'

export type ConsentChoice = 'granted' | 'denied'

export interface StoredConsent {
  choice: ConsentChoice
  /** `Date.now()` when the choice was made. */
  timestamp: number
  version: number
}

export interface ConsentState {
  /** The visitor's valid answer, or `null` while it is unknown (never asked, expired, stale). */
  choice: ConsentChoice | null
  /** Whether the consent banner belongs on screen. */
  bannerOpen: boolean
}

/** Bumping this re-prompts everyone: a stored choice from an older version reads as unknown. */
export const CONSENT_VERSION = 1
export const CONSENT_STORAGE_KEY = 'castiarena:consent'

const DAY_MS = 24 * 60 * 60 * 1000

/** An Accept is honoured for a year, a Decline for half of one — then we ask again. */
export const CONSENT_MAX_AGE_MS: Record<ConsentChoice, number> = {
  granted: 365 * DAY_MS,
  denied: 182 * DAY_MS,
}

// Static render has no storage and must not paint the banner, or hydration would have to replace
// it. `useSyncExternalStore` renders this snapshot on the server and during hydration, then
// re-renders with the real one — which is why the banner can appear without a mismatch.
const SERVER_STATE: ConsentState = Object.freeze({ choice: null, bannerOpen: false })

const listeners = new Set<() => void>()

// Cached so `getConsentState()` returns a stable reference between changes:
// `useSyncExternalStore` re-renders forever if the snapshot is a fresh object each read.
let state: ConsentState | null = null

function isStoredConsent(value: unknown): value is StoredConsent {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Partial<StoredConsent>
  return (
    (candidate.choice === 'granted' || candidate.choice === 'denied') &&
    typeof candidate.timestamp === 'number' &&
    typeof candidate.version === 'number'
  )
}

/**
 * The stored choice, or `null` when there is nothing usable: never asked, unreadable storage
 * (Safari private mode, blocked cookies), malformed JSON, an older `CONSENT_VERSION`, or expired.
 */
function readStored(): StoredConsent | null {
  if (typeof window === 'undefined') return null

  let raw: string | null
  try {
    raw = window.localStorage.getItem(CONSENT_STORAGE_KEY)
  } catch {
    return null
  }
  if (!raw) return null

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }

  if (!isStoredConsent(parsed) || parsed.version !== CONSENT_VERSION) return null
  if (Date.now() - parsed.timestamp > CONSENT_MAX_AGE_MS[parsed.choice]) return null
  return parsed
}

function writeStored(stored: StoredConsent): void {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(stored))
  } catch {
    // Storage unavailable or full. The choice still applies to this page view; the banner simply
    // comes back on the next one, which is the safe direction for an opt-in.
  }
}

function publish(next: ConsentState): void {
  state = next
  for (const listener of listeners) listener()
}

/** Current state, read from storage on first use. Stable reference until something changes. */
export function getConsentState(): ConsentState {
  if (state === null) {
    const stored = readStored()
    state = { choice: stored?.choice ?? null, bannerOpen: stored === null }
  }
  return state
}

/** Snapshot used during static render and hydration: no choice, no banner. */
export function getServerConsentState(): ConsentState {
  return SERVER_STATE
}

export function subscribeToConsent(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Records the visitor's answer and closes the banner. Going from granted to denied also deletes
 * the cookies GA4 already set and reloads, which is the only way to be sure the `gtag.js` already
 * on the page stops reporting.
 */
export function setConsent(choice: ConsentChoice): void {
  const previous = getConsentState().choice

  writeStored({ choice, timestamp: Date.now(), version: CONSENT_VERSION })
  publish({ choice, bannerOpen: false })

  if (previous === 'granted' && choice === 'denied') {
    clearGoogleAnalyticsCookies()
    window.location.reload()
  }
}

/** Puts the banner back on screen — the footer's "Cookie preferences" entry point. */
export function openConsentBanner(): void {
  const current = getConsentState()
  if (current.bannerOpen) return
  publish({ ...current, bannerOpen: true })
}
