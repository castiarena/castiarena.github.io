import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { ProjectGallery } from '@/components/projects/project-gallery'

import { makeProject } from './fixtures'

afterEach(cleanup)

describe('ProjectGallery', () => {
  it('opens the lightbox from a thumbnail with the alt text as a visible caption', async () => {
    const project = makeProject({
      gallery: [
        { src: '/images/a.svg', alt: 'First shot' },
        { src: '/images/b.svg', alt: 'Second shot' },
        { src: '/images/c.svg', alt: 'Third shot' },
      ],
    })
    render(<ProjectGallery project={project} />)

    fireEvent.click(screen.getAllByRole('button')[0]!)

    const dialog = await screen.findByRole('dialog')
    // "First shot" also labels the sr-only DialogTitle — target the visible caption specifically.
    expect(within(dialog).getByText('First shot', { selector: 'figcaption' })).toBeInTheDocument()
    expect(within(dialog).getByText('1 of 3')).toBeInTheDocument()
  })

  it('moves forward and back with the arrow keys, wrapping at the ends', async () => {
    const project = makeProject({
      gallery: [
        { src: '/images/a.svg', alt: 'First shot' },
        { src: '/images/b.svg', alt: 'Second shot' },
        { src: '/images/c.svg', alt: 'Third shot' },
      ],
    })
    render(<ProjectGallery project={project} />)
    fireEvent.click(screen.getAllByRole('button')[0]!)
    const dialog = await screen.findByRole('dialog')

    fireEvent.keyDown(dialog, { key: 'ArrowRight' })
    expect(within(dialog).getByText('Second shot', { selector: 'figcaption' })).toBeInTheDocument()
    expect(within(dialog).getByText('2 of 3')).toBeInTheDocument()

    fireEvent.keyDown(dialog, { key: 'ArrowLeft' })
    expect(within(dialog).getByText('First shot', { selector: 'figcaption' })).toBeInTheDocument()

    // Wraps: one step back from the first image lands on the last.
    fireEvent.keyDown(dialog, { key: 'ArrowLeft' })
    expect(within(dialog).getByText('Third shot', { selector: 'figcaption' })).toBeInTheDocument()
    expect(within(dialog).getByText('3 of 3')).toBeInTheDocument()
  })

  it('closes on Escape and returns focus to the thumbnail that opened it', async () => {
    const project = makeProject({
      gallery: [{ src: '/images/a.svg', alt: 'First shot' }],
    })
    render(<ProjectGallery project={project} />)
    const thumbnail = screen.getAllByRole('button')[0]!
    fireEvent.click(thumbnail)

    const dialog = await screen.findByRole('dialog')
    fireEvent.keyDown(dialog, { key: 'Escape' })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    // Radix restores focus via a `requestAnimationFrame`-scheduled effect, not synchronously.
    await waitFor(() => expect(thumbnail).toHaveFocus())
  })

  it('falls back to 3 generated placeholders when the project has no gallery', () => {
    render(<ProjectGallery project={makeProject({ gallery: undefined })} />)
    expect(screen.getAllByRole('button')).toHaveLength(3)
  })
})
