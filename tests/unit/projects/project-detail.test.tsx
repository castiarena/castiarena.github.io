import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ProjectDetail } from '@/components/projects'

import { makeProject, projectHrefPattern } from './fixtures'

// StatTile's value is a motion CountUp, which observes visibility with IntersectionObserver.
// jsdom doesn't implement it; a no-op stub is enough since these tests only assert markup.
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)

afterEach(cleanup)

describe('ProjectDetail', () => {
  it('renders every approach item', () => {
    const project = makeProject({ approach: ['First step.', 'Second step.', 'Third step.'] })
    render(<ProjectDetail project={project} prev={null} next={null} />)

    expect(screen.getByText('First step.')).toBeInTheDocument()
    expect(screen.getByText('Second step.')).toBeInTheDocument()
    expect(screen.getByText('Third step.')).toBeInTheDocument()
  })

  it('renders every outcome item, numeric or not', () => {
    const project = makeProject({
      outcomes: [
        '35% more platform scalability.',
        'Shipped product improvements in close partnership with stakeholders.',
        'TODO(agustin): Add one more outcome, with a number if you can publish one.',
      ],
    })
    render(<ProjectDetail project={project} prev={null} next={null} />)

    expect(screen.getByText('35')).toBeInTheDocument()
    expect(screen.getByText('more platform scalability.')).toBeInTheDocument()
    expect(
      screen.getByText('Shipped product improvements in close partnership with stakeholders.'),
    ).toBeInTheDocument()
    expect(screen.getByText('TODO(agustin)')).toBeInTheDocument()
    expect(
      screen.getByText('Add one more outcome, with a number if you can publish one.'),
    ).toBeInTheDocument()
  })

  it('shows "First project" / "Last project" at both ends and real links in the middle', () => {
    const project = makeProject()
    const { rerender } = render(<ProjectDetail project={project} prev={null} next={null} />)
    expect(screen.getByText('First project')).toBeInTheDocument()
    expect(screen.getByText('Last project')).toBeInTheDocument()

    const prev = makeProject({ slug: 'prev-project', title: 'Previous project' })
    const next = makeProject({ slug: 'next-project', title: 'Next project' })
    rerender(<ProjectDetail project={project} prev={prev} next={next} />)

    expect(screen.queryByText('First project')).not.toBeInTheDocument()
    expect(screen.queryByText('Last project')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Previous project/ }).getAttribute('href')).toMatch(
      projectHrefPattern('prev-project'),
    )
    expect(screen.getByRole('link', { name: /Next project/ }).getAttribute('href')).toMatch(
      projectHrefPattern('next-project'),
    )
  })

  it('hides link buttons and shows the TODO placeholder when no links are set', () => {
    const project = makeProject({ links: {} })
    render(<ProjectDetail project={project} prev={null} next={null} />)

    expect(screen.queryByRole('link', { name: /View live/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /View source/ })).not.toBeInTheDocument()
    expect(screen.getByText(/TODO\(agustin\): live link/)).toBeInTheDocument()
  })

  it('renders outline link buttons for every link that is present', () => {
    const project = makeProject({
      links: { live: 'https://example.com', repo: 'https://github.com/example/repo' },
    })
    render(<ProjectDetail project={project} prev={null} next={null} />)

    expect(screen.getByRole('link', { name: /View live/ })).toHaveAttribute(
      'href',
      'https://example.com',
    )
    expect(screen.getByRole('link', { name: /View source/ })).toHaveAttribute(
      'href',
      'https://github.com/example/repo',
    )
    expect(screen.queryByText(/TODO\(agustin\): live link/)).not.toBeInTheDocument()
  })

  it('shows the draft badge when NEXT_PUBLIC_DEPLOY_ENV is not "production"', () => {
    render(<ProjectDetail project={makeProject()} prev={null} next={null} />)
    expect(screen.getByText(/Draft/)).toBeInTheDocument()
  })
})
