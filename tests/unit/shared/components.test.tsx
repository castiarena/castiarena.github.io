import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { Container, GradientText, PageHeader, SectionHeading } from '@/components/shared'

afterEach(cleanup)

describe('Container', () => {
  it('uses the container-page utility and the requested element', () => {
    render(
      <Container as="section" className="py-8">
        content
      </Container>,
    )
    const el = screen.getByText('content')
    expect(el.tagName).toBe('SECTION')
    expect(el).toHaveClass('container-page', 'py-8')
  })
})

describe('GradientText', () => {
  it('applies the signature gradient utility', () => {
    render(<GradientText>shine</GradientText>)
    expect(screen.getByText('shine')).toHaveClass('text-signature')
  })
})

describe('PageHeader', () => {
  it('renders eyebrow, a single h1 and description', () => {
    render(<PageHeader eyebrow="Section" title="Projects" description="Things I built." />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Projects')
    expect(screen.getByText('Section')).toHaveClass('font-mono', 'uppercase')
    expect(screen.getByText('Things I built.')).toHaveClass('text-muted-foreground', 'max-w-prose')
  })

  it('wraps the highlighted part of the title in GradientText', () => {
    render(<PageHeader title="Hi, I am Agustin" highlight="Agustin" />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Hi, I am Agustin')
    expect(screen.getByText('Agustin')).toHaveClass('text-signature')
  })
})

describe('SectionHeading', () => {
  it('renders an h2 with the given id and a permalink', () => {
    render(<SectionHeading id="skills" title="Skills" description="What I use." />)
    expect(screen.getByRole('heading', { level: 2, name: 'Skills' })).toHaveAttribute(
      'id',
      'skills',
    )
    expect(screen.getByRole('link', { name: 'Link to section: Skills' })).toHaveAttribute(
      'href',
      '#skills',
    )
  })

  it('derives the anchor from the title when no id is given', () => {
    render(<SectionHeading title="Key Achievements & Impact" />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveAttribute(
      'id',
      'key-achievements-impact',
    )
  })
})
