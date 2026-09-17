# Legacy deployment (v1, Vite site) — recorded for rollback

Recorded by agent 0.1 on 2026-09-17, before any v2 change reached `main`.

| Item                            | Value                                                                 |
| ------------------------------- | --------------------------------------------------------------------- |
| Repository                      | `castiarena/castiarena.github.io`                                     |
| Default branch                  | `main`                                                                |
| Last `main` commit (legacy tip) | `7707f79112bf89535ea910b5c9c3d3ced417a7ac` ("build with adjustments") |
| Frozen copies                   | tag `legacy-v1` and branch `legacy-v1`, both at `7707f79`             |
| Pages build type                | `legacy` (Deploy from a branch)                                       |
| Pages source branch             | `main`                                                                |
| Pages source folder             | `/docs` (the Vite build output was committed to `docs/`)              |
| Pages URL                       | https://castiarena.github.io/                                         |
| Custom domain (CNAME)           | none                                                                  |
| HTTPS enforced                  | yes                                                                   |

Other refs present on origin at the time: `gh-pages` (`941a593`), unused by the current Pages source.

Source: `gh api repos/castiarena/castiarena.github.io/pages`

```json
{
  "status": "built",
  "cname": null,
  "custom_404": false,
  "html_url": "https://castiarena.github.io/",
  "build_type": "legacy",
  "source": { "branch": "main", "path": "/docs" },
  "public": true,
  "https_enforced": true
}
```

## Important for cutover (Wave 4)

- Today Pages serves `main:/docs`. The v2 branch removes the legacy `docs/` build output and reuses `docs/` for plan and handoff Markdown. **Switch Pages to "GitHub Actions" before merging `next` into `main`** (see `docs/plan/03-deployment-flow.md` §6), otherwise Pages would try to serve the Markdown in `docs/`.

## Full rollback to v1

Settings → Pages → Build and deployment → Source: **Deploy from a branch** → branch **`legacy-v1`**, folder **`/docs`** → Save. Takes about 2 minutes.
