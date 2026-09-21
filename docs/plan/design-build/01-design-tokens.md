# 01 — Design Tokens

Source: `reference/01-foundations.png`. Values marked **(from design)** are printed on that screen and must not drift. The rest are derived to match what the screens show; F1 may refine them within ±2% as long as the contrast tests pass, and records any change here.

Everything lives in `src/app/globals.css`. No component may hard-code a colour, radius, shadow or duration.

---

## 1. Brand

| Token | Value | Use |
|---|---|---|
| `--brand` | `oklch(0.63 0.19 256)` **(from design)** | Primary actions, links, the first stat, focus ring |
| `--brand-2` | `oklch(0.72 0.17 195)` **(from design)** | Cyan accent, second stat, gradient middle |
| `--brand-3` | `oklch(0.66 0.24 305)` **(from design)** | Violet accent, fourth stat, timeline dots, logo dot |
| `--brand-foreground` | `oklch(0.99 0 0)` | Text on `--brand` fills |

**Signature gradient (from design)**

```css
@utility bg-signature {
  background-image: linear-gradient(in oklch 120deg, var(--brand), var(--brand-2), var(--brand-3));
}
@utility text-signature {
  background-image: linear-gradient(in oklch 120deg, var(--brand), var(--brand-2), var(--brand-3));
  background-clip: text;
  color: transparent;
}
```

Where the gradient appears: the hero role line, the 404 numerals, avatar rings, the contact band, card covers, the timeline rail, and the nav active underline. Nowhere else.

**Stat accent order** (screens 03, 04, 09): stat 1 `--brand`, stat 2 `--brand-2`, stat 3 a blue-violet mix `oklch(0.66 0.21 285)` (token `--brand-4`), stat 4 `--brand-3`.

---

## 2. Neutrals

### Dark (default)

| Token | Value | Notes |
|---|---|---|
| `--background` | `oklch(0.145 0.005 285)` | Page. Near-black with a hint of violet |
| `--card` | `oklch(0.185 0.006 285)` | Cards, the stat strip band, popovers |
| `--muted` | `oklch(0.21 0.006 285)` | Chips at rest, code-ish surfaces |
| `--border` | `oklch(0.27 0.008 285)` | Hairlines, card borders, inputs |
| `--input` | `oklch(0.24 0.007 285)` | Field fill |
| `--muted-foreground` | `oklch(0.73 0.012 285)` **(from design)** | Body-muted text. Clears 4.5:1 on `--background` |
| `--foreground` | `oklch(0.97 0.002 285)` | Headings and body |
| `--ring` | `var(--brand)` | Focus |
| `--destructive` | `oklch(0.63 0.21 25)` | Field errors (screen 02) |
| `--warning` | `oklch(0.78 0.14 85)` | The amber "DRAFT · PREVIEW ONLY" badge (screen 07) |

### Light (same tokens re-mapped)

| Token | Value |
|---|---|
| `--background` | `oklch(1 0 0)` |
| `--card` | `oklch(0.985 0.002 285)` |
| `--muted` | `oklch(0.967 0.003 285)` |
| `--border` | `oklch(0.90 0.004 285)` |
| `--input` | `oklch(0.94 0.003 285)` |
| `--muted-foreground` | `oklch(0.45 0.012 285)` |
| `--foreground` | `oklch(0.17 0.006 285)` |
| `--ring` | `var(--brand)` |

Brand hues are identical in both themes. On light, `--brand` text on `--background` must clear 4.5:1 — if it doesn't, darken the lightness for the light theme only (`oklch(0.56 0.19 256)`) and note it.

---

## 3. Typography

Fonts: **Geist Sans** (UI, body, headings) and **Geist Mono** (dates, tags, counts, section numbers, eyebrows, footer). Loaded with `next/font` and exposed as `--font-geist-sans` / `--font-geist-mono`.

| Token | Value | Weight / tracking |
|---|---|---|
| `--text-display` | `clamp(2.75rem, 1.6rem + 4.2vw, 4.5rem)` **(from design)** | 700 · `-0.035em` |
| `--text-h1` | `clamp(2rem, 1.4rem + 2.2vw, 3rem)` **(from design)** | 600 · `-0.02em` |
| `--text-h2` | `clamp(1.375rem, 1.1rem + 1vw, 1.75rem)` **(from design)** | 600 · `-0.015em` |
| `--text-h3` | `1.0625rem` | 600 |
| body | `1rem` / `1.65` **(from design)** | 400 · measure 46–68ch **(from design)** |
| small | `0.875rem` / `1.55` | secondary copy, card summaries |
| mono-meta | `0.75rem` / `1.4` · `0.06em` uppercase for eyebrows | dates, tags, counts, eyebrows, footer |

