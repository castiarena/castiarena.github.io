import type { Metadata } from 'next'

import { PageHeader } from '@/components/shared'

export const metadata: Metadata = {
  title: 'Bio',
  description: 'Experience, achievements, skills and training.',
  alternates: { canonical: '/bio/' },
}

// STUB — implemented by agent 2.3
export default function BioPage() {
  return <PageHeader title="Bio" description="Experience, achievements, skills and training." />
}
