'use client'

import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { track, type ContactSource } from '@/lib/analytics'

import { ContactForm } from './contact-form'

export interface ContactDialogProps {
  trigger?: ReactNode
  /** Which entry point opened the dialog. Reported as `contact_open`'s `source`. */
  source: ContactSource
}

export function ContactDialog({ trigger, source }: ContactDialogProps) {
  return (
    // Radix fires this on open and on close; only the open edge is an intent to get in touch.
    <Dialog
      onOpenChange={(open) => {
        if (open) track('contact_open', { source })
      }}
    >
      <DialogTrigger asChild>{trigger ?? <Button>Contact</Button>}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Get in touch</DialogTitle>
          <DialogDescription>I usually reply within a couple of days.</DialogDescription>
        </DialogHeader>
        <ContactForm />
      </DialogContent>
    </Dialog>
  )
}
