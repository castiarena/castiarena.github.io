> **Read [`docs/plan/design-build/00-STATE.md`](../../00-STATE.md) first** — §5 lists the stub routes and
> components that already exist on `next`, and §1 links the handoffs of everything merged so far.

# Agent U2 — Home

| Phase | Mode | Depends on | Unblocks |
|---|---|---|---|
| UI | Parallel with U1, U3–U6 | F1, F2, F3 merged into `next` | V1 |

## Mission
Build the home page exactly as designed: hero with the mesh background and gradient role line, the four-stat impact strip, selected projects, latest experiments, and the contact band. Supersedes `docs/plan/prompts/wave-2/2.2-home-page.md`.

## Context to load first
- `docs/plan/design-build/00-README.md`, `01-design-tokens.md` (§1 stat accents, §8 hero mesh and contact band), `02-component-specs.md` (StatTile, ProjectCard, Button), **`03-page-specs.md` → Home**
- References — Read and look at: **`03-home-desktop.png`**, **`09-home-mobile.png`**
- `docs/handoffs/F1.md`, `F2.md`, `F3.md`, `1.2.md` (content helpers)
- `docs/plan/04-agent-loop-protocol.md`, `docs/plan/design-build/04-visual-qa-protocol.md`

## You own
`src/app/page.tsx`, `src/components/home/**`, `tests/unit/home/**`, `docs/handoffs/U2.md`

## Do not touch
The header and footer (U1), shared and ui components (F2), content data (1.2). Need a `ProjectCard` tweak? U5 owns it — coordinate through a CCR, and in the meantime compose from `Card` + `CoverGradient` inside your own folder only if U5's component is not merged yet, then switch to it in V1.

## Tasks
1. `page.tsx` is a Server Component composing five sections, each its own component in `src/components/home/`. Only leaves that animate or handle events are client components.
2. **Hero**: per `03-page-specs.md`. Mono eyebrow with the pin icon; `h1` with the name in `--foreground` and the role in `GradientText`, both at `text-display` with line-height 1.02; tagline max 46ch; buttons "View projects" (`default`, arrow that shifts 2px on hover), "Read bio" (`outline`), "Get in touch" (`ghost`, opens `ContactDialog`). Avatar 200px circle with the gradient ring, `next/image` with `priority` and explicit width/height so nothing shifts.
3. **Hero mesh**: use F1's `bg-hero-mesh` utility, `aria-hidden`, `pointer-events-none`, clipped to the section, no canvas. Optional slow drift with `ParallaxLayer`, off under reduced motion.
4. **Impact strip**: `--card` band with hairline borders, 4 `StatTile variant="bare"`, accents in the brand / brand-2 / brand-4 / brand-3 order, `CountUp` on first view, `Stagger` at 60ms. 2×2 at `sm` and below; shorten labels on mobile exactly as screen 09 does.
5. **Selected projects**: `SectionHeading` with the "All projects →" action slot, `getFeaturedProjects(3)`, 3 columns desktop / 1 mobile, staggered reveal, mono footnote when covers are placeholders.
6. **Latest experiments**: `getLatestExperiments(4)` as 4 bordered rows in a 2-column grid (1 on mobile): title, one-liner, year in mono, ↗ icon. The whole row is a link, external links get the right `rel`/`target`, and rows without a year show an en dash.
7. **Contact band**: full-bleed gradient per tokens §8, `h2` "Let's build something", one line of copy, `default` "Get in touch" plus the copy-email icon button (both from `ContactCTA` when U6 has merged; otherwise render the dialog trigger directly and switch in V1).
8. **Mobile order** (screen 09): avatar → eyebrow → heading → tagline → full-width primary and outline buttons. The ghost link is dropped below `md`.
9. `metadata`: absolute title from `siteConfig.title`, description from `siteConfig.description`.
10. Tests: hero renders name, role and tagline; the strip renders 4 stats with the right final values and accent classes; featured section renders at most 3 cards linking to `/projects/<slug>/`; experiment rows link externally.

## Visual QA
Shoot `/` at 1280 and 390 in both themes, plus the hero with the header scrolled. Compare with screens 03 and 09 and review the side-by-sides yourself.

## Acceptance criteria
- [ ] Standard gate passes; visual QA checklist passes on all four shots
- [ ] Exactly one `h1`; heading levels don't skip
- [ ] Lighthouse mobile on `/`: Performance ≥ 90, Accessibility ≥ 95, CLS ≤ 0.05, LCP is the heading or avatar
- [ ] First-load JS for `/` ≤ 120 KB gzip (record the number)
- [ ] With JS disabled, the hero, all four stat values, the cards and all links are visible and usable
- [ ] No raw colour values in `src/components/home` (`grep -nE "#[0-9a-fA-F]{3,6}|rgb\("`)
- [ ] Screenshots + side-by-sides in `docs/handoffs/assets/U2/`

## EARLY_START mode
Structure, content wiring and tests against the 0.1 stubs; no screenshots; `status=EARLY_DONE`; visual pass after rebasing on merged foundations.

## Loop rules
`docs/plan/04-agent-loop-protocol.md`. Up to 6 iterations. Final line:
`AGENT_RESULT id=U2 status=<DONE|BLOCKED|EARLY_DONE> pr=<url> preview=<url> ccr=<n>`
