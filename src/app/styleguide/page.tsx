import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Mail } from 'lucide-react'

import {
  Container,
  ExternalLink,
  GradientText,
  PageHeader,
  SectionHeading,
  TagList,
} from '@/components/shared'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

import {
  NavigationMenuDemo,
  OverlayDemos,
  ThemePreviewToggle,
  ToggleDemos,
} from './_components/demos'

// TEMPORARY ROUTE — agent 4.1 deletes `src/app/styleguide/` before release.
export const metadata: Metadata = {
  title: 'Style guide',
  description: 'Design tokens, primitives and shared components.',
  robots: { index: false, follow: false },
}

const SURFACE_TOKENS = [
  ['background', 'foreground'],
  ['card', 'card-foreground'],
  ['popover', 'popover-foreground'],
  ['primary', 'primary-foreground'],
  ['secondary', 'secondary-foreground'],
  ['muted', 'muted-foreground'],
  ['accent', 'accent-foreground'],
  ['brand', 'brand-foreground'],
] as const

const SINGLE_TOKENS = ['brand-2', 'brand-3', 'destructive', 'border', 'input', 'ring'] as const

const TYPE_SCALE = [
  { className: 'text-display font-semibold', label: 'text-display', sample: 'Display' },
  { className: 'text-h1 font-semibold', label: 'text-h1', sample: 'Heading one' },
  { className: 'text-h2 font-semibold', label: 'text-h2', sample: 'Heading two' },
  { className: 'text-xl font-medium', label: 'text-xl', sample: 'Card title' },
  {
    className: 'text-base',
    label: 'text-base',
    sample: 'Body copy for paragraphs, set in Geist Sans.',
  },
  {
    className: 'text-sm text-muted-foreground',
    label: 'text-sm muted',
    sample: 'Secondary copy',
  },
  {
    className: 'font-mono text-xs tracking-[0.2em] uppercase',
    label: 'font-mono xs',
    sample: 'Feb 2023 — Present',
  },
] as const

function Section({
  id,
  title,
  description,
  children,
}: {
  id?: string
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-6 border-t py-12">
      <SectionHeading id={id} title={title} description={description} />
      {children}
    </section>
  )
}

function Demo({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-mono text-xs text-muted-foreground">{label}</p>
      <div className={cn('flex flex-wrap items-center gap-3', className)}>{children}</div>
    </div>
  )
}

