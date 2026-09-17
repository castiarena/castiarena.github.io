export interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
}

// STUB — implemented by agent 1.1
export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header>
      {eyebrow ? <p>{eyebrow}</p> : null}
      <h1>{title}</h1>
      {description ? <p>{description}</p> : null}
    </header>
  )
}
