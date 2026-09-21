import type { Experience } from './types'

// Source: docs/plan/assets/cv-content.md. `intro` and `highlights` are verbatim (enforced by
// tests/unit/content/cv-verbatim.test.ts). Newest first. `stack` is only set where the CV text names it.
// The CV has no intro for Mercado Libre, so its `intro` is an empty string (renderers should skip it).
// The 10/2018 – 01/2020 gap is not on the CV and is intentionally not represented.
export const experiences: Experience[] = [
  {
    id: 'riverside',
    company: 'Riverside.fm',
    companyUrl: 'https://riverside.com',
    title: 'Senior Fullstack Engineer',
    start: '2023-02',
    end: '2026-07',
    intro:
      "Led technical initiatives within the Recording Studio, the company's core product area, focusing on scalability, performance, and long-term maintainability.",
    highlights: [
      'Improved the Recording Studio platform architecture to better support scalability and long-term maintainability',
      'Decomposed core business logic into GraphQL-powered microservices, enabling a more modular platform architecture',
      'Reduced frontend complexity through large-scale technical refactoring that improved maintainability',
      'Introduced AI-assisted engineering workflows and code review automation to streamline development practices',
      "Delivered features across engineering teams for one of the company's most business-critical products",
    ],
    stack: ['GraphQL', 'Microservices'],
  },
  {
    id: 'realworld-one',
    company: 'Realworld One',
    companyUrl: 'https://realworld-one.com',
    title: 'Frontend Team Lead',
    start: '2021-02',
    end: '2023-01',
    intro:
      'Started as a Frontend Engineer and progressed into a Team Lead role responsible for both technical delivery and team management.',
    highlights: [
      'Built and evolved a client-facing VR/AR healthcare platform used to deliver product improvements',
      'Improved delivery planning and team coordination across engineering workstreams',
      'Expanded the team by contributing to hiring and recruitment efforts',
      'Strengthened team growth through mentoring and resource planning',
      'Shipped product improvements in close partnership with stakeholders',
    ],
  },
  {
    id: 'westwing',
    company: 'Westwing Home & Living',
    companyUrl: 'https://www.westwing.com',
    title: 'Senior Frontend Engineer',
    start: '2020-01',
    end: '2021-02',
    intro: "Played a key role in one of the company's largest frontend modernization initiatives.",
    highlights: [
      'Advanced the platform migration toward a decentralized micro frontend architecture',
      'Built and maintained a shared UI kit that improved consistency across frontend teams',
      'Migrated core checkout and payments functionality to support the broader modernization effort',
    ],
    stack: ['Micro frontends'],
  },
  {
    id: 'mercado-libre',
    company: 'Mercado Libre',
    companyUrl: 'https://www.mercadolibre.com',
    title: 'Senior Frontend Engineer',
    start: '2015-11',
    end: '2018-10',
    intro: '',
    highlights: [
      'Built and maintained purchase flow functionality across the platform',
      'Rolled out purchase flow initiatives across multiple Latin American countries',
      'Improved automation processes and engineering quality',
      'Strengthened testing practices within the engineering team',
      'Delivered scalable solutions in collaboration with multiple product teams',
    ],
  },
]
