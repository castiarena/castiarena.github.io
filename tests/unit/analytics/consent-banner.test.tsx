import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { ConsentChoice } from '@/lib/analytics/consent'

const STORAGE_KEY = 'castiarena:consent'

async function renderBanner(choice: ConsentChoice | null) {
  window.localStorage.clear()
  if (choice) {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ choice, timestamp: Date.now(), version: 1 }),
    )
  }
  vi.resetModules()
  const [{ ConsentBanner }, consent] = await Promise.all([
    import('@/components/analytics/consent-banner'),
    import('@/lib/analytics/consent'),
  ])
  const result = render(<ConsentBanner />)
  return { ...result, consent }
}

const acceptButton = () => screen.queryByRole('button', { name: 'Accept' })
const declineButton = () => screen.queryByRole('button', { name: 'Decline' })
const storedChoice = () => JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')?.choice

beforeEach(() => {
  vi.stubGlobal('location', { ...window.location, hostname: 'localhost', reload: vi.fn() })
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('<ConsentBanner>', () => {
  it('asks a visitor who has not answered', async () => {
    await renderBanner(null)

    expect(screen.getByRole('region', { name: 'Cookie preferences' })).toBeInTheDocument()
    expect(acceptButton()).toBeInTheDocument()
    expect(declineButton()).toBeInTheDocument()
    // next/link does not apply the app's `trailingSlash: true` in this environment — assert the
    // path, not the exact trailing slash (same as tests/unit/layout/nav-item.test.tsx).
    expect(screen.getByRole('link', { name: /What this collects/ }).getAttribute('href')).toMatch(
      /^\/privacy\/?$/,
    )
  })

  it('keeps a live region in the markup so the bar is announced when it appears', async () => {
    const { container } = await renderBanner('granted')
    expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument()
  })

  it('stays out of the way once a choice is stored', async () => {
    await renderBanner('granted')
    expect(acceptButton()).not.toBeInTheDocument()
    expect(declineButton()).not.toBeInTheDocument()
  })

  it('records an Accept and closes', async () => {
    await renderBanner(null)

    fireEvent.click(acceptButton()!)

    expect(storedChoice()).toBe('granted')
    expect(acceptButton()).not.toBeInTheDocument()
  })

  it('records a Decline and closes', async () => {
    await renderBanner(null)

    fireEvent.click(declineButton()!)

    expect(storedChoice()).toBe('denied')
    expect(declineButton()).not.toBeInTheDocument()
  })

  it('comes back when the footer reopens it', async () => {
    const { consent } = await renderBanner('denied')
    expect(acceptButton()).not.toBeInTheDocument()

    act(() => consent.openConsentBanner())

    expect(acceptButton()).toBeInTheDocument()
  })

  it('offers both answers as real buttons, reachable by keyboard and in no particular order', async () => {
    await renderBanner(null)

    const buttons = screen.getAllByRole('button')
    expect(buttons.map((button) => button.textContent)).toEqual(['Decline', 'Accept'])
    for (const button of buttons) {
      button.focus()
      expect(button).toHaveFocus()
      expect(button).not.toHaveAttribute('tabindex', '-1')
    }
  })

  it('does not trap focus or cover the page — it is a bar, not a modal', async () => {
    const { container } = await renderBanner(null)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(container.firstElementChild).toHaveClass('pointer-events-none')
    expect(screen.getByRole('region', { name: 'Cookie preferences' })).toHaveClass(
      'pointer-events-auto',
    )
  })
})
