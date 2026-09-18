import type { Metadata } from 'next'

import { PageHeader } from '@/components/shared'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Selected projects: the problem, my role, the stack and the results.',
  alternates: { canonical: '/projects/' },
}

// STUB — implemented by agent 2.5
export default function ProjectsPage() {
  return (
    <PageHeader
      title="Projects"
      description="Selected projects: the problem, my role, the stack and the results."
    />
  )
}
