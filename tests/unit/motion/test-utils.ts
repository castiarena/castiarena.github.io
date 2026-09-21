import { vi } from 'vitest'

type IOCallback = (entries: Partial<IntersectionObserverEntry>[]) => void

/** Minimal IntersectionObserver mock. `intersectAll()` reports every observed element as fully in view. */
export function mockIntersectionObserver() {
  const observers = new Set<{ callback: IOCallback; elements: Set<Element> }>()

  class MockIntersectionObserver {
    private readonly entry: { callback: IOCallback; elements: Set<Element> }
    readonly root = null
    readonly rootMargin = '0px'
    readonly thresholds = [0]
    constructor(callback: IOCallback) {
      this.entry = { callback, elements: new Set() }
      observers.add(this.entry)
    }
    observe(el: Element) {
      this.entry.elements.add(el)
    }
    unobserve(el: Element) {
      this.entry.elements.delete(el)
    }
    disconnect() {
      observers.delete(this.entry)
    }
    takeRecords() {
      return []
    }
  }

  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)

  return {
    intersectAll() {
      for (const { callback, elements } of observers) {
        callback(
          [...elements].map((target) => ({
            target,
            isIntersecting: true,
            intersectionRatio: 1,
          })),
        )
      }
    },
  }
}

/** Mocks `matchMedia` so that `(prefers-reduced-motion: reduce)` matches when `reduce` is true. */
export function mockReducedMotion(reduce: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: reduce && query.includes('prefers-reduced-motion: reduce'),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  )
}

/** Places every element below the fold (jsdom has no layout, so all rects are 0 by default). */
export function mockBelowFold() {
  return vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: window.innerHeight + 500,
    top: window.innerHeight + 500,
    bottom: window.innerHeight + 600,
    left: 0,
    right: 100,
    width: 100,
    height: 100,
    toJSON: () => ({}),
  } as DOMRect)
}

export const nextFrames = () => new Promise((resolve) => setTimeout(resolve, 100))
