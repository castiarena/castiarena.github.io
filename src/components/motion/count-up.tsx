'use client'

export interface CountUpProps {
  value: number
  suffix?: string
  className?: string
}

// STUB — implemented by agent 1.3
export function CountUp({ value, suffix, className }: CountUpProps) {
  return (
    <span className={className}>
      {value}
      {suffix}
    </span>
  )
}
