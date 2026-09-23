import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { ProjectCard } from '@/components/projects'

import { makeProject, projectHrefPattern } from './fixtures'

afterEach(cleanup)

describe('ProjectCard', () => {
  it('renders the whole card as one link to the project detail page', () => {
    const project = makeProject({ slug: 'riverside' })
    render(<ProjectCard project={project} index={1} />)

    const link = screen.getByRole('link')
    expect(link.getAttribute('href')).toMatch(projectHrefPattern('riverside'))
    expect(link).toHaveTextContent(project.title)
    expect(link).toHaveTextContent(project.summary)
  })

  it('renders the mono index over the cover, zero-padded', () => {
    render(<ProjectCard project={makeProject()} index={7} />)
    expect(screen.getByText('07')).toBeInTheDocument()
  })

  it('omits the index badge when none is given', () => {
    render(<ProjectCard project={makeProject()} />)
    expect(screen.queryByText(/^0\d$/)).not.toBeInTheDocument()
  })

  it('caps tags at 3 with a +N overflow badge', () => {
    render(
      <ProjectCard project={makeProject({ stack: ['React', 'TypeScript', 'GraphQL', 'Node'] })} />,
    )
    expect(screen.getByText('+1')).toBeInTheDocument()
  })

  it('renders a TODO(agustin) title in muted-foreground', () => {
    render(<ProjectCard project={makeProject({ title: 'TODO(agustin): Working title' })} />)
    expect(screen.getByRole('heading', { level: 3 })).toHaveClass('text-muted-foreground')
  })
})
