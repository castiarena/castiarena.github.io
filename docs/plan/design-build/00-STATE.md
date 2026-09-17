# 00-STATE — Where the build actually is

> **Read this before your prompt.** The design build was approved *after* waves 0 and 1 had already
> been built and merged. F1, F2 and F3 are therefore **reconciliation** agents, not greenfield ones:
> a first version of the tokens, the primitives and the motion system is already on `next`.
> Your job is to bring what exists up to the approved design, not to rebuild it from zero.

Last updated: 2026-09-17, at the wave-1 → foundations gate.

---

## 1. What is merged on `next`

| Agent | PR | What landed | Handoff |
|---|---|---|---|
| 0.1 Bootstrap | [#1](https://github.com/castiarena/castiarena.github.io/pull/1) | Next.js 16 static export, tooling, shared contracts, seed content, stub routes | `docs/handoffs/0.1.md` |
| 1.4 CI/CD | [#2](https://github.com/castiarena/castiarena.github.io/pull/2) | `ci` + `deploy-pages` workflows, `vercel.json`, `scripts/verify-export.mjs`, CODEOWNERS, PR template | `docs/handoffs/1.4.md` |
| 1.2 Content data | [#3](https://github.com/castiarena/castiarena.github.io/pull/3) | Zod content schema validated at build time, real CV content, date formatters | `docs/handoffs/1.2.md` |
| 1.1 Design system | [#4](https://github.com/castiarena/castiarena.github.io/pull/4) | OKLCH tokens, shadcn init, 18 primitives, 6 shared components, `/styleguide` | `docs/handoffs/1.1.md` |
| 1.3 Motion | [#5](https://github.com/castiarena/castiarena.github.io/pull/5) | 7 motion primitives, `/motion-lab` | `docs/handoffs/1.3.md` |

1.2 and 1.4 are **unaffected** by the design build — nothing to redo there.

1.1 and 1.3 are the ones F1/F2/F3 supersede. They were built against the *old* prose brief, so the
structure is right and the values drift. The deltas below are the whole job.

---

## 2. F1 — token deltas against `01-design-tokens.md`

`src/app/globals.css` exists (189 lines) and is already OKLCH-only, with `:root`/`.light`/`.dark`
blocks, an `@theme inline` map, a fluid type scale, `bg-signature`, `text-signature`,
`container-page`, focus-visible, `::selection` and a reduced-motion block. Keep that skeleton.

**Change these:**

| # | Now | Spec (`01-design-tokens.md`) |
|---|---|---|
| 1 | Neutral hue `262` (dark) / `260` (light) | `285` in both themes, and the exact L/C values in §2 |
| 2 | dark `--background: oklch(0.155 0.014 262)` | `oklch(0.145 0.005 285)` |
| 3 | dark `--card: oklch(0.2 0.015 262)` | `oklch(0.185 0.006 285)`; add `--muted: oklch(0.21 0.006 285)` |
| 4 | dark `--border: oklch(1 0 0 / 10%)`, `--input: oklch(1 0 0 / 15%)` | opaque `oklch(0.27 0.008 285)` / `oklch(0.24 0.007 285)` |
| 5 | light `--background: oklch(0.99 0.002 260)` | `oklch(1 0 0)`, `--card: oklch(0.985 0.002 285)` |
| 6 | light `--brand: oklch(0.52 0.19 258)` | `oklch(0.56 0.19 256)` (§2 note — only the lightness may move, and only if contrast demands it) |
| 7 | `--brand-4` missing | `oklch(0.66 0.21 285)` — the third stat accent (§1) |
| 8 | `--warning` missing | `oklch(0.78 0.14 85)` — the amber DRAFT badge on screen 07 |
| 9 | `--ease-brand`, `--dur-ui`, `--dur-reveal` missing | §6: `cubic-bezier(0.22, 1, 0.36, 1)`, `200ms`, `500ms`. The reduced-motion block must set the two durations to `1ms` |
| 10 | `--radius: 0.625rem`, radii derived with `calc()` | §5: `--radius: 0.75rem`, and literal `--radius-sm: 0.5rem` / `--radius-md: 0.75rem` / `--radius-lg: 1rem` in `@theme inline` |
| 11 | `--text-display: clamp(2.75rem, 1.6rem + 5vw, 5rem)`, `--text-h1: clamp(2.25rem, 1.6rem + 3vw, 3.5rem)` | §3 **(from design, must not drift)**: `clamp(2.75rem, 1.6rem + 4.2vw, 4.5rem)` and `clamp(2rem, 1.4rem + 2.2vw, 3rem)`; `--text-h2: clamp(1.375rem, 1.1rem + 1vw, 1.75rem)`; add `--text-h3: 1.0625rem` |
| 12 | `bg-hero-mesh` and `hairline` missing | §8 and F1 task 5 |
| 13 | `:focus-visible` has no `border-radius: inherit` | §7 |
| 14 | `@import 'shadcn/tailwind.css'` present | Not in the spec skeleton (F1 task 1). Keep it only if removing it breaks a primitive; say which in the handoff |

`tests/unit/shared/contrast.test.ts` **already exists** — extend it to every pair in §10 for both
themes rather than writing a new one. `src/components/shared/fonts.ts` already exports `geistSans`
and `geistMono`; verify the `variable` names and `preload` flags against F1 task 7.

Changing the neutral hue and the radius scale re-themes every existing component. That is expected
and fine — the primitives read tokens, not literals. Re-shoot `/styleguide` after the change and
look at it.

---

## 3. F2 — component deltas against `02-component-specs.md`

`components.json` and 18 primitives exist in `src/components/ui/`: `aspect-ratio badge button card
dialog field input label navigation-menu scroll-area separator sheet skeleton sonner textarea
toggle toggle-group tooltip`. Six shared components exist: `Container`, `PageHeader`,
`SectionHeading`, `TagList`, `ExternalLink`, `GradientText`.

**Still to do — this is the bulk of the foundations work:**

- [ ] Add the missing primitive: `form` (1.1 shipped shadcn's newer `field` instead — decide which
      one `U6` builds the contact form on and say so in the handoff; do not ship both patterns).
- [ ] Restyle every primitive to `02-component-specs.md`: button variants/sizes with the ≥44px hit
      area and loading state, `brand` badge variant, input/textarea error treatment, dialog and
      sheet overlay/blur/radius/padding.
- [ ] Build the three new shared components: **`StatTile`**, **`CoverGradient`**, **`ProseList`**,
      and export them from `src/components/shared/index.ts`. `CoverGradient` is load-bearing for
      Home, Experiments and Projects — ship it first.
- [ ] Build the visual QA harness: `scripts/shoot.mjs` and `scripts/compare.mjs`
      (`04-visual-qa-protocol.md` §1–2) plus the `shoot` / `compare` package scripts. **Every U
      agent is blocked on this** — land it before the restyle if you have to split the PR.
- [ ] Rebuild `src/app/styleguide/` (it exists, with `_components/demos.tsx`) so it reproduces
      `reference/02-components.png` section by section.
- [ ] Add the unit tests listed in F2 task 7 next to the existing
      `tests/unit/shared/{components,external-link,tag-list}.test.tsx`.

`scripts/` currently holds only `verify-export.mjs` (1.4's — do not touch it).

---

## 4. F3 — motion deltas

Nearly done already. `src/components/motion/` ships `MotionProvider`, `Reveal`, `Stagger` /
`StaggerItem`, `HoverLift`, `CountUp`, `ScrollProgress` and `ParallaxLayer`, with `LazyMotion` +
`domAnimation`, a documented hydration strategy in `shared.ts`, and tests in
`tests/unit/motion/`. `motion@13` is in `package.json`.

**Still to do:**

- [ ] F3 task 8 — export the nav underline `layoutId` constant and its shared transition, so U1
      does not invent one.
- [ ] Re-point the hard-coded `MOTION_EASE` / `MOTION_DURATION` in `shared.ts` at the `--ease-brand`
      / `--dur-ui` / `--dur-reveal` tokens F1 is adding, or state in the handoff why the JS side
      keeps its own copy.
- [ ] Re-run the acceptance criteria against the *design's* budget (UI ≤400ms, reveals ≤700ms) and
      record the current first-load JS delta — 1.3 measured it, so this is a re-check, not a rebuild.

F3 is small. It is still worth its own branch so it merges independently of F1's token churn.

---

## 5. Routes that exist as stubs

`src/app/` has `page.tsx`, `bio/`, `experiments/`, `projects/`, `projects/[slug]/`, `not-found.tsx`,
`layout.tsx`, plus the two temporary routes `/styleguide` (F2's, deleted by V1) and `/motion-lab`
(F3's, deleted by V1). `src/components/layout/` has `theme-provider`, `site-header`, `site-footer`
stubs, and `src/components/contact/` has `contact-dialog` and `contact-cta` stubs. `home/`, `bio/`,
`experiments/` and `projects/` component folders are empty `.gitkeep` placeholders.

U1–U6 replace those stubs. The contracts in `docs/plan/02-shared-contracts.md` §4 are frozen: if a
stub's props are wrong for the design, raise a CCR, do not silently change the signature.

---

## 6. Order of play from here

```
  ┌ F1 tokens ┐
  ├ F2 comps  ├─ gate ─ U1 U2 U3 U4 U5 U6 ─ gate ─ V1 ─ gate ─ 3.1 3.2 3.3 ─ gate ─ 4.1 ─ 4.2
  └ F3 motion ┘
```

Wave 1's 1.2 and 1.4 are done, so the foundations phase is three agents, not five. Launch them with
`scripts/agents/wave.sh` (see `docs/plan/design-build/00-README.md` § Running it).
