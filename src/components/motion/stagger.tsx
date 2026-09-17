'use client'

import type { ReactNode } from 'react'

export interface StaggerProps {
  children: ReactNode
  /** Delay in seconds between children. */
  stagger?: number
  className?: string
  as?: 'div' | 'section' | 'ul' | 'ol'
}

export interface StaggerItemProps {
  children: ReactNode
  className?: string
}

// STUB — implemented by agent 1.3
export function Stagger({ children, as: Tag = 'div', className }: StaggerProps) {
  return <Tag className={className}>{children}</Tag>
}

// STUB — implemented by agent 1.3
export function StaggerItem({ children, className }: StaggerItemProps) {
  return <div className={className}>{children}</div>
}
