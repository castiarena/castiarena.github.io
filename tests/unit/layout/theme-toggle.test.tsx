import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ThemeToggle } from '@/components/layout/theme-toggle'

const useThemeMock = vi.fn()

vi.mock('next-themes', () => ({
  useTheme: () => useThemeMock(),
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('ThemeToggle', () => {
  it('has an accessible name that includes the current mode', () => {
    useThemeMock.mockReturnValue({ theme: 'dark', resolvedTheme: 'dark', setTheme: vi.fn() })
    render(<ThemeToggle />)
    expect(screen.getByRole('button', { name: /Theme: dark\./ })).toBeInTheDocument()
  })

  it('names the mode it will switch to next', () => {
    useThemeMock.mockReturnValue({ theme: 'light', resolvedTheme: 'light', setTheme: vi.fn() })
    render(<ThemeToggle />)
    expect(
      screen.getByRole('button', { name: 'Theme: light. Switch to dark.' }),
    ).toBeInTheDocument()
  })

  it('cycles light → dark → system → light', () => {
    const setTheme = vi.fn()
    useThemeMock.mockReturnValue({ theme: 'system', resolvedTheme: 'dark', setTheme })
    render(<ThemeToggle />)
    screen.getByRole('button', { name: 'Theme: system. Switch to light.' }).click()
    expect(setTheme).toHaveBeenCalledWith('light')
  })

  it('shows the moon icon when the resolved theme is dark', () => {
    useThemeMock.mockReturnValue({ theme: 'dark', resolvedTheme: 'dark', setTheme: vi.fn() })
    const { container } = render(<ThemeToggle />)
    expect(container.querySelector('.lucide-moon')).toBeInTheDocument()
  })

  it('shows the sun icon when the resolved theme is light', () => {
    useThemeMock.mockReturnValue({ theme: 'light', resolvedTheme: 'light', setTheme: vi.fn() })
    const { container } = render(<ThemeToggle />)
    expect(container.querySelector('.lucide-sun')).toBeInTheDocument()
  })
})
