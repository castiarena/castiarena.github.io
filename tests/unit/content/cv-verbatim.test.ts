import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { experiences } from '@/content/experience'
import { profile } from '@/content/profile'
import { projects } from '@/content/projects'
import { achievements, courses, skillGroups } from '@/content/skills'

// Compares the content with the CV transcription, the source of truth for agent 1.2.
const cv = readFileSync(join(process.cwd(), 'docs/plan/assets/cv-content.md'), 'utf8')

function section(heading: string): string {
  const start = cv.indexOf(`\n## ${heading}\n`)
  if (start === -1) throw new Error(`CV section "${heading}" not found`)
  const end = cv.indexOf('\n## ', start + 1)
  return cv.slice(start, end === -1 ? undefined : end)
}

interface CvRole {
  title: string
  company: string
  start: string
  end: string
  intro: string
  bullets: string[]
}

function toIsoMonth(value: string): string {
  const [month, year] = value.split('/')
  return `${year}-${month}`
}

const cvRoles: CvRole[] = section('Experience')
  .split('\n### ')
  .slice(1)
  .map((block) => {
    const [heading = '', ...lines] = block.split('\n')
    const [title = '', company = ''] = heading.split(' — ')
    const dates = /\*\*(\d{2}\/\d{4}) – (\d{2}\/\d{4})\*\*/.exec(block)
    if (!dates?.[1] || !dates[2]) throw new Error(`No dates for "${heading}"`)
    const body = lines.map((line) => line.trim()).filter(Boolean)
    return {
      title,
      company,
      start: toIsoMonth(dates[1]),
      end: toIsoMonth(dates[2]),
      intro: body.filter((line) => !/^(-|\*\*|>)/.test(line)).join(' '),
      bullets: body.filter((line) => line.startsWith('- ')).map((line) => line.slice(2)),
    }
  })

const cvSentences = new Set([
  ...cvRoles.flatMap((role) => [role.intro, ...role.bullets]),
  ...section('Summary')
    .split('\n')
    .filter((line) => /^\d+\. /.test(line))
    .map((line) => line.replace(/^\d+\. /, '')),
])

describe('experience matches the CV verbatim', () => {
  it('has the 4 CV roles, newest first, with the expected ids', () => {
    expect(cvRoles).toHaveLength(4)
    expect(experiences.map((experience) => experience.id)).toEqual([
      'riverside',
      'realworld-one',
      'westwing',
      'mercado-libre',
    ])
    expect(experiences.map((experience) => experience.company)).toEqual(
      cvRoles.map((role) => role.company),
    )
  })

  it.each(cvRoles)('$company: title, dates, intro and every bullet', (role) => {
    const experience = experiences.find((item) => item.company === role.company)
    expect(experience, `missing experience for ${role.company}`).toBeDefined()
    expect(experience?.title).toBe(role.title)
    expect(experience?.start).toBe(role.start)
    expect(experience?.end).toBe(role.end)
    expect(experience?.intro).toBe(role.intro)
    expect(experience?.highlights).toEqual(role.bullets)
  })
})

describe('profile, achievements, skills and courses match the CV', () => {
  it('uses the summary paragraphs verbatim', () => {
    const paragraphs = section('Summary')
      .split('\n')
      .filter((line) => /^\d+\. /.test(line))
      .map((line) => line.replace(/^\d+\. /, ''))
    expect(profile.summary).toEqual(paragraphs)
  })

  it('uses the achievements table verbatim', () => {
    const rows = section('Key Achievements')
      .split('\n')
      .filter((line) => line.startsWith('| ') && !line.startsWith('| Title'))
      .map((line) =>
        line
          .split('|')
          .map((cell) => cell.trim())
          .filter(Boolean),
      )
    // Titles are sentence case on the site (design reference); the CV uses Title Case.
    const sentenceCase = (title: string) => title.charAt(0) + title.slice(1).toLowerCase()
    expect(
      achievements.map((a) => [a.title, `${a.metric.value}${a.metric.unit}`, a.description]),
    ).toEqual(rows.map(([title = '', ...rest]) => [sentenceCase(title), ...rest]))
  })

  it('uses the skills in CV order', () => {
    const groups = section('Skills')
      .split('\n')
      .filter((line) => line.startsWith('- **'))
      .map((line) => {
        const match = /^- \*\*(.+?):\*\* (.+)$/.exec(line)
        return { label: match?.[1], skills: match?.[2]?.split(', ') }
      })
    expect(skillGroups.map(({ label, skills }) => ({ label, skills }))).toEqual(groups)
  })

  it('lists the CV courses', () => {
    const cvCourses = section('Training / Courses')
      .split('\n')
      .filter((line) => line.startsWith('- **'))
      .map((line) => /^- \*\*(.+?)\*\* — (.+)$/.exec(line)?.slice(1, 3))
    expect(courses.map((course) => [course.title, course.provider])).toEqual(cvCourses)
  })
})

describe('project placeholders', () => {
  const TODO = 'TODO(agustin):'

  it.each(projects.map((project) => [project.slug, project] as const))(
    '%s: every sentence is from the CV or marked TODO(agustin)',
    (_slug, project) => {
      // Titles are owner-approved and exempt; every other sentence must be traceable.
      const sentences = [
        project.summary,
        project.problem,
        ...project.approach,
        ...project.outcomes,
        project.cover.alt,
      ]
      const unmarked = sentences.filter((s) => !s.startsWith(TODO) && !cvSentences.has(s))
      expect(unmarked).toEqual([])
      expect(cvRoles.map((role) => role.title)).toContain(project.role)
    },
  )
})
