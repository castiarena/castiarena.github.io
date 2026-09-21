# Handoff prompt — finish the portfolio v2 UI

> Paste everything below the line into a fresh agent session started in
> `/Users/agustincastiarena/castiarena/portfolio`. It is self-contained.

---

You are the orchestrator for the remaining work on a Next.js portfolio rebuild. A team of
agents has already completed the groundwork; your job is to build the six page UIs, integrate
them, verify the result locally, show the human, and only then open a pull request.

## 1. Your mission

Make the site match the approved design — 11 screens, in
`docs/plan/design-build/reference/` (PNGs, plus `portfolio-design.pdf`). "Matches the design"
means the reference screens reproduced at 390px and 1280px in both dark and light, not merely
"the page renders".

**Do not deploy to production.** Pushing to `main` publishes to https://castiarena.github.io
via `.github/workflows/deploy-pages.yml`. The human decides when that happens; the plan has a
dedicated cutover agent (`docs/plan/prompts/wave-4/4.1-cutover-production.md`) for it.

## 2. Read these first

- `docs/plan/00-README.md` — the overall plan, waves, stack
- `docs/plan/design-build/00-README.md` — the design build; authoritative for anything visual
- `docs/plan/design-build/00-STATE.md` — what was already merged and why
- `docs/plan/design-build/01-design-tokens.md`, `02-component-specs.md`, `03-page-specs.md`,
  `04-visual-qa-protocol.md`
- `docs/plan/02-shared-contracts.md` — frozen type and prop contracts
- `docs/plan/04-agent-loop-protocol.md` — the loop each agent follows
- `docs/handoffs/F1.md`, `F2.md`, `F3.md` — what the foundations shipped and how to use it

## 3. Exact state right now

**Branches**

| Ref | Commit | Contents |
|---|---|---|
| `origin/main` | `4943a17` | **Deployed to production.** Stub pages only — no UI work |
| `origin/next` | `8c5a253` | Integration branch. Waves 0–1 **plus the merged foundations** |
| `agent/U1` … `agent/U6` | `8c5a253` | Six worktrees, branched off `next`, **empty — no work done yet** |

`next` is where you work. Merging `next` into `main` is what deploys, so don't.

**Worktrees already exist** at `../wt-U1` … `../wt-U6` (siblings of the repo), each on its
`agent/U<n>` branch with `node_modules` installed. `scripts/agents/wave.sh` manages them.

**What is done and merged into `next`:**

- Next.js 16 static export (`output: 'export'`), TypeScript strict, Tailwind v4, pnpm, Node 24
- CI (`ci`, `deploy-pages`), `vercel.json`, `scripts/verify-export.mjs`
- Content layer: zod schema validated at build time, real CV content, date formatters
- **F1 tokens** — `src/app/globals.css`, OKLCH only, dark + light, the fluid type scale as
  `text-display/h1/h2/h3` utilities, `bg-signature`, `text-signature`, `bg-hero-mesh`,
  `container-page`, `focus-ring`, `hairline`, and a contrast test covering every pair
- **F2 components** — restyled shadcn primitives, plus `Container`, `PageHeader`,
  `SectionHeading`, `TagList`, `ExternalLink`, `GradientText`, `StatTile`, `ProseList`,
  `CoverGradient` + `getCoverGradientStops`, all exported from `@/components/shared`
- **F2 visual QA harness** — `scripts/shoot.mjs` and `scripts/compare.mjs` (`pnpm shoot`,
  `pnpm compare`)
- **F3 motion** — `Reveal`, `Stagger`/`StaggerItem`, `HoverLift`, `CountUp`, `MotionProvider`,
  `ScrollProgress`, `ParallaxLayer`, `NAV_UNDERLINE_LAYOUT_ID`, `navUnderlineTransition`, all
  from `@/components/motion`
- Temporary routes `/styleguide/` and `/motion-lab/` — V1 deletes both before release

