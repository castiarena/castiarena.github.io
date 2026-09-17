import { describe, expect, it } from 'vitest'

import { getContent, validateContent, type Content } from '@/content/schema'

/** A deep copy of the real content, so fixtures can be mutated freely. */
function realContent(): Content {
  return structuredClone(getContent())
}

function errorOf(content: unknown): string {
  try {
    validateContent(content)
  } catch (error) {
    return (error as Error).message
  }
  throw new Error('expected validateContent to throw')
}

describe('validateContent', () => {
  it('accepts the real content', () => {
    expect(() => validateContent()).not.toThrow()
    expect(validateContent()).toEqual(getContent())
  })

  it('rejects a duplicate project slug', () => {
    const content = realContent()
    const [first, second] = content.projects
    if (!first || !second) throw new Error('fixture needs 2 projects')
    second.slug = first.slug

    const message = errorOf(content)
    expect(message).toContain('Invalid site content')
    expect(message).toContain(`duplicate slug "${first.slug}"`)
    expect(message).toContain('projects[1].slug')
  })

  it('rejects a duplicate experiment slug', () => {
    const content = realContent()
    content.experiments.push({ ...content.experiments[0]! })

    expect(errorOf(content)).toMatch(/duplicate slug ".+" \(already used at index 0\)/)
  })

  it('rejects an experiment description over 140 characters', () => {
    const content = realContent()
    content.experiments[0]!.description = 'x'.repeat(141)

    const message = errorOf(content)
    expect(message).toContain('description must be at most 140 characters')
    expect(message).toContain('experiments[0].description')
  })

  it('accepts an experiment description of exactly 140 characters', () => {
    const content = realContent()
    content.experiments[0]!.description = 'x'.repeat(140)

    expect(() => validateContent(content)).not.toThrow()
  })

  it('rejects a project summary over 200 characters', () => {
    const content = realContent()
    content.projects[0]!.summary = 'x'.repeat(201)

    expect(errorOf(content)).toContain('summary must be at most 200 characters')
  })

  it('rejects an experience whose end is before its start', () => {
    const content = realContent()
    content.experiences[0]!.start = '2024-05'
    content.experiences[0]!.end = '2023-01'

    const message = errorOf(content)
    expect(message).toContain('end (2023-01) must not be before start (2024-05)')
    expect(message).toContain('experiences[0].end')
  })

  it('accepts an open-ended experience', () => {
    const content = realContent()
    content.experiences[0]!.end = 'present'

    expect(() => validateContent(content)).not.toThrow()
  })

  it('rejects malformed months', () => {
    const content = realContent()
    content.experiences[0]!.start = '2023-13'

    expect(errorOf(content)).toContain('must be a month in the format YYYY-MM')
  })

  it('rejects invalid URLs', () => {
    const content = realContent()
    content.experiments[0]!.href = 'not a url'
    content.experiences[0]!.companyUrl = 'javascript:alert(1)'

    const message = errorOf(content)
    expect(message).toContain('experiments[0].href')
    expect(message).toContain('experiences[0].companyUrl')
  })

  it('rejects an Email social link that is not mailto:', () => {
    const content = realContent()
    content.profile.socials.push({ label: 'Email', href: 'https://example.com' })

    expect(errorOf(content)).toContain('Email links must be "mailto:<address>"')
  })

  it('rejects image paths outside /images/', () => {
    const content = realContent()
    content.projects[0]!.cover.src = '/cover.svg'
    content.profile.avatar.src = 'https://example.com/me.jpg'

    const message = errorOf(content)
    expect(message).toContain('image paths must start with "/images/"')
    expect(message).toContain('projects[0].cover.src')
    expect(message).toContain('profile.avatar.src')
  })

  it('rejects a duplicate experience id', () => {
    const content = realContent()
    content.experiences[1]!.id = content.experiences[0]!.id

    expect(errorOf(content)).toContain('duplicate id "riverside"')
  })
})
