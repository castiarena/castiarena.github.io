> **Read [`docs/plan/design-build/00-STATE.md`](../../00-STATE.md) first** — §5 lists the stub routes and
> components that already exist on `next`, and §1 links the handoffs of everything merged so far.

# Agent U1 — Layout Shell (header · mobile sheet · footer · theme)

| Phase | Mode | Depends on | Unblocks |
|---|---|---|---|
| UI | Parallel with U2–U6 | F1, F2, F3 merged into `next` | V1 |

## Mission
Build the frame that every screen sits in: root layout with providers and fonts, the sticky header from screens 03–08, the mobile menu sheet from screen 10, and the footer. Supersedes `docs/plan/prompts/wave-2/2.1-layout-shell.md`.

## Context to load first
- `docs/plan/design-build/00-README.md`, `01-design-tokens.md`, **`02-component-specs.md`** (NavItem, ThemeToggle, Logo, Sheet, Footer), **`03-page-specs.md`** (Header section, 404 header variant)
- References — Read and look at: `03-home-desktop.png` (header over hero), `10-mobile-menu.png`, `09-home-mobile.png`, `08-not-found-desktop.png`
- `docs/handoffs/F1.md` (font wiring), `F2.md` (primitives, harness), `F3.md` (nav underline helper, MotionProvider)
- `docs/plan/02-shared-contracts.md`, `docs/plan/04-agent-loop-protocol.md`, `docs/plan/design-build/04-visual-qa-protocol.md`

## You own
`src/app/layout.tsx`, `src/components/layout/**`, `tests/unit/layout/**`, `docs/handoffs/U1.md`, plus adding `next-themes`.

## Do not touch
Page files and page-specific components (U2–U6), `components/ui` and `components/shared` (F2 — need a change? CCR), contact internals (U6: you only render `<ContactDialog trigger={…} />`).

## Tasks
1. **`layout.tsx`**: `<html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>`, body `min-h-dvh bg-background text-foreground font-sans antialiased`. Providers in order: `ThemeProvider` → `MotionProvider` → `SkipLink` → `SiteHeader` → `<main id="content" tabIndex={-1}>` → `SiteFooter` → `<Toaster />`. Keep the `metadata` export from 0.1 and add `viewport` with `themeColor` for both schemes.
2. **`ThemeProvider`**: `next-themes`, `attribute="class"`, `defaultTheme="dark"`, `enableSystem`, `disableTransitionOnChange`.
3. **`Logo`**, **`NavItem`**, **`ThemeToggle`** per `02-component-specs.md`. The active underline uses F3's shared `layoutId` and transition, and does not animate under reduced motion.
4. **`SiteHeader`**: 72px desktop / 64px mobile, sticky, transparent over the hero, then `--background/80` + blur + hairline border after 8px of scroll (a small client hook, throttled with `requestAnimationFrame`). Grid: logo left, nav centred, theme toggle + `Button` "Contact" right. Below `md`: logo, theme toggle, hamburger. Optional 2px `ScrollProgress` line at the very top if F3 shipped it.
5. **404 header variant**: on `/404`, the nav links are hidden and only the logo and Contact button show (screen 08). Drive it from `usePathname()`, not from a prop threaded through pages.
6. **`MobileNav`** (screen 10): `Sheet` from the right, `min(86vw, 360px)`. Header row `● menu` in mono with the `--brand-3` dot and a ✕ (44px hit box). Links at 20px/600 with hairline dividers, active item marked by a `--brand-3` dot on the right. Full-width Contact button. `ELSEWHERE` eyebrow with LinkedIn and GitHub `ExternalLink`s pinned to the bottom. Closes on route change and returns focus to the hamburger.
7. **`SiteFooter`** per spec: hairline top border, mono 12px, left credit line, right `LinkedIn GitHub Email` in `--brand`, stacked on mobile. The year is computed at build time. On `/404` the credit line becomes `© <year> Agustin Castiarena · exported as out/404.html`.
8. **`SkipLink`**: hidden until focused, jumps to `#content`.
9. Tests: nav renders every `siteConfig.nav` entry; `aria-current` on the active route (mock `usePathname`); 404 variant hides the nav; sheet closes on navigation; ThemeToggle has an accessible name that includes the current mode.

## Visual QA (`04-visual-qa-protocol.md`)
Shoot `/` (header over hero, scrolled and unscrolled), `/bio/` (solid header), `/404`, and the open sheet at 390px, in both themes. Compare against screens 03, 10 and 08 and review them yourself.

## Acceptance criteria
- [ ] Standard gate passes
- [ ] Visual QA checklist passes for the header, sheet and footer at 390 and 1280, both themes
- [ ] Keyboard: Tab from load reaches skip link → logo → each nav item → theme toggle → Contact; the sheet traps focus, Esc closes it, focus returns to the hamburger
- [ ] Theme persists across navigation and reload, with no hydration warning in the console
- [ ] Header does not overlap content: `main` starts below it at every breakpoint, and anchor targets are not hidden under it (`scroll-mt` set)
- [ ] `out/404.html` shows the reduced header
- [ ] Screenshots + side-by-sides in `docs/handoffs/assets/U1/`

## EARLY_START mode
If you were started with `EARLY_START=1` (foundations not merged yet): build structure, props, tests and accessibility against the 0.1 stubs, skip all screenshots and visual QA, and end with `status=EARLY_DONE`. When foundations land, rebase on `origin/next` and run the visual pass before opening the PR.

## Loop rules
`docs/plan/04-agent-loop-protocol.md`. Up to 6 iterations. Final line:
`AGENT_RESULT id=U1 status=<DONE|BLOCKED|EARLY_DONE> pr=<url> preview=<url> ccr=<n>`
