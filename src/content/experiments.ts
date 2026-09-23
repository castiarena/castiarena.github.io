import type { Experiment } from './types'

// Only real experiments live here; add new ones as they ship (docs/plan/05-inputs-needed.md).
export const experiments: Experiment[] = [
  {
    slug: 'portfolio-v1',
    title: 'Portfolio v1',
    description: 'Previous portfolio built with Vite and TypeScript.',
    href: 'https://github.com/castiarena/castiarena.github.io/tree/legacy-v1',
    tags: ['Vite', 'TypeScript'],
    // Year of the legacy site's last commit (7707f79 on the `legacy-v1` tag, committed in March 2024).
    year: 2024,
  },
]
