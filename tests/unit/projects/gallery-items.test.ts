import { describe, expect, it } from 'vitest'

import { getProjectGalleryItems } from '@/components/projects/gallery-items'

import { makeProject } from './fixtures'

describe('getProjectGalleryItems', () => {
  it('maps real gallery images through unchanged', () => {
    const project = makeProject({
      gallery: [
        { src: '/images/projects/a.png', alt: 'Screenshot A' },
        { src: '/images/projects/b.png', alt: 'Screenshot B' },
      ],
    })
    const items = getProjectGalleryItems(project)
    expect(items).toHaveLength(2)
    expect(items[0]).toMatchObject({ src: '/images/projects/a.png', alt: 'Screenshot A' })
  })

  it('falls back to 3 generated placeholders, each with non-empty TODO(agustin) alt text', () => {
    const project = makeProject({ gallery: undefined })
    const items = getProjectGalleryItems(project)
    expect(items).toHaveLength(3)
    for (const item of items) {
      expect(item.src).toBeUndefined()
      expect(item.alt.length).toBeGreaterThan(0)
      expect(item.alt).toMatch(/^TODO\(agustin\)/)
    }
  })

  it('is deterministic: same project, same seeds, every call', () => {
    const project = makeProject({ gallery: undefined })
    expect(getProjectGalleryItems(project)).toEqual(getProjectGalleryItems(project))
  })
})
