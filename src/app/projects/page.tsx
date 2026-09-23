import type { Metadata } from 'next'

import { ProjectsIndex } from '@/components/projects'
import { Container, PageHeader } from '@/components/shared'
import { projects } from '@/content'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Selected projects: the problem, my role, the stack and the results.',
  alternates: { canonical: '/projects/' },
}

export default function ProjectsPage() {
  return (
    <Container as="section">
      <PageHeader
        eyebrow="WORK"
        title="Projects"
        description="Longer pieces of work, written up as case studies: the problem, the approach, and what changed. Some of it sits under NDA, so the detail stays at the architecture level."
      />
      <ProjectsIndex projects={projects} className="pb-16" />
      <p className="border-t border-border pt-8 pb-16 font-mono text-xs text-muted-foreground">
        Covers are generated SVG placeholders derived from each project&apos;s slug. Roles and
        periods come straight from the CV; problem write-ups, approach detail and outcomes ship
        marked TODO(agustin) until real case-study copy is ready.
      </p>
    </Container>
  )
}
