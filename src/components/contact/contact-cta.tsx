import { profile } from '@/content'

export interface ContactCTAProps {
  className?: string
}

// STUB — implemented by agent 2.6
export function ContactCTA({ className }: ContactCTAProps) {
  return (
    <a href={`mailto:${profile.email}`} className={className}>
      Get in touch
    </a>
  )
}
