import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface TagListProps {
  tags: string[]
  className?: string
  /** Accessible name for the list. Defaults to "Tags". */
  label?: string
}

/** Row of secondary badges (mono) inside a labelled list. Renders nothing when `tags` is empty. */
export function TagList({ tags, className, label = 'Tags' }: TagListProps) {
  if (tags.length === 0) return null

  return (
    <ul aria-label={label} className={cn('flex flex-wrap gap-1.5', className)}>
      {tags.map((tag) => (
        <li key={tag}>
          <Badge variant="secondary" className="font-mono font-normal">
            {tag}
          </Badge>
        </li>
      ))}
    </ul>
  )
}
