'use client'

import type { Route } from 'next'
import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'

import { MOTION_DURATION_UI, useMotionAllowed } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { ToggleGroup } from '@/components/ui/toggle-group'
import type { Experiment } from '@/content'

import { ExperimentCard } from './experiment-card'
import { FilterChip } from './filter-chip'

/** Toggle value of the leading "All" chip. Not a tag, so it can never collide with one. */
export const ALL_FILTER_VALUE = '__all__'

/** Query-string key the selection syncs to: `?tag=Vite&tag=TypeScript`. */
export const TAG_PARAM = 'tag'

export interface ExperimentsGalleryProps {
  experiments: Experiment[]
  tags: string[]
}

/** AND semantics: an experiment matches only when it carries *every* selected tag. */
export function filterExperiments(experiments: Experiment[], selected: string[]): Experiment[] {
  if (selected.length === 0) return experiments
  return experiments.filter((experiment) => selected.every((tag) => experiment.tags.includes(tag)))
}

function subscribeToLocation(onChange: () => void) {
  window.addEventListener('popstate', onChange)
  return () => window.removeEventListener('popstate', onChange)
}

const getSearch = () => window.location.search
/** `''` on the server, so the prerendered HTML is always the unfiltered list. */
const getServerSearch = () => ''

/** `?tag=` values that are actually tags of this collection, in URL order. */
function readTagsFromSearch(search: string, known: string[]): string[] {
  return new URLSearchParams(search).getAll(TAG_PARAM).filter((tag) => known.includes(tag))
}

/**
 * Filterable experiments grid (`03-page-specs.md` → Experiments).
 *
 * The selection lives in React state and is *mirrored* to `?tag=` rather than read from it on
 * every render. On a static export there is no server to re-render per query string, so the URL is
 * a shareable side effect, not the source of truth; `router.replace(..., { scroll: false })` keeps
 * the address bar in step without scrolling the page or pushing a history entry for what is really
 * one filtering interaction.
 *
 * **Why the deep link is not read from `useSearchParams()`.** The page spec asks for
 * `useSearchParams()` behind a `<Suspense>` boundary, but that hook *suspends during static
 * prerendering*: `next build` then writes the fallback into `out/experiments/index.html` and the
 * experiments never reach the markup — verified, the exported page was a pulsing skeleton with all
 * four experiments stranded in the RSC payload. That breaks U4's acceptance criterion ("with JS
 * disabled, all experiments are listed and every card link works") and hides the page from
 * crawlers.
 *
 * So the query string is read through `useSyncExternalStore` instead — the same hydration-safe
 * shape `useMotionAllowed` uses. Its server snapshot is `''`, so the prerendered HTML is the full
 * unfiltered list and the first client render matches it exactly; the browser's real `?tag=` takes
 * effect immediately afterwards. Once the visitor touches a chip, `override` takes over as the
 * source of truth: the selection has to respond instantly, and `router.replace` lands the new URL
 * asynchronously. Nothing is lost by ignoring later URL changes, because `replace` deliberately
 * adds no history entries for filtering.
 */
export function ExperimentsGallery({ experiments, tags }: ExperimentsGalleryProps) {
  const router = useRouter()
  const pathname = usePathname()
  const motionAllowed = useMotionAllowed()

  const search = useSyncExternalStore(subscribeToLocation, getSearch, getServerSearch)
  const [override, setOverride] = useState<string[] | null>(null)
  const fromUrl = useMemo(() => readTagsFromSearch(search, tags), [search, tags])
  const selected = override ?? fromUrl

  const counts = useMemo(() => {
    const byTag = new Map<string, number>()
    for (const experiment of experiments) {
      for (const tag of experiment.tags) byTag.set(tag, (byTag.get(tag) ?? 0) + 1)
    }
    return byTag
  }, [experiments])

  const syncUrl = useCallback(
    (next: string[]) => {
      const params = new URLSearchParams(window.location.search)
      params.delete(TAG_PARAM)
      for (const tag of next) params.append(TAG_PARAM, tag)
      const query = params.toString()
      // Typed routes can't express "this pathname plus a query string", and the value is built
      // from `usePathname()` rather than written by hand, so the cast asserts nothing new.
      router.replace((query ? `${pathname}?${query}` : pathname) as Route, { scroll: false })
    },
    [pathname, router],
  )

  const apply = useCallback(
    (next: string[]) => {
      setOverride(next)
      syncUrl(next)
    },
    [syncUrl],
  )

  /**
   * "All" is an item of the same group so it joins the arrow-key ring, which means Radix reports
   * it in the value array like any other chip. Translate that back into a tag selection.
   *
   * The one ambiguous case is `next` containing "All": that happens both when the user presses
   * "All" *and* when they press a tag while "All" is already lit, because the controlled value
   * carries "All" whenever nothing is selected. What tells them apart is whether "All" was lit
   * beforehand — i.e. whether anything was selected — not whether it appears in `next`.
   */
  const handleValueChange = useCallback(
    (next: string[]) => {
      const pressedAll = next.includes(ALL_FILTER_VALUE) && selected.length > 0
      apply(pressedAll ? [] : next.filter((value) => value !== ALL_FILTER_VALUE))
    },
    [apply, selected.length],
  )

  const visible = useMemo(() => filterExperiments(experiments, selected), [experiments, selected])
  const groupValue = selected.length === 0 ? [ALL_FILTER_VALUE] : selected

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <ToggleGroup
          type="multiple"
          value={groupValue}
          onValueChange={handleValueChange}
          aria-label="Filter experiments by tag"
          className="max-w-full flex-wrap gap-2"
        >
          <FilterChip value={ALL_FILTER_VALUE} label="All" />
          {tags.map((tag) => (
            <FilterChip key={tag} value={tag} label={tag} count={counts.get(tag) ?? 0} />
          ))}
        </ToggleGroup>

        <p aria-live="polite" className="font-mono text-xs text-muted-foreground">
          {visible.length} {visible.length === 1 ? 'experiment' : 'experiments'} shown
        </p>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-start gap-4 rounded-lg border border-border bg-card p-8">
          <p className="text-muted-foreground">No experiments match those tags.</p>
          <Button variant="ghost" onClick={() => apply([])}>
            Clear filters
          </Button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((experiment, index) => (
              <m.li
                key={experiment.slug}
                layout={motionAllowed}
                initial={motionAllowed ? { opacity: 0, scale: 0.96 } : false}
                animate={{ opacity: 1, scale: 1 }}
                exit={motionAllowed ? { opacity: 0, scale: 0.96 } : { opacity: 0 }}
                transition={{ duration: MOTION_DURATION_UI }}
              >
                <ExperimentCard experiment={experiment} priority={index < 3} />
              </m.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  )
}
