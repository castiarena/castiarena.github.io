import type { Experiment } from './types'

// The owner has not provided the experiments list yet (docs/plan/05-inputs-needed.md).
// Every `TODO(agustin)` entry is a placeholder to replace; `portfolio-v1` is real.
export const experiments: Experiment[] = [
  {
    slug: 'todo-experiment-1',
    title: 'TODO(agustin): Experiment title',
    description: 'TODO(agustin): One-line description of the experiment (max 140 characters).',
    href: 'https://castiarena.github.io/',
    tags: ['TODO'],
    year: 2026,
  },
  {
    slug: 'todo-experiment-2',
    title: 'TODO(agustin): Experiment title',
    description: 'TODO(agustin): One-line description of the experiment (max 140 characters).',
    href: 'https://castiarena.github.io/',
    tags: ['TODO'],
    year: 2026,
  },
  {
    slug: 'todo-experiment-3',
    title: 'TODO(agustin): Experiment title',
    description: 'TODO(agustin): One-line description of the experiment (max 140 characters).',
    href: 'https://castiarena.github.io/',
    tags: ['TODO'],
    year: 2026,
  },
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
