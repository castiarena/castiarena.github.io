// SEED — replaced by agent 1.2
import type { Profile } from './types'

export const profile: Profile = {
  name: 'Agustin Castiarena',
  role: 'Senior Frontend Engineer',
  tagline: 'Building maintainable, fast web products with React and GraphQL.',
  location: 'Trevelin, Patagonia, Argentina',
  summary: [
    'Senior Frontend Engineer with 10+ years building and evolving modern web applications across e-commerce, media, healthcare, and insurance.',
  ],
  avatar: { src: '/images/profile.jpg', alt: 'Portrait of Agustin Castiarena' },
  cvHref: '/cv/agustin-castiarena-resume.pdf',
  email: 'castiarena@gmail.com',
  socials: [
    { label: 'GitHub', href: 'https://github.com/castiarena' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/agustin-castiarena' },
    { label: 'Email', href: 'mailto:castiarena@gmail.com' },
  ],
  yearsOfExperience: 10,
}
