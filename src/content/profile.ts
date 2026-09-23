import type { Profile } from './types'

// Source: docs/plan/assets/cv-content.md. The phone number on the CV is intentionally NOT published.
export const profile: Profile = {
  name: 'Agustin Castiarena',
  role: 'Senior Frontend Engineer',
  // Tagline from the design reference (screen 03), approved by the owner.
  tagline:
    'I build fast, maintainable web products — and the teams that ship them. Ten years across e-commerce, media, healthcare and insurance.',
  location: 'Trevelin, Patagonia, Argentina',
  summary: [
    'Senior Frontend Engineer with 10+ years building and evolving modern web applications across e-commerce, media, healthcare, and insurance.',
    'Led frontend architecture work, application modernization, and cross-functional delivery on business-critical products, with deep experience in React ecosystems, GraphQL-based architectures, performance optimization, developer experience, and technical leadership.',
    'Focused on building maintainable software, mentoring engineers, improving development workflows, and shipping products that balance technical quality with business goals.',
  ],
  avatar: {
    src: '/images/profile.jpg',
    alt: 'Portrait of Agustin Castiarena, a smiling man with dark hair and a beard, wearing a blue polka-dot shirt against a light background',
  },
  cvHref: '/cv/agustin-castiarena-resume.pdf',
  email: 'castiarena@gmail.com',
  socials: [
    { label: 'LinkedIn', href: 'https://linkedin.com/in/agustin-castiarena' },
    { label: 'GitHub', href: 'https://github.com/castiarena' },
    { label: 'Email', href: 'mailto:castiarena@gmail.com' },
  ],
  yearsOfExperience: 10,
}
