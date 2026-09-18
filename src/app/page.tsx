import type { Metadata } from 'next'

import { PageHeader } from '@/components/shared'
import { profile } from '@/content'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

// STUB — implemented by agent 2.2
export default function HomePage() {
  return <PageHeader eyebrow={profile.role} title={profile.name} description={profile.tagline} />
}
