import type { ContactFormValues } from './contact-schema'

type SubmitValues = Pick<ContactFormValues, 'name' | 'email' | 'message'>

export interface EmailApiConfig {
  /** Base URL of the email API, without a trailing slash. */
  url: string
  /** Browser-safe public key (`pk_live_…`). The server locks it to our origins, `contact` and a fixed `to`. */
  apiKey: string
  /** Cloudflare Turnstile *site* key. The API rejects every public-key request without a token. */
  turnstileSiteKey: string
}

export type SubmitFailureReason = 'captcha' | 'rate_limited' | 'failed'
export type SubmitResult = { ok: true } | { ok: false; reason: SubmitFailureReason }

export interface SubmitOptions {
  captchaToken: string
  idempotencyKey: string
  timeoutMs?: number
}

export const SUBMIT_TIMEOUT_MS = 15_000

/**
 * Reads the build-time config (inlined by `next build`, the site has no server). Returns `null`
 * unless all three values are set, which keeps the form on its `mailto:` fallback.
 */
export function getEmailApiConfig(): EmailApiConfig | null {
  const url = process.env.NEXT_PUBLIC_EMAIL_API_URL?.trim().replace(/\/+$/, '')
  const apiKey = process.env.NEXT_PUBLIC_EMAIL_API_KEY?.trim()
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim()
  if (!url || !apiKey || !turnstileSiteKey) return null
  return { url, apiKey, turnstileSiteKey }
}

/**
 * Sends the form through the email API's `contact` template (castiarena/email-api,
 * `POST /api/send`). The server parses strictly, so the body holds exactly `template`, `reply_to`,
 * `data` and `captcha_token`: no honeypot, no `to`/`subject`/`html` (the key's policy fixes those).
 */
export async function submitContactForm(
  config: Pick<EmailApiConfig, 'url' | 'apiKey'>,
  values: SubmitValues,
  { captchaToken, idempotencyKey, timeoutMs = SUBMIT_TIMEOUT_MS }: SubmitOptions,
): Promise<SubmitResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  let response: Response
  try {
    response = await fetch(`${config.url.replace(/\/+$/, '')}/api/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        template: 'contact',
        reply_to: values.email,
        data: { name: values.name, email: values.email, message: values.message },
        captcha_token: captchaToken,
      }),
      signal: controller.signal,
    })
  } catch {
    // Network error, CORS failure or the timeout abort: nothing the visitor can fix here.
    return { ok: false, reason: 'failed' }
  } finally {
    clearTimeout(timeout)
  }

  if (response.ok) return { ok: true }
  if (response.status === 429) return { ok: false, reason: 'rate_limited' }

  const code = await readErrorCode(response)
  if (response.status === 403 && code === 'captcha_failed') return { ok: false, reason: 'captcha' }

  // Config/contract bugs (400/401/403/413/415/422) and 5xx. Log only the error code, never values.
  console.error(`[contact] email API responded ${response.status} ${code ?? 'unknown_error'}`)
  return { ok: false, reason: 'failed' }
}

async function readErrorCode(response: Response): Promise<string | undefined> {
  try {
    const body = (await response.json()) as { error?: { code?: unknown } } | null
    return typeof body?.error?.code === 'string' ? body.error.code : undefined
  } catch {
    return undefined
  }
}
