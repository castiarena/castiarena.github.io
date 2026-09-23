export const siteConfig = {
  name: 'Agustin Castiarena',
  title: 'Agustin Castiarena — Senior Frontend Engineer',
  description: 'Senior Frontend Engineer with 10+ years building modern web applications. Bio, projects and web experiments.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://castiarena.github.io',
  locale: 'en_US',
  // Order matches every reference screen's header (Home · Bio · Experiments · Projects); "Home"
  // is rendered by the header itself rather than listed here.
  nav: [
    { href: '/bio/', label: 'Bio' },
    { href: '/experiments/', label: 'Experiments' },
    { href: '/projects/', label: 'Projects' },
  ],
  repo: 'https://github.com/castiarena/castiarena.github.io',
} as const
