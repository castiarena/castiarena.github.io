# Where the UI rebuild stands, and what to do next

Written 2026-09-23. Read this instead of `docs/plan/design-build/HANDOFF-PROMPT.md`
— that one briefs a big parallel agent wave, which is no longer how we're working.
Everything below is one small step at a time, each finishing green and committed.

---

## Current state in one paragraph

All five UI agent branches plus a hand-built Experiments page are merged on the
branch **`gate-ui`** (in the worktree `../wt-gate`, branched off `next`). Every
page of the site now exists and the full gate is green: lint, `tsc --noEmit`,
319 unit tests, `next build`, repo-wide `format:check`, `verify:export`
(9 passed / 2 expected warnings / 0 errors). **Nothing is pushed.** `origin/next`
is still at `2aba0c0`, and no PR has been opened for this work.

### Branches

| Branch | Where | State |
|---|---|---|
| `gate-ui` | `../wt-gate` | `0aed03c` — all the work. Has uncommitted changes (see step 1). |
| `next` | `portfolio/` | `cc4baab` — 2 commits ahead of `origin/next`, not pushed. |
| `agent/U1` `U2` `U3` `U5` `U6` | `../wt-U*` | Merged into `gate-ui`. Done with. |
| `agent/U4` | `../wt-U4` | Never ran. Its work was built by hand on `gate-ui` instead. |

### What landed on `gate-ui`

- **U1** layout shell: header, mobile sheet, footer, theme toggle.
- **U2** Home: hero, impact strip, selected projects, latest experiments, contact band.
- **U3** Bio: header, on-this-page rail, experience timeline, achievements, skills, training.
- **U5** Projects: alternating index rows, case-study detail, `ProjectCard`, gallery lightbox.
- **U6** Contact: dialog + form (react-hook-form/zod, honeypot, 3s min submit, mailto fallback), 404.
- **Experiments** (built by hand): filter chips with counts, live count line, 3/2/1 card grid,
  monogram gradient covers, empty state, `?tag=` sync.
- **Three foundation fixes** no agent's own gate caught: `cn()` was silently dropping
  `text-display/h1/h2/h3`, `Button asChild` threw unless `loading` was passed, and the brand
  `Badge` failed contrast (fixed with a new `--brand-ink` token). All three have regression tests.
- `/styleguide/` and `/motion-lab/` deleted; nav reordered to Home · Bio · Experiments · Projects.

---

## Step 1 — finish the project cover fix (15 min)

This is the only work in flight. `../wt-gate` has **uncommitted changes** to:

```
public/images/projects/*.svg            (3 files, regenerated)
src/components/projects/generate-covers.mjs
src/components/projects/projects-index.tsx
src/components/projects/project-detail.tsx
```

