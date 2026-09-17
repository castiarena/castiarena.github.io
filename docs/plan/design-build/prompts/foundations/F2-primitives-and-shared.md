> **Read [`docs/plan/design-build/00-STATE.md`](../../00-STATE.md) first.**
> Waves 0 and 1 are already merged, so a first version of the tokens, primitives and motion system
> exists on `next`. 00-STATE §3 lists exactly what still differs from this spec. You are
> reconciling that code with the approved design, not starting from an empty file.

# Agent F2 — Primitives & Shared Components

| Phase | Mode | Depends on | Unblocks |
|---|---|---|---|
| Foundations | Parallel with F1, F3, 1.2, 1.4 | 0.1 bootstrap merged into `next` | U1–U6 |

## Mission
Install and restyle every shadcn primitive the design uses, implement the shared components from `02-component-specs.md`, ship the screenshot/compare harness the whole team needs for visual QA, and put it all on a style guide route.

You write against the token names in `01-design-tokens.md`. F1 lands the values in parallel — never redefine a token yourself.

## Context to load first
- `docs/plan/design-build/00-README.md`, **`01-design-tokens.md`**, **`02-component-specs.md`**, `04-visual-qa-protocol.md`
- `docs/plan/design-build/reference/02-components.png` — Read it and look at it; also glance at `03-home-desktop.png` and `05-experiments-desktop.png` for components in context
- `docs/plan/02-shared-contracts.md` (§4 shared stub signatures — frozen), `docs/plan/04-agent-loop-protocol.md`, `docs/handoffs/0.1.md`

## You own
`components.json`, `src/components/ui/**`, `src/components/shared/**` (except `fonts.ts`, which is F1's), `src/app/styleguide/**`, `scripts/shoot.mjs`, `scripts/compare.mjs`, `tests/unit/shared/**` (except `contrast.test.ts`), `docs/handoffs/F2.md`, plus deps.

## Tasks
1. **shadcn init** for Tailwind v4 (CSS variables, RSC, `@/components` alias). Confirm `components.json` points at `src/app/globals.css`. Install: `button badge card dialog sheet navigation-menu form input textarea label separator tooltip toggle-group skeleton sonner scroll-area aspect-ratio`.
2. **Restyle the primitives** to `02-component-specs.md`: button variants and sizes with the ≥44px hit area and the loading state; badge with the `brand` variant; input/textarea/form with the error treatment; dialog and sheet with the overlay, blur, radius and padding from the spec. Keep the shadcn API surface so later `shadcn add` runs stay compatible, and put every change in the component file rather than in overrides scattered across pages.
3. **Shared components** (signatures per `docs/plan/02-shared-contracts.md` §4, visuals per `02-component-specs.md`): `Container`, `PageHeader`, `SectionHeading` (with the right-hand action slot), `TagList`, `ExternalLink`, `GradientText`, plus the new `StatTile`, `CoverGradient` and `ProseList`. Export them all from `src/components/shared/index.ts`.
4. **`CoverGradient`** is load-bearing for three pages: given a `seed` it picks two stops from the brand ramp deterministically (hash → hue rotation within the brand range), renders a 135° gradient with a bottom scrim, and optionally a monogram or label. Same seed must always give the same output, in SSR and in the browser. Unit-test that.
5. **Harness** (`04-visual-qa-protocol.md` §1–2): `scripts/shoot.mjs` (route → 4 PNGs, theme via `localStorage`, animations disabled, fonts and images awaited) and `scripts/compare.mjs` (stack a shot beside a reference at equal width). Pure Node plus Playwright, no new heavy deps. Add `"shoot"` and `"compare"` scripts to `package.json`. Document usage in your handoff — every UI agent depends on this.
6. **Style guide** (`src/app/styleguide/page.tsx`, `robots: { index: false }`): reproduce `reference/02-components.png` section by section — buttons (all variants, sizes, loading, disabled), badges and taglist, external link, project card, stat tile, nav item, form fields including the error state, filter chips, timeline node — each labelled with a mono eyebrow like the reference. Add a `?theme=` free area so both themes can be shot. V1 deletes this route before release.
7. **Tests**: `ExternalLink` (rel/target/sr-only), `TagList` (`max` overflow), `StatTile` (accent class, `variant`), `CoverGradient` (determinism), `Button` (loading sets `aria-busy` and disables), `Input` (error wires `aria-invalid` + `aria-describedby`).
8. Do **not** build page-specific components (`ProjectCard`, `ExperimentCard`, `TimelineNode`, `FilterChip`, nav, footer). Those belong to U1–U5. Your job is the parts they compose.

## Acceptance criteria
- [ ] Standard gate passes
- [ ] `/styleguide/` renders every component in both themes with no console errors
- [ ] Side-by-side of `/styleguide/` against `reference/02-components.png` reviewed by you, saved in `docs/handoffs/assets/F2/`
- [ ] `node scripts/shoot.mjs --route /styleguide/ --out /tmp/x` produces 4 correct PNGs, and `compare.mjs` produces a readable side-by-side
- [ ] `grep -rnE "#[0-9a-fA-F]{3,6}|rgb\(" src/components/ui src/components/shared` finds nothing
- [ ] Every interactive primitive shows a visible focus ring and has a ≥44×44px hit area (Playwright measures the bounding boxes)
- [ ] Shared exports still match `docs/plan/02-shared-contracts.md` §4

## Handoff — `docs/handoffs/F2.md`
Component inventory with props and variants, harness usage, the `CoverGradient` algorithm, and anything a UI agent should reuse instead of rebuilding.

## Loop rules
`docs/plan/04-agent-loop-protocol.md`. Up to 6 iterations. Final line:
`AGENT_RESULT id=F2 status=<DONE|BLOCKED> pr=<url> preview=<url> ccr=<n>`
