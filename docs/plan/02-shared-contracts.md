# 02 — Shared Contracts & File Ownership

Parallel agents stay out of each other's way because of three rules:

1. **Wave 0 creates every shared interface up front**: types, site config, and **stub components with their final prop signatures**. Wave 1 and 2 agents write against these stubs and never wait on each other.
2. **Each agent owns a fixed set of paths** (see the matrix). An agent may only create or modify files inside the paths it owns.
3. **Frozen files** can only be changed through a *Contract Change Request* (CCR) in the agent's handoff note. The wave gate applies CCRs before the next wave starts.

---

## 1. Content types — `src/content/types.ts` (FROZEN)

```ts
export type ISODateMonth = `${number}-${number}` // "2023-02"

export interface SocialLink {
  label: 'GitHub' | 'LinkedIn' | 'Email' | 'X' | 'Website'
  href: string
}

export interface Profile {
  name: string
  role: string                    // "Senior Frontend Engineer"
  tagline: string                 // one-liner for hero
  location: string                // "Trevelin, Patagonia, Argentina"
  summary: string[]               // paragraphs
  avatar: { src: string; alt: string }
  cvHref: string                  // "/cv/agustin-castiarena-resume.pdf"
  email: string
  socials: SocialLink[]
  yearsOfExperience: number
}

export interface Experience {
  id: string                      // "riverside"
  company: string
  companyUrl?: string
  title: string
  start: ISODateMonth
  end: ISODateMonth | 'present'
  intro: string
  highlights: string[]
  stack?: string[]
}

export interface Achievement {
  id: string
  title: string
  metric: { value: number; unit: '%' | 'x' | '+'; label: string }
  description: string
}

export interface SkillGroup {
  id: 'frontend' | 'backend' | 'leadership'
  label: string
  skills: string[]
}

export interface Course {
  title: string
  provider: string
  href?: string
}

export interface Experiment {
  slug: string
  title: string
  description: string             // ≤ 140 chars
  href: string                    // live URL
  sourceHref?: string
  image?: { src: string; alt: string }
  tags: string[]
  year: number
}

export interface Project {
  slug: string
  title: string
  summary: string                 // ≤ 200 chars, card copy
  role: string
  period?: string
  problem: string
  approach: string[]
  outcomes: string[]
  stack: string[]
  cover: { src: string; alt: string }
  gallery?: { src: string; alt: string }[]
  links: { live?: string; repo?: string; caseStudy?: string }
  featured: boolean
  order: number
}
```

## 2. Content barrel — `src/content/index.ts` (FROZEN signatures; bodies can grow)

```ts
export { profile } from './profile'
export { experiences } from './experience'
export { achievements, skillGroups, courses } from './skills'
export { experiments } from './experiments'
export { projects } from './projects'

export function getFeaturedProjects(limit = 3): Project[]
export function getProjectBySlug(slug: string): Project | undefined
export function getAllProjectSlugs(): string[]
export function getLatestExperiments(limit = 4): Experiment[]
export function getExperimentTags(): string[]
```

Wave 0 seeds each content file with **one valid placeholder entry** so the pages compile. Agent 1.2 replaces them with real data.

## 3. Site config — `src/config/site.ts` (FROZEN)

```ts
export const siteConfig = {
  name: 'Agustin Castiarena',
  title: 'Agustin Castiarena — Senior Frontend Engineer',
  description: 'Senior Frontend Engineer with 10+ years building modern web applications. Bio, projects and web experiments.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://castiarena.github.io',
  locale: 'en_US',
  nav: [
    { href: '/bio/', label: 'Bio' },
    { href: '/projects/', label: 'Projects' },
    { href: '/experiments/', label: 'Experiments' },
  ],
  repo: 'https://github.com/castiarena/castiarena.github.io',
} as const
```

## 4. Stub components (created by 0.1, implemented by their owner)

Each stub renders something minimal but valid, and **already exports the final props**.

| File | Export & props | Stub behaviour | Implemented by |
|---|---|---|---|
| `src/components/motion/index.ts` | `Reveal({ children, delay?: number, y?: number, as?: 'div'\|'section'\|'li', className? })` | Renders `as` with children | 1.3 |
| | `Stagger({ children, stagger?: number, className?, as? })` · `StaggerItem({ children, className? })` | Pass-through | 1.3 |
| | `HoverLift({ children, className? })` | Pass-through | 1.3 |
| | `CountUp({ value: number, suffix?: string, className? })` | Renders `{value}{suffix}` | 1.3 |
| | `MotionProvider({ children })` | Fragment | 1.3 |
| `src/components/shared/index.ts` | `Container({ children, className?, as? })` | `div.mx-auto.max-w-6xl.px-4` | 1.1 |
| | `PageHeader({ eyebrow?: string, title: string, description?: string })` | `header > h1 + p` | 1.1 |
| | `SectionHeading({ title: string, description?: string, id?: string })` | `h2 + p` | 1.1 |
| | `TagList({ tags: string[], className? })` | `ul > li` | 1.1 |
| | `ExternalLink({ href: string, children, className?, showIcon?: boolean })` | `<a target=_blank rel=…>` | 1.1 |
| | `GradientText({ children, className? })` | `span` | 1.1 |
| `src/components/contact/index.ts` | `ContactDialog({ trigger?: ReactNode })` · `ContactCTA({ className? })` | `mailto:` button | 2.6 |
| `src/components/layout/index.ts` | `SiteHeader()` · `SiteFooter()` · `ThemeProvider({ children })` | Minimal nav / footer / fragment | 2.1 |

**Rule:** you may **add** optional props to a component you own. You may **not** rename or remove props, or make optional props required, without a CCR.