function ThemePanel({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <div
      className={cn(
        theme,
        'flex flex-col gap-4 rounded-xl bg-background p-4 text-foreground ring-1 ring-border sm:p-6',
      )}
    >
      <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
        {theme} theme
      </p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label={`${theme} surface tokens`}>
        {SURFACE_TOKENS.map(([bg, fg]) => (
          <li
            key={bg}
            className="flex h-24 flex-col justify-between rounded-lg p-3 ring-1 ring-border"
            style={{ backgroundColor: `var(--${bg})`, color: `var(--${fg})` }}
          >
            <span className="text-sm font-medium">Aa</span>
            <span className="font-mono text-[0.7rem] leading-tight">
              --{bg}
              <br />
              --{fg}
            </span>
          </li>
        ))}
      </ul>
      <ul className="grid grid-cols-3 gap-3" aria-label={`${theme} accent tokens`}>
        {SINGLE_TOKENS.map((token) => (
          <li key={token} className="flex flex-col gap-1.5">
            <span
              className="h-10 rounded-md ring-1 ring-border"
              style={{ backgroundColor: `var(--${token})` }}
            />
            <span className="font-mono text-[0.7rem] text-muted-foreground">--{token}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-2">
        <div className="h-10 rounded-md bg-signature" />
        <p className="font-mono text-[0.7rem] text-muted-foreground">bg-signature</p>
      </div>
      <p className="text-h2 font-semibold">
        <GradientText>text-signature</GradientText>
      </p>
    </div>
  )
}

export default function StyleguidePage() {
  return (
    <Container className="pb-24">
      <PageHeader
        eyebrow="Internal · not indexed"
        title="Design system style guide"
        highlight="style guide"
        description="OKLCH tokens, the fluid type scale, every installed shadcn/ui primitive and the shared components. Temporary route for reviewers."
      >
        <div className="flex flex-wrap gap-3">
          <ThemePreviewToggle />
        </div>
      </PageHeader>

      <Section id="colors" title="Colour tokens" description="Both themes side by side.">
        <div className="grid gap-4 lg:grid-cols-2">
          <ThemePanel theme="light" />
          <ThemePanel theme="dark" />
        </div>
      </Section>

      <Section
        id="type"
        title="Type scale"
        description="Fluid clamp() sizes for display, h1 and h2."
      >
        <ul className="flex flex-col gap-6">
          {TYPE_SCALE.map((item) => (
            <li key={item.label} className="flex flex-col gap-1">
              <span className="font-mono text-xs text-muted-foreground">{item.label}</span>
              <span className={cn(item.className, 'break-words')}>{item.sample}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="primitives" title="Primitives" description="shadcn/ui (radix-nova) components.">
        <Demo label="Button · variants">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </Demo>
        <Demo label="Button · sizes">
          <Button size="xs">Extra small</Button>
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="Email">
            <Mail />
          </Button>
          <Button disabled>Disabled</Button>
          <Button className="bg-signature text-brand-foreground hover:opacity-90">Signature</Button>
        </Demo>
        <Demo label="Badge">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </Demo>
        <Demo label="Card" className="grid items-start gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Project card</CardTitle>
              <CardDescription>Summary line in muted foreground.</CardDescription>
              <CardAction>
                <Badge variant="outline">2024</Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <TagList tags={['Next.js', 'TypeScript', 'Tailwind']} />
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button size="sm" variant="outline">
                Read more
              </Button>
            </CardFooter>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardTitle>Skeleton</CardTitle>
              <CardDescription>Loading placeholder.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </Demo>
        <Demo label="Navigation menu">
          <NavigationMenuDemo />
        </Demo>
        <Demo label="Dialog · Sheet · Tooltip · Sonner">
          <OverlayDemos />
        </Demo>
        <Demo label="Toggle group · Toggle">
          <ToggleDemos />
        </Demo>
        <Demo label="Field · Label · Input · Textarea" className="block">
          <form className="max-w-md" aria-label="Style guide form demo">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="sg-name">Name</FieldLabel>
                <Input id="sg-name" name="name" placeholder="Ada Lovelace" autoComplete="off" />
              </Field>
              <Field data-invalid="true">
                <FieldLabel htmlFor="sg-email">Email</FieldLabel>
                <Input id="sg-email" name="email" type="email" aria-invalid="true" />
                <FieldDescription>Invalid state styling.</FieldDescription>
              </Field>
              <Field>
                <Label htmlFor="sg-message">Message (plain Label)</Label>
                <Textarea id="sg-message" name="message" placeholder="Say hi…" />
              </Field>
            </FieldGroup>
          </form>
        </Demo>
        <Demo label="Separator">
          <div className="flex h-5 items-center gap-3 text-sm">
            <span>Bio</span>
            <Separator orientation="vertical" />
            <span>Projects</span>
            <Separator orientation="vertical" />
            <span>Experiments</span>
          </div>
        </Demo>
        <Demo label="Scroll area · Aspect ratio" className="grid items-start gap-4 sm:grid-cols-2">
          <ScrollArea className="h-40 rounded-lg ring-1 ring-border">
            <ul className="p-4 text-sm">
              {Array.from({ length: 20 }, (_, i) => (
                <li key={i} className="border-b py-1.5 last:border-0">
                  Scrollable row {i + 1}
                </li>
              ))}
            </ul>
          </ScrollArea>
          <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-lg">
            <div className="flex size-full items-center justify-center bg-signature font-mono text-sm text-brand-foreground">
              16 / 9
            </div>
          </AspectRatio>
        </Demo>
      </Section>

      <Section
        id="shared-components"
        title="Shared components"
        description="Exported from @/components/shared."
      >
        <Demo label="PageHeader (rendered at the top of this page)">
          <p className="text-sm text-muted-foreground">
            eyebrow · title with <code className="font-mono">highlight</code> · description ·
            children
          </p>
        </Demo>
        <Demo label="SectionHeading (every section on this page)">
          <p className="text-sm text-muted-foreground">
            Hover a heading to reveal its # permalink.
          </p>
        </Demo>
        <Demo label="TagList">
          <TagList tags={['React', 'TypeScript', 'Motion', 'OKLCH', 'WebGL']} />
        </Demo>
        <Demo label="ExternalLink">
          <ExternalLink href="https://github.com/castiarena" className="text-brand">
            GitHub profile
          </ExternalLink>
          <ExternalLink href="https://nextjs.org" showIcon={false}>
            Without icon
          </ExternalLink>
        </Demo>
        <Demo label="GradientText">
          <p className="text-h2 font-semibold">
            Calm, technical, <GradientText>bright accents</GradientText>.
          </p>
        </Demo>
        <Demo label="Container">
          <p className="text-sm text-muted-foreground">
            This page is wrapped in <code className="font-mono">Container</code> (
            <code className="font-mono">container-page</code>: max-w-6xl, px-4 sm:px-6).
          </p>
        </Demo>
      </Section>
    </Container>
  )
}
