export type ISODateMonth = `${number}-${number}` // "2023-02"

export interface SocialLink {
  label: 'GitHub' | 'LinkedIn' | 'Email' | 'X' | 'Website'
  href: string
}

export interface Profile {
  name: string
  role: string                    // "Senior Frontend Engineer"
  tagline: string                 // one-liner for hero
  location: string                // "Trevelin, Patagonia, Argentina"
  summary: string[]               // paragraphs
  avatar: { src: string; alt: string }
  cvHref: string                  // "/cv/agustin-castiarena-resume.pdf"
  email: string
  socials: SocialLink[]
  yearsOfExperience: number
}

export interface Experience {
  id: string                      // "riverside"
  company: string
  companyUrl?: string
  title: string
  start: ISODateMonth
  end: ISODateMonth | 'present'
  intro: string
  highlights: string[]
  stack?: string[]
}

export interface Achievement {
  id: string
  title: string
  metric: { value: number; unit: '%' | 'x' | '+'; label: string }
  description: string
}

export interface SkillGroup {
  id: 'frontend' | 'backend' | 'leadership'
  label: string
  skills: string[]
}

export interface Course {
  title: string
  provider: string
  href?: string
}

export interface Experiment {
  slug: string
  title: string
  description: string             // ≤ 140 chars
  href: string                    // live URL
  sourceHref?: string
  image?: { src: string; alt: string }
  tags: string[]
  year: number
}

export interface Project {
  slug: string
  title: string
  summary: string                 // ≤ 200 chars, card copy
  role: string
  period?: string
  problem: string
  approach: string[]
  outcomes: string[]
  stack: string[]
  cover: { src: string; alt: string }
  gallery?: { src: string; alt: string }[]
  links: { live?: string; repo?: string; caseStudy?: string }
  featured: boolean
  order: number
}
