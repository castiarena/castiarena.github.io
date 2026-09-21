import { cn } from '@/lib/utils'

export interface SectionHeadingProps {
  title: string
  description?: string
  /** Anchor id for the `h2`. Defaults to a slug of `title`. */
  id?: string
  className?: string
}

export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Section `h2` with a stable anchor and a `#` permalink revealed on hover / focus. */
export function SectionHeading({ title, description, id, className }: SectionHeadingProps) {
  const anchor = id ?? slugify(title)

  return (
    <div className={cn('group/heading flex flex-col gap-2', className)}>
      <div className="flex items-baseline gap-2">
        <h2 id={anchor} className="scroll-mt-24 text-h2 font-semibold text-balance">
          {title}
        </h2>
        <a
          href={`#${anchor}`}
          className="rounded-sm font-mono text-h2 text-muted-foreground opacity-0 transition-opacity group-hover/heading:opacity-100 hover:text-brand focus-visible:opacity-100"
        >
          <span aria-hidden="true">#</span>
          <span className="sr-only">Link to section: {title}</span>
        </a>
      </div>
      {description ? (
        <p className="max-w-prose text-pretty text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}
