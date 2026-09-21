import { cn } from '@/lib/utils'

/** The brand ramp (01-design-tokens.md §1) that every cover gradient draws its two stops from. */
const BRAND_RAMP = ['--brand', '--brand-2', '--brand-3', '--brand-4'] as const

/** FNV-1a: fast, pure, and identical on server and client for the same input string. */
function hashSeed(seed: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

export interface CoverGradientStops {
  from: (typeof BRAND_RAMP)[number]
  to: (typeof BRAND_RAMP)[number]
  /** Deterministic hue-rotate, kept within ±20deg so the result stays inside the brand range. */
  hueRotate: number
}

/** Pure hash → two ramp stops + a hue-rotate offset. Reused by the SVG placeholder generator. */
export function getCoverGradientStops(seed: string): CoverGradientStops {
  const hash = hashSeed(seed)
  const fromIndex = hash % BRAND_RAMP.length
  const offset = 1 + (Math.floor(hash / BRAND_RAMP.length) % (BRAND_RAMP.length - 1))
  const toIndex = (fromIndex + offset) % BRAND_RAMP.length
  const hueRotate = (hash % 41) - 20

  return { from: BRAND_RAMP[fromIndex]!, to: BRAND_RAMP[toIndex]!, hueRotate }
}

/**
 * `--brand-4` lands with F1's token PR, in parallel with this component. Until that merges, fall
 * back to `--brand-3` so the gradient stays valid instead of the whole `background-image` breaking
 * on an undefined custom property.
 */
function cssVar(token: (typeof BRAND_RAMP)[number]): string {
  return token === '--brand-4' ? 'var(--brand-4, var(--brand-3))' : `var(${token})`
}

function getMonogram(source: string): string {
  const words = source.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase()
  return (words[0]!.charAt(0) + words[1]!.charAt(0)).toUpperCase()
}

export interface CoverGradientProps {
  /** Anything stable per item — a slug is ideal. Same seed always renders the same cover. */
  seed: string
  /** Used for the monogram text (when `monogram` is set) and as an sr-only caption. */
  label?: string
  monogram?: boolean
  className?: string
}

/**
 * Deterministic 135° gradient cover: two stops picked from the brand ramp by hashing `seed`,
 * with a bottom scrim so an overlaid caption stays legible. Used by ProjectCard, ExperimentCard
 * and the SVG placeholder generator — never randomised, so it matches between SSR and the browser.
 */
export function CoverGradient({ seed, label, monogram = false, className }: CoverGradientProps) {
  const { from, to, hueRotate } = getCoverGradientStops(seed)
  const initials = monogram ? getMonogram(label ?? seed) : null

  return (
    <div
      role="img"
      aria-label={label ?? undefined}
      aria-hidden={label ? undefined : true}
      className={cn('relative flex size-full items-end overflow-hidden', className)}
      style={{
        backgroundImage: `linear-gradient(135deg, ${cssVar(from)}, ${cssVar(to)})`,
        filter: `hue-rotate(${hueRotate}deg)`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0_0_0_/_0.55)] to-transparent" />
      {initials ? (
        <span className="relative z-10 p-4 text-[28px] font-semibold text-white/60">
          {initials}
        </span>
      ) : null}
    </div>
  )
}
