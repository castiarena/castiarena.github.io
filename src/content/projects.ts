import type { Project } from './types'

// The owner has not provided project case studies yet (docs/plan/05-inputs-needed.md).
// These 3 placeholders are derived from CV themes only (docs/plan/assets/cv-content.md).
// Rule: every sentence NOT taken verbatim from the CV starts with `TODO(agustin):`.
// No numbers, confidential details or links are invented; `links` stays empty (NDA work).
// Cover SVGs at /images/projects/<slug>.svg are created by agent 2.5.
export const projects: Project[] = [
  {
    slug: 'recording-studio-architecture',
    title: 'TODO(agustin): Recording Studio architecture',
    summary:
      'Decomposed core business logic into GraphQL-powered microservices, enabling a more modular platform architecture',
    role: 'Senior Fullstack Engineer',
    period: 'Feb 2023 — Jul 2026',
    problem: 'TODO(agustin): Describe the problem in 2–3 sentences, without confidential details.',
    approach: [
      'Improved the Recording Studio platform architecture to better support scalability and long-term maintainability',
      'Decomposed core business logic into GraphQL-powered microservices, enabling a more modular platform architecture',
      'Reduced frontend complexity through large-scale technical refactoring that improved maintainability',
      'TODO(agustin): Add or refine approach bullets (3–5 in total).',
    ],
    outcomes: ['TODO(agustin): Add 2–4 outcomes, with numbers you can share publicly.'],
    stack: ['GraphQL', 'Microservices'],
    cover: {
      src: '/images/projects/recording-studio-architecture.svg',
      alt: 'TODO(agustin): Describe the cover image for the Recording Studio architecture case study.',
    },
    links: {},
    featured: true,
    order: 1,
  },
  {
    slug: 'vr-ar-healthcare-platform',
    title: 'TODO(agustin): VR/AR healthcare platform',
    summary:
      'Built and evolved a client-facing VR/AR healthcare platform used to deliver product improvements',
    role: 'Frontend Team Lead',
    period: 'Feb 2021 — Jan 2023',
    problem: 'TODO(agustin): Describe the problem in 2–3 sentences, without confidential details.',
    approach: [
      'Improved delivery planning and team coordination across engineering workstreams',
      'Expanded the team by contributing to hiring and recruitment efforts',
      'Strengthened team growth through mentoring and resource planning',
      'TODO(agustin): Add or refine approach bullets (3–5 in total).',
    ],
    outcomes: [
      'Shipped product improvements in close partnership with stakeholders',
      'TODO(agustin): Add 1–3 more outcomes, with numbers you can share publicly.',
    ],
    stack: ['TODO(agustin): Stack'],
    cover: {
      src: '/images/projects/vr-ar-healthcare-platform.svg',
      alt: 'TODO(agustin): Describe the cover image for the VR/AR healthcare platform case study.',
    },
    links: {},
    featured: true,
    order: 2,
  },
  {
    slug: 'micro-frontend-migration',
    title: 'TODO(agustin): Micro frontend migration',
    summary:
      "Played a key role in one of the company's largest frontend modernization initiatives.",
    role: 'Senior Frontend Engineer',
    period: 'Jan 2020 — Feb 2021',
    problem: 'TODO(agustin): Describe the problem in 2–3 sentences, without confidential details.',
    approach: [
      'Advanced the platform migration toward a decentralized micro frontend architecture',
      'Built and maintained a shared UI kit that improved consistency across frontend teams',
      'Migrated core checkout and payments functionality to support the broader modernization effort',
      'TODO(agustin): Add or refine approach bullets (3–5 in total).',
    ],
    outcomes: ['TODO(agustin): Add 2–4 outcomes, with numbers you can share publicly.'],
    stack: ['Micro frontends'],
    cover: {
      src: '/images/projects/micro-frontend-migration.svg',
      alt: 'TODO(agustin): Describe the cover image for the micro frontend migration case study.',
    },
    links: {},
    featured: true,
    order: 3,
  },
]
