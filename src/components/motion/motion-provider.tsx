'use client'

import { LazyMotion, MotionConfig } from 'motion/react'
import type { ReactNode } from 'react'

import { MOTION_DURATION_REVEAL, MOTION_EASE } from './shared'

const loadFeatures = () => import('./features').then((mod) => mod.domAnimation)

export interface MotionProviderProps {
  children: ReactNode
}

/**
 * App-wide motion defaults. `reducedMotion="user"` follows the OS setting, and `LazyMotion strict`
 * ships the `domAnimation` feature set (animations plus hover/tap/focus/in-view gestures) in a
 * separate chunk, loaded after hydration. It throws if a full (non-`m`) Motion component is rendered
 * inside, so always use `m.*`.
 */
export function MotionProvider({ children }: MotionProviderProps) {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ duration: MOTION_DURATION_REVEAL, ease: MOTION_EASE }}
    >
      <LazyMotion features={loadFeatures} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  )
}
