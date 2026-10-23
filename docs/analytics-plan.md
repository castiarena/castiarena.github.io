# Analytics plan — GA4 with opt-in consent

Status: **PR 1 built** (branch `feat/analytics-consent`), PR 2 and PR 3 not started. Decisions
below were settled in a grilling session; treat them as fixed unless the owner reopens one.
Implementation is split into three independently shippable PRs.

## Goals

Answer two questions: _where do visitors come from_ and _do they reach out / which work do they
look at_. That means page views + traffic sources, plus four groups of custom events:

1. Contact flow
2. Outbound links
3. Project / experiment views
4. Theme toggle

Not in scope: funnels, session replay, heatmaps, A/B testing, server-side tagging.

## Constraints from this repo

- Static export (`output: 'export'`) on GitHub Pages — no server, no middleware, no geo-detection.
  Everything runs client-side; every route stays fully static.
- Config reaches the build only as `NEXT_PUBLIC_*` env vars, set from GitHub repo **variables** in
  `.github/workflows/deploy-pages.yml` (same pattern as `NEXT_PUBLIC_TURNSTILE_SITE_KEY`).
- `NEXT_PUBLIC_DEPLOY_ENV=production` is set only by the deploy workflow; CI and local dev leave it
  unset.
- Read `node_modules/next/dist/docs/01-app/02-guides/third-party-libraries.md` (Google Analytics
  section) before writing the loader — this is Next 16, don't rely on memory.
- Gate checks (lint, typecheck, test, build, format:check, verify:export) run repo-wide.

## Decisions

| Area          | Decision                                                                                                                                                                                                                         |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Provider      | Google Analytics 4 (free, hosted)                                                                                                                                                                                                |
| Loader        | `@next/third-parties/google` → `<GoogleAnalytics gaId=… />`, rendered **only** once consent is granted                                                                                                                           |
| Consent model | Opt-in for everyone (no geo-targeting possible). **Basic** mode: `gtag.js` is never requested before Accept — no Consent Mode v2 cookieless pings                                                                                |
| Banner UX     | Non-blocking bottom bar, Accept / Decline, equal visual weight. "Cookie preferences" link in `SiteFooter` reopens it                                                                                                             |
| Persistence   | `localStorage` key holding `{ choice: 'granted' \| 'denied', timestamp, version }`. Accept expires after 12 months, Decline after 6; bumping `version` re-prompts everyone                                                       |
| Revocation    | Switching granted → denied deletes `_ga` and `_ga_*` cookies, then reloads the page                                                                                                                                              |
| Policy page   | New static `/privacy/` route; linked from the banner and footer; added to `sitemap.ts`                                                                                                                                           |
| Event naming  | GA4 recommended events where they fit, custom snake_case otherwise; all events defined in one typed catalog so `track()` is type-checked                                                                                         |
| Environments  | Active only when `NEXT_PUBLIC_DEPLOY_ENV === 'production'` **and** `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set. Otherwise `track()` logs to `console.debug` in dev and no-ops elsewhere; the banner still renders so it can be tested |
| Tests         | Vitest unit tests + Playwright e2e network assertions                                                                                                                                                                            |
| Delivery      | Three PRs (below)                                                                                                                                                                                                                |

## Architecture

New module `src/lib/analytics/` (client-only):

```
src/lib/analytics/
  config.ts        // reads env → { enabled: boolean, measurementId?: string }
  consent.ts       // pure store: read/write/expire/version; subscribe(); no React
  use-consent.ts   // React hook over consent.ts (useSyncExternalStore)
  events.ts        // typed event catalog (name → params type)
  track.ts         // track<E>(name, params): gtag if enabled+granted, console.debug in dev, else no-op
  clear-cookies.ts // deletes _ga / _ga_* on current host + parent domain
  index.ts
```

New components:

- `src/components/analytics/analytics.tsx` — `'use client'`; subscribes to consent and renders
  `<GoogleAnalytics>` only when `config.enabled && choice === 'granted'`. Mounted once in
  `src/app/layout.tsx`.
- `src/components/analytics/consent-banner.tsx` — bottom bar; shown when there's no valid stored
  choice or when reopened. Must be keyboard-accessible, announce itself politely (no focus trap,
  it's non-blocking), and pass the existing axe checks. Uses existing `ui/` primitives (Button).
- A way to reopen the banner from the footer: export an `openConsentBanner()` from the consent
  store (a flag in the store the banner subscribes to) rather than prop-drilling.

Consent store contract (`consent.ts`):

```ts
type ConsentChoice = 'granted' | 'denied'
type StoredConsent = { choice: ConsentChoice; timestamp: number; version: number }

const CONSENT_VERSION = 1
const STORAGE_KEY = 'castiarena:consent'
const MAX_AGE = { granted: 365 days, denied: 182 days }

