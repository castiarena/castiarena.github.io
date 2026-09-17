import type { Achievement, Course, SkillGroup } from './types'

// Source: docs/plan/assets/cv-content.md ("Key Achievements", "Skills", "Training / Courses").
// `metric.label` is a short caption derived from the CV description.
export const achievements: Achievement[] = [
  {
    id: 'scalability',
    title: 'Scalability Enhancement',
    metric: { value: 35, unit: '%', label: 'platform scalability' },
    description: 'Increased platform scalability by 35% through microservices architecture.',
  },
  {
    id: 'code-review',
    title: 'Code Review Optimization',
    metric: { value: 40, unit: '%', label: 'less code review time' },
    description: 'Reduced code review time by 40% with AI-assisted workflow.',
  },
  {
    id: 'stakeholder-satisfaction',
    title: 'Stakeholder Satisfaction Achievement',
    metric: { value: 98, unit: '%', label: 'stakeholder satisfaction' },
    description: 'Led team that delivered 98% stakeholder satisfaction.',
  },
  {
    id: 'frontend-performance',
    title: 'Frontend Optimization',
    metric: { value: 25, unit: '%', label: 'faster load times' },
    description: 'Improved frontend load times by 25% with UI optimizations.',
  },
]

export const skillGroups: SkillGroup[] = [
  {
    id: 'frontend',
    label: 'Frontend Engineering',
    skills: ['React', 'JavaScript', 'TypeScript'],
  },
  {
    id: 'backend',
    label: 'Backend & APIs',
    skills: ['GraphQL', 'REST APIs', 'Node.js', 'Microservices'],
  },
  {
    id: 'leadership',
    label: 'Leadership',
    skills: [
      'Engineering Leadership',
      'Team Growth',
      'Hiring & Interviewing',
      'Technical Mentoring',
      'Cross-functional Collaboration',
      'Resource Planning',
      'Agile Development',
    ],
  },
]

export const courses: Course[] = [
  {
    // No `href`: frontendmasters.com/courses/advanced-react-patterns/ now redirects to a different
    // course, so the page for this course can't be confirmed.
    title: 'Advanced React Patterns',
    provider: 'Frontend Masters',
  },
  {
    title: 'The Good Parts of JavaScript and the Web',
    provider: 'Frontend Masters',
    href: 'https://frontendmasters.com/courses/good-parts-javascript-web/',
  },
]
