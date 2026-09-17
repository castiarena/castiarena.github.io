export const siteConfig = {
  name: 'Agustin Castiarena',
  title: 'Agustin Castiarena — Senior Frontend Engineer',
  description: 'Senior Frontend Engineer with 10+ years building modern web applications. Bio, projects and web experiments.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://castiarena.github.io',
  locale: 'en_US',
  nav: [
    { href: '/bio/', label: 'Bio' },
    { href: '/projects/', label: 'Projects' },
    { href: '/experiments/', label: 'Experiments' },
  ],
  repo: 'https://github.com/castiarena/castiarena.github.io',
} as const
