'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

export interface CopyEmailButtonProps {
  email: string
}

/** Icon button that copies the email to the clipboard, per the contact band spec (Home §5). */
export function CopyEmailButton({ email }: CopyEmailButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable (unsupported browser, denied permission) — no-op.
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={handleCopy}
      aria-label={copied ? `Copied ${email}` : `Copy email address ${email}`}
    >
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
    </Button>
  )
}
