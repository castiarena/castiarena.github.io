import type { Metadata } from 'next'

import { PageHeader } from '@/components/shared'

export const metadata: Metadata = {
  title: 'Experiments',
  description: 'Smaller web experiments and prototypes.',
  alternates: { canonical: '/experiments/' },
}

// STUB — implemented by agent 2.4
export default function ExperimentsPage() {
  return <PageHeader title="Experiments" description="Smaller web experiments and prototypes." />
}
