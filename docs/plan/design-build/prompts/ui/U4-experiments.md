> **Read [`docs/plan/design-build/00-STATE.md`](../../00-STATE.md) first** — §5 lists the stub routes and
> components that already exist on `next`, and §1 links the handoffs of everything merged so far.

# Agent U4 — Experiments

| Phase | Mode | Depends on | Unblocks |
|---|---|---|---|
| UI | Parallel with U1–U3, U5, U6 | F1, F2, F3 merged into `next` | V1 |

## Mission
Build the experiments gallery from screen 05: filter chips with counts, a live count line, the card grid with generated covers, and URL-synced filtering that works in a static export. Supersedes `docs/plan/prompts/wave-2/2.4-experiments-page.md`.

## Context to load first
- `docs/plan/design-build/00-README.md`, `01-design-tokens.md`, **`02-component-specs.md`** (ExperimentCard, FilterChip, CoverGradient), **`03-page-specs.md` → Experiments**
- Reference — Read and look at: **`05-experiments-desktop.png`**
- `docs/plan/01-architecture.md` §1 (static export rules — `useSearchParams` needs a Suspense boundary)
- `docs/handoffs/F1.md`, `F2.md`, `F3.md`, `1.2.md`
- `docs/plan/04-agent-loop-protocol.md`, `docs/plan/design-build/04-visual-qa-protocol.md`

## You own
`src/app/experiments/**`, `src/components/experiments/**`, `public/images/experiments/**`, `tests/unit/experiments/**`, `docs/handoffs/U4.md`

## Tasks
1. `experiments/page.tsx` is a Server Component: `PageHeader` with eyebrow `LAB`, title "Experiments", description "Small things I built to learn, test an idea, or just for fun." It renders `<Suspense fallback={<GallerySkeleton />}><ExperimentsGallery experiments={…} tags={getExperimentTags()} /></Suspense>`.
2. **`FilterChip`** per component spec: pill, mono, count suffix, selected state in brand-tinted fill, built on `ToggleGroup type="multiple"` with a leading "All" that clears the selection. Real `aria-pressed`, 44px hit area.
3. **`ExperimentsGallery`** (`'use client'`): AND filtering, `?tag=` sync with `router.replace(..., { scroll: false })`, state initialised from `useSearchParams`, "N experiments shown" in mono with `aria-live="polite"`, and an empty state with a "Clear filters" button.
4. **`ExperimentCard`** per spec: `CoverGradient` from F2 seeded by the slug with the 2-letter monogram, ↗ icon top-right, title, one-liner, `TagList` left and year right, `HoverLift` including `:focus-within`. The card is one link with the title as its accessible name; the optional `Source` link sits outside it so links never nest.
5. Grid: 3 / 2 / 1 columns at desktop / `md` / mobile, 24px gap (16px mobile). Enter and exit through `AnimatePresence` with `layout`; under reduced motion items appear and disappear without movement.
6. Mono footnote under the grid: chips come from `experiments.ts`, selection syncs to `?tag=`, cards without a screenshot fall back to a slug-derived gradient.
7. When an experiment has a real `image`, render it with `next/image` (16:10, `sizes` set) instead of the gradient.
8. `metadata`: title "Experiments", description, canonical `/experiments/`.
9. Tests: one tag filters correctly; two tags use AND; "All" resets; `?tag=` initialises state; the count line matches the rendered card count; the monogram is derived from the title; covers are deterministic per slug.

## Visual QA
Shoot `/experiments/` at 1280 and 390 in both themes, plus a filtered state and the empty state. Compare with screen 05.

## Acceptance criteria
- [ ] Standard gate passes; visual QA checklist passes
- [ ] `pnpm build` produces no "useSearchParams should be wrapped in a suspense boundary" error, and `out/experiments/index.html` lists every experiment
- [ ] With JS disabled, all experiments are listed (the filter UI may be hidden) and every card link works
- [ ] Every external link has `target="_blank"` and a `rel` containing `noopener`; no nested interactive elements (axe passes)
- [ ] Chips are keyboard operable (arrow keys within the group, Space/Enter toggles) and show a visible focus ring
- [ ] Screenshots + side-by-sides in `docs/handoffs/assets/U4/`

## EARLY_START mode
Structure, filtering logic and tests against the stubs; no screenshots; `status=EARLY_DONE`; visual pass after rebase.

## Loop rules
`docs/plan/04-agent-loop-protocol.md`. Up to 6 iterations. Final line:
`AGENT_RESULT id=U4 status=<DONE|BLOCKED|EARLY_DONE> pr=<url> preview=<url> ccr=<n>`
