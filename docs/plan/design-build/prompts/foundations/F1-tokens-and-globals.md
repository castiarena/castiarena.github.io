> **Read [`docs/plan/design-build/00-STATE.md`](../../00-STATE.md) first.**
> Waves 0 and 1 are already merged, so a first version of the tokens, primitives and motion system
> exists on `next`. 00-STATE §2 lists exactly what still differs from this spec. You are
> reconciling that code with the approved design, not starting from an empty file.

# Agent F1 — Tokens & `globals.css`

| Phase | Mode | Depends on | Unblocks |
|---|---|---|---|
| Foundations | Parallel with F2, F3, 1.2, 1.4 | 0.1 bootstrap merged into `next` | Everything visual |

## Mission
Turn `design-build/01-design-tokens.md` into the single stylesheet the whole site is built on: OKLCH tokens for dark and light, the Tailwind v4 theme mapping, the signature gradient utilities, the fluid type scale, focus rules and the motion budget. Prove the contrast floor with a test.

## Context to load first
- `docs/plan/design-build/00-README.md`
- **`docs/plan/design-build/01-design-tokens.md`** (your spec, end to end)
- `docs/plan/design-build/reference/01-foundations.png` — open it with the Read tool and look at it
- `docs/plan/02-shared-contracts.md`, `docs/plan/04-agent-loop-protocol.md`, `docs/handoffs/0.1.md`

## You own
`src/app/globals.css`, `src/components/shared/fonts.ts`, `tests/unit/shared/contrast.test.ts`, `docs/handoffs/F1.md`, plus adding `culori` / `@types/culori` and the font package to `package.json`.

## Do not touch
`src/components/ui/**` and `src/components/shared/**` except `fonts.ts` (F2), `src/components/motion/**` (F3), pages, layout.

## Tasks
1. **Stylesheet skeleton**: `@import "tailwindcss"; @import "tw-animate-css";` then `@custom-variant dark (&:is(.dark *));`.
2. **Tokens**: `:root` (light) and `.dark` blocks with every value in `01-design-tokens.md` §2, plus the brand tokens from §1 including `--brand-4` and `--brand-foreground`, `--destructive` and `--warning`. Dark is the default theme, so `<html>` carries `.dark` initially (U1 wires `next-themes`).
3. **Theme mapping**: the `@theme inline` block from §9, so `bg-card`, `text-muted-foreground`, `border-border`, `text-brand-2`, `font-mono`, `rounded-lg` and `ease-brand` all resolve.
4. **Type scale**: `--text-display`, `--text-h1`, `--text-h2`, `--text-h3` as `clamp()` values from §3, each with its weight and tracking. Expose them as utilities (`@utility text-display { … }` and so on) so pages never write raw `text-[…]`.
5. **Utilities**: `container-page`, `bg-signature`, `text-signature`, `bg-hero-mesh` (the three blurred blobs from §8, as a background-image composition so no extra DOM is needed where possible), `focus-ring` (for cases that need it applied manually), `hairline` (1px `--border` top/bottom helpers).
6. **Base layer**: `html { color-scheme: light dark; scroll-behavior: smooth }`, body font and colours, `:focus-visible` per §7, `::selection` in `--brand` at 30%, heading tracking defaults, and a `@media (prefers-reduced-motion: reduce)` block that kills smooth scroll and sets `--dur-ui`/`--dur-reveal` to `1ms`.
7. **Fonts** (`src/components/shared/fonts.ts`): export `geistSans` and `geistMono` via `next/font` with `variable: '--font-geist-sans'` / `'--font-geist-mono'`, `display: 'swap'`, and preload only the sans. Write the exact `<html className>` wiring U1 needs into your handoff.
8. **Contrast test**: parse the tokens out of `globals.css` with a regex, convert with `culori`, and assert every pair in `01-design-tokens.md` §10 for **both** themes. The test must fail loudly if a token is edited into a failing value.
9. **Token reference page**: extend the existing `src/app/styleguide/page.tsx` only if 0.1 created it; otherwise skip — F2 owns the style guide.
10. If a value from the spec fails contrast, adjust the **lightness only**, keep the hue, write the change into `01-design-tokens.md` (you may edit that file — it is your spec) and call it out in the handoff.

## Acceptance criteria (loop until all pass)
- [ ] Standard gate from `docs/plan/04-agent-loop-protocol.md` §3 passes
- [ ] `grep -nE "#[0-9a-fA-F]{3,6}|rgb\(|hsl\(" src/app/globals.css` finds nothing — OKLCH only
- [ ] The contrast test passes for dark and light
- [ ] A scratch page using `text-display`, `bg-signature`, `container-page`, `bg-card`, `text-brand-2` renders correctly in both themes (screenshot it, review it, then delete the scratch page)
- [ ] Toggling `.dark` on `<html>` re-themes everything with no missing variables (check the computed styles in Playwright, no `unset`/empty values)
- [ ] Your screenshots of the token sheet are in `docs/handoffs/assets/F1/` and you compared them to `reference/01-foundations.png` yourself

## Handoff — `docs/handoffs/F1.md`
Full token table with the shipped values, the utility class list with examples, the exact `<html>` font wiring for U1, and any value you adjusted with the reason.

## Loop rules
`docs/plan/04-agent-loop-protocol.md`. Up to 6 iterations. Final line:
`AGENT_RESULT id=F1 status=<DONE|BLOCKED> pr=<url> preview=<url> ccr=<n>`