getConsent(): ConsentChoice | null   // null = unknown/expired/old version/storage unavailable
setConsent(choice): void             // persists; if previous was granted and new is denied → clear cookies + location.reload()
subscribe(listener): () => void
openBanner(): void / isBannerOpen()
```

All `localStorage` access in `try/catch`; unavailable storage behaves as "no choice" (banner shows,
GA stays off). SSR/static-render: the store must return `null` on the server and the banner must
not cause a hydration mismatch (render after mount).

Page views: GA4 enhanced measurement's "page changes based on browser history events" handles
App Router client navigations — verify it's on in the property (setup checklist) and confirm in
DebugView that navigating Home → Bio → Projects logs three `page_view`s with no duplicates.

## Event catalog

Defined in `src/lib/analytics/events.ts`. Experiments are external links (they open in a new
tab), so "experiment views" are outbound clicks tagged with `content_type: 'experiment'`.

| Event                | GA4 type          | Params                                                                                                            | Fired from                                                                    |
| -------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `contact_open`       | custom            | `source: 'header' \| 'cta' \| …`                                                                                  | `contact-dialog.tsx` / `contact-cta.tsx` when the dialog opens                |
| `generate_lead`      | recommended       | `method: 'form'`                                                                                                  | `contact-form.tsx` on successful submit                                       |
| `contact_error`      | custom            | `reason: 'network' \| 'turnstile' \| 'validation'`                                                                | `contact-form.tsx` on failed submit                                           |
| `contact_mailto`     | custom            | —                                                                                                                 | `mailto.ts` usage site                                                        |
| `contact_copy_email` | custom            | —                                                                                                                 | `copy-to-clipboard.ts` usage site, on success                                 |
| `click` (outbound)   | recommended shape | `link_url`, `link_domain`, `outbound: true`, `content_type?: 'experiment' \| 'project' \| 'social' \| 'employer'` | `shared/external-link.tsx` + the raw `<a target="_blank">` sites listed below |
| `select_content`     | recommended       | `content_type: 'project'`, `content_id: slug`                                                                     | project card click → `/projects/[slug]/`                                      |
| `theme_change`       | custom            | `theme: 'light' \| 'dark' \| 'system'`                                                                            | `layout/theme-toggle.tsx`                                                     |

Raw external-link sites to instrument (or migrate to `ExternalLink`):
`home/latest-experiments.tsx`, `experiments/experiment-card.tsx`, `bio/bio-header.tsx`,
`bio/timeline-node.tsx`, `projects/project-hero.tsx`. Prefer migrating them to `ExternalLink` and
instrumenting once there, if it doesn't change markup/styling.

Never send PII: no form field values, no email addresses, no free text.

## Phased delivery

### PR 1 — Consent + page views — **done**

- Add `@next/third-parties` (pin to the version matching `next@16.3.5`).
- `config.ts`, `consent.ts`, `use-consent.ts`, `clear-cookies.ts`.
- `<Analytics />` + `<ConsentBanner />` mounted in `src/app/layout.tsx`.
- "Cookie preferences" button + "Privacy" link in `site-footer.tsx`.
- `/privacy/` route (`src/app/privacy/page.tsx`): what GA collects, cookies set (`_ga`, `_ga_<id>`)
  and their lifetime, data retention setting, that IP addresses aren't logged or stored by GA4, how
  to withdraw (the footer button), contact email. Add it to `sitemap.ts` (not to `siteConfig.nav`).
- Wire `NEXT_PUBLIC_GA_MEASUREMENT_ID: ${{ vars.NEXT_PUBLIC_GA_MEASUREMENT_ID }}` into
  `deploy-pages.yml`; document it in `docs/DEPLOYMENT.md`'s env table.
- Unit tests: consent store (fresh, accept, decline, expiry for each choice, version bump,
  storage throws, revoke clears cookies + reloads), banner (renders when unknown, hides after
  choice, reopens from footer, keyboard), `<Analytics>` renders GA only when enabled + granted.

Two things PR 1 added that weren't on this list, both because `/privacy/` is a new route and the
repo already guards its routes: `privacy/index.html` in `scripts/verify-export.mjs`'s required
files, and `/privacy/` in `tests/e2e/smoke.spec.ts`'s route list.

`<Link href>` has to be written `/privacy` (no trailing slash) — `typedRoutes` generates the route
without one and `trailingSlash: true` adds it at render time. The unit tests assert
`/^\/privacy\/?$/` for the same reason, as `tests/unit/layout/nav-item.test.tsx` already did.

### PR 2 — Event catalog + instrumentation

- `events.ts` + `track.ts` (dev logging, prod gtag, otherwise no-op; never throws).
- Instrument every row of the catalog above.
- Unit tests: `track()` gating matrix (enabled × consent × env); each instrumented component calls
  `track` with the expected name/params (mock the module).

### PR 3 — E2E + docs

- Playwright spec (`tests/e2e/analytics.spec.ts`) against a build with a fake measurement ID and
  `NEXT_PUBLIC_DEPLOY_ENV=production`:
  - no request to `googletagmanager.com` / `google-analytics.com` before any choice;
  - Decline → still none, after reload too;
  - Accept → gtag requested; reload → requested without banner;
  - Cookie preferences → Decline → `_ga*` cookies gone, no further GA requests.
  - Block/route GA requests in the test so nothing reaches Google.
- Axe check with the banner visible.
- Replace the "Out of scope for v2.0" analytics note at `docs/DEPLOYMENT.md:124` with a short
  section pointing at this plan.

## Manual setup checklist (owner)

1. Create a GA4 property + web data stream for `https://castiarena.github.io`.
2. Admin → Data retention: 2 months (shortest; lower privacy exposure — enough for a portfolio).
3. Admin → Data collection: Google signals **off**; granular location/device data collection off
   for regions you don't need.
4. Data stream → Enhanced measurement: on, including "page changes based on browser history
   events". Turn **off** built-in outbound-click tracking to avoid duplicating our `click` event.
5. Copy the `G-XXXXXXXXXX` ID → GitHub repo → Settings → Variables → Actions →
   `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
6. After PR 1 deploys: open the site, Accept, check Realtime / DebugView.

## Open risks

- Ad blockers will block gtag for a meaningful share of a developer audience; numbers are a lower
  bound. Accepted.
- ~~`@next/third-parties` peer-dep range vs `next@16.3.5`~~ — resolved: `@next/third-parties@16.3.5`
  accepts `next@^16.0.0`, no fallback loader needed.
