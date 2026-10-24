import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const track = vi.fn()
vi.mock('@/lib/analytics', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/analytics')>()),
  track: (...args: unknown[]) => track(...args),
}))

const copyToClipboard = vi.fn<(text: string) => Promise<boolean>>(async () => true)
vi.mock('@/components/contact/copy-to-clipboard', () => ({
  copyToClipboard: (text: string) => copyToClipboard(text),
}))

const useThemeMock = vi.fn()
vi.mock('next-themes', () => ({
  // Falls back to a usable theme so the header's ThemeToggle renders without per-test setup.
  useTheme: () => useThemeMock() ?? { theme: 'system', resolvedTheme: 'dark', setTheme: () => {} },
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('contact_open', () => {
  it.each(['header', 'mobile_nav', 'hero', 'contact_band', 'cta'] as const)(
    'reports the %s entry point it was given',
    async (source) => {
      const { ContactDialog } = await import('@/components/contact/contact-dialog')
      render(<ContactDialog source={source} />)

      fireEvent.click(screen.getByRole('button', { name: 'Contact' }))

      await waitFor(() => {
        expect(track).toHaveBeenCalledWith('contact_open', { source })
      })
    },
  )

  it('fires on open only, not when the dialog closes again', async () => {
    const { ContactDialog } = await import('@/components/contact/contact-dialog')
    render(<ContactDialog source="hero" />)

    fireEvent.click(screen.getByRole('button', { name: 'Contact' }))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' })

    await waitFor(() => {
      expect(track.mock.calls.filter(([name]) => name === 'contact_open')).toHaveLength(1)
    })
  })

  it('reports from a real entry point, end to end', async () => {
    const { ContactCTA } = await import('@/components/contact/contact-cta')
    render(<ContactCTA />)

    fireEvent.click(screen.getByRole('button', { name: 'Get in touch' }))

    await waitFor(() => {
      expect(track).toHaveBeenCalledWith('contact_open', { source: 'cta' })
    })
  })

  // Rendering every wrapper (header, mobile sheet, hero) just to read one prop is slow and
  // brittle; this catches the thing that actually goes wrong — a call site added without a source.
  it('is wired at every ContactDialog call site in the app', () => {
    const files = execSync("grep -rl '<ContactDialog' src --include='*.tsx'", { encoding: 'utf8' })
      .trim()
      .split('\n')
    expect(files.length).toBeGreaterThan(1)

    const missing = files.filter((file) => {
      const source = readFileSync(file, 'utf8')
      return source
        .split('<ContactDialog')
        .slice(1)
        .some((usage) => !usage.slice(0, usage.indexOf('/>') + 1).includes('source='))
    })
    expect(missing, 'every <ContactDialog> needs a source for contact_open').toEqual([])
  })
})

describe('contact_copy_email', () => {
  it('reports a successful copy from the CTA', async () => {
    const { ContactCTA } = await import('@/components/contact/contact-cta')
    render(<ContactCTA />)

    fireEvent.click(screen.getByRole('button', { name: /Copy email address/ }))

    await waitFor(() => {
      expect(track).toHaveBeenCalledWith('contact_copy_email', { source: 'cta' })
    })
  })

  it('stays quiet when the copy fails', async () => {
    copyToClipboard.mockResolvedValueOnce(false)
    const { ContactCTA } = await import('@/components/contact/contact-cta')
    render(<ContactCTA />)

    fireEvent.click(screen.getByRole('button', { name: /Copy email address/ }))

    await waitFor(() => expect(copyToClipboard).toHaveBeenCalled())
    expect(track).not.toHaveBeenCalledWith('contact_copy_email', expect.anything())
  })

  it('reports a copy from the contact band', async () => {
    const writeText = vi.fn(async () => {})
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } })
    const { CopyEmailButton } = await import('@/components/home/copy-email-button')
    render(<CopyEmailButton email="a@example.com" />)

    fireEvent.click(screen.getByRole('button', { name: /Copy email address/ }))

    await waitFor(() => {
      expect(track).toHaveBeenCalledWith('contact_copy_email', { source: 'contact_band' })
    })
    vi.unstubAllGlobals()
  })
})

describe('theme_change', () => {
  it('reports the mode being switched to, not the one being left', async () => {
    const setTheme = vi.fn()
    useThemeMock.mockReturnValue({ theme: 'light', resolvedTheme: 'light', setTheme })
    const { ThemeToggle } = await import('@/components/layout/theme-toggle')
    render(<ThemeToggle />)

    fireEvent.click(screen.getByRole('button', { name: /Theme: light/ }))

    expect(track).toHaveBeenCalledWith('theme_change', { theme: 'dark' })
    expect(setTheme).toHaveBeenCalledWith('dark')
  })
})