**The problem being fixed.** The generated SVG covers had the project title baked
into the artwork, so the title appeared twice (once painted in the image, once as
the card's real heading), and because the SVGs were natively 16:10 the components
used `object-contain` at every other ratio — leaving the gradient letterboxed
inside a `bg-muted` band. Reference screens 06 and 07 show flat, edge-to-edge
gradient covers with no text.

**What the uncommitted diff already does.** Regenerates the SVGs as gradient-only
(title text removed) and switches both components to `object-cover`, dropping the
`bg-muted` letterbox fill. Verified by re-shooting `/projects/` at 1280 dark: the
band and the duplicated title are gone.

**The open question.** Removing the title also removed the bottom scrim that was in
the same code path, which left the covers flatter and brighter than the reference —
reference covers darken toward their lower edge, the way `CoverGradient` does for
the live gradients. I started restoring just the scrim and Agustin stopped that
change, so **decide deliberately before committing**:

- (a) keep them flat as they are now, or
- (b) restore only the `<rect fill="url(#scrim)">` layer and its `linearGradient`
  in `buildSvg`, then re-run `node src/components/projects/generate-covers.mjs`.

Then: `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm format:check`
and commit.

---

## Step 2 — the questions only Agustin can answer (one sitting)

`src/content/` holds 24 `TODO(agustin)` placeholders (17 in `projects.ts`, 7 in
`experiments.ts`). The UI renders them faithfully and mutes them, so the site is
honest but reads as unfinished. These are the ones that actually change what's on
screen:

1. **Project titles carry the prefix**, so cards read "TODO(agustin): Recording
   Studio architecture". The reference shows "Recording Studio architecture".
   Should the three project titles drop the prefix and be treated as real?
2. **Project outcomes** are placeholders, so the case-study outcome tiles have
   nothing real to show.
3. **Experiments are three placeholders plus the real Portfolio v1.** Their tags
   are all literally `TODO`, which is why the filter row shows a `TODO 3` chip that
   the reference doesn't have. Real experiments (or dropping the placeholders) fixes
   this by itself.
4. **No experiment has a `sourceHref`**, so no card shows the "Source" link the
   reference shows on Portfolio v1.
5. **`profile.tagline` is shorter than the reference's**, so the hero reads lighter
   than designed.
6. **Achievement titles are Title Case** ("Scalability Enhancement"); the reference
   is sentence case ("Scalability enhancement").

---

## Step 3 — visual polish, one page per iteration

The gate is green and every page matches the reference in structure. These are the
differences I could see comparing screenshots side by side with the reference. None
is a blocker; do them one page at a time, re-shooting that page after each.

- **Home hero heading wraps early.** "Agustin Castiarena" breaks onto two lines at
  1280 because the hero's text column is capped at half the grid. The reference
  (shot at 1650) keeps it on one line. Consider widening the text column or letting
  the avatar column shrink.
- **`text-[15px]` in `latest-experiments.tsx`** and a `text-[clamp(...)]` in
  `not-found.tsx` are the only hand-rolled font sizes left; both could move onto the
  type scale.
- **`/experiments/` heading is smaller than the reference's**, which is a viewport
  artefact (reference is 1650 wide, we shoot at 1280) — confirm before changing anything.

### How to shoot

```bash
pnpm build && npx --yes serve out -l 4173
```

```bash
node scripts/shoot.mjs --route /experiments/ --out /tmp/shots
```

Writes `<slug>-{1280,390}-{dark,light}.png`. Always `md5` the dark and light pair —
if they're byte-identical the theme didn't actually switch. Last full run: all 20
PNGs differed correctly.

---

## Step 4 — show Agustin the site running, then open the PR

Not before. Serve `out/` locally, walk all five routes at 390 and 1280 in both
themes, and say plainly what matches the design and what doesn't.

Only after he's seen it: push `next` and open a PR into `main`. **Merging that PR
deploys to production** — `.github/workflows/deploy-pages.yml` publishes `main` to
https://castiarena.github.io. A PR into `main` is a release, not a checkpoint, and
the body must say so. PR #10 is still open from an earlier, pre-UI state; either
rewrite it or close it in favour of a fresh one.

---

## Things that will bite you

- **Node must be 24** (`.nvmrc`). Otherwise `pnpm install` resolves the wrong native
  bindings and fails with `Cannot find native binding … @rolldown/binding-wasm32-wasi`.
- **`tsc --noEmit` is not the same check as `next build`.** Typed routes are only
  validated during the build, and with `trailingSlash: true` an href like
  `"/projects/"` needs a `Route` cast (`href={'/projects/' as Route}`) — the repo
  convention. Six call sites failed this way after the merge.
- **`useSearchParams()` suspends during static prerendering.** Using it puts the
  Suspense *fallback* in the exported HTML and strands the real content in the RSC
  payload — the Experiments page shipped as a pulsing skeleton until this was
  caught. `ExperimentsGallery` reads the query string through `useSyncExternalStore`
  instead; don't "fix" it back.
- **`format:check` runs repo-wide.** `prettier-plugin-tailwindcss` sorts classes
  using the CSS config, so scoping it to changed files misses real failures.
- **Deleting a route leaves stale generated types.** `.next/types/validator.ts` will
  keep referencing the deleted page until you `rm -rf .next` and rebuild.
- **Don't spell a real Tailwind utility class contiguously in
  `tests/unit/shared/theme-tokens.test.ts`** — the content scanner matches raw
  substrings and will compile a phantom rule for a class nothing uses.
