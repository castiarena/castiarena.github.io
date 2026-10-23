'use client'

import { useEffect, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { CircleCheckIcon, ClipboardIcon, MailIcon, TriangleAlertIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DialogClose } from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { profile } from '@/content'
import { cn } from '@/lib/utils'

import { copyToClipboard } from './copy-to-clipboard'
import { CONTACT_MESSAGE_MAX, CONTACT_MIN_SUBMIT_MS, contactFormSchema } from './contact-schema'
import type { ContactFormValues } from './contact-schema'
import { getEmailApiConfig, submitContactForm } from './form-endpoint'
import type { SubmitFailureReason } from './form-endpoint'
import { buildMailto } from './mailto'
import { TurnstileWidget } from './turnstile-widget'
import type { TurnstileWidgetHandle } from './turnstile-widget'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const defaultValues: ContactFormValues = { name: '', email: '', message: '', company: '' }

export function ContactForm() {
  const apiConfig = getEmailApiConfig()
  const hasEndpoint = apiConfig !== null

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues,
  })
  const [status, setStatus] = useState<Status>('idle')
  const [errorReason, setErrorReason] = useState<SubmitFailureReason | null>(null)
  // Single-use Turnstile token, kept in memory only.
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileWidgetHandle>(null)
  // One Idempotency-Key per message: reused while retrying the same values (e.g. after a timeout
  // that may have gone through), replaced once the values change or a send succeeds.
  const idempotencyRef = useRef<{ key: string; fingerprint: string } | null>(null)

  // Tracked from when the form mounts (i.e. when the dialog opens, since DialogContent unmounts
  // while closed) rather than page load — a 3-second minimum time-to-submit, per the mission.
  const mountedAtRef = useRef(0)
  useEffect(() => {
    mountedAtRef.current = Date.now()
  }, [])

  const messageValue = useWatch({ control: form.control, name: 'message' }) ?? ''
  const submitting = status === 'submitting'

  async function onValid(values: ContactFormValues) {
    const isLikelyBot =
      Boolean(values.company) || Date.now() - mountedAtRef.current < CONTACT_MIN_SUBMIT_MS

    if (isLikelyBot) {
      // A real visitor can't trigger either check (the honeypot is invisible, and typing a
      // 20+ character message already takes longer than 3s) — quietly pretend success instead of
      // telling a bot what tripped it.
      setStatus('success')
      return
    }

    if (!apiConfig) {
      window.location.assign(buildMailto(profile.email, values))
      toast.success('Opening your email app…')
      return
    }

    if (!captchaToken) return

    const payload = { name: values.name, email: values.email, message: values.message }
    const fingerprint = JSON.stringify(payload)
    if (idempotencyRef.current?.fingerprint !== fingerprint) {
      idempotencyRef.current = { key: crypto.randomUUID(), fingerprint }
    }

    setStatus('submitting')
    setErrorReason(null)
    const result = await submitContactForm(apiConfig, payload, {
      captchaToken,
      idempotencyKey: idempotencyRef.current.key,
    })
    // Every request that reached the API spent the token, success or not.
    turnstileRef.current?.reset()

    if (result.ok) {
      idempotencyRef.current = null
      setStatus('success')
      toast.success("Thanks — I'll be in touch.")
    } else if (result.reason === 'captcha') {
      setStatus('idle')
      setErrorReason('captcha')
    } else {
      setStatus('error')
      setErrorReason(result.reason)
    }
  }

  async function handleCopyEmail() {
    const copied = await copyToClipboard(profile.email)
    if (copied) {
      toast.success('Email copied', { description: profile.email })
    } else {
      toast.error('Could not copy automatically', { description: profile.email })
    }
  }

  if (status === 'success') {
    return (
      <div role="status" className="flex flex-col items-center gap-4 py-6 text-center">
        <CircleCheckIcon className="size-10 text-brand-2" aria-hidden="true" />
        <p className="text-base font-semibold text-foreground">Thanks — I&apos;ll be in touch.</p>
        <DialogClose asChild>
          <Button variant="outline">Close</Button>
        </DialogClose>
      </div>
    )
  }

  return (
    // `handleSubmit(onValid)` is evaluated during render, and the React Compiler can't tell that
    // `onValid` only runs later — it reads `mountedAtRef` and calls `Date.now()`, both of which it
    // has to assume could happen during render (react-hooks/refs, react-hooks/purity). Building the
    // submit handler inside the event callback keeps those reads provably outside render.
    <form
      onSubmit={(event) => {
        void form.handleSubmit(onValid)(event)
      }}
      noValidate
      className="flex flex-col gap-6"
    >
      <fieldset disabled={submitting} aria-busy={submitting} className="flex flex-col gap-6">
        <FieldGroup>
          <Field data-invalid={Boolean(form.formState.errors.name) || undefined}>
            <FieldLabel htmlFor="contact-name">Name</FieldLabel>
            <Input
              id="contact-name"
              autoComplete="name"
              error={form.formState.errors.name?.message}
              {...form.register('name')}
            />
          </Field>
          <Field data-invalid={Boolean(form.formState.errors.email) || undefined}>
            <FieldLabel htmlFor="contact-email">Email</FieldLabel>
            <Input
              id="contact-email"
              type="email"
              autoComplete="email"
              error={form.formState.errors.email?.message}
              {...form.register('email')}
            />
          </Field>
          <Field data-invalid={Boolean(form.formState.errors.message) || undefined}>
            <FieldLabel htmlFor="contact-message">Message</FieldLabel>
            <Textarea
              id="contact-message"
              error={form.formState.errors.message?.message}
              {...form.register('message')}
            />
            <p
              className={cn(
                'self-end text-right font-mono text-xs text-muted-foreground',
                messageValue.length > CONTACT_MESSAGE_MAX && 'text-destructive',
              )}
            >
              {messageValue.length} / {CONTACT_MESSAGE_MAX}
            </p>
          </Field>
        </FieldGroup>

        {/* Honeypot — invisible to real visitors and hidden from assistive tech, so only a bot
            filling every field it can find will ever set this. */}
        <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
          <label htmlFor="contact-company">Company</label>
          <input
            id="contact-company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...form.register('company')}
          />
        </div>
      </fieldset>

      {apiConfig ? (
        <div className="flex flex-col gap-2">
          <TurnstileWidget
            ref={turnstileRef}
            siteKey={apiConfig.turnstileSiteKey}
            onTokenChange={setCaptchaToken}
          />
          {errorReason === 'captcha' ? (
            <p role="alert" className="text-sm text-destructive">
              The spam check didn&apos;t go through. Please complete it again, then resend.
            </p>
          ) : null}
        </div>
      ) : null}

      {status === 'error' ? (
        <div
          role="alert"
          className="flex flex-col gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <p className="flex items-center gap-2 font-medium">
            <TriangleAlertIcon className="size-4 shrink-0" aria-hidden="true" />
            {errorReason === 'rate_limited'
              ? 'Too many messages right now, try again in a minute.'
              : 'Something went wrong sending that — the endpoint might be down.'}
          </p>
          <a
            href={buildMailto(profile.email, form.getValues())}
            className="inline-flex w-fit items-center gap-1.5 font-semibold underline underline-offset-4 hover:text-foreground"
          >
            <MailIcon className="size-3.5" aria-hidden="true" />
            Email me instead
          </a>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={submitting} disabled={hasEndpoint && !captchaToken}>
          {submitting ? 'Sending…' : hasEndpoint ? 'Send message' : 'Open email app'}
        </Button>
        <Button type="button" variant="outline" onClick={handleCopyEmail}>
          <ClipboardIcon aria-hidden="true" />
          Copy email
        </Button>
      </div>
    </form>
  )
}
