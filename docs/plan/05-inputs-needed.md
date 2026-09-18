# 05 — Inputs Needed From You

Agents use placeholders for anything below and list it as **Needs human input** in their handoffs. The sooner you provide these, the fewer placeholders reach staging.

## Before Wave 0 (blocking)

- [ ] **Vercel account** connected to GitHub, with the Vercel GitHub App installed on `castiarena/castiarena.github.io` (03 §5)
- [ ] **Branch protection** on `main` (03 §5)
- [ ] Note the **current Pages source** (Settings → Pages: branch + folder) so the rollback is exact

## Before Wave 1 (for 1.2 Content data)

### Experiments
One row each. Screenshots are optional (1200×750 PNG/WebP).

| Title | Live URL | Source URL | One-liner (≤140 chars) | Tags | Year |
|---|---|---|---|---|---|
| | | | | | |

> Tip: any of your repos with GitHub Pages enabled (`castiarena.github.io/<repo>/`) is a natural experiment. Agent 3.3 will list them too.

### Projects (bigger work)
2–6 projects. For each one:

- **Title** and **slug**
- **Summary** (≤200 chars)
- **Your role** and **period**
- **Problem** (2–3 sentences)
- **Approach** (3–5 bullets)
- **Outcomes** (2–4 bullets, with numbers where you can)
- **Stack**
- **Links**: live / repo / case study (whatever can be public)
- **Cover image** (1600×1000) plus optional gallery images
- **Featured on home?** (pick 3)

> If some work is under NDA (Riverside, Realworld One, Westwing, Mercado Libre), describe it as a case study without internal details or screenshots, and leave the links empty.

## Nice to have

- [ ] Short **tagline** for the hero. Default: *"I build fast, maintainable web products and the teams that ship them."*
- [ ] **GitHub / X** handles to show in the footer (LinkedIn and GitHub are assumed)
- [ ] A **form endpoint** (Formspree or Web3Forms free tier) → `NEXT_PUBLIC_FORM_ENDPOINT`. Without one, contact falls back to `mailto:`
- [ ] Confirm that **location** can be shown as "Trevelin, Patagonia, Argentina"
- [ ] Confirm that the **phone number stays off** the public site (the plan assumes yes)
- [ ] Confirm **current status** (your CV lists Riverside ending 07/2026). Should the hero say *"Open to new opportunities"*?
