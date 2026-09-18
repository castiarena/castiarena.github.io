> **Read [`docs/plan/design-build/00-STATE.md`](../../00-STATE.md) first** — §5 lists the stub routes and
> components that already exist on `next`, and §1 links the handoffs of everything merged so far.

# Agent V1 — Visual QA & Polish Pass

| Phase | Mode | Depends on | Unblocks |
|---|---|---|---|
| Integration | **Runs alone** after U1–U6 are merged into `next` | All UI agents | Wave 3 (SEO, quality, deploy dry-run) |

## Mission
Look at the whole site as one product rather than six branches. Find and fix the seams the parallel work left: inconsistent spacing between pages, components that were duplicated instead of shared, light-theme gaps, focus rings that got lost, motion that overruns its budget. Then lock the approved screens behind visual regression baselines.

## Context to load first
- `docs/plan/design-build/00-README.md`, `01-design-tokens.md`, `02-component-specs.md`, `03-page-specs.md`, **`04-visual-qa-protocol.md`**
- **Every reference image** in `docs/plan/design-build/reference/` — Read them and look at them
- Every handoff: `F1`–`F3`, `U1`–`U6`, plus `1.2` and `1.4`
- `docs/plan/04-agent-loop-protocol.md`

## You own
Everything under `src/**` for **fix-level changes only** (spacing, tokens, class names, shared-component adoption, a11y attributes, motion configs), `tests/e2e/visual.spec.ts`, `docs/handoffs/V1.md`, `docs/plan/design-build/DESIGN-QA-REPORT.md`.

**Not yours**: new features, content changes (1.2), CI configuration (1.4), or anything that changes a component's public props without a CCR.

## Tasks
1. **Full shoot**: run the harness over `/`, `/bio/`, `/experiments/`, `/projects/`, one `/projects/<slug>/`, `/404`, plus the open contact dialog and the mobile sheet — 1280 and 390, dark and light. Save everything under `docs/handoffs/assets/V1/`.
2. **Compare every screen** against its reference with `scripts/compare.mjs` and review each side-by-side yourself with the Read tool. Write down every difference, then classify it: **fix**, **accepted deviation**, or **design update needed**.
3. **Cross-page consistency sweep**, fixing as you go:
   - Section rhythm (`py-16`/`py-24`) and container width identical across pages
   - `PageHeader` used on Bio, Experiments and Projects with the same eyebrow, title and description treatment
   - `SectionHeading` action links ("All projects →", "All experiments →") identical in size, colour and icon
   - Card padding, radius, border and hover lift identical between `ProjectCard` and `ExperimentCard`
   - Stat accents follow the brand / brand-2 / brand-4 / brand-3 order on Home, Bio and project Outcomes
   - Mono used only for dates, tags, counts, section numbers, eyebrows and the footer
4. **De-duplicate**: if U2 built its own card or CTA while U5/U6 were unmerged, switch it to the shared component and delete the copy. Same for any locally re-implemented gradient, external link or list marker. `grep` for repeated class-name clusters to find them.
5. **Light theme pass**: go through every screen in light. Fix anything that was only tuned for dark — borders that vanish, muted text that greys out, gradient bands that wash out, scrims over covers.
6. **Interaction pass**: hover, focus-visible, active and disabled on every interactive element across all pages; keyboard traversal of each page end to end; the dialog and sheet focus behaviour; skip link; anchor targets not hidden under the sticky header.
7. **Motion pass**: check every transition against the budget (UI ≤400ms, reveals ≤700ms, `--ease-brand`, transform/opacity only). Run the whole site with `reducedMotion: 'reduce'` and confirm nothing moves and nothing stays hidden.
8. **Clean-up**: delete `src/app/styleguide/**` and `src/app/motion-lab/**` and any references to them (robots, sitemap, tests). They have done their job.
9. **Lock it in**: write `tests/e2e/visual.spec.ts` with `toHaveScreenshot` baselines for the six routes at both widths in dark, `maxDiffPixelRatio: 0.02`, animations disabled. Generate the baselines inside the Playwright Linux container image so CI matches, and commit them.
10. **Report**: `docs/plan/design-build/DESIGN-QA-REPORT.md` — one section per screen with the side-by-side, the verdict, fixes applied, accepted deviations, and anything the design should change. Close with a readiness statement for Wave 3.

## Acceptance criteria
- [ ] Standard gate passes, and `pnpm e2e` passes including the new visual specs
- [ ] Every screen's visual QA checklist from `04-visual-qa-protocol.md` passes in both themes at both widths
- [ ] `grep -rnE "#[0-9a-fA-F]{3,6}|rgb\(" src` finds nothing outside `globals.css`
- [ ] No duplicated component logic remains (name each one you merged in the report)
- [ ] axe clean (serious/critical) on every route, both themes
- [ ] Lighthouse mobile on all six routes: Performance ≥ 90, Accessibility ≥ 95, CLS ≤ 0.05
- [ ] `/styleguide/` and `/motion-lab/` are gone and nothing links to them
- [ ] `DESIGN-QA-REPORT.md` covers all 11 reference screens

## Loop rules
`docs/plan/04-agent-loop-protocol.md`. Up to 6 iterations. If a fix would need a new feature or a props change, record a CCR instead of building it. Final line:
`AGENT_RESULT id=V1 status=<DONE|BLOCKED> pr=<url> preview=<url> ccr=<n> deviations=<n>`
