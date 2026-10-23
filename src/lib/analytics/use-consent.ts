'use client'

import { useSyncExternalStore } from 'react'

import {
  getConsentState,
  getServerConsentState,
  subscribeToConsent,
  type ConsentState,
} from './consent'

/**
 * Subscribes a component to the consent store. Returns `{ choice: null, bannerOpen: false }` for
 * the static render and the hydration pass, then the real stored state — see `consent.ts`.
 */
export function useConsent(): ConsentState {
  return useSyncExternalStore(subscribeToConsent, getConsentState, getServerConsentState)
}
