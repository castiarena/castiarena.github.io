import type { ContactFormValues } from './contact-schema'

type SubmitValues = Pick<ContactFormValues, 'name' | 'email' | 'message'>

/**
 * Posts the form to whichever third-party endpoint `NEXT_PUBLIC_FORM_ENDPOINT` names — the site
 * has no server to post to (01-architecture.md §1, 03-deployment-flow.md §8). Keyed on the
 * endpoint's hostname so both shapes are supported without a config flag:
 *
 * - Formspree (`formspree.io`): a plain `{ name, email, message }` JSON body.
 * - Web3Forms (`api.web3forms.com`): the same body plus `access_key`, read from an
 *   `?access_key=…` query param on the endpoint URL itself (Web3Forms' key is public by design —
 *   it's meant to sit in client-side code) and a `{ success: boolean }` response body.
 */
export async function submitContactForm(
  endpoint: string,
  values: SubmitValues,
): Promise<{ ok: boolean }> {
  const url = new URL(endpoint)
  const isWeb3Forms = url.hostname.endsWith('web3forms.com')

  const payload: Record<string, unknown> = {
    name: values.name,
    email: values.email,
    message: values.message,
  }
  if (isWeb3Forms) {
    payload.access_key = url.searchParams.get('access_key') ?? ''
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) return { ok: false }
  if (!isWeb3Forms) return { ok: true }

  const data = (await response.json().catch(() => null)) as { success?: boolean } | null
  return { ok: data?.success !== false }
}
