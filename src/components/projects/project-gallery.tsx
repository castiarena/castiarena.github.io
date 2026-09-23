'use client'

import Image from 'next/image'
import { useCallback, useRef, useState } from 'react'

import { CoverGradient } from '@/components/shared'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import type { Project } from '@/content'

import { getProjectGalleryItems } from './gallery-items'

export interface ProjectGalleryProps {
  project: Project
}

/**
 * Thumbnail grid + dialog lightbox (`03-page-specs.md` → Project detail §6). Radix's dialog traps
 * focus and closes on Esc for free, but its automatic focus-restore-on-close only targets a
 * `Dialog.Trigger` — we don't render one per thumbnail (they're plain buttons driving `openIndex`
 * from outside the dialog), so `onCloseAutoFocus` below restores focus itself, to whichever
 * thumbnail was clicked (tracked separately from `openIndex`, which also changes on arrow-key
 * navigation and would otherwise point at the wrong thumbnail).
 */
export function ProjectGallery({ project }: ProjectGalleryProps) {
  const items = getProjectGalleryItems(project)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const openedFromIndex = useRef<number | null>(null)
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([])

  const open = useCallback((index: number) => {
    openedFromIndex.current = index
    setOpenIndex(index)
  }, [])

  const move = useCallback(
    (delta: number) => {
      setOpenIndex((current) => {
        if (current === null) return current
        return (current + delta + items.length) % items.length
      })
    },
    [items.length],
  )

  if (items.length === 0) return null

  const active = openIndex !== null ? items[openIndex]! : null

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-h2 font-semibold">Gallery</h2>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {items.map((item, index) => (
          <li key={item.seed}>
            <button
              type="button"
              ref={(el) => {
                thumbnailRefs.current[index] = el
              }}
              onClick={() => open(index)}
              className="relative block aspect-[16/10] w-full overflow-hidden rounded-lg"
            >
              {item.src ? (
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <CoverGradient seed={item.seed} label={item.alt} />
              )}
            </button>
          </li>
        ))}
      </ul>
      <p className="font-mono text-xs text-muted-foreground">
        Opens a dialog lightbox: arrow keys move, Esc closes, focus returns to the thumbnail. Alt
        text shows as the caption.
      </p>

      <Dialog open={openIndex !== null} onOpenChange={(next) => !next && setOpenIndex(null)}>
        <DialogContent
          showCloseButton
          className="max-w-3xl"
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            const index = openedFromIndex.current
            if (index !== null) thumbnailRefs.current[index]?.focus()
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight') {
              event.preventDefault()
              move(1)
            } else if (event.key === 'ArrowLeft') {
              event.preventDefault()
              move(-1)
            }
          }}
        >
          <DialogTitle className="sr-only">{active?.alt ?? 'Gallery image'}</DialogTitle>
          {active ? (
            <figure className="flex flex-col gap-3">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-md bg-muted">
                {active.src ? (
                  <Image
                    src={active.src}
                    alt={active.alt}
                    fill
                    sizes="90vw"
                    className="object-contain"
                  />
                ) : (
                  <CoverGradient seed={active.seed} label={active.alt} />
                )}
              </div>
              <figcaption className="text-sm text-muted-foreground">{active.alt}</figcaption>
              <p aria-live="polite" className="font-mono text-xs text-muted-foreground">
                {openIndex! + 1} of {items.length}
              </p>
            </figure>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
