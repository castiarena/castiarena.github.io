import { z } from 'zod'

import { experiences } from './experience'
import { experiments } from './experiments'
import { profile } from './profile'
import { projects } from './projects'
import { achievements, courses, skillGroups } from './skills'
import type {
  Achievement,
  Course,
  Experience,
  Experiment,
  ISODateMonth,
  Profile,
  Project,
  SkillGroup,
  SocialLink,
} from './types'

// Runtime mirror of `./types.ts`. Each schema `satisfies z.ZodType<T>`, so a change to the frozen
// types that isn't reflected here fails `pnpm typecheck`.

export const EXPERIMENT_DESCRIPTION_MAX = 140
export const PROJECT_SUMMARY_MAX = 200

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/

const text = z.string().trim().min(1, 'must not be empty')

/** Absolute http(s) URL. */
const webUrl = z.url({
  protocol: /^https?$/,
  error: 'must be an absolute http(s) URL',
})

const imagePath = z.string().startsWith('/images/', 'image paths must start with "/images/"')

const image = z.object({ src: imagePath, alt: text })

const isoDateMonth = z
  .templateLiteral([z.number(), '-', z.number()])
  .refine(
    (value) => MONTH_PATTERN.test(value),
    'must be a month in the format YYYY-MM',
  ) satisfies z.ZodType<ISODateMonth>

export const socialLinkSchema = z
  .object({
    label: z.enum(['GitHub', 'LinkedIn', 'Email', 'X', 'Website']),
    href: z.string(),
  })
  .superRefine((link, ctx) => {
    const valid =
      link.label === 'Email'
        ? /^mailto:[^@\s]+@[^@\s]+\.[^@\s]+$/.test(link.href)
        : webUrl.safeParse(link.href).success
    if (!valid) {
      ctx.addIssue({
        code: 'custom',
        path: ['href'],
        message:
          link.label === 'Email'
            ? 'Email links must be "mailto:<address>"'
            : 'must be an absolute http(s) URL',
      })
    }
  }) satisfies z.ZodType<SocialLink>

export const profileSchema = z.object({
  name: text,
  role: text,
  tagline: text,
  location: text,
  summary: z.array(text).min(1, 'needs at least one paragraph'),
  avatar: image,
  cvHref: z.string().regex(/^\/cv\/[\w.-]+\.pdf$/, 'must be a PDF path under "/cv/"'),
  email: z.email('must be a valid email address'),
  socials: z.array(socialLinkSchema),
  yearsOfExperience: z.number().int().positive(),
}) satisfies z.ZodType<Profile>

export const experienceSchema = z
  .object({
    id: text,
    company: text,
    companyUrl: webUrl.optional(),
    title: text,
    start: isoDateMonth,
    end: z.union([isoDateMonth, z.literal('present')]),
    // Can be empty: not every CV role has an intro paragraph.
    intro: z.string(),
    highlights: z.array(text).min(1, 'needs at least one highlight'),
    stack: z.array(text).optional(),
  })
  .superRefine((experience, ctx) => {
    // "YYYY-MM" strings sort chronologically, so a string comparison is enough.
    if (experience.end !== 'present' && experience.end < experience.start) {
      ctx.addIssue({
        code: 'custom',
        path: ['end'],
        message: `end (${experience.end}) must not be before start (${experience.start})`,
      })
    }
  }) satisfies z.ZodType<Experience>

export const achievementSchema = z.object({
  id: text,
  title: text,
  metric: z.object({
    value: z.number().nonnegative(),
    unit: z.enum(['%', 'x', '+']),
    label: text,
  }),
  description: text,
}) satisfies z.ZodType<Achievement>

export const skillGroupSchema = z.object({
  id: z.enum(['frontend', 'backend', 'leadership']),
  label: text,
  skills: z.array(text).min(1, 'needs at least one skill'),
}) satisfies z.ZodType<SkillGroup>

export const courseSchema = z.object({
  title: text,
  provider: text,
  href: webUrl.optional(),
}) satisfies z.ZodType<Course>

export const experimentSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be kebab-case (a-z, 0-9, -)'),
  title: text,
  description: text.max(
    EXPERIMENT_DESCRIPTION_MAX,
    `description must be at most ${EXPERIMENT_DESCRIPTION_MAX} characters`,
  ),
  href: webUrl,
  sourceHref: webUrl.optional(),
  image: image.optional(),
  tags: z.array(text),
  year: z.number().int().min(2000).max(2100),
}) satisfies z.ZodType<Experiment>

export const projectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be kebab-case (a-z, 0-9, -)'),
  title: text,
  summary: text.max(
    PROJECT_SUMMARY_MAX,
    `summary must be at most ${PROJECT_SUMMARY_MAX} characters`,
  ),
  role: text,
  period: text.optional(),
  problem: text,
  approach: z.array(text),
  outcomes: z.array(text),
  stack: z.array(text),
  cover: image,
  gallery: z.array(image).optional(),
  links: z.object({
    live: webUrl.optional(),
    repo: webUrl.optional(),
    caseStudy: webUrl.optional(),
  }),
  featured: z.boolean(),
  order: z.number().int(),
}) satisfies z.ZodType<Project>

/** Adds an issue for every item whose `key` repeats an earlier item's value. */
function uniqueBy<T>(key: keyof T & string) {
  return (items: T[], ctx: z.RefinementCtx<T[]>) => {
    const seen = new Map<unknown, number>()
    items.forEach((item, index) => {
      const value = item[key]
      const first = seen.get(value)
      if (first === undefined) {
        seen.set(value, index)
        return
      }
      ctx.addIssue({
        code: 'custom',
        path: [index, key],
        message: `duplicate ${key} "${String(value)}" (already used at index ${first})`,
      })
    })
  }
}

export const contentSchema = z.object({
  profile: profileSchema,
  experiences: z.array(experienceSchema).superRefine(uniqueBy<Experience>('id')),
  achievements: z.array(achievementSchema).superRefine(uniqueBy<Achievement>('id')),
  skillGroups: z.array(skillGroupSchema).superRefine(uniqueBy<SkillGroup>('id')),
  courses: z.array(courseSchema).superRefine(uniqueBy<Course>('title')),
  experiments: z.array(experimentSchema).superRefine(uniqueBy<Experiment>('slug')),
  projects: z
    .array(projectSchema)
    .superRefine(uniqueBy<Project>('slug'))
    .superRefine(uniqueBy<Project>('order')),
})

export type Content = z.infer<typeof contentSchema>

/** The content shipped in `src/content/*`. */
export function getContent(): Content {
  return { profile, experiences, achievements, skillGroups, courses, experiments, projects }
}

/**
 * Validates site content (defaults to the real content in `src/content/*`) and returns it.
 * Throws an `Error` listing every problem with its path, e.g.
 * `✖ description must be at most 140 characters → at experiments[0].description`.
 */
export function validateContent(content: unknown = getContent()): Content {
  const result = contentSchema.safeParse(content)
  if (!result.success) {
    throw new Error(`Invalid site content (src/content):\n${z.prettifyError(result.error)}`)
  }
  return result.data
}