---

## 5. Ownership matrix

✏️ = may create/modify · 👀 = read/import only · — = not relevant

| Path | 0.1 | 1.1 | 1.2 | 1.3 | 1.4 | 2.1 | 2.2 | 2.3 | 2.4 | 2.5 | 2.6 | 3.1 | 3.2 | 3.3 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| root configs (`next.config.ts`, `tsconfig`, eslint, prettier, vitest, playwright) | ✏️ | 👀 | 👀 | 👀 | 👀 | 👀 | 👀 | 👀 | 👀 | 👀 | 👀 | 👀 | 👀 | 👀 |
| `package.json` / `pnpm-lock.yaml` | ✏️ | ➕deps | ➕deps | ➕deps | ➕scripts | ➕deps | — | — | — | — | ➕deps | — | ➕deps/scripts | — |
| `src/content/types.ts`, `src/config/site.ts` | ✏️ | 👀 | 👀 | — | — | 👀 | 👀 | 👀 | 👀 | 👀 | 👀 | 👀 | — | — |
| `src/content/*` (data) | seed | — | ✏️ | — | — | — | 👀 | 👀 | 👀 | 👀 | 👀 | 👀 | 👀 | — |
| `src/lib/format.ts` | — | — | ✏️ | — | — | — | 👀 | 👀 | 👀 | 👀 | — | — | — | — |
| `src/app/globals.css`, `components.json`, `src/components/ui/**`, `src/components/shared/**` | stub | ✏️ | — | — | — | 👀 | 👀 | 👀 | 👀 | 👀 | 👀 | — | — | — |
| `src/app/styleguide/**` (temp) | — | ✏️ | — | — | — | — | — | — | — | — | — | — | — | — |
| `src/app/motion-lab/**` (temp) | — | — | — | ✏️ | — | — | — | — | — | — | — | — | — | — |
| `src/components/motion/**` | stub | — | — | ✏️ | — | 👀 | 👀 | 👀 | 👀 | 👀 | 👀 | — | — | — |
| `.github/**`, `vercel.json`, `scripts/**`, `docs/DEPLOYMENT.md` | — | — | — | — | ✏️ | — | — | — | — | — | — | — | — | ✏️ fixes |
| `src/app/layout.tsx`, `src/app/not-found.tsx`, `src/components/layout/**` | stub | — | — | — | — | ✏️ | — | — | — | — | — | ✏️ metadata only | — | — |
| `src/app/page.tsx`, `src/components/home/**` | stub | — | — | — | — | — | ✏️ | — | — | — | — | — | — | — |
| `src/app/bio/**`, `src/components/bio/**` | stub | — | — | — | — | — | — | ✏️ | — | — | — | ✏️ metadata only | — | — |
| `src/app/experiments/**`, `src/components/experiments/**`, `public/images/experiments/**` | stub | — | — | — | — | — | — | — | ✏️ | — | — | ✏️ metadata only | — | — |
| `src/app/projects/**`, `src/components/projects/**`, `public/images/projects/**` | stub | — | — | — | — | — | — | — | — | ✏️ | — | ✏️ metadata only | — | — |
| `src/components/contact/**` | stub | — | — | — | — | — | — | — | — | — | ✏️ | — | — | — |
| `src/app/{sitemap,robots,manifest}.ts`, `icon.svg`, `opengraph-image.tsx`, `src/lib/seo.ts` | — | — | — | — | — | — | — | — | — | — | — | ✏️ | — | — |
| `tests/e2e/**`, `lighthouserc.json` | seed | — | — | — | — | — | — | — | — | — | — | — | ✏️ | — |
| `tests/unit/<area>/**` | seed | own area | own area | own area | — | own area | own area | own area | own area | own area | own area | own area | ✏️ | — |
| `docs/handoffs/<id>.md` | own | own | own | own | own | own | own | own | own | own | own | own | own | own |

### Hot-spot rules

- **`package.json` & lockfile**: add deps with `pnpm add`, and never hand-edit the lockfile. If your PR conflicts, rebase on `origin/next`, take `next`'s lockfile, and run `pnpm install` again.
- **shadcn components**: only 1.1 runs `shadcn add`. A wave-2 agent that needs a primitive 1.1 did not install records a CCR, and meanwhile builds from the Radix primitive inside its own folder.
- **`layout.tsx`**: only 2.1 edits it. The providers from 1.3 (`MotionProvider`) and 2.1 (`ThemeProvider`) are wired there.
- **Metadata**: each page exports its own `metadata`. 3.1 may edit only the `metadata` / `generateMetadata` exports inside page files, not their JSX.
- **Wave 3 workflow edits**: 3.1 may only flip `VERIFY_STRICT=1` in `ci.yml`/`deploy-pages.yml`. 3.2 only adds the new file `.github/workflows/lighthouse.yml`. 3.3 may fix defects in `.github/**`, `scripts/**` and `vercel.json`, but must not touch the `VERIFY_STRICT` lines.
- **Wave 4**: 4.1 deletes the temporary `styleguide`/`motion-lab` routes. 4.2 adds `tests/e2e/production.spec.ts` and `.github/workflows/uptime.yml`.

---

## 6. Contract Change Request (CCR) format

Put this inside `docs/handoffs/<id>.md`:

```md
### CCR-<id>-<n>
- **File:** src/content/types.ts
- **Change:** add `Project.video?: { src: string; poster: string }`
- **Why:** project detail hero needs a looping video
- **Impact:** 1.2 (data), 2.5 (render). Backwards compatible: yes
```

The wave gate either accepts the CCR (applies it on `next`) or rejects it before the next wave starts.
