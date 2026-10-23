'use client'

import { useEffect, useEffectEvent, useImperativeHandle, useRef, useState } from 'react'
import type { Ref } from 'react'
import { useTheme } from 'next-themes'

import { cn } from '@/lib/utils'

export const TURNSTILE_SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

interface TurnstileRenderOptions {
  sitekey: string
  callback: (token: string) => void
  'expired-callback': () => void
  'error-callback': () => void
  theme: 'light' | 'dark' | 'auto'
  size: 'normal' | 'flexible' | 'compact'
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string | undefined
  reset: (widgetId: string) => void
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

// One script tag per page, injected the first time a form mounts (never on page load). A failed
// load clears the promise so the next mount can try again.
let scriptPromise: Promise<TurnstileApi> | null = null

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  scriptPromise ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = TURNSTILE_SCRIPT_SRC
    script.async = true
    script.onload = () => {
      if (window.turnstile) resolve(window.turnstile)
      else reject(new Error('Turnstile did not initialise'))
    }
    script.onerror = () => reject(new Error('Turnstile failed to load'))
    document.head.appendChild(script)
  }).catch((error: unknown) => {
    scriptPromise = null
    throw error
  })
  return scriptPromise
}

/** @internal Test-only: forget the cached script promise between tests. */
export function resetTurnstileLoaderForTests() {
  scriptPromise = null
}

export interface TurnstileWidgetHandle {
  /** Gets a fresh challenge. Tokens are single-use, so call this after every API request. */
  reset: () => void
}

export interface TurnstileWidgetProps {
  siteKey: string
  /** Called with a fresh token, or `null` once the current one expires or errors. */
  onTokenChange: (token: string | null) => void
  ref?: Ref<TurnstileWidgetHandle>
  className?: string
}

export function TurnstileWidget({ siteKey, onTokenChange, ref, className }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const { resolvedTheme } = useTheme()
  const theme = resolvedTheme === 'dark' || resolvedTheme === 'light' ? resolvedTheme : 'auto'

  const emitToken = useEffectEvent((token: string | null) => onTokenChange(token))

  useImperativeHandle(ref, () => ({
    reset() {
      onTokenChange(null)
      if (widgetIdRef.current) window.turnstile?.reset(widgetIdRef.current)
    },
  }))

  useEffect(() => {
    let cancelled = false

    loadTurnstile().then(
      (turnstile) => {
        const container = containerRef.current
        if (cancelled || !container) return
        widgetIdRef.current =
          turnstile.render(container, {
            sitekey: siteKey,
            callback: (token) => emitToken(token),
            'expired-callback': () => emitToken(null),
            'error-callback': () => emitToken(null),
            theme,
            size: 'flexible',
          }) ?? null
      },
      () => {
        if (!cancelled) setLoadFailed(true)
      },
    )

    return () => {
      cancelled = true
      // The dialog unmounts the form on close, and a re-render with a new theme starts over, so
      // always remove the old widget rather than leaking iframes.
      if (widgetIdRef.current) window.turnstile?.remove(widgetIdRef.current)
      widgetIdRef.current = null
      emitToken(null)
    }
  }, [siteKey, theme])

  if (loadFailed) {
    return (
      <p role="alert" className={cn('text-sm text-destructive', className)}>
        The spam check couldn&apos;t load (a content blocker, maybe). Use &ldquo;Copy email&rdquo;
        to reach me directly.
      </p>
    )
  }

  return <div ref={containerRef} className={cn('min-h-[65px] w-full', className)} />
}
