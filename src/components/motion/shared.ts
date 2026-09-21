import { MotionConfigContext, type Variants } from 'motion/react'
import {
  type RefObject,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
} from 'react'

/**
 * Site-wide easing (easeOutQuint-like). Mirrors the design token `--ease-brand`
 * (`cubic-bezier(0.22, 1, 0.36, 1)`, `01-design-tokens.md` §6) and the `MotionProvider` default
 * transition. Kept as a JS constant rather than read from the CSS custom property: Motion's
 * transition config needs a literal cubic-bezier array (or duration in seconds) at the point an
 * animation is defined, including during SSR where there is no `getComputedStyle` to read from,
 * so the token and this constant are two literals that must be kept equal by convention, not by
 * reference. `tests/unit/motion/budget.test.ts` pins both this value and the durations below so
 * a drift shows up as a failing test instead of a silent visual mismatch.
 */
export const MOTION_EASE = [0.22, 1, 0.36, 1] as const
/** UI interactions — hover, tap, toggle, the nav underline. Mirrors `--dur-ui` (200ms), hard cap 400ms. */
export const MOTION_DURATION_UI = 0.2
/** Scroll reveals. Mirrors `--dur-reveal` (500ms), hard cap 700ms. */
export const MOTION_DURATION_REVEAL = 0.5

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function subscribeReducedMotion(onChange: () => void) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {}
  const mql = window.matchMedia(REDUCED_MOTION_QUERY)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

function getMotionAllowedSnapshot() {
  if (typeof window.matchMedia !== 'function') return true
  return !window.matchMedia(REDUCED_MOTION_QUERY).matches
}

/** Motion is never allowed on the server or during hydration, so SSR markup stays static. */
function getMotionAllowedServerSnapshot() {
  return false
}

/**
 * `true` only on the client, after hydration, when the user has not asked for reduced motion
 * (and `MotionConfig reducedMotion` is not `"always"`).
 *
 * The server snapshot is `false`, so the first client render matches the static server HTML
 * exactly: no inline `opacity`/`transform` is ever rendered before JS has decided to animate.
 */
export function useMotionAllowed(): boolean {
  const { reducedMotion } = useContext(MotionConfigContext)
  const allowed = useSyncExternalStore(
    subscribeReducedMotion,
    getMotionAllowedSnapshot,
    getMotionAllowedServerSnapshot,
  )
  return allowed && reducedMotion !== 'always'
}

export const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * Whether an element starts below the fold. Only those are hidden and revealed on scroll:
 * anything the user can already see (or has scrolled past) stays visible, so there is no
 * visible → hidden flicker when JS hydrates.
 */
export function isBelowFold(el: Element): boolean {
  return el.getBoundingClientRect().top >= window.innerHeight
}

export interface RevealCustom {
  y: number
  delay?: number
}

/**
 * Shared by `Reveal` and `StaggerItem`. `hidden` applies instantly (it is only used for
 * off-screen elements); `visible` fades in and slides up. `delay` is only set when given, so a
 * parent's `staggerChildren` delay is not overridden.
 */
export const revealVariants: Variants = {
  hidden: ({ y }: RevealCustom) => ({ opacity: 0, y, transition: { duration: 0 } }),
  visible: ({ delay }: RevealCustom) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATION_REVEAL,
      ease: MOTION_EASE,
      ...(delay ? { delay } : {}),
    },
  }),
}

export const revealViewport = { once: true, amount: 0.2 } as const

/**
 * `layoutId` shared by every `NavItem`'s active-state underline (`02-component-specs.md`:
 * "animated between items with a Motion `layoutId`"). Motion animates an element between two
 * positions only when both instances share a `layoutId`, so this constant must be the same
 * string everywhere a `NavItem` renders the underline — hence a shared export instead of a
 * per-page literal.
 */
export const NAV_UNDERLINE_LAYOUT_ID = 'nav-active-underline'

/**
 * Transition for the nav underline's `layoutId` animation. UI-budget, not reveal-budget: it's a
 * hover/selection-adjacent interaction, not a scroll reveal.
 */
export const navUnderlineTransition = { duration: MOTION_DURATION_UI, ease: MOTION_EASE }

/**
 * Hydration-safe reveal switch shared by `Reveal` and `Stagger`.
 *
 * Returns `false` on the server, during hydration, under reduced motion, and for elements that
 * are already on screen (or above it) when motion becomes allowed: those keep the static,
 * fully visible server HTML. It flips to `true` (once, before paint) only for elements that
 * start below the fold; the caller then hides them instantly and reveals them on scroll.
 */
export function useArmedReveal(ref: RefObject<Element | null>): boolean {
  const allowed = useMotionAllowed()
  const [armed, setArmed] = useState(false)

  useIsomorphicLayoutEffect(() => {
    if (!allowed || armed || !ref.current) return
    // Measuring layout before paint is the documented use case for setState in a layout effect.
    if (isBelowFold(ref.current)) setArmed(true)
  }, [allowed, armed, ref])

  return armed
}

/** Joins class names. Motion components avoid `cn` so tailwind-merge stays out of their client bundle. */
export function joinClassNames(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}
