<!-- Title: [<agent id>] <short title> · base branch: next -->

## Summary

<!-- What changed and why, in a few bullets. -->

-

## Handoff

<!-- Agents: link your handoff note. Humans: delete this section if not applicable. -->

- `docs/handoffs/<id>.md`

## Preview

<!-- The Vercel bot comments the preview URL on this PR. Paste the main route(s) to review. -->

- Vercel preview: <!-- https://…vercel.app -->

## Screenshots

<!-- UI changes: 375px and 1280px, light and dark. Delete if not applicable. -->

## Checklist

- [ ] Standard gate passes locally: `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test -- --run`, `pnpm build`, `node scripts/verify-export.mjs`
- [ ] No new `'use server'`, Server Actions, `cookies()` / `headers()` (the site is a static export)
- [ ] Accessibility checked (keyboard, focus visible, labels, contrast, one `h1` per page)
- [ ] Reduced motion checked (`prefers-reduced-motion: reduce`)
- [ ] Only files I own were modified (or a CCR is recorded in the handoff)
- [ ] Acceptance criteria from the prompt are copied below and ticked

<!-- Acceptance criteria -->
