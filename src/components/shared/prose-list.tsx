import { cn } from '@/lib/utils'

export interface ProseListProps {
  items: string[]
  className?: string
}

/** Bulleted list with the hollow-circle marker used on Bio (highlights) and project pages (approach/outcomes). */
export function ProseList({ items, className }: ProseListProps) {
  if (items.length === 0) return null

  return (
    <ul className={cn('flex flex-col gap-2', className)}>
      {items.map((item, index) => (
        <li key={`${index}-${item}`} className="flex items-start gap-2 text-[15px] text-foreground">
          <span
            aria-hidden="true"
            className="mt-[9px] size-1 shrink-0 rounded-full border border-muted-foreground"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}
