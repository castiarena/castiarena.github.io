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
import { submitContactForm } from './form-endpoint'
import { buildMailto } from './mailto'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const defaultValues: ContactFormValues = { name: '', email: '', message: '', company: '' }

export function ContactForm() {
  const formEndpoint = process.env.NEXT_PUBLIC_FORM_ENDPOINT
  const hasEndpoint = Boolean(formEndpoint)

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues,
  })
  const [status, setStatus] = useState<Status>('idle')

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

    if (!formEndpoint) {
      window.location.assign(buildMailto(profile.email, values))
      toast.success('Opening your email app…')
      return
    }

    setStatus('submitting')
    try {
      const result = await submitContactForm(formEndpoint, values)
      if (result.ok) {
        setStatus('success')
        toast.success("Thanks — I'll be in touch.")
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
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

      {status === 'error' ? (
        <div
          role="alert"
          className="flex flex-col gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <p className="flex items-center gap-2 font-medium">
            <TriangleAlertIcon className="size-4 shrink-0" aria-hidden="true" />
            Something went wrong sending that — the endpoint might be down.
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
        <Button type="submit" loading={submitting}>
          {submitting ? 'Sending…' : hasEndpoint ? 'Send message' : 'Open email app'}
        </Button>
        <Button type="button" variant="outline" onClick={handleCopyEmail}>
          <ClipboardIcon aria-hidden="true" />
          Copy email
        </Button>
      </div>

      <p className="pt-4 font-mono text-xs text-muted-foreground hairline-t">
        No server on GitHub Pages: posts to NEXT_PUBLIC_FORM_ENDPOINT when set, otherwise the button
        becomes &ldquo;Open email app&rdquo; and builds a mailto:. Honeypot field and a 3s minimum
        keep bots out.
      </p>
    </form>
  )
}
