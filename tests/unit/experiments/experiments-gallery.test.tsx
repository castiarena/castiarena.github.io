import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { MotionProvider } from '@/components/motion'
import type { Experiment } from '@/content'

import { mockReducedMotion } from '../motion/test-utils'

const replaceMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => '/experiments/',
}))

/**
 * The gallery reads a `?tag=` deep link from `window.location.search` after mount rather than from
 * `useSearchParams()` — that hook suspends during static prerendering, which would ship the
 * Suspense fallback as the exported page instead of the experiments. So these tests set the jsdom
 * URL rather than stubbing a Next hook.
 */
function setQuery(query: string) {
  window.history.replaceState(null, '', `/experiments/${query}`)
}

function experiment(slug: string, title: string, tags: string[], year = 2026): Experiment {
  return {
    slug,
    title,
    description: `What ${title} does.`,
    href: `https://example.com/${slug}`,
    tags,
    year,
  }
}

// One experiment per tag combination the filters need to tell apart: Vite only, TypeScript only,
// and both — so a two-tag selection has exactly one correct answer.
const EXPERIMENTS: Experiment[] = [
  experiment('vite-only', 'Vite Only', ['Vite']),
  experiment('ts-only', 'Typescript Only', ['TypeScript']),
  experiment('both', 'Both Tags', ['Vite', 'TypeScript']),
]
const TAGS = ['TypeScript', 'Vite']

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  replaceMock.mockReset()
})

beforeEach(() => {
  mockReducedMotion(false)
  setQuery('')
})

async function renderGallery(experiments: Experiment[] = EXPERIMENTS) {
  const { ExperimentsGallery } = await import('@/components/experiments')
  return render(
    <MotionProvider>
      <ExperimentsGallery experiments={experiments} tags={TAGS} />
    </MotionProvider>,
  )
}

function cardTitles(): string[] {
  return screen
    .getAllByRole('heading', { level: 3 })
    .map((heading) => heading.textContent?.replace(' (opens in a new tab)', '') ?? '')
}

const chip = (name: string) => screen.getByRole('button', { name })

describe('ExperimentsGallery', () => {
  it('lists every experiment with no filter applied', async () => {
    await renderGallery()
    expect(cardTitles()).toEqual(['Vite Only', 'Typescript Only', 'Both Tags'])
    expect(screen.getByText('3 experiments shown')).toBeInTheDocument()
  })

  it('shows each tag with its own count and "All" pressed by default', async () => {
    await renderGallery()
    // Radix gives a `type="multiple"` ToggleGroup `role="toolbar"` (its roving-focus pattern,
    // which is what makes arrow keys move between chips) — not `role="group"`.
    const group = screen.getByRole('toolbar', { name: 'Filter experiments by tag' })
    expect(within(group).getByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(within(group).getByRole('button', { name: 'Vite (2)' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(within(group).getByRole('button', { name: 'TypeScript (2)' })).toBeInTheDocument()
  })

  it('filters to one tag and syncs it to ?tag=', async () => {
    await renderGallery()

    fireEvent.click(chip('Vite (2)'))

    expect(cardTitles()).toEqual(['Vite Only', 'Both Tags'])
    expect(screen.getByText('2 experiments shown')).toBeInTheDocument()
    expect(replaceMock).toHaveBeenLastCalledWith('/experiments/?tag=Vite', { scroll: false })
  })

  it('uses AND semantics across two tags', async () => {
    await renderGallery()

    fireEvent.click(chip('Vite (2)'))
    fireEvent.click(chip('TypeScript (2)'))

    expect(cardTitles()).toEqual(['Both Tags'])
    expect(screen.getByText('1 experiment shown')).toBeInTheDocument()
    expect(replaceMock).toHaveBeenLastCalledWith('/experiments/?tag=Vite&tag=TypeScript', {
      scroll: false,
    })
  })

  it('"All" clears the selection and empties the query string', async () => {
    await renderGallery()

    fireEvent.click(chip('Vite (2)'))
    fireEvent.click(chip('All'))

    expect(cardTitles()).toHaveLength(3)
    expect(replaceMock).toHaveBeenLastCalledWith('/experiments/', { scroll: false })
  })

  it('pressing an already-selected tag deselects it', async () => {
    await renderGallery()

    fireEvent.click(chip('Vite (2)'))
    expect(cardTitles()).toHaveLength(2)

    fireEvent.click(chip('Vite (2)'))
    expect(cardTitles()).toHaveLength(3)
    expect(chip('All')).toHaveAttribute('aria-pressed', 'true')
  })

  it('applies a ?tag= deep link after mount', async () => {
    setQuery('?tag=Vite&tag=TypeScript')
    await renderGallery()

    expect(cardTitles()).toEqual(['Both Tags'])
    expect(chip('All')).toHaveAttribute('aria-pressed', 'false')
  })

  it('ignores a ?tag= value that is not a real tag', async () => {
    setQuery('?tag=NotATag')
    await renderGallery()

    expect(cardTitles()).toHaveLength(3)
    expect(chip('All')).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows the empty state with a working "Clear filters" button', async () => {
    setQuery('?tag=Vite')
    await renderGallery([experiment('ts', 'TS Only', ['TypeScript'])])

    expect(screen.getByText('No experiments match those tags.')).toBeInTheDocument()
    expect(screen.getByText('0 experiments shown')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument()

    fireEvent.click(chip('Clear filters'))

    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
    expect(replaceMock).toHaveBeenLastCalledWith('/experiments/', { scroll: false })
  })

  it('the count line is announced politely', async () => {
    await renderGallery()
    expect(screen.getByText('3 experiments shown')).toHaveAttribute('aria-live', 'polite')
  })
})
