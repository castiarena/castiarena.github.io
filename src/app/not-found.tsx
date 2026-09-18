import type { Metadata } from 'next'
import Link from 'next/link'

import { PageHeader } from '@/components/shared'

export const metadata: Metadata = {
  title: 'Page not found',
}

// STUB — implemented by agent 2.1
export default function NotFound() {
  return (
    <>
      <PageHeader
        title="Page not found"
        description="The page you are looking for does not exist."
      />
      <Link href="/">Back to home</Link>
    </>
  )
}
