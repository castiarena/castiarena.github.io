import type { Experience } from './types'

// Source: docs/plan/assets/cv-content.md (the CV plus the owner's LinkedIn export). `intro` and
// `highlights` are verbatim (enforced by tests/unit/content/cv-verbatim.test.ts). Newest first.
// `stack` is only set where the source names it. Roles with no text have an empty `intro` and
// `highlights` (renderers skip both).
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
    id: 'axa',
    company: 'AXA',
    title: 'Fullstack Engineer',
    start: '2018-12',
    end: '2019-12',
    intro: '',
    highlights: [],
    stack: ['React', 'Test-Driven Development'],
  },
  {
    id: 'mercado-libre',
    company: 'Mercado Libre',
    companyUrl: 'https://www.mercadolibre.com',
    title: 'Senior Frontend Engineer',
    start: '2015-11',
    end: '2018-10',
    intro:
      "Worked on one of Latin America's largest e-commerce platforms, delivering product improvements for millions of users.",
    highlights: [
      'Built and maintained purchase flow functionality across the platform',
      'Rolled out purchase flow initiatives across multiple Latin American countries',
      'Improved automation processes and engineering quality',
      'Strengthened testing practices within the engineering team',
      'Delivered scalable solutions in collaboration with multiple product teams',
    ],
  },
  {
    id: 'basso-brovelli',
    company: 'Basso Brovelli',
    title: 'Senior Frontend Developer',
    start: '2014-08',
    end: '2015-12',
    intro: '',
    highlights: [],
    stack: ['React', 'Test-Driven Development'],
  },
  {
    id: 'cobranzas',
    company: 'Cobranzas',
    title: 'Junior Frontend Developer',
    start: '2014-05',
    end: '2014-08',
    intro: '',
    highlights: [
      'Improved and maintained a legacy user interface from 1999, transitioning to modern JavaScript frameworks.',
      "Integrated Bootstrap to enhance the UI's responsiveness and user experience.",
      'Contributed to asynchronous operations by adding JSON support to existing XML API responses on ASP.NET servers.',
    ],
    stack: ['jQuery', 'SQL'],
  },
  {
    id: 'ilcacto',
    company: 'Ilcacto',
    title: 'Freelance Developer',
    start: '2012-08',
    end: '2012-12',
    intro: '',
    highlights: [],
  },
  {
    id: 'octavo-circulo',
    company: 'Octavo Círculo',
    title: 'Freelance Developer',
    start: '2012-03',
    end: '2012-11',
    intro:
      'Information architecture, web layout, SEO, site traffic monitoring and data retrieval from MySQL databases.',
    highlights: [],
    stack: ['MySQL'],
  },
]
