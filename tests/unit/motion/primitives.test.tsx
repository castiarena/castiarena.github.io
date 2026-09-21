import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  CountUp,
  HoverLift,
  MotionProvider,
  ParallaxLayer,
  Reveal,
  ScrollProgress,
  Stagger,
  StaggerItem,
} from '@/components/motion'

import {
  mockBelowFold,
  mockIntersectionObserver,
  mockReducedMotion,
  nextFrames,
} from './test-utils'

function Lab({ children }: { children?: ReactNode }) {
  return (
    <MotionProvider>
      <Reveal>Reveal child</Reveal>
      <Reveal as="section" delay={0.2} y={32}>
        Section child
      </Reveal>
      <Stagger as="ul">
        <StaggerItem as="li">Stagger one</StaggerItem>
        <StaggerItem as="li">Stagger two</StaggerItem>
      </Stagger>
      <HoverLift>Lift child</HoverLift>
      <CountUp value={35} suffix="%" />
      <ParallaxLayer>Parallax child</ParallaxLayer>
      <ScrollProgress />
      {children}
    </MotionProvider>
  )
}

function inlineTransforms(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>('*'))
    .map((el) => el.style.transform)
    .filter(Boolean)
}

let io: ReturnType<typeof mockIntersectionObserver>

beforeEach(() => {
  io = mockIntersectionObserver()
  mockReducedMotion(false)
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('motion primitives', () => {
  it('render their children', () => {
    render(<Lab />)
    for (const text of [
      'Reveal child',
      'Section child',
      'Stagger one',
      'Stagger two',
      'Lift child',
      'Parallax child',
    ]) {
      expect(screen.getByText(text)).toBeInTheDocument()
    }
    expect(screen.getByText('Section child').tagName).toBe('SECTION')
    expect(screen.getByText('Stagger one').tagName).toBe('LI')
    expect(screen.getByText('Stagger one').parentElement?.tagName).toBe('UL')
  })

  it('server HTML is static and fully visible (no inline opacity or transform)', () => {
    const html = renderToString(<Lab />)
    expect(html).not.toMatch(/opacity/)
    expect(html).not.toMatch(/transform/)
    expect(html).toContain('Reveal child')
  })

  it('does not hide elements that are already on screen at load', async () => {
    const { container } = render(<Lab />)
    await act(nextFrames)
    const styled = Array.from(container.querySelectorAll<HTMLElement>('*')).filter(
      (el) => el.style.opacity === '0',
    )
    expect(styled).toHaveLength(0)
  })

  it('hides below-the-fold reveals and shows them when they enter the viewport', async () => {
    mockBelowFold()
    render(<Lab />)
    const reveal = screen.getByText('Reveal child')
    await waitFor(() => expect(reveal.style.opacity).toBe('0'))
    expect(reveal.style.transform).toContain('translateY(16px)')

    act(() => io.intersectAll())
    await waitFor(() => expect(reveal.style.opacity).toBe('1'), { timeout: 2000 })
  })
})

describe('CountUp', () => {
  it('renders the final value in SSR output', () => {
    const html = renderToString(<CountUp value={98} suffix="%" />)
    expect(html).toContain('98')
    expect(html).toContain('%')
  })

  it('exposes the final value to assistive tech once and hides the animated digits', () => {
    const { container } = render(<CountUp value={1250.5} suffix="+" />)
    expect(container.querySelector('.sr-only')).toHaveTextContent('1,250.5+')
    const digits = container.querySelector('[data-count-up]')
    expect(digits).toHaveAttribute('aria-hidden', 'true')
    expect(digits).toHaveTextContent('1,250.5+')
  })

  it('shows the final value immediately with reduced motion', async () => {
    mockReducedMotion(true)
    mockBelowFold()
    const { container } = render(<CountUp value={40} suffix="%" />)
    await act(nextFrames)
    expect(container.querySelector('[data-count-up]')).toHaveTextContent('40%')
  })

  it('counts up from 0 once a below-the-fold counter enters the viewport', async () => {
    mockBelowFold()
    const { container } = render(<CountUp value={25} suffix="%" duration={0.05} />)
    const digits = container.querySelector('[data-count-up]')
    await waitFor(() => expect(digits).toHaveTextContent('0%'))
    act(() => io.intersectAll())
    await waitFor(() => expect(digits).toHaveTextContent('25%'), { timeout: 2000 })
  })
})

describe('reduced motion', () => {
  it('applies no transform style, even below the fold, in view, and on hover', async () => {
    mockReducedMotion(true)
    mockBelowFold()
    const { container } = render(<Lab />)
    await act(nextFrames)
    act(() => io.intersectAll())
    await act(nextFrames)
    expect(inlineTransforms(container)).toEqual([])
    expect(screen.getByText('Reveal child').style.opacity).toBe('')
    // ScrollProgress renders nothing under reduced motion.
    expect(container.querySelector('.fixed')).toBeNull()
  })
})
