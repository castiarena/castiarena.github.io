export interface SectionHeadingProps {
  title: string
  description?: string
  id?: string
}

// STUB — implemented by agent 1.1
export function SectionHeading({ title, description, id }: SectionHeadingProps) {
  return (
    <>
      <h2 id={id}>{title}</h2>
      {description ? <p>{description}</p> : null}
    </>
  )
}
