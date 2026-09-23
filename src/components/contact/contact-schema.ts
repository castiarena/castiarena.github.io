import { z } from 'zod'

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Enter at least 2 characters.')
    .max(80, 'Keep it under 80 characters.'),
  email: z.string().trim().min(1, 'Enter your email address.').email('Enter a valid email address.'),
  message: z
    .string()
    .trim()
    .min(20, 'Say a bit more — at least 20 characters.')
    .max(2000, 'Keep it under 2000 characters.'),
  // Honeypot — real visitors never see or fill this field. Not surfaced through field-level
  // errors; checked separately in the submit handler so a filled value fails silently.
  company: z.string().optional(),
})

export type ContactFormValues = z.infer<typeof contactFormSchema>

export const CONTACT_MESSAGE_MAX = 2000
export const CONTACT_MIN_SUBMIT_MS = 3000
