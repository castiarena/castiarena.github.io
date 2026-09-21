> **Read [`docs/plan/design-build/00-STATE.md`](../../00-STATE.md) first** — §5 lists the stub routes and
> components that already exist on `next`, and §1 links the handoffs of everything merged so far.

# Agent U5 — Projects (index + case study)

| Phase | Mode | Depends on | Unblocks |
|---|---|---|---|
| UI | Parallel with U1–U4, U6 | F1, F2, F3 merged into `next` | V1, U2 (uses `ProjectCard`) |

## Mission
Build the projects index from screen 06 and the case-study page from screen 07, including the shared `ProjectCard` that Home also uses, the generated covers and the gallery lightbox. Supersedes `docs/plan/prompts/wave-2/2.5-projects-pages.md`.

## Context to load first
- `docs/plan/design-build/00-README.md`, `01-design-tokens.md`, **`02-component-specs.md`** (ProjectCard, StatTile, Dialog, Badge), **`03-page-specs.md` → Projects index and Project detail**
- References — Read and look at: **`06-projects-index-desktop.png`**, **`07-project-detail-desktop.png`**, and `03-home-desktop.png` for the card in its Home context
- `docs/plan/01-architecture.md` §1 (dynamic routes: `generateStaticParams`, `dynamicParams = false`, `params` is a Promise in Next 16)
- `docs/handoffs/F1.md`, `F2.md`, `F3.md`, `1.2.md`
- `docs/plan/04-agent-loop-protocol.md`, `docs/plan/design-build/04-visual-qa-protocol.md`

## You own
`src/app/projects/**`, `src/components/projects/**`, `public/images/projects/**`, `tests/unit/projects/**`, `docs/handoffs/U5.md`

> **`ProjectCard` is yours and Home imports it.** Ship it early in your branch and say so in the handoff so U2 can switch to it during V1.

## Tasks
1. **Placeholder covers**: for every slug without a real image, generate `public/images/projects/<slug>.svg` (1600×1000) from the same gradient algorithm as `CoverGradient`, with the title set in large type. Each file ≤ 20 KB. A small Node script under `src/components/projects/` (not `scripts/`) that you run once and commit the output of is fine — document it.
2. **`ProjectCard`** per component spec: 16:10 cover with the mono index over a scrim, `--card` body with title, 3-line clamped summary and `TagList max={3}`, whole-card link, `HoverLift` with the focus-within lift.
3. **Index page** (`/projects/`): `PageHeader` with eyebrow `WORK`; alternating 12-column rows (cover 7 / text 5, sides swapping), 96px apart; text column per `03-page-specs.md` (mono index, `h2`, summary, mono meta line, tags, "Read case study →"). Mobile stacks cover-then-text at 48px apart. `Reveal` per row plus a ±24px cover parallax, both off under reduced motion. Mono footnote about placeholder covers.
4. **Detail page** (`/projects/[slug]/`): `generateStaticParams` from `getAllProjectSlugs()`, `dynamicParams = false`, `const { slug } = await params`, `notFound()` for unknown slugs, `generateMetadata` with title, summary and the cover as the OG image.
5. Detail composition per `03-page-specs.md`: breadcrumb → hero (draft badge when `NEXT_PUBLIC_DEPLOY_ENV !== 'production'`, `h1`, summary, link buttons) with the 320px meta card (`ROLE`, `PERIOD`, `STACK`) → full-width cover → problem / approach two-column with mono `01`–`0N` markers → outcomes as `StatTile variant="card"` with dashed muted cards for outcomes that carry no number → gallery grid → prev/next footer with the `NEXT` eyebrow and the centred "All projects" link.
6. **Gallery lightbox**: `Dialog` showing the image at contain size with the alt text as a visible caption, ← → to move, Esc to close, focus returned to the thumbnail that opened it, and the current position announced ("3 of 5").
7. `TODO(agustin)` copy renders in `--muted-foreground` exactly as in screen 07, including the dashed placeholder outcome card and the disabled-looking "live link" button.
8. Tests: index sorted by `order`; every approach and outcome item renders; prev/next behaves at both ends ("First project" / "Last project"); link buttons hidden when links are absent; `generateStaticParams` returns every slug; the lightbox is keyboard operable.

## Visual QA
Shoot `/projects/` and one `/projects/<slug>/` at 1280 and 390 in both themes, plus the open lightbox. Compare with screens 06 and 07.

## Acceptance criteria
- [ ] Standard gate passes; visual QA checklist passes for both routes
- [ ] `out/projects/<slug>/index.html` exists for every slug; an unknown slug serves `404.html`
- [ ] Every placeholder SVG ≤ 20 KB and every `img` has non-empty alt text
- [ ] The alternating layout reads in the correct order for screen readers (DOM order is text-then-cover consistently; visual swapping is done with `order`, not by duplicating markup)
- [ ] axe clean in both themes, including with the lightbox open
- [ ] Screenshots + side-by-sides in `docs/handoffs/assets/U5/`

## EARLY_START mode
Structure, routing, cover generation and tests against the stubs; no screenshots; `status=EARLY_DONE`; visual pass after rebase.

## Loop rules
`docs/plan/04-agent-loop-protocol.md`. Up to 6 iterations. Final line:
`AGENT_RESULT id=U5 status=<DONE|BLOCKED|EARLY_DONE> pr=<url> preview=<url> ccr=<n>`
