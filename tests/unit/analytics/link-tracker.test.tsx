import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { LinkTracker } from '@/components/analytics/link-tracker'

const track = vi.fn()
vi.mock('@/lib/analytics', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/analytics')>()),
  track: (...args: unknown[]) => track(...args),
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  document.body.innerHTML = ''
})

function withLink(html: string) {
  render(<LinkTracker />)
  const host = document.createElement('div')
  host.innerHTML = html
  document.body.appendChild(host)
  return host.querySelector('a') as HTMLAnchorElement
}

describe('<LinkTracker>', () => {
  it('reports an outbound click from anywhere in the document', () => {
    const link = withLink('<a href="https://github.com/castiarena">GitHub</a>')

    link.click()

    expect(track).toHaveBeenCalledWith('click', {
      link_url: 'https://github.com/castiarena',
      link_domain: 'github.com',
      outbound: true,
    })
  })

  it('finds the anchor when the click lands on something inside it', () => {
    const link = withLink('<a href="https://example.com/x"><span>deep</span></a>')

    link.querySelector('span')!.click()

    expect(track).toHaveBeenCalledWith('click', expect.objectContaining({ outbound: true }))
  })

  it('reports a project card as select_content', () => {
    const link = withLink(
      '<a href="/projects/exporter/" data-analytics-event="select_content" data-analytics-content-id="exporter">x</a>',
    )

    link.click()

    expect(track).toHaveBeenCalledWith('select_content', {
      content_type: 'project',
      content_id: 'exporter',
    })
  })

  it('stays quiet for internal navigation', () => {
    const link = withLink('<a href="/bio/">Bio</a>')

    link.click()

    expect(track).not.toHaveBeenCalled()
  })

  it('counts a middle-click, which opens the link in a new tab', () => {
    const link = withLink('<a href="https://example.com/x">x</a>')

    link.dispatchEvent(new MouseEvent('auxclick', { bubbles: true, button: 1 }))

    expect(track).toHaveBeenCalledTimes(1)
  })

  it('ignores a right-click, which only opens a context menu', () => {
    const link = withLink('<a href="https://example.com/x">x</a>')

    link.dispatchEvent(new MouseEvent('auxclick', { bubbles: true, button: 2 }))

    expect(track).not.toHaveBeenCalled()
  })

  it('still reports when a handler below it stops propagation', () => {
    const link = withLink('<a href="https://example.com/x">x</a>')
    link.addEventListener('click', (event) => event.stopPropagation())

    link.click()

    expect(track).toHaveBeenCalledTimes(1)
  })

  it('detaches its listeners on unmount', () => {
    const { unmount } = render(<LinkTracker />)
    const host = document.createElement('div')
    host.innerHTML = '<a href="https://example.com/x">x</a>'
    document.body.appendChild(host)

    unmount()
    host.querySelector('a')!.click()

    expect(track).not.toHaveBeenCalled()
  })
})
