'use client'

import { useEffect, useRef } from 'react'
import type { Route } from 'next'
import Link from 'next/link'
import { MenuIcon } from 'lucide-react'

import { ContactDialog } from '@/components/contact'
import { ExternalLink } from '@/components/shared'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { profile } from '@/content'

import { isNavActive } from './is-nav-active'

export interface MobileNavItem {
  href: Route | string
  label: string
}

export interface MobileNavProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: MobileNavItem[]
  pathname: string
}

const ELSEWHERE_LABELS = ['LinkedIn', 'GitHub'] as const

/**
 * Screen 10. The hamburger is rendered here as a real `SheetTrigger` (not a separate button that
 * imperatively sets `open`), because Radix's default `onCloseAutoFocus` calls
 * `context.triggerRef.current?.focus()` — it targets the registered trigger specifically, not
 * whatever `document.activeElement` happened to be before opening. A same-looking button outside
 * `SheetTrigger` would leave `triggerRef` unset and drop focus to `<body>` on close instead of
 * returning it to the hamburger. Closing on navigation is handled two ways: each link is wrapped in
 * `SheetClose asChild` for the click itself, and the `pathname` effect below is a backstop for any
 * other way the route could change while the sheet is open (browser back/forward).
 */
export function MobileNav({ open, onOpenChange, items, pathname }: MobileNavProps) {
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    onOpenChange(false)
    // Only re-run when the route actually changes, not when `onOpenChange` is re-created.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const elsewhereLinks = profile.socials.filter((social) =>
    (ELSEWHERE_LABELS as readonly string[]).includes(social.label),
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open menu"
        >
          <MenuIcon aria-hidden="true" />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="flex flex-col gap-0 p-0">
        <SheetHeader className="flex-row items-center gap-2 border-b border-border p-6">
          <SheetTitle className="flex items-center gap-2 font-mono text-sm font-normal lowercase">
            <span aria-hidden="true" className="size-2 rounded-full bg-brand-3" />
            menu
          </SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
        </SheetHeader>

        <nav aria-label="Mobile" className="flex flex-col">
          {items.map((item) => {
            const active = isNavActive(pathname, item.href)
            return (
              <SheetClose asChild key={item.href}>
                <Link
                  href={item.href as Route}
                  aria-current={active ? 'page' : undefined}
                  className="flex items-center justify-between border-b border-border px-6 py-4 text-xl font-semibold text-foreground"
                >
                  {item.label}
                  {active && (
                    <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-brand-3" />
                  )}
                </Link>
              </SheetClose>
            )
          })}
        </nav>

        <div className="p-6">
          <ContactDialog trigger={<Button className="w-full">Contact</Button>} />
        </div>

        <div className="mt-auto flex flex-col gap-3 border-t border-border p-6">
          <p className="font-mono text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">
            Elsewhere
          </p>
          <div className="flex flex-col gap-3">
            {elsewhereLinks.map((social) => (
              <ExternalLink key={social.label} href={social.href} className="text-brand">
                {social.label}
              </ExternalLink>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
