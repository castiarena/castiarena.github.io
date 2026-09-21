import type { ReactNode } from 'react'

import { profile } from '@/content'

export interface ContactDialogProps {
  trigger?: ReactNode
}

// STUB — implemented by agent 2.6 (dialog + form). For now it is a plain mailto: link.
export function ContactDialog({ trigger }: ContactDialogProps) {
  return <a href={`mailto:${profile.email}`}>{trigger ?? 'Contact'}</a>
}
