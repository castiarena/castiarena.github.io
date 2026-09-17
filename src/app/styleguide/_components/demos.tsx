'use client'

import { useSyncExternalStore } from 'react'
import { AlignCenter, AlignLeft, AlignRight, Moon, Sun } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Toaster } from '@/components/ui/sonner'
import { Toggle } from '@/components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

/**
 * Temporary: flips the `.dark` class on <html> so reviewers can see both themes before 2.1 wires
 * next-themes. Removed with the rest of the style guide by agent 4.1.
 */
function subscribeToThemeClass(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => observer.disconnect()
}

const isDarkClass = () => document.documentElement.classList.contains('dark')

export function ThemePreviewToggle() {
  const dark = useSyncExternalStore(subscribeToThemeClass, isDarkClass, () => false)

  return (
    <Button
      variant="outline"
      aria-pressed={dark}
      onClick={() => document.documentElement.classList.toggle('dark', !isDarkClass())}
    >
      {dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
      Preview dark theme
    </Button>
  )
}

export function OverlayDemos() {
  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog title</DialogTitle>
              <DialogDescription>Used by the contact dialog (2.6).</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button>Got it</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Open sheet</Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Sheet title</SheetTitle>
              <SheetDescription>Used by the mobile navigation (2.1).</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost">Hover for tooltip</Button>
          </TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>

        <Button
          variant="secondary"
          onClick={() => toast.success('Message sent', { description: 'Sonner toast demo.' })}
        >
          Show toast
        </Button>
      </div>
      <Toaster />
    </TooltipProvider>
  )
}

export function ToggleDemos() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <ToggleGroup type="single" variant="outline" defaultValue="left" aria-label="Text alignment">
        <ToggleGroupItem value="left" aria-label="Align left">
          <AlignLeft />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          <AlignCenter />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right">
          <AlignRight />
        </ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="multiple" defaultValue={['react']} aria-label="Filter by tag">
        <ToggleGroupItem value="react">React</ToggleGroupItem>
        <ToggleGroupItem value="css">CSS</ToggleGroupItem>
        <ToggleGroupItem value="webgl">WebGL</ToggleGroupItem>
      </ToggleGroup>
      <Toggle aria-label="Toggle bold">Toggle</Toggle>
    </div>
  )
}

export function NavigationMenuDemo() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Sections</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-64 gap-1 p-1">
              {['Bio', 'Projects', 'Experiments'].map((label) => (
                <li key={label}>
                  <NavigationMenuLink href={`#nav-${label.toLowerCase()}`}>
                    {label}
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#primitives">Primitives</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#shared-components">Shared</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
