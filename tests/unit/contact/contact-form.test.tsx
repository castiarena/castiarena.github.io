import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ContactForm } from '@/components/contact/contact-form'
import { resetTurnstileLoaderForTests } from '@/components/contact/turnstile-widget'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'

vi.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'dark' }),
}))

type RenderOptions = {
  callback: (token: string) => void
  'expired-callback': () => void
  'error-callback': () => void
  theme: string
}

const fetchMock = vi.fn<typeof fetch>()
let widget: RenderOptions | null = null
const turnstile = {
  render: vi.fn((_el: HTMLElement, options: RenderOptions) => {
    widget = options
    return 'widget-1'
  }),
  reset: vi.fn(),
  remove: vi.fn(),
}

const values = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  message: 'Hello there, this message is long enough.',
}

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function renderForm() {
  return render(
    <Dialog open>
      <DialogContent>
        <DialogTitle>Get in touch</DialogTitle>
        <DialogDescription>Test</DialogDescription>
        <ContactForm />
      </DialogContent>
    </Dialog>,
  )
}

function fillForm(overrides: Partial<typeof values> & { company?: string } = {}) {
  const v = { ...values, ...overrides }
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: v.name } })
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: v.email } })
  fireEvent.change(screen.getByLabelText('Message'), { target: { value: v.message } })
  if (overrides.company !== undefined) {
    fireEvent.change(document.getElementById('contact-company')!, {
      target: { value: overrides.company },
    })
  }
}

async function issueToken(token: string) {
  await waitFor(() => expect(widget).not.toBeNull())
  act(() => widget!.callback(token))
}

/** Lets the 3s minimum time-to-submit elapse. */
function waitPastMinimum() {
  vi.setSystemTime(Date.now() + 5000)
}

function submitButton() {
  return screen.getByRole('button', { name: /Send message|Sending/ })
}

function sentBody(call: number) {
  return JSON.parse(fetchMock.mock.calls[call]![1]!.body as string) as Record<string, unknown>
}

function sentIdempotencyKey(call: number) {
  return (fetchMock.mock.calls[call]![1]!.headers as Record<string, string>)['Idempotency-Key']
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.stubEnv('NEXT_PUBLIC_EMAIL_API_URL', 'https://api.example.com/')
  vi.stubEnv('NEXT_PUBLIC_EMAIL_API_KEY', 'pk_live_test')
  vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', '1x00000000000000000000AA')
  vi.stubGlobal('fetch', fetchMock)
  window.turnstile = turnstile
  widget = null
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  cleanup()
  delete window.turnstile
  resetTurnstileLoaderForTests()
  vi.useRealTimers()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  vi.clearAllMocks()
  fetchMock.mockReset()
})

