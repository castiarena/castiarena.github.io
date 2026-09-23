import type { Metadata } from 'next'

import { ExperimentsGallery } from '@/components/experiments'
import { Container, PageHeader } from '@/components/shared'
import { experiments, getExperimentTags } from '@/content'

const DESCRIPTION = 'Small things I built to learn, test an idea, or just for fun.'

export const metadata: Metadata = {
  title: 'Experiments',
  description: DESCRIPTION,
  alternates: { canonical: '/experiments/' },
}

/**
 * Server Component. `ExperimentsGallery` is a client component but deliberately does not read
 * `useSearchParams()`, so it prerenders: the full chip row, every card and every link end up in
 * `out/experiments/index.html`, which is what makes the page readable with JavaScript disabled
 * and visible to crawlers. There is no `<Suspense>` boundary here because nothing suspends — see
 * the note on `ExperimentsGallery` for why the `?tag=` deep link is read after mount instead.
 */
export default function ExperimentsPage() {
  return (
    <Container as="section">
      <PageHeader eyebrow="LAB" title="Experiments" description={DESCRIPTION} />
      <ExperimentsGallery experiments={experiments} tags={getExperimentTags()} />
      <p className="mt-12 border-t border-border pt-8 pb-16 font-mono text-xs text-muted-foreground">
        Chips are generated from experiments.ts and the selection syncs to ?tag=. Cards without a
        screenshot fall back to a gradient derived from the slug.
      </p>
    </Container>
  )
}
