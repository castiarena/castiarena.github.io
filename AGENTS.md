<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## This repo specifically

Static export (`output: 'export'` in `next.config.ts`), deployed to GitHub Pages — there is no
Node server at runtime. No Route Handlers other than build-time metadata files (`robots.ts`,
`sitemap.ts`), no Server Actions, no `fetch` revalidation. Every route must be fully static.

Content (bio, experience, projects, skills, experiments) is typed data in `src/content/*.ts`, not
fetched. `experience.ts`'s `intro`/`highlights` are checked verbatim against the source CV by
`tests/unit/content/cv-verbatim.test.ts` — don't paraphrase them.

This site was originally built by a fleet of AI agents from a written plan. `docs/plan/` (the
architecture, content contracts, agent-loop protocol) and `docs/handoffs/` (each agent's notes)
are historical records, not living process to follow for day-to-day changes — but they're the
fastest way to understand why something is shaped the way it is.
