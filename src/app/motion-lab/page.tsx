import type { Metadata } from 'next'

import {
  CountUp,
  HoverLift,
  ParallaxLayer,
  Reveal,
  ScrollProgress,
  Stagger,
  StaggerItem,
} from '@/components/motion'

// TEMPORARY demo route for the motion primitives (agent 1.3). Agent 4.1 deletes it before release.

export const metadata: Metadata = {
  title: 'Motion lab',
  description: 'Internal demo of the motion primitives.',
  robots: { index: false, follow: false },
}

const stats = [
  { value: 35, suffix: '%', label: 'Scalability' },
  { value: 40, suffix: '%', label: 'Faster code review' },
  { value: 98, suffix: '%', label: 'Stakeholder satisfaction' },
  { value: 2.5, suffix: 'x', label: 'Decimal example' },
]

const items = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot']

function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-6 py-16">
      <h2 id={id} className="font-mono text-sm tracking-widest uppercase">
        {title}
      </h2>
      {children}
    </section>
  )
}

function Spacer({ label }: { label: string }) {
  return (
    <p className="flex h-[70vh] items-center justify-center rounded-lg border border-dashed border-current/20 text-sm">
      {label}
    </p>
  )
}

export default function MotionLabPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-32">
      <ScrollProgress />

      <header className="py-16">
        <h1 className="text-4xl font-semibold">Motion lab</h1>
        <p className="mt-2 max-w-prose">
          Every motion primitive, for manual QA. Content above the fold never animates on load;
          scroll down to see reveals.
        </p>
      </header>

      <Section id="reveal-above" title="Reveal (above the fold, stays static)">
        <Reveal className="rounded-lg border p-6">
          <p>This reveal is on screen at load, so it is never hidden.</p>
        </Reveal>
      </Section>

      <Spacer label="Scroll down" />

      <Section id="reveal" title="Reveal">
        <Reveal className="rounded-lg border p-6">
          <p>Default reveal: 16px, no delay.</p>
        </Reveal>
        <Reveal as="section" delay={0.15} y={32} className="rounded-lg border p-6">
          <p>Section reveal with delay 0.15s and y 32px.</p>
        </Reveal>
        <ul className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Reveal key={i} as="li" delay={i * 0.1} className="rounded-lg border p-6">
              List item reveal {i + 1}
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section id="stagger" title="Stagger / StaggerItem">
        <Stagger as="ul" className="grid gap-4 sm:grid-cols-3">
          {items.map((item) => (
            <StaggerItem key={item} as="li" className="rounded-lg border p-6">
              {item}
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      <Section id="hover-lift" title="HoverLift">
        <div className="grid gap-4 sm:grid-cols-3">
          {['Card one', 'Card two', 'Card three'].map((card) => (
            <HoverLift key={card} className="rounded-lg border p-6">
              <h3 className="font-semibold">{card}</h3>
              <a href="#hover-lift" className="mt-2 inline-block underline">
                Focusable link
              </a>
            </HoverLift>
          ))}
        </div>
      </Section>

      <Section id="count-up" title="CountUp">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border p-6">
              <dt className="text-sm">{stat.label}</dt>
              <dd className="text-4xl font-semibold tabular-nums">
                <CountUp value={stat.value} suffix={stat.suffix} />
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section id="parallax" title="ParallaxLayer">
        <div className="relative overflow-hidden rounded-lg border p-16">
          <ParallaxLayer offset={60}>
            <p className="text-center text-2xl font-semibold">Parallax layer (±60px)</p>
          </ParallaxLayer>
        </div>
      </Section>

      <Spacer label="End of lab" />
    </div>
  )
}
