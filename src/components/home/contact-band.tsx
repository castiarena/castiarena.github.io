import { ContactDialog } from '@/components/contact'
import { Button } from '@/components/ui/button'
import { profile } from '@/content'

import { CopyEmailButton } from './copy-email-button'

/**
 * Full-bleed gradient band (01 §8). U6 has not merged yet, so the trigger is rendered directly
 * per the mission's fallback instruction — V1 switches this to `ContactCTA` once it lands.
 */
export function ContactBand() {
  return (
    <section className="relative hairline-t overflow-hidden bg-card py-16">
      <div aria-hidden="true" className="absolute inset-0 bg-signature opacity-[0.18]" />
      <div className="container-page relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex max-w-[46ch] flex-col gap-2">
          <h2 className="text-h2 font-semibold">Let&apos;s build something</h2>
          <p className="text-pretty text-muted-foreground">
            Frontend architecture, platform modernization, or growing a team. I usually reply
            within a couple of days.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="w-full sm:w-auto">
            <ContactDialog
              trigger={
                <Button size="lg" className="w-full sm:w-auto">
                  Get in touch
                </Button>
              }
            />
          </div>
          <CopyEmailButton email={profile.email} />
        </div>
      </div>
    </section>
  )
}
