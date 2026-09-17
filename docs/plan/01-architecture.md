# 01 — Architecture

## 1. Rendering model

The whole site is **statically exported** (`output: 'export'`). `next build` writes plain HTML/CSS/JS into `out/`. GitHub Pages serves that folder, and Vercel serves the same build for previews.

Because of this, a few rules apply to **every agent**:

| Allowed | Not allowed (breaks static export) |
|---|---|
| Server Components that run at build time | `cookies()`, `headers()`, `draftMode()` |
| Client Components (`'use client'`) for interactivity | Server Actions (`'use server'`) |
| Dynamic routes **with** `generateStaticParams()` and `export const dynamicParams = false` | Dynamic routes without `generateStaticParams` |
| `GET` route handlers with `export const dynamic = 'force-static'` (e.g. `sitemap.ts`, `robots.ts`) | Route handlers that read the `Request` |
| `next/image` with `images.unoptimized: true` | The default image optimizer, ISR, `proxy.ts` (formerly middleware), rewrites/redirects/headers in `next.config` |
| Browser APIs inside `useEffect` or event handlers | Reading `window` or `localStorage` during render |

### `next.config.ts` (owned by Wave 0; later changes need a contract change request)

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,          // /bio -> /bio/index.html (GitHub Pages serves this without a rewrite)
  images: { unoptimized: true },
  reactStrictMode: true,
  typedRoutes: true,
  // No basePath: castiarena.github.io is a *user* site served from the domain root.
}

