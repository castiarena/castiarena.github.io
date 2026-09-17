// SEED — replaced by agent 1.2
import type { Achievement, Course, SkillGroup } from './types'

export const achievements: Achievement[] = [
  {
    id: 'scalability',
    title: 'Scalability Enhancement',
    metric: { value: 35, unit: '%', label: 'scalability' },
    description: 'Increased platform scalability by 35% through microservices architecture.',
  },
]

export const skillGroups: SkillGroup[] = [
  {
    id: 'frontend',
    label: 'Frontend Engineering',
    skills: ['React', 'JavaScript', 'TypeScript'],
  },
]

export const courses: Course[] = [
  {
    title: 'Advanced React Patterns',
    provider: 'Frontend Masters',
  },
]
