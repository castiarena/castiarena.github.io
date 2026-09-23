'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'

import { ContactDialog } from '@/components/contact'
import { Container } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'

import { isNavActive } from './is-nav-active'
import { Logo } from './logo'
import { MobileNav } from './mobile-nav'
import { NavItem } from './nav-item'
import { ThemeToggle } from './theme-toggle'
import { useHeaderScrolled } from './use-header-scrolled'

/**
 * The pathname Next.js resolves for the statically exported not-found page (confirmed by building
 * and serving `out/404.html` directly — see docs/handoffs/U1.md, Decisions). It does not catch a
 * `notFound()` thrown from inside another route (the URL there stays whatever was requested), which
 * is a known limitation of pathname-only detection on a fully static export.
 */
const NOT_FOUND_PATHNAME = '/404'

const NAV_ITEMS = [{ href: '/', label: 'Home' }, ...siteConfig.nav]

export function SiteHeader() {
  const pathname = usePathname()
  const scrolled = useHeaderScrolled()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isNotFound = pathname === NOT_FOUND_PATHNAME

  return (
    <header
      className={cn(
        'sticky top-0 z-40 h-16 border-b border-border transition-[background-color,backdrop-filter,border-color] duration-(--dur-ui) ease-(--ease-brand) md:h-[72px]',
        scrolled ? 'bg-background/80 backdrop-blur-md' : 'border-transparent bg-transparent',
      )}
    >
      <Container className="flex h-full items-center justify-between gap-4">
        <Logo />

        {!isNotFound && (
          <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
            {NAV_ITEMS.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                active={isNavActive(pathname, item.href)}
              />
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          {!isNotFound && <ThemeToggle />}

          <ContactDialog
            trigger={
              <Button className={cn(!isNotFound && 'hidden md:inline-flex')}>Contact</Button>
            }
          />

          {!isNotFound && (
            <MobileNav
              open={mobileOpen}
              onOpenChange={setMobileOpen}
              items={NAV_ITEMS}
              pathname={pathname}
            />
          )}
        </div>
      </Container>
    </header>
  )
}
