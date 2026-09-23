import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// `text-display`, `text-h1`, `text-h2` and `text-h3` are our own font-size utilities
// (`@utility` blocks in globals.css, values in design-build/01-design-tokens.md §3).
// tailwind-merge only knows Tailwind's built-in scale, so it filed them under text-color and
// dropped them whenever a colour landed in the same `cn()` call: `cn('text-h1', 'text-brand')`
// resolved to `text-brand` alone and the heading silently fell back to body size. Registering
// them in the font-size group is what makes the two kinds of `text-*` stop competing.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['display', 'h1', 'h2', 'h3'] }],
    },
  },
})

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
