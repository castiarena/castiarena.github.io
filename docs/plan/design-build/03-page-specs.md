# 03 — Page Specs

Section-by-section composition for every screen. Desktop values are measured at 1280px against a 1152px container; mobile at 390px. Breakpoints are Tailwind defaults (`sm` 640, `md` 768, `lg` 1024, `xl` 1280).

Every page: `<main id="content">` holds the sections, sections are separated by hairline borders where the reference shows them, and vertical rhythm is `py-16` mobile / `py-24` desktop.

---

## Home — `reference/03-home-desktop.png`, `reference/09-home-mobile.png` (U2)

**1. Hero** (no top border, sits directly under the header, ~520px tall desktop)

- Mesh background per tokens §8, clipped to the section.
- Left column (max 620px): mono eyebrow `⌖ TREVELIN, PATAGONIA, ARGENTINA` (12px, letter-spacing 0.08em, pin icon 12px) → `h1` in two blocks: **name** in `--foreground` and **role** in `text-signature`, both `--text-display`, line-height 1.02 → tagline 17px `--muted-foreground` max 46ch → button row: `default` "View projects" with → icon, `outline` "Read bio", `ghost` "Get in touch" (opens the contact dialog).
- Right: avatar, 200px circle, gradient ring, `next/image` with `priority`.
- Mobile (screen 09): avatar first at 96px, then eyebrow, heading, tagline, then **full-width stacked buttons** (primary, then outline; the ghost link is dropped).
- Motion: heading, tagline and buttons reveal with a 60ms stagger on load (not on scroll); the avatar fades in.

**2. Impact strip** (`--card` band, hairline top and bottom borders, `py-12`)

- 4 `StatTile variant="bare"` in a 4-column grid desktop, 2×2 at `sm`, 2×2 mobile with tighter copy.
- Accents in order: brand, brand-2, brand-4, brand-3. `CountUp` when the strip first enters view.

**3. Selected projects** (`py-24`)

- `SectionHeading` "Selected projects" with an "All projects →" link on the right, in `--brand`.
- 3 `ProjectCard`s, 3 columns desktop (24px gap), 1 column mobile, revealed with a 60ms stagger.
- Footnote in mono 12px `--muted-foreground` below the grid when covers are placeholders.

**4. Latest experiments** (`py-24`)

- `SectionHeading` "Latest experiments" + "All experiments →".
- 4 compact rows in a 2-column grid (1 column mobile): each is a bordered card, 16px padding, title 15px/600, one-liner 14px muted, and on the right the year in mono with an ↗ icon. The whole row is a link.

**5. Contact band** (full-bleed, gradient per tokens §8, `py-16`)

- Left: `h2` "Let's build something" + one line of copy.
- Right: `default` button "Get in touch" and an icon button that copies the email.
- Stacks on mobile, button full width.

---

## Bio — `reference/04-bio-desktop.png` (U3)

**Header block**

- Left: eyebrow `BIO` → `h1` name → subtitle "Senior Frontend Engineer · 10+ years" 17px `--muted-foreground` → location row with a pin icon, 14px → button row: `default` "Download CV" with a download icon and `PDF · 1.6 MB` in mono at 90% opacity, then `outline` "LinkedIn" and "GitHub".
- Right: avatar 220px, `--radius-lg`, gradient ring.
- Mobile: avatar above, 120px, buttons stack full width.

**Two-column body (≥ lg)**: sticky left rail (180px) + content.

- Rail: eyebrow `ON THIS PAGE`, then About / Experience / Achievements / Skills / Training, 13px. Active item gets `--foreground` and a 2px `--brand` bar on its left; the rest are `--muted-foreground`. Driven by `IntersectionObserver`. Hidden below `lg`.
- Content sections in order, each `scroll-mt-24`:
  1. **About** `#about` — `h2` "About", 3 paragraphs, 16px/1.65, max 68ch, 16px apart.
  2. **Experience** `#experience` — `h2`, then an `<ol>` of `TimelineNode`s, 48px apart, in CV order (newest first). Each node per component spec. A mono note under the list carries any `TODO(agustin)` about the timeline gap.
  3. **Key achievements** `#achievements` — `h2`, 2×2 grid of `StatTile variant="card"` (1 column mobile), 16px gap.
  4. **Skills** `#skills` — `h2`, 3 columns (1 column mobile, 24px gap). Each: mono uppercase group label, then wrapped badges. Leadership uses `variant="brand"`.
  5. **Training** `#training` — `h2`, list of course title (15px/600) + provider (14px muted), 12px apart.

---

## Experiments — `reference/05-experiments-desktop.png` (U4)

