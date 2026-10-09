import type { Project } from './types'

// `exporter` and `next-eclipse` are real case studies: their copy, cover and gallery are final, and
// their images live in /images/projects/<slug>/.
// The other 3 are still placeholders derived from CV themes only (docs/plan/assets/cv-content.md).
// Rule for those: every sentence NOT taken verbatim from the CV starts with `TODO(agustin):`,
// except the titles, which the owner approved as real.
// No numbers, confidential details or links are invented; their `links` stay empty (NDA work).
// Their cover SVGs at /images/projects/<slug>.svg are created by agent 2.5.
export const projects: Project[] = [
  {
    slug: 'exporter',
    title: 'exporter Chrome extension',
    summary:
      'A Chrome extension that turns any web page, or just the elements you pick, into a clean, paginated PDF with real selectable text. It runs entirely on-device: no uploads, no account, no tracking.',
    role: 'Creator & sole developer',
    period: 'Sep 2026',
    problem:
      'Most "save as PDF" tools either upload the page to a server to convert it, or wrap a screenshot in a PDF, so the text can\'t be searched or copied. None of them let you pull out just the parts you care about, like three charts from a dashboard or a receipt without the sidebar, as a tidy document. I wanted a converter that makes real documents and never lets the page leave the browser.',
    approach: [
      "Drove Chrome's own print engine through the DevTools protocol (Page.printToPDF), attaching the debugger for exactly one call and detaching it in a finally block, so the output keeps selectable text, real page breaks and vector graphics.",
      'Exported picked elements by narrowing the input instead of cropping the output: one temporary stylesheet hides everything except the picks and forces a page break after each, so a single print call gives one page per element.',
      'Tracked down the layouts that break pagination (min-height wrappers, aspect-ratio boxes, multi-column and flex ancestors) and covered them with Playwright tests against a real Chromium.',
      "Added an html2canvas + jsPDF fallback behind the same interface for tabs where the debugger can't attach, with the popup explaining the trade-off.",
      'Made privacy verifiable: no content scripts, activeTab instead of host permissions, sender checks on every message, sanitised filenames, and a build step that fails if the shipped bundle contains any network or remote-code path.',
    ],
    outcomes: [
      '100% on-device: zero network requests, no account and no analytics, checked at build time',
      'Pick up to 30 elements per export, each on its own page, in document order',
      'End-to-end tests assert that n picked elements produce exactly n PDF pages across four layout hazard profiles',
      'Published on the Chrome Web Store with a single-purpose listing and a written justification for every permission',
    ],
    stack: [
      'TypeScript',
      'Manifest V3',
      'Chrome DevTools Protocol',
      'Vite',
      'Vitest',
      'Playwright',
      'jsPDF',
      'html2canvas',
    ],
    cover: {
      src: '/images/projects/exporter/cover.webp',
      alt: 'A browser showing a report with a chart and a table picked for export, next to the two-page PDF exporter made from them: the chart on page one and the table on page two.',
    },
    gallery: [
      {
        src: '/images/projects/exporter/01-popup.webp',
        alt: 'The exporter popup over a demo garden report, with "Export page to PDF", "Select elements", paper size and background options.',
      },
      {
        src: '/images/projects/exporter/02-picker.webp',
        alt: 'Element picker: a bar chart and a table picked on the page, labelled First and Second, with a toolbar that reads "each becomes a page".',
      },
      {
        src: '/images/projects/exporter/03-saved.webp',
        alt: "The popup after an export, confirming the PDF was saved and noting that it was rendered with Chrome's print engine, so the text stays selectable.",
      },
      {
        src: '/images/projects/exporter/04-options.webp',
        alt: 'The exporter defaults page with paper size, background and print-stylesheet settings, and a privacy note saying it makes no network requests.',
      },
    ],
    links: {
      live: 'https://chromewebstore.google.com/detail/kjhjfmochmbifcddibchbmgadejpmbhh',
      liveLabel: 'Add to Chrome',
      website: 'https://castiarena.github.io/exporter/',
      repo: 'https://github.com/castiarena/exporter-source',
    },
    featured: true,
    order: 1,
  },
  {
    slug: 'next-eclipse',
    title: 'Next eclipse',
    summary:
      'A live countdown to the next solar or lunar eclipse, with a 3D globe showing where on Earth you can see it. Built on NASA eclipse catalogs, precomputed offline, and hosted as a static site.',
    role: 'Creator & sole developer',
    period: 'Oct 2026',
    problem:
      'Eclipse dates are easy to find, but what you actually want to know is whether you can see this one from where you are. Most sites bury that in tables of coordinates or a static map. I wanted a single screen that counts down to the next eclipse and shows, on a globe you can spin, who gets the show, with no backend to run.',
    approach: [
      'Parsed the NASA GSFC eclipse catalogs (Espenak & Meeus) with a Node script into static JSON: a 46-eclipse index plus one geometry file per eclipse, loaded only when that eclipse is shown. A repository interface keeps the UI independent of where the data lives.',
      'Kept astronomy out of the browser: visibility geometry is precomputed offline, so the client only draws it. Solar eclipses render the central path with its limits and centre line; lunar ones a dot grid coloured by whether the Moon is up for the whole eclipse or only part of it.',
      'Built the interactive globe with three.js through react-globe.gl: drag to rotate, scroll to zoom, camera turns to face the eclipse. Paths that cross the antimeridian are split so they never draw a line across the planet, and the camera centre averages unit vectors.',
      'Designed a full-bleed dark layout: the globe fills the desktop screen behind the content, and on mobile the details sit in a glass bottom sheet over it. The globe chunk is lazy-loaded, with a fallback message when WebGL is unavailable.',
      'Made location opt-in: "Check my location" says whether you are inside the zone, entirely in the browser, and the selected type lives in the URL (?type=lunar) so views are shareable.',
    ],
    outcomes: [
      'No server and no astronomy code in the client: 46 eclipses over the next 10 years served as static JSON',
      'Countdown, data integrity, geometry, visibility lookups and date formatting covered by 46 Vitest tests',
      'Location check runs on-device; nothing is sent anywhere',
      'Deployed to GitHub Pages by a workflow that runs the tests before every deploy',
      'The source code is private, so this case study describes the build instead of linking to it',
    ],
    stack: [
      'React',
      'TypeScript',
      'Vite',
      'Chakra UI',
      'three.js',
      'react-globe.gl',
      'Vitest',
      'GitHub Actions',
      'NASA open data',
    ],
    cover: {
      src: '/images/projects/next-eclipse/cover.webp',
      alt: 'The Next eclipse site on desktop: a countdown to the 20 February 2027 penumbral lunar eclipse on the left and a 3D globe on the right covered in purple dots over Europe and Africa.',
    },
    gallery: [
      {
        src: '/images/projects/next-eclipse/01-lunar.webp',
        alt: 'Lunar view: countdown, magnitude and Saros series beside a globe whose dot grid shows where the Moon is up for the whole eclipse or only part of it.',
      },
      {
        src: '/images/projects/next-eclipse/02-solar.webp',
        alt: 'Solar view: countdown to the 6 February 2027 annular eclipse and a gold path of annularity crossing South America on the globe.',
      },
      {
        src: '/images/projects/next-eclipse/03-mobile.webp',
        alt: 'Mobile layout: the countdown above the globe, with a glass bottom sheet over it showing local and UTC time, magnitude and Saros series.',
      },
    ],
    // Source is private, so there is no `repo` link. Add `live`
    // (https://castiarena.github.io/eclipses/) once the eclipses repo's Pages deploy passes.
    links: {},
    featured: true,
    order: 2,
  },
  {
    slug: 'recording-studio-architecture',
    title: 'Recording Studio architecture',
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
    order: 3,
  },
  {
    slug: 'vr-ar-healthcare-platform',
    title: 'VR/AR healthcare platform',
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
    order: 4,
  },
  {
    slug: 'micro-frontend-migration',
    title: 'Micro frontend migration',
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
    order: 5,
  },
]
