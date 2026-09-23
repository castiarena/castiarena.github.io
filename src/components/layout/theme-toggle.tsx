'use client'

import { useSyncExternalStore } from 'react'
import { MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'

const THEME_CYCLE = ['light', 'dark', 'system'] as const
type ThemeMode = (typeof THEME_CYCLE)[number]

function nextMode(mode: ThemeMode): ThemeMode {
  const index = (THEME_CYCLE.indexOf(mode) + 1) % THEME_CYCLE.length
  // Always in range: `index` is a modulo of THEME_CYCLE.length, never out of bounds.
  return THEME_CYCLE[index] as ThemeMode
}

const subscribeNoop = () => () => {}
const getMountedSnapshot = () => true
const getMountedServerSnapshot = () => false

/**
 * `true` only after the client has hydrated. Same `useSyncExternalStore` trick
 * `@/components/motion/shared.ts`'s `useMotionAllowed` uses, instead of a `useEffect` + `setState`
 * mount flag, so the first client render can safely differ from the static server markup without
 * triggering a second render pass.
 */
function useMounted(): boolean {
  return useSyncExternalStore(subscribeNoop, getMountedSnapshot, getMountedServerSnapshot)
}

/**
 * Ghost 40×40 icon button. Cycles light → dark → system; the icon follows the *resolved* theme
 * (moon for dark, sun for light) while the accessible name states the mode actually selected, so
 * "system" is distinguishable even though it shares an icon with whichever theme it resolves to.
 */
export function ThemeToggle() {
  const mounted = useMounted()
  const { theme, resolvedTheme, setTheme } = useTheme()

  // Same footprint as the real button before mount, so nothing shifts when next-themes resolves
  // the stored preference on the client.
  if (!mounted) {
    return <span aria-hidden="true" className="size-10" />
  }

  const mode = (theme as ThemeMode | undefined) ?? 'system'
  const upcoming = nextMode(mode)
  const isDark = resolvedTheme === 'dark'

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => setTheme(upcoming)}
      aria-label={`Theme: ${mode}. Switch to ${upcoming}.`}
    >
      {isDark ? <MoonIcon aria-hidden="true" /> : <SunIcon aria-hidden="true" />}
    </Button>
  )
}