- `PageHeader`: eyebrow `LAB`, `h1` "Experiments", description "Small things I built to learn, test an idea, or just for fun."
- **Filter row** 32px below: `FilterChip`s — "All" first (selected by default), then one per tag with its count. Below, in mono 12px, "N experiments shown", `aria-live="polite"`.
- **Grid**: 3 columns desktop, 2 at `md`, 1 mobile, 24px gap, `ExperimentCard`s. Enter/exit through `AnimatePresence` with `layout`; under reduced motion items just appear.
- Empty state: bordered box, "No experiments match those tags." plus a "Clear filters" `ghost` button.
- Mono footnote at the bottom explaining chips and cover fallbacks.
- URL sync: `?tag=a&tag=b`, AND semantics, `router.replace(..., { scroll: false })`, the whole gallery inside `<Suspense>`.

---

## Projects index — `reference/06-projects-index-desktop.png` (U5)

- `PageHeader`: eyebrow `WORK`, `h1` "Projects", 2-line description.
- **Alternating rows**, 96px apart desktop: 12-column grid where the cover takes 7 columns and the text 5, swapping sides each row. Cover `--radius-lg`, aspect 4:3, deterministic gradient.
- Text column: index `01` in mono 12px `--muted-foreground` → `h2` title → summary 16px muted (max 58ch) → meta line in mono 12px `Role · Feb 2023 — Jul 2026` → `TagList` → "Read case study →" in `--brand`.
- Mobile: cover then text, stacked, 48px apart, cover aspect 16:10.
- Motion: `Reveal` per row plus a ±24px parallax on the cover; both off under reduced motion.
- Mono footnote about placeholder covers.

## Project detail — `reference/07-project-detail-desktop.png` (U5)

1. **Breadcrumb**: `Projects / <title>` — "Projects" in `--brand`, separator and title in `--muted-foreground`, mono 12px.
2. **Hero**: optional amber outline badge `DRAFT · PREVIEW ONLY` (`--warning`, mono 11px, only when `NEXT_PUBLIC_DEPLOY_ENV !== 'production'`) → `h1` → summary 17px muted max 58ch → link buttons (`outline`, hidden when absent).
   - Right: **meta card**, 320px, `--card`, `--border`, `--radius-lg`, 20px padding, with `ROLE`, `PERIOD`, `STACK` eyebrows, values 15px, stack as badges. It moves below the summary on mobile.
3. **Cover**: full container width, aspect 21:9 desktop / 16:10 mobile, `--radius-lg`.
4. **The problem / Approach**: two columns (1 mobile, 48px gap). Problem: `h2` + paragraphs, `TODO(agustin)` lines rendered in `--muted-foreground`. Approach: `h2` + numbered list with mono `01`–`0N` markers in `--muted-foreground` and 15px body.
5. **Outcomes**: `h2` + 3-column grid of `StatTile variant="card"`; an outcome with no number renders as a dashed-border card with muted text.
6. **Gallery**: `h2` + 3-column thumbnail grid, aspect 16:10, each opening the dialog lightbox (arrow keys move, Esc closes, focus returns to the thumbnail, alt text shown as the caption). Mono note under the grid.
7. **Footer nav**: hairline top border, previous on the left, "All projects" centred in `--brand` mono, next on the right with a `NEXT` eyebrow above the title. Ends become plain muted text ("First project").

---

## 404 — `reference/08-not-found-desktop.png` (U6)

- Centred column, ~60vh: `404` in `text-signature` at ~clamp(5rem, 14vw, 9rem)/800 → `h1` "That page moved, or never existed" at `--text-h1` → one muted line mentioning the `legacy-v1` tag, max 46ch → three buttons: `default` Home, `outline` Projects, `outline` Experiments.
- Header on this page hides the nav links (only logo and Contact), as in the reference.
- Footer text is `© <year> Agustin Castiarena · exported as out/404.html`.

## Contact dialog — `reference/11-contact-dialog.png` (U6)

- Title "Get in touch" 20px/600, description "I usually reply within a couple of days." 14px muted.
- Fields: Name, Email, Message (per component spec), 16px apart, counter under the textarea.
- Actions: `default` "Send message" and `outline` "Copy email" with a clipboard icon.
- Mono footnote explaining the no-server behaviour (this stays in the UI — it reads as an engineering detail and the reference shows it).
- Success replaces the form body with a check icon, "Thanks — I'll be in touch.", and a Close button, announced with `role="status"`.

## Header — all screens (U1)

- Logo left, nav centred (`Home Bio Experiments Projects`), theme toggle + `default` "Contact" button right.
- Transparent over the hero, gaining a hairline bottom border and a `--background` at 80% + blur fill after 8px of scroll.
- Below `md`: logo, theme toggle and a hamburger that opens the sheet (screen 10).
