import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import PrivacyPage, { metadata } from '@/app/privacy/page'
import { profile } from '@/content'
import { CONSENT_STORAGE_KEY } from '@/lib/analytics'

afterEach(cleanup)

describe('/privacy/', () => {
  it('is a static, canonical route of its own', () => {
    expect(metadata.alternates?.canonical).toBe('/privacy/')
    expect(metadata.title).toBe('Privacy')
  })

  it('has the page heading', () => {
    render(<PrivacyPage />)
    expect(screen.getByRole('heading', { level: 1, name: 'Privacy' })).toBeInTheDocument()
  })

  // The page is the promise; `src/lib/analytics/` is the implementation. These assertions are
  // here so a change to one is noticed when the other is left behind.
  it.each([
    ['names the client-ID cookie', /_ga —/],
    ['names the session cookie', /_ga_<measurement-id>/],
    ['states the cookie lifetime', /Expires after 2 years/],
    ['states the GA4 retention setting', /Data retention is set to 2 months/],
    ['says IP addresses are not stored', /not logged or stored/],
    ['points at the footer control to withdraw', /Cookie preferences/],
    ['states the Accept and Decline lifetimes', /12 months and a Decline for 6/],
  ])('%s', (_label, pattern) => {
    render(<PrivacyPage />)
    // getAllByText: both cookie bullets carry the same lifetime sentence.
    expect(screen.getAllByText(pattern).length).toBeGreaterThan(0)
  })

  it('names the storage key the consent store actually uses', () => {
    render(<PrivacyPage />)
    expect(screen.getByText(CONSENT_STORAGE_KEY)).toBeInTheDocument()
  })

  it('offers a way to get in touch', () => {
    render(<PrivacyPage />)
    expect(screen.getByRole('link', { name: profile.email })).toHaveAttribute(
      'href',
      `mailto:${profile.email}`,
    )
  })
})