describe('ContactForm with the email API configured', () => {
  it('renders the Turnstile widget with the site key and the resolved theme', async () => {
    renderForm()
    await waitFor(() => expect(turnstile.render).toHaveBeenCalledTimes(1))
    expect(turnstile.render.mock.calls[0]![1]).toMatchObject({
      sitekey: '1x00000000000000000000AA',
      theme: 'dark',
      size: 'flexible',
    })
  })

  it('keeps submit disabled until a token arrives, and again after it expires', async () => {
    renderForm()
    expect(submitButton()).toBeDisabled()

    await issueToken('tok-1')
    expect(submitButton()).toBeEnabled()

    act(() => widget!['expired-callback']())
    expect(submitButton()).toBeDisabled()

    await issueToken('tok-2')
    act(() => widget!['error-callback']())
    expect(submitButton()).toBeDisabled()
  })

  it('sends the token, resets the widget and shows the success state', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { id: 'email_1' }))
    renderForm()
    await issueToken('tok-1')
    fillForm({ name: '  Ada Lovelace  ' })
    waitPastMinimum()

    fireEvent.click(submitButton())

    expect(await screen.findByText(/I'll be in touch/, { selector: 'p' })).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0]![0]).toBe('https://api.example.com/api/send')
    expect(sentBody(0)).toEqual({
      template: 'contact',
      reply_to: values.email,
      data: values,
      captcha_token: 'tok-1',
    })
    expect(turnstile.reset).toHaveBeenCalledWith('widget-1')
  })

  it('keeps the input and asks to redo the check on captcha_failed', async () => {
    fetchMock.mockResolvedValue(jsonResponse(403, { error: { code: 'captcha_failed' } }))
    renderForm()
    await issueToken('tok-1')
    fillForm()
    waitPastMinimum()

    fireEvent.click(submitButton())

    expect(await screen.findByText(/complete it again/)).toBeInTheDocument()
    expect(turnstile.reset).toHaveBeenCalledTimes(1)
    expect(submitButton()).toBeDisabled() // token cleared until the widget issues a new one
    expect(screen.getByLabelText('Name')).toHaveValue(values.name)
    expect(screen.getByLabelText('Message')).toHaveValue(values.message)
  })

  it('shows the rate-limit message with the mailto fallback on 429', async () => {
    fetchMock.mockResolvedValue(jsonResponse(429, { error: { code: 'rate_limited' } }))
    renderForm()
    await issueToken('tok-1')
    fillForm()
    waitPastMinimum()

    fireEvent.click(submitButton())

    expect(await screen.findByText(/Too many messages right now/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Email me instead/ })).toHaveAttribute(
      'href',
      expect.stringMatching(/^mailto:/),
    )
  })

  it('shows the error state with the mailto fallback on a contract error', async () => {
    fetchMock.mockResolvedValue(jsonResponse(403, { error: { code: 'not_allowed' } }))
    renderForm()
    await issueToken('tok-1')
    fillForm()
    waitPastMinimum()

    fireEvent.click(submitButton())

    expect(await screen.findByText(/Something went wrong/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Email me instead/ })).toBeInTheDocument()
    expect(turnstile.reset).toHaveBeenCalledTimes(1)
  })

  it('never calls the API when the honeypot is filled', async () => {
    renderForm()
    await issueToken('tok-1')
    fillForm({ company: 'Spam Inc' })
    waitPastMinimum()

    fireEvent.click(submitButton())

    expect(await screen.findByText(/I'll be in touch/, { selector: 'p' })).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('never calls the API when submitted faster than the 3s minimum', async () => {
    renderForm()
    await issueToken('tok-1')
    fillForm()

    fireEvent.click(submitButton())

    expect(await screen.findByText(/I'll be in touch/, { selector: 'p' })).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('reuses the Idempotency-Key when retrying the same message', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(502, { error: { code: 'provider_unavailable' } }))
      .mockResolvedValueOnce(jsonResponse(200, { id: 'email_1' }))
    renderForm()
    await issueToken('tok-1')
    fillForm()
    waitPastMinimum()

    fireEvent.click(submitButton())
    await screen.findByText(/Something went wrong/)

    await issueToken('tok-2')
    fireEvent.click(submitButton())
    await screen.findByText(/I'll be in touch/, { selector: 'p' })

    expect(sentIdempotencyKey(0)).toMatch(/^[0-9a-f-]{36}$/)
    expect(sentIdempotencyKey(1)).toBe(sentIdempotencyKey(0))
    expect(sentBody(1).captcha_token).toBe('tok-2')
  })

  it('generates a new Idempotency-Key for the next message after a success', async () => {
    fetchMock.mockImplementation(async () => jsonResponse(200, { id: 'email' }))

    renderForm()
    await issueToken('tok-1')
    fillForm()
    waitPastMinimum()
    fireEvent.click(submitButton())
    await screen.findByText(/I'll be in touch/, { selector: 'p' })
    cleanup()

    // Reopening the dialog remounts the form.
    widget = null
    renderForm()
    await issueToken('tok-2')
    fillForm()
    waitPastMinimum()
    fireEvent.click(submitButton())
    await screen.findByText(/I'll be in touch/, { selector: 'p' })

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(sentIdempotencyKey(1)).not.toBe(sentIdempotencyKey(0))
  })

  it('uses a new Idempotency-Key when the message changes between attempts', async () => {
    fetchMock.mockImplementation(async () =>
      jsonResponse(500, { error: { code: 'provider_error' } }),
    )
    renderForm()
    await issueToken('tok-1')
    fillForm()
    waitPastMinimum()
    fireEvent.click(submitButton())
    await screen.findByText(/Something went wrong/)

    await issueToken('tok-2')
    fillForm({ message: 'A completely different message this time.' })
    fireEvent.click(submitButton())
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))

    expect(sentIdempotencyKey(1)).not.toBe(sentIdempotencyKey(0))
  })

  it('removes the widget on unmount', async () => {
    const { unmount } = renderForm()
    await waitFor(() => expect(turnstile.render).toHaveBeenCalled())
    unmount()
    expect(turnstile.remove).toHaveBeenCalledWith('widget-1')
  })
})

describe('ContactForm without the email API configured', () => {
  it.each([
    'NEXT_PUBLIC_EMAIL_API_URL',
    'NEXT_PUBLIC_EMAIL_API_KEY',
    'NEXT_PUBLIC_TURNSTILE_SITE_KEY',
  ])('falls back to mailto when %s is missing', async (missing) => {
    vi.stubEnv(missing, '')
    const assign = vi.fn()
    vi.stubGlobal('location', { ...window.location, assign })

    renderForm()
    const button = screen.getByRole('button', { name: 'Open email app' })
    expect(button).toBeEnabled()
    expect(turnstile.render).not.toHaveBeenCalled()

    fillForm()
    waitPastMinimum()
    fireEvent.click(button)

    await waitFor(() => expect(assign).toHaveBeenCalledTimes(1))
    expect(assign.mock.calls[0]![0]).toMatch(/^mailto:/)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
