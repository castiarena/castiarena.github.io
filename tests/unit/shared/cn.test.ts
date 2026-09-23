import { describe, expect, it } from 'vitest'

import { cn } from '@/lib/utils'

// Regression guard for a silent failure caught at the UI wave gate: tailwind-merge does not know
// our own `text-display` / `text-h1` / `text-h2` / `text-h3` font-size utilities, so it treated
// them as text *colours* and dropped them from any `cn()` call that also carried a colour. Every
// StatTile number and every tinted heading rendered at body size, with nothing failing.
describe('cn', () => {
  it.each(['text-display', 'text-h1', 'text-h2', 'text-h3'])(
    'keeps %s when a text colour is merged in',
    (size) => {
      const result = cn(size, 'text-muted-foreground')
      expect(result).toContain(size)
      expect(result).toContain('text-muted-foreground')
    },
  )

  it('keeps the type utility alongside a conditional accent colour, as StatTile uses it', () => {
    expect(cn('text-h1 font-bold', 'text-brand')).toBe('text-h1 font-bold text-brand')
  })

  it('still lets a later type utility win over an earlier one', () => {
    expect(cn('text-h1', 'text-h2')).toBe('text-h2')
  })

  it('still lets a later Tailwind size win over one of ours, and the reverse', () => {
    expect(cn('text-h1', 'text-sm')).toBe('text-sm')
    expect(cn('text-sm', 'text-h1')).toBe('text-h1')
  })

  it('still collapses conflicting colours', () => {
    expect(cn('text-brand', 'text-foreground')).toBe('text-foreground')
  })
})
