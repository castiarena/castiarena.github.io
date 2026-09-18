# 02 — Component Specs

Source: `reference/02-components.png`, plus how each component appears in context on screens 03–11.

Two owners:

- **F2** builds everything in `src/components/ui/**` (shadcn primitives, restyled to these specs) and `src/components/shared/**`.
- **UI agents** build page-specific compositions in `src/components/<page>/**` using these.

Prop signatures from `docs/plan/02-shared-contracts.md` are frozen. Adding an optional prop is fine; renaming or removing one needs a CCR.

---

## Button (`ui/button.tsx`)

| Variant | Fill | Text | Border | Where |
|---|---|---|---|---|
| `default` | `--brand` | `--brand-foreground` | none | "View projects", "Contact", "Send message", "Get in touch" |
| `outline` | transparent | `--foreground` | `--border` | "Read bio", "LinkedIn", "GitHub", 404 secondary |
| `ghost` | transparent | `--muted-foreground` → `--foreground` on hover | none | "Get in touch" on Home hero, icon buttons |
| `secondary` | `--card` | `--foreground` | `--border` | rare, in dialogs |

- Sizes: `sm` 36px, `default` 40px, `lg` 44px, `icon` 40×40 — but the **tap area is always ≥44×44**, padded with a pseudo-element when the visual box is smaller (from design).
- Radius `--radius`, font 14px/600, gap 8px to icons, icons 16px.
- Hover: `default` lightens ~4%, `outline`/`ghost` get `--muted` fill. Active: `scale(0.98)`. Transition `--dur-ui` `--ease-brand`.
- **Loading** (screen 02, "Sending…"): spinner replaces the leading icon, label stays, `aria-busy="true"`, `disabled`, opacity 0.9.
- Arrow-suffixed buttons ("View projects →") move the arrow 2px right on hover, and not at all under reduced motion.

## Badge / TagList (`ui/badge.tsx`, `shared/tag-list.tsx`)

- Mono 12px, `--muted` fill, `--border` hairline, radius `--radius-sm`, padding `2px 8px`, ~24px tall.
- `variant="brand"` for leadership tags (screen 02 "Team Lead", screen 04 leadership column): `--brand` at 15% alpha fill, `--brand` text, `--brand` at 35% border.
- `TagList` renders a `ul` with `aria-label="Tags"`, `gap-2`, wraps, and takes `max?: number` with a `+N` overflow badge.

## ExternalLink (`shared/external-link.tsx`)

- `--brand` text, 1px underline at 40% alpha that goes solid on hover, trailing ↗ icon 12px (`aria-hidden`), `sr-only` "(opens in a new tab)".
- Always `target="_blank" rel="noopener noreferrer"`.

## NavItem (`components/layout/nav-item.tsx`, U1)

- 14px, `--muted-foreground`; active and hover go to `--foreground`.
- Active gets a 2px underline in `bg-signature`, 6px below the label, animated between items with a Motion `layoutId` (no animation under reduced motion).
- Active item sets `aria-current="page"`.

## StatTile (`shared/stat-tile.tsx`)

Screen 02 "40%" and the Home strip.

- Value: `--text-h1` size, 700, coloured by the stat's brand accent (see tokens §1), `CountUp` on first view.
- Label: 14px/600 `--foreground`, directly under the value.
- Description: 14px `--muted-foreground`, max 34ch.
- Two shapes: **card** (`--card` fill, `--border`, `--radius-lg`, 20px padding) used on Bio and project Outcomes; **bare** (no fill or border) used in the Home strip.
- Props: `{ value, unit, label, description?, accent: 'brand'|'brand-2'|'brand-3'|'brand-4', variant?: 'card'|'bare' }`.

## ProjectCard (`components/projects/project-card.tsx`, U5; used on Home by U2)

- Cover: aspect 16:10, `--radius-lg` top corners, deterministic slug gradient, index number (`01`) in mono 12px at 12px from the bottom-left over a dark scrim.
- Body: 20px padding on `--card`, hairline border, title 17px/600, summary 14px `--muted-foreground` (max 3 lines, `line-clamp-3`), `TagList` with `max={3}`.
- Whole card is one link. **HoverLift: y −4px, tap scale 0.98, and the same lift on `:focus-within`** (from design).
- Props: `{ project: Project, index?: number, priority?: boolean }`.

## ExperimentCard (`components/experiments/experiment-card.tsx`, U4)

