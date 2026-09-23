import type { ContactFormValues } from './contact-schema'

/** Builds a properly encoded `mailto:` URL pre-filled from the form values (01-architecture.md §1: no Server Actions). */
export function buildMailto(
  email: string,
  values: Pick<ContactFormValues, 'name' | 'email' | 'message'>,
): string {
  const subject = encodeURIComponent(`Portfolio contact from ${values.name}`)
  const body = encodeURIComponent(`${values.message}\n\n— ${values.name} (${values.email})`)
  return `mailto:${email}?subject=${subject}&body=${body}`
}
