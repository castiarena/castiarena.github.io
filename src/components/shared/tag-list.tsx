export interface TagListProps {
  tags: string[]
  className?: string
}

// STUB — implemented by agent 1.1
export function TagList({ tags, className }: TagListProps) {
  return (
    <ul className={className}>
      {tags.map((tag) => (
        <li key={tag}>{tag}</li>
      ))}
    </ul>
  )
}
