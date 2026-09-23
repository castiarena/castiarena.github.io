'use client'

import { ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'

export interface FilterChipProps {
  /** Toggle value — a tag name, or `ALL_FILTER_VALUE` for the leading "All" chip. */
  value: string
  label: string
  /** Number of experiments carrying this tag. Omitted for "All". */
  count?: number
  className?: string
}

/**
 * Pill filter chip (`02-component-specs.md` → FilterChip), built on `ToggleGroupItem` so the
 * group gives us roving arrow-key focus and a real `aria-pressed` state for free.
 *
 * Two things here are less obvious than they look:
 *
 * - **Every pressed/hover style is spelled out for both `aria-pressed` and `data-[state=on]`.**
 *   Radix sets both attributes on a `type="multiple"` item, and `toggleVariants` ships a
 *   `bg-muted` for each. tailwind-merge only drops a base utility when the later one carries the
 *   *same* modifier, so overriding just one of the two would leave the other `bg-muted` rule
 *   live and let stylesheet order decide the colour. The `hover:` compounds exist for the same
 *   reason: a bare `hover:bg-muted` and `aria-pressed:bg-brand/15` have equal specificity, so a
 *   hovered selected chip needs a two-selector rule to win deterministically.
 * - **Selected text is `--brand-ink`, not `--brand`.** The spec says brand text on a 15% brand
 *   fill, but that pair only reaches 3.59:1 in light and 4.20:1 in dark — the same failure the
 *   brand `Badge` had (CCR-U3-2). `--brand-ink` is the accessible ink for this exact fill; see
 *   `tests/unit/shared/contrast.test.ts`.
 */
export function FilterChip({ value, label, count, className }: FilterChipProps) {
  return (
    <ToggleGroupItem
      value={value}
      aria-label={count === undefined ? label : `${label} (${count})`}
      className={cn(
        'relative h-8 gap-1.5 rounded-full border border-border px-3 font-mono text-xs text-muted-foreground',
        // The pill stays 32px tall per the spec; the ::before box extends the pointer target to
        // 44px without changing the painted size or the row's layout.
        'before:absolute before:inset-x-0 before:-inset-y-1.5 before:content-[""]',
        'aria-pressed:border-brand/35 aria-pressed:bg-brand/15 aria-pressed:text-brand-ink',
        'data-[state=on]:border-brand/35 data-[state=on]:bg-brand/15 data-[state=on]:text-brand-ink',
        'aria-pressed:hover:bg-brand/20 aria-pressed:hover:text-brand-ink',
        className,
      )}
    >
      {label}
      {count === undefined ? null : (
        <span aria-hidden="true" className="text-[90%] text-muted-foreground">
          {count}
        </span>
      )}
    </ToggleGroupItem>
  )
}
