import { CountUp } from '@/components/motion'
import { cn } from '@/lib/utils'

export type StatTileAccent = 'brand' | 'brand-2' | 'brand-3' | 'brand-4'

const ACCENT_CLASS: Record<StatTileAccent, string> = {
  brand: 'text-brand',
  'brand-2': 'text-brand-2',
  'brand-3': 'text-brand-3',
  // --brand-4 lands with F1's token PR; fall back to --brand-3 until it's defined.
  'brand-4': 'text-[var(--brand-4,var(--brand-3))]',
}

export interface StatTileProps {
  value: number
  unit?: string
  label: string
  description?: string
  accent: StatTileAccent
  /** `card` (bordered, 02 Bio / project Outcomes) or `bare` (Home strip). Defaults to `bare`. */
  variant?: 'card' | 'bare'
  className?: string
}

/** A single metric: a `CountUp` value in the accent colour, a label, and an optional description. */
export function StatTile({
  value,
  unit,
  label,
  description,
  accent,
  variant = 'bare',
  className,
}: StatTileProps) {
  return (
    <div
      data-slot="stat-tile"
      data-variant={variant}
      className={cn(
        'flex flex-col gap-1',
        variant === 'card' && 'rounded-lg border border-border bg-card p-5',
        className,
      )}
    >
      <p className={cn('text-h1 font-bold', ACCENT_CLASS[accent])}>
        <CountUp value={value} suffix={unit} />
      </p>
      <p className="text-sm font-semibold text-foreground">{label}</p>
      {description ? (
        <p className="max-w-[34ch] text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}
