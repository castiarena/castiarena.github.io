import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { Logo } from '@/components/layout/logo'
import { siteConfig } from '@/config/site'

afterEach(cleanup)

describe('Logo', () => {
  it('links home and names the site', () => {
    render(<Logo />)
    const link = screen.getByRole('link', { name: siteConfig.name })
    expect(link.getAttribute('href')).toMatch(/^\/$/)
  })
})