export default nextConfig
```

> **Why there is no `basePath`:** a repo named `<user>.github.io` is published at the root of the domain. A `basePath` is only needed for *project* sites (`<user>.github.io/<repo>`).

---

## 2. Repository layout

```
castiarena.github.io/
├─ .github/
│  ├─ workflows/
│  │  ├─ ci.yml                     # 1.4 — lint, typecheck, unit, build, e2e on PRs + next/main
│  │  └─ deploy-pages.yml           # 1.4 — build + deploy to GitHub Pages on push to main
│  ├─ pull_request_template.md      # 1.4
│  └─ dependabot.yml                # 1.4
├─ docs/
│  ├─ plan/                         # this plan (copied by 0.1)
│  ├─ handoffs/                     # one handoff note per agent (04-agent-loop-protocol)
│  └─ DEPLOYMENT.md                 # 1.4 — runbook distilled from 03-deployment-flow
├─ public/
│  ├─ images/profile.jpg            # 0.1 (from plan/assets)
│  ├─ images/experiments/*          # 2.4 (placeholders until you supply screenshots)
│  ├─ images/projects/*             # 2.5
│  ├─ cv/agustin-castiarena-resume.pdf   # 0.1
│  └─ .nojekyll                     # 0.1
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx                 # 2.1 (stub from 0.1)
│  │  ├─ globals.css                # 1.1 (Tailwind v4 entry + tokens)
│  │  ├─ page.tsx                   # 2.2 — home
│  │  ├─ not-found.tsx              # 2.1
│  │  ├─ bio/page.tsx               # 2.3
│  │  ├─ experiments/page.tsx       # 2.4
│  │  ├─ projects/page.tsx          # 2.5
│  │  ├─ projects/[slug]/page.tsx   # 2.5
│  │  ├─ sitemap.ts                 # 3.1
│  │  ├─ robots.ts                  # 3.1
│  │  ├─ manifest.ts                # 3.1
│  │  ├─ icon.svg                   # 3.1
│  │  └─ opengraph-image.tsx        # 3.1 (build-time; static PNG fallback allowed)
│  ├─ components/
│  │  ├─ ui/                        # 1.1 — shadcn primitives (generated)
│  │  ├─ shared/                    # 1.1 — PageHeader, SectionHeading, TagList, ExternalLink, Container
│  │  ├─ motion/                    # 1.3 — Reveal, Stagger, StaggerItem, HoverLift, MotionProvider
│  │  ├─ layout/                    # 2.1 — SiteHeader, MobileNav, SiteFooter, ThemeToggle, SkipLink
│  │  ├─ contact/                   # 2.6 — ContactDialog, ContactForm
│  │  ├─ home/                      # 2.2
│  │  ├─ bio/                       # 2.3
│  │  ├─ experiments/               # 2.4
│  │  └─ projects/                  # 2.5
│  ├─ content/
│  │  ├─ types.ts                   # 0.1 — FROZEN contract
│  │  ├─ profile.ts                 # 1.2
│  │  ├─ experience.ts              # 1.2
│  │  ├─ skills.ts                  # 1.2
│  │  ├─ experiments.ts             # 1.2
│  │  ├─ projects.ts                # 1.2
│  │  └─ index.ts                   # 0.1 — barrel + query helpers (getProjectBySlug, …)
│  ├─ config/site.ts                # 0.1 — FROZEN contract (name, url, nav, socials)
│  └─ lib/
│     ├─ utils.ts                   # 0.1 — cn()
│     └─ format.ts                  # 1.2 — date range formatting
├─ tests/
│  ├─ unit/                         # each agent adds tests for what it owns
│  └─ e2e/                          # 3.2 (smoke spec seeded by 0.1)
├─ components.json                  # 1.1 (shadcn)
├─ eslint.config.mjs · prettier.config.mjs · vitest.config.ts · playwright.config.ts   # 0.1
├─ lighthouserc.json                # 3.2
├─ vercel.json                      # 1.4
├─ next.config.ts · tsconfig.json · postcss.config.mjs · package.json   # 0.1
└─ README.md                        # 0.1, refreshed in 4.1
```

---

## 3. Routes and page anatomy

### `/` — Home (2.2)
1. **Hero**: name, "Senior Frontend Engineer", a one-line pitch, a bright OKLCH gradient behind the heading, and CTAs (*View projects*, *Read bio*, *Contact*).
2. **Impact strip**: the 4 key achievements from the CV as animated stat counters (35% scalability, 40% faster code review, 98% stakeholder satisfaction, 25% faster load).
3. **Featured projects**: the 3 projects marked `featured: true`, shown as cards.
4. **Latest experiments**: the 4 most recent entries, in a compact grid.
5. **Contact CTA** band.

### `/bio/` — Bio (2.3)
1. Header with photo, location (Patagonia, Argentina), links (LinkedIn, GitHub, email) and a **Download CV** button.
2. Summary (3 paragraphs from the CV).
3. **Experience timeline**: vertical and animated on scroll. Each role shows company, title, dates, a short intro line and bullets.
4. **Key achievements**: 4 cards.
5. **Skills**: grouped as Frontend Engineering, Backend & APIs, and Leadership.
6. **Training / courses**.

### `/experiments/` — Experiments (2.4)
- Filterable grid (tag chips, client-side, filter kept in `?tag=` via `useSearchParams` inside a `<Suspense>` boundary).
- Each card: preview image, title, one-line description, tags, year, and an external link (opens in a new tab, `rel="noopener noreferrer"`). A source link is optional.

### `/projects/` and `/projects/[slug]/` — Projects (2.5)
- The index lists every project as a large card with alternating layout and scroll reveal.
- The detail page shows the problem, your role, the stack, highlights/results, a gallery, and links (live, repo, case study). It is generated with `generateStaticParams` from `projects.ts`, and `dynamicParams = false`.

### Global (2.1, 2.6)
- **Sticky header**: shadcn `NavigationMenu` on desktop, `Sheet` on mobile, a theme toggle, and a *Contact* button that opens `ContactDialog`.
- **Footer**: socials, "Built with Next.js · deployed on GitHub Pages", and the year.
- **404 page** (`not-found.tsx` → exported as `404.html`, which GitHub Pages serves automatically).

---

## 4. Design direction (for 1.1)

- **Personality**: calm, technical, confident, with bright accents used sparingly.
- **Theme**: dark by default, with full light-mode support through `next-themes` (`class` strategy, which works in a static export).
- **Colour tokens** (OKLCH, defined in `globals.css` under `@theme inline`):
  - `--brand`: `oklch(0.63 0.19 256)` (close to the CV blue)
  - `--brand-2`: `oklch(0.72 0.17 195)` (cyan)
  - `--brand-3`: `oklch(0.66 0.24 305)` (violet), used only in gradients
  - Neutrals follow shadcn's `--background`, `--foreground`, `--muted`, etc.
  - Signature gradient: `linear-gradient(in oklch 120deg, var(--brand), var(--brand-2), var(--brand-3))`
- **Type**: Geist Sans for UI and body, Geist Mono for metadata (dates, tags), loaded with `next/font` so the fonts are self-hosted at build time.
- **Layout**: max width 72rem, a 16px mobile gutter, and a fluid `clamp()` type scale.
- **Motion budget**: ≤ 400ms for UI, ≤ 700ms for reveals, only `transform` and `opacity` are animated, and every animation is off when `prefers-reduced-motion: reduce`.

---

## 5. Cross-cutting rules

| Topic | Rule |
|---|---|
| Accessibility | Semantic landmarks, one `h1` per page, visible focus rings, colour contrast ≥ 4.5:1, labelled icon buttons, a skip link |
| Performance | A route is a Server Component unless it needs interactivity. Keep `'use client'` at the leaves. Budget: ≤ 120 KB JS gzip on first load for `/` |
| Privacy | **Do not publish the phone number from the CV.** Email is shown only through the contact dialog or `mailto:` |
| Content | All copy lives in `src/content/*`. Components never hard-code biographical text |
| External links | Use `<ExternalLink>` (adds `target="_blank"`, `rel`, an icon, and an sr-only "(opens in new tab)") |
| Imports | Use the `@/*` alias. No default exports except where Next requires them (pages, layouts) |
