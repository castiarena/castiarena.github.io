> **Read [`docs/plan/design-build/00-STATE.md`](../../00-STATE.md) first** — §5 lists the stub routes and
> components that already exist on `next`, and §1 links the handoffs of everything merged so far.

# Agent U6 — Contact Dialog & 404

| Phase | Mode | Depends on | Unblocks |
|---|---|---|---|
| UI | Parallel with U1–U5 | F1, F2, F3 merged into `next` | V1 |

## Mission
Build the contact dialog from screen 11 — which has to work with no server behind it — and the 404 page from screen 08. Supersedes `docs/plan/prompts/wave-2/2.6-contact.md` and the 404 part of `2.1`.

## Context to load first
- `docs/plan/design-build/00-README.md`, `01-design-tokens.md`, **`02-component-specs.md`** (Dialog, form fields, Button loading state), **`03-page-specs.md` → 404 and Contact dialog**
- References — Read and look at: **`11-contact-dialog.png`**, **`08-not-found-desktop.png`**
- `docs/plan/01-architecture.md` §1 (no Server Actions), `docs/plan/03-deployment-flow.md` §8 (form endpoint)
- `docs/handoffs/F1.md`, `F2.md`, `F3.md`, `1.2.md`
- `docs/plan/04-agent-loop-protocol.md`, `docs/plan/design-build/04-visual-qa-protocol.md`

## You own
`src/components/contact/**`, `src/app/not-found.tsx`, `tests/unit/contact/**`, `docs/handoffs/U6.md`, plus `react-hook-form` and `@hookform/resolvers` if 1.2 hasn't added zod already.

> `not-found.tsx` is listed as U1's in the original matrix. Here it is **yours**; U1 only owns the reduced header and footer variants that appear on it. Coordinate through your handoffs.

## Tasks
1. **`ContactDialog({ trigger? })`** (`'use client'`): dialog per spec — 560px, title "Get in touch", description "I usually reply within a couple of days.", default trigger `Button` "Contact".
2. **`ContactForm`**: shadcn `Form` + `react-hook-form` + zod. Name (2–80), Email (valid), Message (20–2000) with the mono `0 / 2000` counter, a hidden honeypot `company` field, and a 3-second minimum time-to-submit. Field styling and the error treatment come from `02-component-specs.md`.
3. **Submit behaviour**: with `NEXT_PUBLIC_FORM_ENDPOINT` set, POST JSON (support both Formspree and Web3Forms shapes through a small adapter keyed on the endpoint host). Without it, the primary button becomes "Open email app" and builds a properly encoded `mailto:`. On failure, show an inline alert plus an "Email me instead" `mailto:` link pre-filled from the form values.
4. **States**: idle, submitting (spinner in the button, `aria-busy`, fields disabled), success (body swaps to a check icon, "Thanks — I'll be in touch." and a Close button, announced with `role="status"`, plus a sonner toast), error.
5. **`ContactCTA({ className? })`**: `default` button that opens the dialog, next to an icon button that copies the email to the clipboard with a toast and a fallback for browsers without the Clipboard API. Home's contact band uses this.
6. **Mono footnote** inside the dialog, as in screen 11: no server on GitHub Pages, posts to `NEXT_PUBLIC_FORM_ENDPOINT` when set, otherwise `mailto:`; honeypot and 3s minimum keep bots out.
7. **404** (`src/app/not-found.tsx`): centred column at ~60vh — `404` in `text-signature` at clamp(5rem, 14vw, 9rem)/800, `h1` "That page moved, or never existed", one muted line about the old Vite site living on the `legacy-v1` tag, then `default` Home, `outline` Projects, `outline` Experiments. Exports as `out/404.html`.
8. **Privacy**: the email address appears only in `mailto:` and copy actions, never as visible body text on every page.
9. Tests (mock `fetch`): validation messages; honeypot blocks submission; a too-fast submit blocks; success path; error path shows the mailto fallback; with no endpoint, the mailto URL is correctly encoded; the counter turns destructive past 2000.

## Visual QA
Shoot the open dialog at 1280 and 390 in both themes (idle, error and success states) and `/404` at both widths. Compare with screens 11 and 08.

## Acceptance criteria
- [ ] Standard gate passes; visual QA checklist passes
- [ ] `grep -rn "use server" src` finds nothing
- [ ] Dialog: focus trapped, Esc closes, focus returns to the trigger, first invalid field receives focus on a failed submit
- [ ] axe clean on the open dialog and on `/404` in both themes
- [ ] `out/404.html` contains the 404 heading and the three links
- [ ] Contact adds ≤ 25 KB gzip to first-load JS on pages that include the header (record before/after)
- [ ] Screenshots + side-by-sides in `docs/handoffs/assets/U6/`

## EARLY_START mode
Form logic, states and tests against the stubs; no screenshots; `status=EARLY_DONE`; visual pass after rebase.

## Loop rules
`docs/plan/04-agent-loop-protocol.md`. Up to 6 iterations. Final line:
`AGENT_RESULT id=U6 status=<DONE|BLOCKED|EARLY_DONE> pr=<url> preview=<url> ccr=<n>`
