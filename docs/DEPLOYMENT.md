# Deployment runbook

Operator guide for `castiarena/castiarena.github.io`, based on [`docs/plan/03-deployment-flow.md`](plan/03-deployment-flow.md).
The legacy (v1, Vite) setup is recorded in [`docs/DEPLOYMENT-legacy.md`](DEPLOYMENT-legacy.md).

- Production: **https://castiarena.github.io** (GitHub Pages, deployed by `deploy-pages.yml`)
- Previews and staging: **Vercel** (one preview per PR, plus a staging URL for `next`)

## 1. Platform roles

| Platform                    | Role                                                                                  | Triggered by                                  | URL                                                |
| --------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------- | -------------------------------------------------- |
| GitHub                      | Source of truth: review, required checks, Actions                                     | every push / PR                               | https://github.com/castiarena/castiarena.github.io |
| Actions: `ci.yml`           | Quality gate: lint, format, typecheck, unit, build, `verify-export`, e2e              | PRs to `next`/`main`, pushes to `next`/`main` | —                                                  |
| Vercel (Git integration)    | Preview per PR and staging for `next`. Production deploys are **off** (`vercel.json`) | PR opened/updated, push to `next`             | `*-git-<branch>-castiarena.vercel.app`             |
| Actions: `deploy-pages.yml` | Production deploy of the static export                                                | push to `main`, manual `workflow_dispatch`    | https://castiarena.github.io                       |

Vercel and GitHub Pages serve the same `next build` output (`output: 'export'`, `trailingSlash: true`, no `basePath`), so what passes on a preview is what ships to Pages.

### Workflows and scripts