- Same shell as ProjectCard, but the cover shows a 2-letter monogram from the title in 28px semibold white at 60% alpha, bottom-left, and an ↗ icon top-right.
- Footer row: `TagList` left, year in mono right. Missing year renders an en dash.
- `Source` link (screen 05) sits **below** the card body as its own link, outside the card's main link.

## TimelineNode (`components/bio/timeline-node.tsx`, U3)

- Rail: 1px `--border` vertical line with a `bg-signature` segment behind the active portion.
- Dot: 8px circle, `--brand-3`, 2px `--background` ring, centred on the rail.
- Desktop (≥ lg): dates in a left gutter (mono 12px, two lines: range then duration). Mobile: dates above the title.
- Title 17px/600, company 14px `--muted-foreground` (linked when `companyUrl`), intro 15px, bullets with 4px hollow circle markers and 8px gap, optional `TagList`.

## FilterChip (`components/experiments/filter-chip.tsx`, U4)

- Pill (`--radius-full`), mono 12px, 32px tall, `--border` hairline.
- Rest: `--muted-foreground`. Hover: `--foreground`. **Selected: `--brand` at 15% fill, `--brand` text, `--brand` 35% border** (screen 05 "All").
- Count suffix in `--muted-foreground` at 90% size.
- Built on shadcn `ToggleGroup`, with real `aria-pressed` state.

## Form fields (`ui/input.tsx`, `ui/textarea.tsx`, `ui/form.tsx`)

- Label 14px/600, 8px above the field.
- Field: `--input` fill, `--border`, `--radius`, 44px tall (textarea 120px min), 12px horizontal padding, 15px text, placeholder `--muted-foreground` at 70%.
- Focus: `--ring` border plus the standard focus ring.
- **Error** (screen 02): `--destructive` border, message below in `--destructive` 13px, field gets `aria-invalid` and `aria-describedby`.
- Counter (`13 / 2000`) is mono 12px `--muted-foreground`, right-aligned under the textarea, and turns `--destructive` past the limit.

## Dialog & Sheet (`ui/dialog.tsx`, `ui/sheet.tsx`)

- Dialog: max-width 560px, `--card`, `--radius-lg`, 24px padding, elevation shadow, overlay `oklch(0 0 0 / 0.6)` with a 2px backdrop blur, close ✕ top-right (40px hit box).
- Sheet (screen 10): slides from the right, width `min(86vw, 360px)`, same fill, 24px padding. Header row: `● menu` in mono with a `--brand-3` dot, and ✕. Links 20px/600 separated by hairlines, active item marked with a `--brand-3` dot on the right. Full-width Contact button below, `ELSEWHERE` eyebrow and social links pinned to the bottom.
- Both: focus trapped, Esc closes, focus returns to the trigger, body scroll locked.

## ThemeToggle (`components/layout/theme-toggle.tsx`, U1)

- Ghost icon button, 40×40, moon in dark and sun in light, cycling light → dark → system.
- `aria-label` states the current mode, e.g. "Theme: dark. Switch to system."
- Renders a same-size placeholder before mount so nothing shifts on hydration.

## Logo (`components/layout/logo.tsx`, U1)

- `● agustin castiarena` — an 8px `--brand-3` dot, then the name in **mono 14px lowercase**, `--foreground`. Links to `/`. On hover the dot scales to 1.15.

## Footer (`components/layout/site-footer.tsx`, U1)

- Hairline top border, 32px vertical padding, mono 12px `--muted-foreground`.
- Left: `© <year> Agustin Castiarena · Built with Next.js · Deployed on GitHub Pages`.
- Right: `LinkedIn GitHub Email` in `--brand`, 20px apart. Stacks to two lines on mobile.

## Shared helpers (F2)

| Component | Notes |
|---|---|
| `Container` | `container-page` utility |
| `PageHeader` | Mono eyebrow, `h1` at `--text-h1`, description 16px `--muted-foreground` max 58ch, 16px gaps |
| `SectionHeading` | `h2` at `--text-h2` with an optional right-aligned action slot ("All projects →"), 24px bottom margin, hover `#` anchor |
| `GradientText` | `text-signature` |
| `CoverGradient` | `{ seed: string, label?: string, monogram?: boolean }` — deterministic gradient cover used by both card types and the SVG placeholder generator |
| `ProseList` | Bulleted list with the hollow-circle marker used on Bio and project pages |
