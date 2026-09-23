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

import { ContactForm } from './contact-form'

export interface ContactDialogProps {
  trigger?: ReactNode
}

export function ContactDialog({ trigger }: ContactDialogProps) {
  return (
    <Dialog>
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
