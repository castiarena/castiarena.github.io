import { Stagger, StaggerItem } from '@/components/motion'
import { StatTile, type StatTileAccent } from '@/components/shared'
import { achievements } from '@/content'

// Stat accent order per `01-design-tokens.md` §1 / `03-page-specs.md` §2: brand, brand-2,
// brand-4, brand-3 — the same order `project-outcomes.tsx` uses for the analogous section on a
// project detail page.
const ACCENTS: StatTileAccent[] = ['brand', 'brand-2', 'brand-4', 'brand-3']

/** `--card` band with hairline borders, 4 bare `StatTile`s (Home §2). */
export function ImpactStrip() {
  return (
    <section className="bg-card py-12 hairline-b hairline-t">
      <div className="container-page">
        <Stagger stagger={0.06} as="ul" className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-6">
          {achievements.map((achievement, index) => (
            <StaggerItem key={achievement.id} as="li">
              <StatTile
                value={achievement.metric.value}
                unit={achievement.metric.unit}
                label={achievement.title}
                description={achievement.description}
                accent={ACCENTS[index % ACCENTS.length] ?? 'brand'}
                variant="bare"
              />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