**Gate status on `next` today:** `pnpm lint`, `pnpm format:check`, `pnpm typecheck`,
`pnpm test -- --run` (167 tests), `pnpm build`, `node scripts/verify-export.mjs` all pass.
`verify-export` reports two warnings — no `sitemap.xml`, no `robots.txt`. Those are expected:
agent 3.1 adds them in wave 3 and flips `VERIFY_STRICT=1` then.

**What is NOT done:** every page. `/`, `/bio/`, `/experiments/`, `/projects/`,
`/projects/[slug]/`, `not-found` and the contact dialog are all wave-0 stubs. That is your work.

## 4. The work, in order

### Step 1 — run U1–U6 in parallel

```bash
export AGENT_NOTE="...see below..."
./scripts/agents/wave.sh launch ui
```

Prompts are `docs/plan/design-build/prompts/ui/U{1..6}-*.md`; each states its own ownership and
acceptance criteria. Ownership matters — six agents run at once:

| Agent | Owns |
|---|---|
| U1 | `src/app/layout.tsx`, `src/components/layout/**` — header, mobile nav, footer, theme |
| U2 | `src/app/page.tsx`, `src/components/home/**` |
| U3 | `src/app/bio/**`, `src/components/bio/**` |
| U4 | `src/app/experiments/**`, `src/components/experiments/**` |
| U5 | `src/app/projects/**`, `src/components/projects/**` — `ProjectCard` lives here, Home imports it |
| U6 | `src/components/contact/**`, `src/app/not-found.tsx` |

Pass this as `AGENT_NOTE` (the launcher appends it to every prompt in the wave):

> **Finish by committing on your own branch. Do NOT push and do NOT open a PR** — the
> orchestrator integrates all six and opens one PR. End with your `AGENT_RESULT` line using
> `pr=none`.
>
> **Foundations are already on this branch.** Read `docs/handoffs/F1.md`, `F2.md`, `F3.md` and
> reuse what is there — do not rebuild tokens, primitives or motion. `EARLY_START` does not
> apply: do the full visual pass.
>
> **Screenshots — use your own port.** Six agents run at once, so a shared port means you
> screenshot someone else's build. Yours: U1=4181, U2=4182, U3=4183, U4=4184, U5=4185, U6=4186.
> `pnpm build`, then `npx --yes serve out -l <port>`, then
> `node scripts/shoot.mjs --route <route> --out docs/handoffs/assets/<id> --base-url http://localhost:<port>`.
> Open the PNGs and compare them to your reference screen before declaring DONE.
>
> **U1 owns a known gap:** `<html>` carries no `.dark` class, so the site defaults to light
> while the design specifies dark as default. Wire next-themes with dark as default and no
> flash of the wrong theme on first paint. Everyone else can assume that lands.
>
> **Known trap:** a component referencing a colour utility with no matching token in the
> `@theme inline` map compiles to nothing — silently, with no error.
> `tests/unit/shared/theme-tokens.test.ts` is the only thing that catches it; keep it passing.
> Available colour tokens: background, foreground, card, muted, muted-foreground, border,
> input, ring, brand, brand-2, brand-3, brand-4, brand-foreground, destructive, warning. There
> is **no** primary, secondary, accent, popover or card-foreground.
>
> **Run `pnpm format:check` repo-wide**, not only on files you touched — F1's tokens changed
> Tailwind's class sort order, so prettier flags files you never opened.

### Step 2 — the wave gate (do not skip; this is the step that catches things)

Each agent only ever verifies its own branch, so the defects live in the seams. In the
foundations wave this exact procedure caught five, none of which failed any agent's own tests:

```bash
SCRATCH=$(mktemp -d)/wt-merge
git worktree add "$SCRATCH" -b trial/ui-merge origin/next
cd "$SCRATCH" && for b in agent/U1 agent/U2 agent/U3 agent/U4 agent/U5 agent/U6; do
  git merge --no-edit "$b" || echo "CONFLICT $b"
done
pnpm install --frozen-lockfile
pnpm lint && pnpm format:check && pnpm typecheck && pnpm test -- --run && pnpm build
node scripts/verify-export.mjs
npx --yes serve out -l 4173 &
for r in / /bio/ /experiments/ /projects/ /projects/recording-studio-architecture/; do
  node scripts/shoot.mjs --route "$r" --out "$SCRATCH/shots"
done
```

