import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.ComponentProps<'input'> {
  /** Renders the destructive border + message below the field, and wires `aria-invalid` / `aria-describedby`. */
  error?: string
}

function Input({
  className,
  type,
  id,
  error,
  ref,
  'aria-describedby': describedByProp,
  'aria-invalid': ariaInvalidProp,
  ...props
}: InputProps) {
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const errorId = error ? `${inputId}-error` : undefined
  const describedBy = [errorId, describedByProp].filter(Boolean).join(' ') || undefined

  return (
    <div className="w-full">
      <input
        ref={ref}
        id={inputId}
        type={type}
        data-slot="input"
        aria-invalid={error ? true : ariaInvalidProp}
        aria-describedby={describedBy}
        className={cn(
          'flex h-11 w-full min-w-0 rounded-lg border border-input bg-input px-3 text-[15px] text-foreground transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 text-[13px] text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export { Input }
