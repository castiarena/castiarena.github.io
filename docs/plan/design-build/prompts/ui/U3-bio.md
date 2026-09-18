> **Read [`docs/plan/design-build/00-STATE.md`](../../00-STATE.md) first** — §5 lists the stub routes and
> components that already exist on `next`, and §1 links the handoffs of everything merged so far.

# Agent U3 — Bio

| Phase | Mode | Depends on | Unblocks |
|---|---|---|---|
| UI | Parallel with U1, U2, U4–U6 | F1, F2, F3 merged into `next` | V1 |

## Mission
Build the Bio page from screen 04: header block with the CV download, sticky "on this page" rail, the experience timeline, achievements, skills and training. Supersedes `docs/plan/prompts/wave-2/2.3-bio-page.md`.

## Context to load first
- `docs/plan/design-build/00-README.md`, `01-design-tokens.md`, **`02-component-specs.md`** (TimelineNode, StatTile, Badge brand variant), **`03-page-specs.md` → Bio**
- Reference — Read and look at: **`04-bio-desktop.png`**
- `docs/plan/assets/cv-content.md` (the copy is data, and 1.2 owns it — never hard-code it)
- `docs/handoffs/F1.md`, `F2.md`, `F3.md`, `1.2.md`
- `docs/plan/04-agent-loop-protocol.md`, `docs/plan/design-build/04-visual-qa-protocol.md`

## You own
`src/app/bio/**`, `src/components/bio/**`, `tests/unit/bio/**`, `docs/handoffs/U3.md`

## Tasks
1. `bio/page.tsx` is a Server Component. Sections in order with ids `#about`, `#experience`, `#achievements`, `#skills`, `#training`, each with `scroll-mt-24` so the sticky header doesn't cover the anchor.
2. **Header block**: eyebrow `BIO`, `h1` name, subtitle "Senior Frontend Engineer · 10+ years" from `profile`, location row with a pin icon, then buttons: `default` "Download CV" with a download icon and `PDF · 1.6 MB` in mono (`href={profile.cvHref}` plus `download`), `outline` LinkedIn and GitHub. Avatar 220px at `--radius-lg` with the gradient ring, moving above the text below `lg`.
3. **On this page rail** (`lg` and up): sticky, 180px, eyebrow `ON THIS PAGE`, five links, active item in `--foreground` with a 2px `--brand` bar on its left, driven by `IntersectionObserver` with `rootMargin` tuned so the active item changes at the right moment. Hidden below `lg`. Client leaf only.
4. **About**: three paragraphs from `profile.summary`, 16px/1.65, max 68ch.
5. **Experience timeline**: `<ol>` of `TimelineNode`s (build the component here, spec in `02-component-specs.md`), newest first, 48px apart, `Reveal` per node with the dot filling as it enters view. Desktop puts the date range and duration in a left gutter in mono; mobile puts them above the title. Dates come from `formatRange` / `durationLabel` in `src/lib/format.ts`. Any `TODO(agustin)` note about the timeline gap renders in mono `--muted-foreground` under the list.
6. **Key achievements**: 2×2 `StatTile variant="card"` (1 column mobile), accents in the same order as Home.
7. **Skills**: three columns from `skillGroups` with mono uppercase labels; the leadership group uses `Badge variant="brand"`.
8. **Training**: course title + provider, linked when `href` exists.
9. `metadata`: title "Bio", description from the first summary sentence, canonical `/bio/`.
10. Tests: all four roles render newest-first with every CV bullet; the CV button has `download` and the right href; section ids exist; the rail marks the right section for a mocked observer; the phone number appears nowhere.

## Visual QA
Shoot `/bio/` at 1280 and 390 in both themes, plus a scrolled state showing the rail's active item. Compare with screen 04.

## Acceptance criteria
- [ ] Standard gate passes; visual QA checklist passes
- [ ] Every CV bullet from `docs/plan/assets/cv-content.md` appears in `out/bio/index.html` (test greps the built HTML)
- [ ] `out/bio/index.html` contains no phone number
- [ ] `/cv/agustin-castiarena-resume.pdf` returns 200 with `application/pdf` from `pnpm start`
- [ ] axe clean (serious/critical) in both themes; heading order h1 → h2 → h3; the timeline is a real `ol`/`li`
- [ ] The rail is keyboard reachable and its links move focus to the section heading
- [ ] Screenshots + side-by-sides in `docs/handoffs/assets/U3/`

## EARLY_START mode
Structure, content wiring and tests against the stubs; no screenshots; `status=EARLY_DONE`; visual pass after rebase.

## Loop rules
`docs/plan/04-agent-loop-protocol.md`. Up to 6 iterations. Final line:
`AGENT_RESULT id=U3 status=<DONE|BLOCKED|EARLY_DONE> pr=<url> preview=<url> ccr=<n>`
