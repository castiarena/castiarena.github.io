import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const STORAGE_KEY = 'castiarena:consent'
const MEASUREMENT_ID = 'G-TEST12345'

const sendGAEvent = vi.fn()
vi.mock('@next/third-parties/google', () => ({
  sendGAEvent: (...args: unknown[]) => sendGAEvent(...args),
}))

type Choice = 'granted' | 'denied' | null

async function loadTrack(choice: Choice) {
  window.localStorage.clear()
  if (choice) {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ choice, timestamp: Date.now(), version: 1 }),
    )
  }
  vi.resetModules()
  const { track } = await import('@/lib/analytics/track')
  return track
}

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_DEPLOY_ENV', 'production')
  vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', MEASUREMENT_ID)
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.clearAllMocks()
  vi.restoreAllMocks()
})

describe('track() — the gating matrix', () => {
  it('sends when analytics are configured and consent is granted', async () => {
    const track = await loadTrack('granted')

    track('theme_change', { theme: 'dark' })

    expect(sendGAEvent).toHaveBeenCalledWith('event', 'theme_change', { theme: 'dark' })
  })

  it.each([
    ['consent is unknown', null],
    ['consent is denied', 'denied'],
  ] as const)('sends nothing when %s', async (_label, choice) => {
    const track = await loadTrack(choice)

    track('theme_change', { theme: 'dark' })

    expect(sendGAEvent).not.toHaveBeenCalled()
  })

  it('sends nothing without a measurement ID, even with consent', async () => {
    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', undefined)
    const track = await loadTrack('granted')

    track('theme_change', { theme: 'dark' })

    expect(sendGAEvent).not.toHaveBeenCalled()
  })

  it('sends nothing outside the production deploy, even with consent', async () => {
    vi.stubEnv('NEXT_PUBLIC_DEPLOY_ENV', undefined)
    const track = await loadTrack('granted')

    track('theme_change', { theme: 'dark' })

    expect(sendGAEvent).not.toHaveBeenCalled()
  })
})

describe('track() — behaviour', () => {
  it('logs instead of sending in development, so call sites are verifiable without GA', async () => {
    vi.stubEnv('NEXT_PUBLIC_DEPLOY_ENV', undefined)
    vi.stubEnv('NODE_ENV', 'development')
    const debug = vi.spyOn(console, 'debug').mockImplementation(() => {})
    const track = await loadTrack('granted')

    track('contact_open', { source: 'header' })

    expect(sendGAEvent).not.toHaveBeenCalled()
    expect(debug).toHaveBeenCalledWith('[analytics]', 'contact_open', { source: 'header' })
  })

  it('stays silent when it is neither active nor in development', async () => {
    vi.stubEnv('NEXT_PUBLIC_DEPLOY_ENV', undefined)
    vi.stubEnv('NODE_ENV', 'test')
    const debug = vi.spyOn(console, 'debug').mockImplementation(() => {})
    const track = await loadTrack('granted')

    track('contact_open', { source: 'header' })

    expect(sendGAEvent).not.toHaveBeenCalled()
    expect(debug).not.toHaveBeenCalled()
  })

  it('never throws, whatever the transport does', async () => {
    sendGAEvent.mockImplementation(() => {
      throw new Error('dataLayer is gone')
    })
    const track = await loadTrack('granted')

    expect(() => track('generate_lead', { method: 'form' })).not.toThrow()
  })

  it('passes recommended-event params through unchanged', async () => {
    const track = await loadTrack('granted')

    track('select_content', { content_type: 'project', content_id: 'exporter' })

    expect(sendGAEvent).toHaveBeenCalledWith('event', 'select_content', {
      content_type: 'project',
      content_id: 'exporter',
    })
  })
})
