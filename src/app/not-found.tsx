import type { Metadata, Route } from 'next'
import Link from 'next/link'

import { Container } from '@/components/shared'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Page not found',
}

export default function NotFound() {
  return (
    <Container
      as="div"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-6 py-16 text-center"
    >
      <p aria-hidden="true" className="text-signature text-numeral">
        404
      </p>
      <h1 className="text-h1 font-semibold text-balance">That page moved, or never existed</h1>
      <p className="max-w-[46ch] text-base text-pretty text-muted-foreground">
        The old Vite site lives on the <code className="font-mono">legacy-v1</code> tag, so a few
        links from it no longer resolve here.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/">Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={'/projects/' as Route}>Projects</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={'/experiments/' as Route}>Experiments</Link>
        </Button>
      </div>
    </Container>
  )
}
