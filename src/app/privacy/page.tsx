import type { Metadata } from 'next'

import { Container, ExternalLink, PageHeader, ProseList, SectionHeading } from '@/components/shared'
import { profile } from '@/content'

const DESCRIPTION =
  'What this site measures, the cookies Google Analytics sets once you accept, and how to change your mind.'

export const metadata: Metadata = {
  title: 'Privacy',
  description: DESCRIPTION,
  alternates: { canonical: '/privacy/' },
}

/**
 * Static policy page behind the consent banner and the footer. Deliberately not in
 * `siteConfig.nav` — it belongs in the footer, not the header — but it is in `sitemap.ts`.
 *
 * Every claim here has to match what the code actually does (`src/lib/analytics/`) and the GA4
 * property settings listed in `docs/analytics-plan.md`. Change one, change the other.
 */
export default function PrivacyPage() {
  return (
    <Container as="section">
      <PageHeader eyebrow="PRIVACY" title="Privacy" description={DESCRIPTION} />

      <div className="flex max-w-prose flex-col gap-12 pb-16">
        <section className="flex flex-col gap-4">
          <SectionHeading title="The short version" />
          <p className="text-[15px] leading-relaxed text-pretty">
            This is a personal portfolio. I want to know roughly how many people visit, where they
            came from, and which work they look at — nothing more. Google Analytics 4 does that
            measuring, and it is only loaded if you press <strong>Accept</strong> on the banner.
            Until then no analytics script is requested and no analytics cookie exists.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <SectionHeading title="What is measured" />
          <ProseList
            items={[
              'Page views: which pages you open and when, including navigations within the site.',
              'Where you came from: the referring site, or the search engine / campaign that sent you.',
              'Approximate location (country and region), derived from your IP address by Google.',
              'Device basics: browser, operating system, screen size, and whether you are on mobile.',
              'Interactions I instrument deliberately: opening the contact dialog, submitting it, following an outbound link, opening a case study, switching the theme.',
            ]}
          />
          <p className="text-[15px] leading-relaxed text-pretty">
            What is never sent: anything you type. No form field values, no email addresses, no free
            text, no message contents.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <SectionHeading title="Cookies" />
          <p className="text-[15px] leading-relaxed text-pretty">
            Google Analytics sets two cookies, both first-party, both only after you accept:
          </p>
          <ProseList
            items={[
              '_ga — a randomly generated ID that distinguishes one browser from another. Expires after 2 years.',
              '_ga_<measurement-id> — the state of your current visit, so a reload is not counted as a new one. Expires after 2 years.',
            ]}
          />
          <p className="text-[15px] leading-relaxed text-pretty">
            Your answer to the banner is not a cookie. It is kept in your browser&apos;s
            <code className="mx-1 font-mono text-[13px]">localStorage</code>
            under <code className="font-mono text-[13px]">castiarena:consent</code>, and it never
            leaves your device. An Accept is remembered for 12 months and a Decline for 6, after
            which the banner asks once more.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <SectionHeading title="What I have switched off" />
          <ProseList
            items={[
              'IP addresses: GA4 uses yours to work out an approximate location and then discards it. It is not logged or stored, and I never see it.',
              'Google signals is off, so nothing is joined to a Google account and no data feeds ad personalisation.',
              'Data retention is set to 2 months — the shortest GA4 allows. After that, the event-level data is deleted and only aggregate reports remain.',
              'No session replay, no heatmaps, no A/B testing, no advertising or remarketing tags, no third-party analytics besides GA4.',
            ]}
          />
        </section>

        <section className="flex flex-col gap-4">
          <SectionHeading title="Changing your mind" />
          <p className="text-[15px] leading-relaxed text-pretty">
            Use <strong>Cookie preferences</strong> in the footer at the bottom of any page. Picking{' '}
            <strong>Decline</strong> after having accepted deletes the
            <code className="mx-1 font-mono text-[13px]">_ga</code> cookies and reloads the page, so
            the analytics script that was already running stops reporting immediately.
          </p>
          <p className="text-[15px] leading-relaxed text-pretty">
            Blocking cookies or JavaScript for this site works too: the whole site is static HTML
            and reads fine without either. You can also ask Google directly to stop measuring you
            anywhere with their{' '}
            <ExternalLink
              href="https://tools.google.com/dlpage/gaoptout"
              className="text-brand"
              showIcon={false}
            >
              browser opt-out add-on
            </ExternalLink>
            .
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <SectionHeading title="The contact form" />
          <p className="text-[15px] leading-relaxed text-pretty">
            Separate from analytics, and not covered by the banner: if you send me a message, the
            name, email address and message you typed go to a small email API of mine so that it can
            reach my inbox and I can reply. Cloudflare Turnstile checks the submission to keep spam
            out. Nothing from the form is sent to Google Analytics — only the fact that a submission
            happened.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <SectionHeading title="Questions" />
          <p className="text-[15px] leading-relaxed text-pretty">
            Write to{' '}
            <a
              href={`mailto:${profile.email}`}
              className="text-brand underline-offset-4 hover:underline"
            >
              {profile.email}
            </a>{' '}
            and I will answer. If you want the data associated with your visits deleted, say so and
            I will delete it from the property.
          </p>
        </section>
      </div>
    </Container>
  )
}
