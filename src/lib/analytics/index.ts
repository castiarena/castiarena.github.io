export { getAnalyticsConfig, type AnalyticsConfig } from './config'
export {
  CONSENT_MAX_AGE_MS,
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  getConsentState,
  getServerConsentState,
  openConsentBanner,
  setConsent,
  subscribeToConsent,
  type ConsentChoice,
  type ConsentState,
  type StoredConsent,
} from './consent'
export { clearGoogleAnalyticsCookies, getGoogleAnalyticsCookieNames } from './clear-cookies'
export { useConsent } from './use-consent'