Rules:

- **Mono carries dates, tags, counts and section numbers only** (from design). Never body copy.
- Eyebrows (`BIO`, `LAB`, `WORK`, `ON THIS PAGE`, `ELSEWHERE`, `STACK`) are mono, uppercase, `--muted-foreground`, letter-spacing `0.08em`, 12px.
- One `h1` per page at `--text-h1`, except Home, where the hero name uses `--text-display`.

---

## 4. Layout & space

| Token | Value |
|---|---|
| `--container` | `72rem` (1152px) **(from design)** |
| gutter | `16px` mobile, `24px` at `sm` and up **(from design)** |
| spacing step | `8px` **(from design)**; Tailwind's default scale already matches |
| section rhythm | `py-16` mobile, `py-24` desktop between page sections; `py-12`/`py-16` inside a section |
| header height | `64px` mobile, `72px` desktop, sticky, hairline bottom border |
| grid gap | `24px` cards desktop, `16px` mobile |

```css
@utility container-page { max-inline-size: var(--container); margin-inline: auto; padding-inline: 1rem; }
@media (width >= 40rem) { @utility container-page { padding-inline: 1.5rem; } }
```

## 5. Radii, borders, elevation

| Token | Value | Use |
|---|---|---|
| `--radius` | `0.75rem` (12px) **(from design: 12–16px)** | Buttons, inputs, chips at `--radius-sm` |
| `--radius-sm` | `0.5rem` | Badges, small controls |
| `--radius-lg` | `1rem` | Cards, covers, dialog |
| `--radius-full` | `9999px` | Avatar, filter chips, logo dot |
| border | `1px solid var(--border)` | Everything. No 2px borders except the focus ring |
| elevation | Dialog and sheet only: `0 24px 48px -24px oklch(0 0 0 / 0.6)` | Cards use borders, not shadows |

## 6. Motion **(from design)**

| Token | Value |
|---|---|
| `--ease-brand` | `cubic-bezier(0.22, 1, 0.36, 1)` |
| `--dur-ui` | `200ms` (hover, toggle, chip) — hard cap **400ms** |
| `--dur-reveal` | `500ms` (scroll reveal) — hard cap **700ms** |
| stagger | `60ms` between siblings |

Only `transform` and `opacity` animate. Everything is disabled under `prefers-reduced-motion: reduce`.

## 7. Focus **(from design)**

```css
:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
  border-radius: inherit;
}
```

Applies to **every** interactive element, including cards that are links. Minimum hit target **44×44px** (from design, screen 02).

## 8. Backgrounds and effects

- **Hero mesh** (screens 03, 09): three blurred radial blobs — `--brand` upper-left, `--brand-2` centre, `--brand-3` upper-right — at 10–14% alpha over `--background`, `filter: blur(80px)`, `aria-hidden`, `pointer-events: none`, clipped to the hero. No canvas, no WebGL.
- **Contact band** (screen 03): full-bleed `bg-signature` at ~18% alpha over `--card`, with a hairline top border.
- **Card covers** (screens 03, 05, 06, 07): deterministic gradient generated from the slug — two stops picked from the brand ramp, 135°, plus a dark overlay at the bottom so the caption stays legible. Same input always gives the same cover.
- **Avatar ring**: 2px gradient ring with a 3px gap to the image (circle on Home, `--radius-lg` on Bio).

## 9. Token map for Tailwind v4

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-brand: var(--brand);
  --color-brand-2: var(--brand-2);
  --color-brand-3: var(--brand-3);
  --color-brand-4: var(--brand-4);
  --color-destructive: var(--destructive);
  --color-warning: var(--warning);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --ease-brand: cubic-bezier(0.22, 1, 0.36, 1);
}
```

## 10. Contrast floor

| Pair | Minimum | Both themes |
|---|---|---|
| `--foreground` on `--background` | 4.5:1 (body), 3:1 (≥24px) | ✅ |
| `--muted-foreground` on `--background` | 4.5:1 | ✅ |
| `--muted-foreground` on `--card` | 4.5:1 | ✅ |
| `--brand-foreground` on `--brand` | 4.5:1 | ✅ |
| `--brand` link text on `--background` | 4.5:1 | ✅ |
| Focus ring against both surfaces | 3:1 | ✅ |

F1 ships an automated test for this table (`tests/unit/shared/contrast.test.ts`).