| File                                 | What it does                                                                                                                                                                                                     |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/ci.yml`           | Job `verify`: install → lint → `format:check` → typecheck → unit → build → `verify-export` → upload `out/`. Job `e2e`: downloads `out/`, installs Chromium, runs Playwright against `out/` (`E2E_SKIP_BUILD=1`). |
| `.github/workflows/deploy-pages.yml` | Job `build`: checkout (`ref` input or the pushed ref) → build with production env → `.nojekyll` → `verify-export` → `upload-pages-artifact`. Job `deploy`: `deploy-pages` into the `github-pages` environment.   |
| `scripts/verify-export.mjs`          | Checks `out/` (see §8). `pnpm verify:export` or `node scripts/verify-export.mjs [outDir]`. `VERIFY_STRICT=1` makes missing `sitemap.xml`/`robots.txt` an error.                                                  |
| `vercel.json`                        | Framework, install/build commands, and `git.deploymentEnabled` off for `main` and `legacy-v1`.                                                                                                                   |
| `.github/dependabot.yml`             | Weekly npm (minor + patch grouped) and GitHub Actions updates, both targeting `next`.                                                                                                                            |
| `.github/CODEOWNERS`                 | `* @castiarena`                                                                                                                                                                                                  |
| `.github/pull_request_template.md`   | Summary, handoff, preview, screenshots, checklist.                                                                                                                                                               |

Build environment variables:

| Variable                         | CI (`ci.yml`)                             | Production (`deploy-pages.yml`)                     | Vercel preview                  |
| -------------------------------- | ----------------------------------------- | --------------------------------------------------- | ------------------------------- |
| `NEXT_PUBLIC_SITE_URL`           | `https://castiarena.github.io`            | `https://castiarena.github.io`                      | empty (falls back to github.io) |
| `NEXT_PUBLIC_DEPLOY_ENV`         | —                                         | `production`                                        | —                               |
| `NEXT_PUBLIC_EMAIL_API_URL`      | `https://email-api.invalid` (placeholder) | repo variable `vars.NEXT_PUBLIC_EMAIL_API_URL`      | Vercel env var (same value)     |
| `NEXT_PUBLIC_EMAIL_API_KEY`      | `pk_test_e2e` (placeholder)               | repo variable `vars.NEXT_PUBLIC_EMAIL_API_KEY`      | Vercel env var (same value)     |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile test key (placeholder)          | repo variable `vars.NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Vercel env var (same value)     |

The three contact-form values are public (they ship in browser code), so they live in repository **Variables**, not Secrets. If any is missing, the form falls back to `mailto:`. CI builds with placeholders only so the e2e tests exercise the API path; they stub Turnstile and intercept `**/api/send`. `.env.example` documents local dev. A Vercel preview only works against the real API if its origin is in the public key's `origins` in the email API's `PUBLIC_KEYS` and its hostname is in the Turnstile widget's hostnames.

### Required status checks

| Check (as GitHub displays it on a PR) | Name to select in branch protection | Required on    |
| ------------------------------------- | ----------------------------------- | -------------- |
| `ci / verify (pull_request)`          | `verify`                            | `next`, `main` |
| `ci / e2e (pull_request)`             | `e2e`                               | `next`, `main` |
| `Vercel`                              | `Vercel`                            | `next`         |

## 2. Branch model

| Branch                     | Purpose                                                  | Protected                        | Deploys to                  |
| -------------------------- | -------------------------------------------------------- | -------------------------------- | --------------------------- |
| `main`                     | Production. Holds the Vite site until cutover, then Next | PR + `verify` + `e2e` + 1 review | GitHub Pages                |
| `legacy-v1` (branch + tag) | Frozen v1 Vite site at `7707f79`, used for rollback      | read-only                        | —                           |
| `next`                     | Integration branch for all waves                         | PR + `verify` + `e2e` + `Vercel` | Vercel staging (branch URL) |
| `agent/<id>-<slug>`        | One per agent, PR into `next`                            | —                                | Vercel preview              |

Dependabot PRs also target `next`. Releases go `next → main` through a PR titled `release: vX.Y.Z`.

## 3. One-time setup checklist (human only)

Agents can't change repository, Pages or Vercel settings. Do these once.

**GitHub**

- [ ] [Settings → Branches](https://github.com/castiarena/castiarena.github.io/settings/branches): protect `main` and `next`. Require a PR, require status checks `verify` and `e2e` (both branches) plus `Vercel` (on `next`), and require 1 review on `main`. The checks only show up in the picker after `ci.yml` has run at least once.
- [ ] [Settings → Environments → `github-pages`](https://github.com/castiarena/castiarena.github.io/settings/environments): deployment branches and tags = **Selected branches** → `main` only. (The environment already exists from the legacy Pages setup.)
- [ ] [Settings → Actions → General](https://github.com/castiarena/castiarena.github.io/settings/actions): _Workflow permissions_ = **Read repository contents and packages permissions**, and untick **Allow GitHub Actions to create and approve pull requests**. On 2026-09-17 these were still `write` and allowed. The workflows declare their own `permissions:`, so they keep working.
- [ ] [Settings → Secrets and variables → Actions → Variables](https://github.com/castiarena/castiarena.github.io/settings/variables/actions): `NEXT_PUBLIC_EMAIL_API_URL` (email API base URL), `NEXT_PUBLIC_EMAIL_API_KEY` (the `pk_live_…` public key) and `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (Turnstile **site** key). Without them the contact form falls back to `mailto:`.
- [ ] **Leave [Settings → Pages](https://github.com/castiarena/castiarena.github.io/settings/pages) alone for now.** The source switches during cutover (§4).

**Vercel**

- [ ] [vercel.com/new](https://vercel.com/new) → import `castiarena/castiarena.github.io` (install the Vercel GitHub App on this repository only).
- [ ] Framework: Next.js · Root directory: `./` · Node.js: 24.x. Install and build commands come from `vercel.json`.
- [ ] Project Settings → Git → _Production Branch_ = `main`. `vercel.json` disables deployments for `main` and `legacy-v1`, so Vercel only builds PR previews and `next`.
- [ ] Project Settings → Environment Variables (Preview): `NEXT_PUBLIC_SITE_URL` empty, the three contact-form variables = same as GitHub (see the note under _Build environment variables_).
- [ ] Project Settings → Deployment Protection: keep _Vercel Authentication_ on for private previews, or turn it off to share previews publicly.
- [ ] Open a test PR into `next` and check that the Vercel bot comments a preview URL and a `Vercel` status check appears.

## 4. Cutover (Wave 4)

1. **Confirm legacy is frozen.** `git fetch origin --tags && git rev-parse legacy-v1 origin/main` must print the same SHA (`7707f79…`). If `main` moved, move the `legacy-v1` tag and branch to the new tip and update `docs/DEPLOYMENT-legacy.md`.
2. **Open the release PR** `next → main`, titled `release: v2.0.0`. Wait for `verify` and `e2e`, and do a final review on the `next` staging URL.
3. **Switch the Pages source** right before merging: [Settings → Pages](https://github.com/castiarena/castiarena.github.io/settings/pages) → _Build and deployment_ → Source: **GitHub Actions**. The legacy site keeps being served until a new deployment replaces it. Don't skip this: on `main` the v2 `docs/` folder contains Markdown, and a branch-based source would serve it.
4. **Merge** the release PR. `deploy-pages` runs (about 2–3 minutes). The `github-pages` environment shows the live URL.
5. **Verify** https://castiarena.github.io (agent 4.2 runs the post-launch checks): `/`, `/bio/`, `/projects/`, `/experiments/`, an unknown path (404 page), and `/cv/agustin-castiarena-resume.pdf`.
6. **Tag** `v2.0.0` on `main` and push the tag.

## 5. Rollback

| Situation                                        | Action                                                                                                                                                                                             | Time   |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| A bad v2 deploy (a later commit broke something) | [Actions → deploy-pages](https://github.com/castiarena/castiarena.github.io/actions/workflows/deploy-pages.yml) → _Run workflow_ → branch **`main`**, `ref` = last good SHA or tag (e.g. `v2.0.0`) | ~3 min |
| A bad commit on `main`                           | `git revert <sha>` on a branch → PR into `main` → merge → automatic deploy                                                                                                                         | ~5 min |
| v2 has to be pulled completely                   | [Settings → Pages](https://github.com/castiarena/castiarena.github.io/settings/pages) → Source: **Deploy from a branch** → branch **`legacy-v1`**, folder **`/docs`** → Save                       | ~2 min |

Notes:

- Always start _Run workflow_ from the `main` branch selector and put the old commit in `ref`. The `github-pages` environment only accepts deployments from `main`, and the workflow definition always comes from the branch you pick, while `ref` only chooses what gets built.
- `ref` must point at a v2 commit (one with `scripts/verify-export.mjs`). To go back to the Vite site, use the full rollback row instead.
- The legacy Pages source was `main` → `/docs` with build type `legacy` (recorded in `docs/DEPLOYMENT-legacy.md`). The same `/docs` build output lives on `legacy-v1`, which is why the full rollback points there.
- To return to v2 after a full rollback, switch the source back to **GitHub Actions** and re-run `deploy-pages` from `main`.

## 6. Day-to-day

- **Agent / feature work:** branch from `origin/next`, open a PR into `next`, wait for `ci / verify`, `ci / e2e` and the Vercel preview, review the preview, merge.
- **Staging:** every merge into `next` updates the Vercel branch URL for `next`.
- **Release:** PR `next → main`, merge, `deploy-pages` publishes.
- **Local gate:** `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test -- --run && pnpm build && pnpm verify:export`.
- **CI failure artifacts:** the `e2e` job uploads `playwright-report` on failure (7 days). The `verify` job uploads `out` (3 days) for the `e2e` job.

## 7. Gotchas

- **Other repos' Pages sites** are served at `castiarena.github.io/<repo-name>/`. A top-level route with the same name as a repo that has Pages enabled conflicts with it (e.g. a repo called `projects`). Agent 3.3 checks `/bio`, `/projects` and `/experiments` against the list of repos with Pages enabled.
- **`trailingSlash: true`** exports every route as `<route>/index.html`, so Pages resolves `/bio` → `/bio/` natively.
- **`.nojekyll`** is in `public/` (copied to `out/`) and also touched in `deploy-pages.yml`, so `_next/` is never filtered out. Both artifact uploads set `include-hidden-files: true`, because `upload-artifact` and `upload-pages-artifact` skip dotfiles by default.
- **`404.html`** comes from `not-found.tsx`, and Pages serves it for unknown paths. `next build` also writes `out/404/index.html` and `out/_not-found/`. They are harmless and `verify-export` ignores them.
- **No `actions/configure-pages`** with `static_site_generator: next`: it injects a `basePath` (wrong for a user site) and doesn't handle `next.config.ts`.
- **No Server Actions.** The contact form calls the email API (`castiarena/email-api`, `POST /api/send`) from the browser with a public key and a Cloudflare Turnstile token, and falls back to `mailto:` when unconfigured. The API parses strictly: send exactly `template`, `reply_to`, `data` and `captcha_token`, and only the `Authorization`, `Content-Type` and `Idempotency-Key` request headers, or it (or its CORS preflight) rejects the request.
- **`@vercel/analytics`** only works on Vercel domains. Use a script-based tool (Plausible, Umami, GoatCounter) on github.io. Out of scope for v2.0.
- **Vercel previews** send `X-Robots-Tag: noindex`, so they don't compete with production in search.
- **`deploy-pages` before cutover:** the workflow only runs on pushes to `main`, and _Run workflow_ only appears once the file is on `main`. Before the Pages source is switched to GitHub Actions, a deploy would fail at the `deploy` step. That is harmless, and the legacy site keeps serving.
- **Action versions** are pinned to majors (`checkout@v7`, `setup-node@v7`, `pnpm/action-setup@v6`, `upload-artifact@v7`, `download-artifact@v8`, `upload-pages-artifact@v5`, `deploy-pages@v5`). Dependabot proposes bumps weekly. `pnpm/action-setup` reads the pnpm version from `packageManager` in `package.json`, so don't also set `version:`.

## 8. What `verify-export` checks

Exits 1 with a readable report if any of these fail:

- `out/` contains non-empty `index.html`, `404.html`, `bio/index.html`, `experiments/index.html`, `projects/index.html` and `cv/agustin-castiarena-resume.pdf`
- `out/_next/static/` exists and is not empty
- The number of `out/projects/<slug>/index.html` folders equals the number of `slug:` entries in `src/content/projects.ts`, and each slug has its folder
- No `.html` file contains `href="/castiarena.github.io/` or `src="/castiarena.github.io/`, or any `/_next/` asset URL under a path prefix (basePath leak)
- `sitemap.xml` and `robots.txt` exist. Until `VERIFY_STRICT=1` (switched on by agent 3.1 in both workflows), their absence is only a warning.
