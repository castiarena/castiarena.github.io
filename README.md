# castiarena.github.io — portfolio v2

Personal portfolio of **Agustin Castiarena**, Senior Frontend Engineer. Three sections: **Bio**, **Projects** and **Experiments**, plus a home page and a contact dialog reachable from every page.

Production: https://castiarena.github.io (GitHub Pages) · Previews: Vercel (one per PR).

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19.2, statically exported (`output: 'export'`)
- TypeScript (strict)
- Tailwind CSS v4 · shadcn/ui · Motion
- pnpm (via corepack) · Node 24
- Vitest + Testing Library · Playwright + axe

## Getting started

```bash
nvm use            # Node 24 (.nvmrc)
corepack enable    # pnpm version pinned in package.json
pnpm install
pnpm dev           # http://localhost:3000
```

## Scripts

| Script                              | What it does                                                                                    |
| ----------------------------------- | ----------------------------------------------------------------------------------------------- |
| `pnpm dev`                          | Next dev server                                                                                 |
| `pnpm build`                        | Static export into `out/`                                                                       |
| `pnpm start`                        | Serve `out/` on http://localhost:4173                                                           |
| `pnpm lint`                         | ESLint (flat config)                                                                            |
| `pnpm typecheck`                    | `tsc --noEmit`                                                                                  |
| `pnpm test`                         | Vitest unit tests (`pnpm test -- --run` for a single run)                                       |
| `pnpm e2e`                          | Playwright e2e (builds, then serves `out/`; set `E2E_SKIP_BUILD=1` to reuse an existing `out/`) |
| `pnpm format` / `pnpm format:check` | Prettier                                                                                        |

## Docs

- Implementation plan: [`docs/plan/00-README.md`](docs/plan/00-README.md)
- Deployment runbook: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) (added by agent 1.4)
- Legacy (v1) deployment record and rollback: [`docs/DEPLOYMENT-legacy.md`](docs/DEPLOYMENT-legacy.md)
- Agent handoffs: [`docs/handoffs/`](docs/handoffs)

The previous Vite site is preserved on the `legacy-v1` tag and branch.
