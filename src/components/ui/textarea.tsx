import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.ComponentProps<'textarea'> {
  /** Renders the destructive border + message below the field, and wires `aria-invalid` / `aria-describedby`. */
  error?: string
}

function Textarea({
  className,
  id,
  error,
  ref,
  'aria-describedby': describedByProp,
  'aria-invalid': ariaInvalidProp,
  ...props
}: TextareaProps) {
  const generatedId = React.useId()
  const textareaId = id ?? generatedId
  const errorId = error ? `${textareaId}-error` : undefined
  const describedBy = [errorId, describedByProp].filter(Boolean).join(' ') || undefined

  return (
    <div className="w-full">
      <textarea
        ref={ref}
        id={textareaId}
        data-slot="textarea"
        aria-invalid={error ? true : ariaInvalidProp}
        aria-describedby={describedBy}
        className={cn(
          'flex field-sizing-content min-h-[120px] w-full rounded-lg border border-input bg-input px-3 py-2.5 text-[15px] text-foreground transition-colors outline-none placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
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

export { Textarea }
