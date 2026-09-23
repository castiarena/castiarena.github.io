import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { BioHeader } from '@/components/bio'
import type { Profile } from '@/content/types'

afterEach(cleanup)

const profile: Profile = {
  name: 'Agustin Castiarena',
  role: 'Senior Frontend Engineer',
  tagline: 'I build fast, maintainable web products.',
  location: 'Trevelin, Patagonia, Argentina',
  summary: ['One.', 'Two.', 'Three.'],
  avatar: { src: '/images/profile.jpg', alt: 'Portrait of Agustin Castiarena' },
  cvHref: '/cv/agustin-castiarena-resume.pdf',
  email: 'castiarena@gmail.com',
  socials: [
    { label: 'LinkedIn', href: 'https://linkedin.com/in/agustin-castiarena' },
    { label: 'GitHub', href: 'https://github.com/castiarena' },
  ],
  yearsOfExperience: 10,
}

describe('BioHeader', () => {
  it('renders the name as the page h1 and the role/years subtitle', () => {
    render(<BioHeader profile={profile} />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Agustin Castiarena' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Senior Frontend Engineer · 10+ years')).toBeInTheDocument()
    expect(screen.getByText('Trevelin, Patagonia, Argentina')).toBeInTheDocument()
  })

  it('links the CV download button to cvHref with a download attribute', () => {
    render(<BioHeader profile={profile} />)
    const link = screen.getByRole('link', { name: /Download CV/ })
    expect(link).toHaveAttribute('href', '/cv/agustin-castiarena-resume.pdf')
    expect(link).toHaveAttribute('download')
  })

  it('links LinkedIn and GitHub to their social hrefs, opening in a new tab', () => {
    render(<BioHeader profile={profile} />)
    const linkedin = screen.getByRole('link', { name: /LinkedIn/ })
    expect(linkedin).toHaveAttribute('href', 'https://linkedin.com/in/agustin-castiarena')
    expect(linkedin).toHaveAttribute('target', '_blank')

    const github = screen.getByRole('link', { name: /GitHub/ })
    expect(github).toHaveAttribute('href', 'https://github.com/castiarena')
    expect(github).toHaveAttribute('target', '_blank')
  })

  it('renders the avatar with the profile alt text', () => {
    render(<BioHeader profile={profile} />)
    expect(screen.getByAltText('Portrait of Agustin Castiarena')).toBeInTheDocument()
  })
})
