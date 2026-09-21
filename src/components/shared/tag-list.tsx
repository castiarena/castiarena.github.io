import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface TagListProps {
  tags: string[]
  className?: string
  /** Accessible name for the list. Defaults to "Tags". */
  label?: string
  /** Cap the number of visible tags, showing a `+N` overflow badge for the rest. */
  max?: number
}

/** Row of secondary badges (mono) inside a labelled list. Renders nothing when `tags` is empty. */
export function TagList({ tags, className, label = 'Tags', max }: TagListProps) {
  if (tags.length === 0) return null

  const visible = typeof max === 'number' ? tags.slice(0, Math.max(0, max)) : tags
  const overflow = tags.length - visible.length

  return (
    <ul aria-label={label} className={cn('flex flex-wrap gap-2', className)}>
      {visible.map((tag) => (
        <li key={tag}>
          <Badge variant="secondary">{tag}</Badge>
        </li>
      ))}
      {overflow > 0 ? (
        <li>
          <Badge variant="secondary">+{overflow}</Badge>
        </li>
      ) : null}
    </ul>
  )
}