Then **look at every PNG yourself** and compare it against the matching reference screen. Check
specifically:

- the dark and light PNGs are not byte-identical (`md5`) — a harness that silently emits
  duplicates once made an entire wave's light-theme evidence worthless
- no component references a token that no longer exists (`bg-primary` and friends compile to
  nothing — grep the built CSS for the class if unsure)
- `pnpm format:check` passes **repo-wide**, not per-agent

Send defects back to the owning agent with a specific, reproducible description, in its own
worktree, instructing it to commit but not push. Re-run the gate until clean.

### Step 3 — V1

`docs/plan/design-build/prompts/integration/V1-visual-qa-and-polish.md`. Runs alone after
U1–U6 merge into `next`. It does the cross-screen polish pass and deletes `/styleguide/` and
`/motion-lab/`.

### Step 4 — run it locally and show the human

```bash
pnpm build && npx --yes serve out -l 4173
```

Walk every route at 390px and 1280px in both themes. Compare against the reference screens.
Then show the human the screenshots and say plainly what matches and what does not — including
anything still off. Do not claim the design is reproduced without having looked.

### Step 5 — the PR, last

Only after the human has seen it. Push `next`, open a PR into `main`, and say clearly in the
body that merging deploys to production. A PR into `main` is a release, not a checkpoint.

## 5. Gotchas that will cost you hours

1. **Node must be 24** (`.nvmrc`). Under an older Node, `pnpm install` resolves the wrong
   native bindings and it surfaces much later as `Cannot find native binding …
   @rolldown/binding-wasm32-wasi` from `pnpm test` — a version problem wearing a dependency
   problem's clothes. `wave.sh` pins it; if installing by hand, `nvm use` first. Recovery:
   `rm -rf node_modules && pnpm install --frozen-lockfile` on Node 24.

2. **Headless agents cannot answer permission prompts.** `.claude/settings.json` has the
   allowlist. A `claude -p` agent that hits something outside it exits silently with its last
   line being the request — `wave.sh status <wave>` reports that as `STALLED`.

3. **Agents self-gate on pushing** even when permitted, because pushing is shared state. That
   is why `AGENT_NOTE` tells them to commit only. Expect to integrate their branches yourself.

4. **Do not switch branches in the main checkout while a wave is starting.** `wave.sh` is read
   from the working tree; a mid-launch `git checkout` fed six agents a stale script once, and
   they silently lost their instructions. Verify what they actually received with
   `ps -axww -o command | grep "[c]laude -p"`.

5. **Tailwind's content scanner matches raw substrings anywhere**, including prose. Spelling a
   real utility class out in a doc comment makes it compile phantom CSS.

6. **`prettier-plugin-tailwindcss` sorts classes using the CSS config**, so a token change
   reformats files nobody touched. Always run `format:check` repo-wide.

## 6. What only the human can provide

`src/content/` carries 24 `TODO(agustin)` placeholders — 17 in `projects.ts`, 7 in
`experiments.ts`: project descriptions, outcomes, cover-image descriptions, and the real
experiment entries. Build the UI against them as-is; they render as visible placeholder text.
Collect them in one list and ask once, rather than blocking. See
`docs/plan/05-inputs-needed.md`.

## 7. Definition of done

- [ ] All 11 reference screens reproduced at 390px and 1280px, dark and light
- [ ] `/`, `/bio/`, `/experiments/`, `/projects/`, every `/projects/[slug]/` and the 404 render
      with no console errors
- [ ] Dark is the default theme; the toggle works with no flash on first paint
- [ ] No component hard-codes a colour, radius, shadow or duration — tokens only
- [ ] Keyboard paths and visible focus rings on every interactive element; `prefers-reduced-motion`
      respected
- [ ] `/styleguide/` and `/motion-lab/` deleted
- [ ] Full gate green on the merged branch, repo-wide
- [ ] The human has seen it running locally and agreed before any PR into `main`
