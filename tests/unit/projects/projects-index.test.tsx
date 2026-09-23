import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { ProjectsIndex } from '@/components/projects'

import { makeProject } from './fixtures'

afterEach(cleanup)

describe('ProjectsIndex', () => {
  it('renders rows sorted by `order`, regardless of input array order', () => {
    const projects = [
      makeProject({ slug: 'third', title: 'Third project', order: 3 }),
      makeProject({ slug: 'first', title: 'First project', order: 1 }),
      makeProject({ slug: 'second', title: 'Second project', order: 2 }),
    ]
    render(<ProjectsIndex projects={projects} />)

    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    expect(headings).toEqual(['First project', 'Second project', 'Third project'])
  })

  it('keeps DOM order text-before-cover for every row (visual swap is CSS-only)', () => {
    const projects = [
      makeProject({ slug: 'a', title: 'Row A', order: 1 }),
      makeProject({ slug: 'b', title: 'Row B', order: 2 }),
      makeProject({ slug: 'c', title: 'Row C', order: 3 }),
    ]
    const { container } = render(<ProjectsIndex projects={projects} />)
    // Only the top-level rows — `TagList` also renders `<li>`s, nested deeper inside each row.
    const rows = container.querySelector('ol')?.children ?? []

    for (const row of rows) {
      const heading = row.querySelector('h2')
      const image = row.querySelector('img')
      expect(heading).not.toBeNull()
      expect(image).not.toBeNull()
      // compareDocumentPosition: heading precedes image in the DOM.
      const position = heading!.compareDocumentPosition(image!)
      expect(Boolean(position & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true)
    }
  })

  it('numbers rows 01, 02, 03… in display order', () => {
    const projects = [
      makeProject({ slug: 'a', title: 'Row A', order: 1 }),
      makeProject({ slug: 'b', title: 'Row B', order: 2 }),
    ]
    render(<ProjectsIndex projects={projects} />)
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('02')).toBeInTheDocument()
  })
})
