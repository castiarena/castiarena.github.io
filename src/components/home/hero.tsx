import { ArrowRight, MapPin } from 'lucide-react'
import Image from 'next/image'
import type { Route } from 'next'
import Link from 'next/link'

import { ContactDialog } from '@/components/contact'
import { Reveal, Stagger, StaggerItem } from '@/components/motion'
import { GradientText } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { profile } from '@/content'

/**
 * Hero always starts above the fold, so `Stagger`/`Reveal` render it statically (per
 * `useArmedReveal`'s documented rule: only content that starts below the fold is hidden and
 * animated — the same reason the impact strip's `CountUp` values render at their final number
 * instead of counting up when they're already on screen at load). Reusing them here keeps the
 * hero on the same "never flash visible content to hidden" guarantee the rest of the site has,
 * rather than inventing a one-off entrance animation that would fight that guarantee.
 */
export function Hero() {
  return (
    <section className="bg-hero-mesh relative overflow-hidden">
      <div className="container-page grid gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-24">
        <div className="order-2 flex flex-col gap-6 lg:order-1 lg:max-w-[620px]">
          <p className="flex items-center gap-1.5 font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
            <MapPin aria-hidden="true" className="size-3" />
            {profile.location}
          </p>
          <Stagger stagger={0.06} className="flex flex-col gap-6">
            <StaggerItem>
              <h1 className="text-display leading-[1.02] text-balance">
                <span className="text-foreground">{profile.name}</span>
                <br />
                <GradientText>{profile.role}</GradientText>
              </h1>
            </StaggerItem>
            <StaggerItem>
              <p className="max-w-[46ch] text-lg text-pretty text-muted-foreground">
                {profile.tagline}
              </p>
            </StaggerItem>
            <StaggerItem className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href={'/projects/' as Route}>
                  View projects
                  <ArrowRight data-position="end" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link href={'/bio/' as Route}>Read bio</Link>
              </Button>
              <ContactDialog
                trigger={
                  <Button size="lg" variant="ghost" className="hidden md:inline-flex">
                    Get in touch
                  </Button>
                }
              />
            </StaggerItem>
          </Stagger>
        </div>

        <Reveal className="order-1 flex justify-center lg:order-2 lg:justify-end">
          <div className="size-24 shrink-0 rounded-full bg-signature p-[2px] lg:size-[200px]">
            <div className="size-full rounded-full bg-background p-[3px]">
              <div className="relative size-full overflow-hidden rounded-full">
                <Image
                  src={profile.avatar.src}
                  alt={profile.avatar.alt}
                  width={200}
                  height={200}
                  priority
                  sizes="(min-width: 1024px) 200px, 96px"
                  className="size-full object-cover"
                />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
