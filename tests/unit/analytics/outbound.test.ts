import { describe, expect, it } from 'vitest'

import { describeLinkClick } from '@/lib/analytics/outbound'

const ORIGIN = 'https://castiarena.github.io'

function anchor(html: string): HTMLAnchorElement {
  const host = document.createElement('div')
  host.innerHTML = html
  const element = host.querySelector('a')
  if (!element) throw new Error('fixture has no anchor')
  return element
}

describe('describeLinkClick — outbound', () => {
  it('reports an absolute link to another origin', () => {
    expect(
      describeLinkClick(anchor('<a href="https://github.com/castiarena">GH</a>'), ORIGIN),
    ).toEqual({
      kind: 'outbound',
      params: {
        link_url: 'https://github.com/castiarena',
        link_domain: 'github.com',
        outbound: true,
      },
    })
  })

  it('carries a content_type when the link declares one', () => {
    const result = describeLinkClick(
      anchor('<a href="https://example.com/lab" data-analytics-content-type="experiment">x</a>'),
      ORIGIN,
    )
    expect(result).toMatchObject({ params: { content_type: 'experiment' } })
  })

  it('drops a content_type that is not in the catalog', () => {
    const result = describeLinkClick(
      anchor('<a href="https://example.com" data-analytics-content-type="nonsense">x</a>'),
      ORIGIN,
    )
    expect(result?.kind).toBe('outbound')
    expect(result).not.toHaveProperty('params.content_type')
  })

  it.each([
    ['an internal absolute link', `<a href="${ORIGIN}/bio/">Bio</a>`],
    ['a root-relative link', '<a href="/projects/">Projects</a>'],
    ['an in-page anchor', '<a href="#content">Skip</a>'],
    ['a mailto link — it has its own event', '<a href="mailto:a@example.com">Mail</a>'],
    ['a tel link', '<a href="tel:+100000">Call</a>'],
    ['an anchor with no href', '<a>Nothing</a>'],
  ])('ignores %s', (_label, html) => {
    expect(describeLinkClick(anchor(html), ORIGIN)).toBeNull()
  })
})

describe('describeLinkClick — select_content', () => {
  it('reports a tagged project link by its slug, not as an outbound click', () => {
    const result = describeLinkClick(
      anchor(
        '<a href="/projects/exporter/" data-analytics-event="select_content" data-analytics-content-id="exporter">x</a>',
      ),
      ORIGIN,
    )
    expect(result).toEqual({ kind: 'select_content', contentId: 'exporter' })
  })

  it('reports nothing when the slug is missing, rather than a half-filled event', () => {
    const result = describeLinkClick(
      anchor('<a href="/projects/" data-analytics-event="select_content">x</a>'),
      ORIGIN,
    )
    expect(result).toBeNull()
  })
})
