> **Read [`docs/plan/design-build/00-STATE.md`](../../00-STATE.md) first.**
> Waves 0 and 1 are already merged, so a first version of the tokens, primitives and motion system
> exists on `next`. 00-STATE §4 lists exactly what still differs from this spec. You are
> reconciling that code with the approved design, not starting from an empty file.

# Agent F3 — Motion System

| Phase | Mode | Depends on | Unblocks |
|---|---|---|---|
| Foundations | Parallel with F1, F2, 1.2, 1.4 | 0.1 bootstrap merged into `next` | U1–U6 |

## Mission
Implement the motion primitives the pages compose with, inside the design's motion budget: UI ≤400ms, reveals ≤700ms, `cubic-bezier(0.22, 1, 0.36, 1)`, transform and opacity only, everything off under reduced motion.

## Context to load first
- `docs/plan/design-build/00-README.md`, **`01-design-tokens.md` §6**, `02-component-specs.md` (HoverLift on cards, nav underline, CountUp on stats), `03-page-specs.md` (where each effect appears)
- `docs/plan/design-build/reference/01-foundations.png` (motion budget box) and `03-home-desktop.png`
- `docs/plan/02-shared-contracts.md` (§4 motion stubs — frozen), `docs/plan/04-agent-loop-protocol.md`, `docs/handoffs/0.1.md`

## You own
`src/components/motion/**`, `src/app/motion-lab/**`, `tests/unit/motion/**`, `docs/handoffs/F3.md`, plus adding `motion` to deps.

## Tasks
1. `pnpm add motion`. Use `motion/react`, `LazyMotion` with `domAnimation` and `strict`, and `m.*` components everywhere so the bundle stays small.
2. **`MotionProvider`**: `MotionConfig reducedMotion="user"` with the default transition `{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }`, wrapped in `LazyMotion`. U1 mounts it in `layout.tsx`.
3. **`Reveal`** (`{ children, delay?, y?, as?, className? }`): opacity 0→1 and y 16→0 on entering the viewport, `viewport={{ once: true, amount: 0.2 }}`, duration ≤700ms. Pick a hydration strategy that keeps the static HTML **visible** (no `opacity:0` in `out/*.html`) and doesn't flash elements that are already on screen at hydration. Explain the choice in the handoff.
4. **`Stagger` / `StaggerItem`**: 60ms between children, used by the stat strip, card grids and the hero's on-load entrance.
5. **`HoverLift`**: y −4px on hover, `scale(0.98)` on tap, and the same lift on `:focus-within` so keyboard users get it too.
6. **`CountUp`** (`{ value, suffix?, durationMs? }`): counts from 0 when first in view, renders the final value in SSR HTML, `aria-label` carries the final value while the animated digits are `aria-hidden`, and reduced motion shows the final value immediately.
7. **`ParallaxLayer`** (`{ children, offset? }`) for the projects covers and the hero mesh drift, and **`ScrollProgress`** for the header. Both no-ops under reduced motion. Add them as new exports.
8. **Nav underline helper**: export the `layoutId` constant and the shared transition U1 uses for the active-item underline, so it isn't reinvented per page.
9. `'use client'` at the top of each file, no default exports, nothing animated except `transform` and `opacity`, no layout-triggering properties.
10. **`/motion-lab/`** (noindex) demonstrates every primitive with a reduced-motion toggle note. V1 deletes it before release.
11. Tests with `IntersectionObserver` and `matchMedia` mocked: each primitive renders its children; `CountUp`'s SSR output contains the final value; with reduced motion mocked, no transform is applied.

## Acceptance criteria
- [ ] Standard gate passes
- [ ] `grep -rn "framer-motion" src` finds nothing; motion components use `m.*`, not `motion.*`
- [ ] Playwright with `reducedMotion: 'reduce'` on `/motion-lab/`: after scrolling, no element carries a non-identity inline transform
- [ ] With `javaScriptEnabled: false`, every text on `/motion-lab/` is visible (computed opacity 1)
- [ ] First-load JS added by motion ≤ 35 KB gzip — record the before/after numbers from `next build`
- [ ] Every duration in the code is ≤400ms for UI and ≤700ms for reveals (a test greps the transition configs)

## Handoff — `docs/handoffs/F3.md`
Usage snippet per primitive, recommended defaults per context (hero, grid, timeline, stat), the hydration strategy, and the bundle numbers.

## Loop rules
`docs/plan/04-agent-loop-protocol.md`. Up to 6 iterations. Final line:
`AGENT_RESULT id=F3 status=<DONE|BLOCKED> pr=<url> preview=<url> ccr=<n>`
