import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  SUBMIT_TIMEOUT_MS,
  getEmailApiConfig,
  submitContactForm,
} from '@/components/contact/form-endpoint'

const values = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  message: 'Hello there, this is long.',
}
const options = { captchaToken: 'turnstile-token', idempotencyKey: 'idem-123' }
const config = { url: 'https://api.example.com', apiKey: 'pk_live_test' }

const fetchMock = vi.fn<typeof fetch>()

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
  fetchMock.mockReset()
})

describe('submitContactForm request', () => {
  it('posts exactly the contact payload with the auth, content-type and idempotency headers', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { id: 'email_1' }))

    await submitContactForm({ ...config, url: 'https://api.example.com/' }, values, options)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('https://api.example.com/api/send')
    expect(init?.method).toBe('POST')
    expect(init?.headers).toEqual({
      Authorization: 'Bearer pk_live_test',
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Idempotency-Key': 'idem-123',
    })
    expect(init?.signal).toBeInstanceOf(AbortSignal)

    const body = JSON.parse(init?.body as string) as Record<string, unknown>
    expect(body).toEqual({
      template: 'contact',
      reply_to: 'ada@example.com',
      data: {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        message: 'Hello there, this is long.',
      },
      captcha_token: 'turnstile-token',
    })
    expect(Object.keys(body).sort()).toEqual(['captcha_token', 'data', 'reply_to', 'template'])
    for (const forbidden of ['to', 'subject', 'html', 'text', 'from', 'company']) {
      expect(body).not.toHaveProperty(forbidden)
      expect(body.data).not.toHaveProperty(forbidden)
    }
  })

  it('never puts form values in the URL', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { id: 'email_1' }))
    await submitContactForm(config, values, options)
    const [url] = fetchMock.mock.calls[0]!
    expect(String(url)).not.toMatch(/ada|Lovelace|Hello/)
  })
})

describe('submitContactForm response mapping', () => {
  it.each([
    [200, { id: 'email_1' }, { ok: true }],
    [403, { error: { code: 'captcha_failed' } }, { ok: false, reason: 'captcha' }],
    [403, { error: { code: 'not_allowed' } }, { ok: false, reason: 'failed' }],
    [403, { error: { code: 'origin_not_allowed' } }, { ok: false, reason: 'failed' }],
    [429, { error: { code: 'rate_limited' } }, { ok: false, reason: 'rate_limited' }],
    [422, { error: { code: 'validation_error' } }, { ok: false, reason: 'failed' }],
    [500, { error: { code: 'server_error' } }, { ok: false, reason: 'failed' }],
    [502, { error: { code: 'captcha_unavailable' } }, { ok: false, reason: 'failed' }],
  ])('maps %i %o', async (status, body, expected) => {
    fetchMock.mockResolvedValue(jsonResponse(status, body))
    await expect(submitContactForm(config, values, options)).resolves.toEqual(expected)
  })

  it('maps a non-JSON error body to failed', async () => {
    fetchMock.mockResolvedValue(new Response('<html>Bad gateway</html>', { status: 502 }))
    await expect(submitContactForm(config, values, options)).resolves.toEqual({
      ok: false,
      reason: 'failed',
    })
  })

  it('logs only the error code on contract failures, never the form values', async () => {
    fetchMock.mockResolvedValue(jsonResponse(422, { error: { code: 'validation_error' } }))
    await submitContactForm(config, values, options)
    expect(console.error).toHaveBeenCalledTimes(1)
    const logged = vi.mocked(console.error).mock.calls.flat().join(' ')
    expect(logged).toContain('validation_error')
    expect(logged).not.toMatch(/ada|Lovelace|Hello|turnstile-token|pk_live/)
  })

  it('maps a network error (or CORS failure) to failed', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(submitContactForm(config, values, options)).resolves.toEqual({
      ok: false,
      reason: 'failed',
    })
  })

  it('aborts after the timeout and maps it to failed', async () => {
    vi.useFakeTimers()
    fetchMock.mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError')),
          )
        }),
    )

    const pending = submitContactForm(config, values, options)
    await vi.advanceTimersByTimeAsync(SUBMIT_TIMEOUT_MS)

    await expect(pending).resolves.toEqual({ ok: false, reason: 'failed' })
    expect(fetchMock.mock.calls[0]![1]?.signal?.aborted).toBe(true)
  })
})

describe('getEmailApiConfig', () => {
  it('returns the config with the trailing slash stripped', () => {
    vi.stubEnv('NEXT_PUBLIC_EMAIL_API_URL', 'https://api.example.com/')
    vi.stubEnv('NEXT_PUBLIC_EMAIL_API_KEY', 'pk_live_test')
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'site-key')
    expect(getEmailApiConfig()).toEqual({
      url: 'https://api.example.com',
      apiKey: 'pk_live_test',
      turnstileSiteKey: 'site-key',
    })
  })

  it.each([
    'NEXT_PUBLIC_EMAIL_API_URL',
    'NEXT_PUBLIC_EMAIL_API_KEY',
    'NEXT_PUBLIC_TURNSTILE_SITE_KEY',
  ])('returns null when %s is missing', (missing) => {
    vi.stubEnv('NEXT_PUBLIC_EMAIL_API_URL', 'https://api.example.com')
    vi.stubEnv('NEXT_PUBLIC_EMAIL_API_KEY', 'pk_live_test')
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'site-key')
    vi.stubEnv(missing, '')
    expect(getEmailApiConfig()).toBeNull()
  })
})
