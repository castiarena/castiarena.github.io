import type { Metadata } from 'next'

import { BioHeader, getTimelineGapNotes, OnThisPageRail, TimelineNode } from '@/components/bio'
import { Container, SectionHeading, StatTile, type StatTileAccent } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { achievements, courses, experiences, profile, skillGroups } from '@/content'

export const metadata: Metadata = {
  title: 'Bio',
  description: profile.summary[0],
  alternates: { canonical: '/bio/' },
}

// Same order as Home's impact strip (03-page-specs.md "Impact strip").
const ACHIEVEMENT_ACCENTS: StatTileAccent[] = ['brand', 'brand-2', 'brand-4', 'brand-3']

// Content titles are Title Case ("Scalability Enhancement"); the design (04-bio-desktop.png)
// renders them sentence case under the stat value ("Scalability enhancement").
function sentenceCase(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase()
}

export default function BioPage() {
  const gapNotes = getTimelineGapNotes(experiences)

  return (
    <Container>
      <BioHeader profile={profile} />

      <div className="flex flex-col gap-16 pb-24 lg:flex-row lg:items-start lg:gap-16">
        <OnThisPageRail />

        <div className="flex min-w-0 flex-1 flex-col gap-16 lg:gap-20">
          <section id="about" className="scroll-mt-24">
            <SectionHeading id="about-heading" title="About" />
            <div className="mt-6 flex max-w-[68ch] flex-col gap-4 text-base leading-[1.65] text-foreground">
              {profile.summary.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section id="experience" className="scroll-mt-24">
            <SectionHeading id="experience-heading" title="Experience" />
            <ol className="mt-6 flex flex-col">
              {experiences.map((experience, index) => (
                <TimelineNode
                  key={experience.id}
                  experience={experience}
                  last={index === experiences.length - 1}
                />
              ))}
            </ol>
            {gapNotes.map((note) => (
              <p key={note} className="mt-4 font-mono text-xs text-muted-foreground">
                {note}
              </p>
            ))}
          </section>

          <section id="achievements" className="scroll-mt-24">
            <SectionHeading id="achievements-heading" title="Key achievements" />
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {achievements.map((achievement, index) => (
                <StatTile
                  key={achievement.id}
                  value={achievement.metric.value}
                  unit={achievement.metric.unit}
                  label={sentenceCase(achievement.title)}
                  description={achievement.description}
                  accent={ACHIEVEMENT_ACCENTS[index % ACHIEVEMENT_ACCENTS.length] ?? 'brand'}
                  variant="card"
                />
              ))}
            </div>
          </section>

          <section id="skills" className="scroll-mt-24">
            <SectionHeading id="skills-heading" title="Skills" />
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {skillGroups.map((group) => (
                <div key={group.id} className="flex flex-col gap-3">
                  <p className="font-mono text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">
                    {group.label}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.skills.map((skill) => (
                      <Badge key={skill} variant={group.id === 'leadership' ? 'brand' : 'default'}>
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="training" className="scroll-mt-24">
            <SectionHeading id="training-heading" title="Training" />
            <ul className="mt-6 flex flex-col gap-3">
              {courses.map((course) => (
                <li key={course.title} className="flex flex-col gap-0.5">
                  {course.href ? (
                    <a
                      href={course.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-fit text-[15px] font-semibold text-foreground hover:text-brand"
                    >
                      {course.title}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    <p className="text-[15px] font-semibold text-foreground">{course.title}</p>
                  )}
                  <p className="text-sm text-muted-foreground">{course.provider}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </Container>
  )
}
