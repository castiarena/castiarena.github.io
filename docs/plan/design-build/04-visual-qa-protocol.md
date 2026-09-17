# 04 — Visual QA Protocol

How an agent proves a screen matches the design. Every UI agent runs this for its own screens before declaring DONE, and V1 runs it across the whole site at the end.

The reference images are **renders of a design document, not pixel-perfect targets**. A pixel-diff against them would be noise. What follows checks the things that actually make a UI look wrong: structure, type, colour, spacing, state.

---

## 1. Harness

`scripts/shoot.mjs` (F2 ships it, UI agents use it):

```bash
pnpm build && pnpm start &                 # serves ./out on :4173
node scripts/shoot.mjs --route /bio/ --out docs/handoffs/assets/U3
```

For each route it writes, into the given folder:

| File | Viewport | Theme |
|---|---|---|
| `<route>-1280-dark.png` | 1280×900, full page | dark |
| `<route>-1280-light.png` | 1280×900, full page | light |
| `<route>-390-dark.png` | 390×844, full page | dark |
| `<route>-390-light.png` | 390×844, full page | light |

It sets the theme by writing `localStorage.theme` before load, disables animations (`prefers-reduced-motion`), waits for fonts (`document.fonts.ready`) and for images, then captures.

## 2. Side-by-side

`node scripts/compare.mjs --shot <shot.png> --ref design-build/reference/03-home-desktop.png --out <side-by-side.png>` scales both to the same width and stacks them. The agent **looks at the result itself** with the Read tool. This is the step that catches what a checklist misses.

## 3. Checklist (per screen, per theme, per viewport)

**Structure**

- [ ] Sections appear in the reference's order, with nothing added or missing
- [ ] Column counts match at each breakpoint (and the mobile reference where one exists)
- [ ] Content max-widths match: 1152px container, 46–68ch measure on prose

**Type**

- [ ] Heading sizes come from `--text-display` / `--text-h1` / `--text-h2`, never ad-hoc `text-[..]`
- [ ] Mono is used only for dates, tags, counts, section numbers, eyebrows and the footer
- [ ] Eyebrows are uppercase, 12px, `0.08em`, `--muted-foreground`
- [ ] No orphaned single words in headings at 390px

**Colour**

- [ ] Every colour resolves to a token: `grep -nE "#[0-9a-fA-F]{3,6}|rgb\(|oklch\(" src/components/<area> src/app/<route>` finds nothing
- [ ] The signature gradient appears only where tokens §1 allows
- [ ] Stat accents follow the brand / brand-2 / brand-4 / brand-3 order
- [ ] The light theme is not just inverted: cards, borders and muted text all read correctly

**Spacing**

- [ ] Section rhythm is `py-16` / `py-24`; every gap is a multiple of 4px
- [ ] Card padding 20px, grid gaps 24px desktop / 16px mobile
- [ ] Nothing touches the viewport edge at 390px (16px gutter holds)

**State** (drive these with Playwright, capture each)

- [ ] Hover and focus-visible on every interactive element — the focus ring is 2px `--ring` with 2px offset and is never clipped
- [ ] Active nav item, selected filter chip, loading button, field error, empty state, disabled state
- [ ] Keyboard: Tab order matches reading order; dialogs and the sheet trap focus and restore it

**Motion**

- [ ] Reveals ≤700ms, UI ≤400ms, `--ease-brand`, transform/opacity only
- [ ] With `reducedMotion: 'reduce'`, nothing moves and nothing stays hidden

**Resilience**

- [ ] With JavaScript disabled, all text is visible and links work
- [ ] At 320px wide there is no horizontal scroll
- [ ] Zoomed to 200%, nothing overlaps or is cut off

## 4. Thresholds

| Check | Passes when |
|---|---|
| Structure, type, colour, spacing | Every checklist box ticked, side-by-side reviewed by the agent |
| axe (`@axe-core/playwright`) | No serious or critical violations, in both themes |
| Lighthouse (mobile, per route) | Performance ≥ 90, Accessibility ≥ 95 |
| Layout shift | CLS ≤ 0.05 on the route |
| Console | No errors, and no message containing "Hydration" |
| Visual regression | Once V1 has approved a screen, `toHaveScreenshot` baselines guard it with `maxDiffPixelRatio: 0.02` |

## 5. Reporting

Each agent's handoff (`docs/handoffs/<id>.md`) gets a **Visual QA** section:

```md
## Visual QA
| Screen | 1280 dark | 1280 light | 390 dark | 390 light | Reference | Verdict |
|---|---|---|---|---|---|---|
| /bio/ | ✅ | ✅ | ✅ | ⚠️ rail hidden (by design) | 04-bio-desktop.png | pass |

Deviations from the reference (intentional):
- … what, why, and whether the design should be updated
```

## 6. Deviations

Where code can't or shouldn't match the render, the agent writes it down instead of silently diverging. Known ones, already accepted:

- The reference renders are static: real hover, focus and loading states come from `02-component-specs.md`, not from the images.
- Mobile references exist only for Home and the menu. Other mobile layouts follow the responsive rules in `03-page-specs.md`.
- Placeholder content (`TODO(agustin)`, generated covers) shows in the references and stays until real content lands.
