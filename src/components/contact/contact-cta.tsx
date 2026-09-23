'use client'

import { ClipboardIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { profile } from '@/content'
import { cn } from '@/lib/utils'

import { ContactDialog } from './contact-dialog'
import { copyToClipboard } from './copy-to-clipboard'

export interface ContactCTAProps {
  className?: string
}

export function ContactCTA({ className }: ContactCTAProps) {
  async function handleCopyEmail() {
    const copied = await copyToClipboard(profile.email)
    if (copied) {
      toast.success('Email copied', { description: profile.email })
    } else {
      toast.error('Could not copy automatically', { description: profile.email })
    }
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <ContactDialog trigger={<Button>Get in touch</Button>} />
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={`Copy email address (${profile.email})`}
        onClick={handleCopyEmail}
      >
        <ClipboardIcon aria-hidden="true" />
      </Button>
    </div>
  )
}
