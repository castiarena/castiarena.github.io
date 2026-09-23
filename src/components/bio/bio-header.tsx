import { Download, MapPin } from 'lucide-react'
import Image from 'next/image'

import { buttonVariants } from '@/components/ui/button'
import type { Profile } from '@/content/types'

// `Button asChild` (Radix `Slot`) throws "Slot failed to slot onto its children" whenever
// `loading` is left at its default `false` — see the CCR in docs/handoffs/U3.md. Rendering the
// anchors directly with `buttonVariants` sidesteps `Slot` entirely while keeping the exact same
// classes `ui/button.tsx` (owned by F2) defines.

export interface BioHeaderProps {
  profile: Profile
}

/** Bio page header: eyebrow, name, subtitle, location, CV/social buttons, and the avatar. */
export function BioHeader({ profile }: BioHeaderProps) {
  const linkedin = profile.socials.find((social) => social.label === 'LinkedIn')
  const github = profile.socials.find((social) => social.label === 'GitHub')

  return (
    <div className="flex flex-col-reverse items-start gap-8 py-12 sm:py-16 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-4">
        <p className="font-mono text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">
          Bio
        </p>
        <h1 className="text-h1 font-semibold text-balance">{profile.name}</h1>
        <p className="text-lg text-muted-foreground">
          {profile.role} · {profile.yearsOfExperience}+ years
        </p>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin aria-hidden="true" className="size-3.5" />
          {profile.location}
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a
            href={profile.cvHref}
            download
            className={buttonVariants({ size: 'lg', className: 'w-full sm:w-auto' })}
          >
            <Download aria-hidden="true" />
            Download CV
            {/* 03-page-specs.md calls for 90% opacity here, but that drops light-theme
                brand-foreground/brand contrast below 4.5:1 (axe: serious color-contrast) — the
                mono/size distinction alone still reads as secondary without it. */}
            <span className="font-mono text-xs">PDF · 1.6 MB</span>
          </a>
          {linkedin ? (
            <a
              href={linkedin.href}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({
                variant: 'outline',
                size: 'lg',
                className: 'w-full sm:w-auto',
              })}
            >
              LinkedIn
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : null}
          {github ? (
            <a
              href={github.href}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({
                variant: 'outline',
                size: 'lg',
                className: 'w-full sm:w-auto',
              })}
            >
              GitHub
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : null}
        </div>
      </div>

      <div className="size-[120px] shrink-0 rounded-lg bg-signature p-0.5 lg:size-[220px]">
        <div className="size-full rounded-lg bg-background p-[3px]">
          <div className="relative size-full overflow-hidden rounded-lg">
            <Image
              src={profile.avatar.src}
              alt={profile.avatar.alt}
              fill
              sizes="(min-width: 1024px) 220px, 120px"
              priority
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
