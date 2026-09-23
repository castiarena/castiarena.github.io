import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2Icon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Slot } from 'radix-ui'

/**
 * Sizes are the visual box from 02-component-specs.md (sm 36 / default 40 / lg 44 / icon 40×40).
 * The tap area must stay ≥44×44 regardless, so every size below 44px gets a `::after` pseudo
 * element that expands the hit area without changing the visible box (from design).
 */
const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all duration-(--dur-ui) ease-(--ease-brand) outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg[data-position=end]]:transition-transform [&_svg[data-position=end]]:duration-(--dur-ui) [&_svg[data-position=end]]:ease-(--ease-brand) hover:[&_svg[data-position=end]]:translate-x-0.5 motion-reduce:[&_svg[data-position=end]]:translate-x-0",
  {
    variants: {
      variant: {
        default:
          'bg-brand text-brand-foreground hover:bg-[color-mix(in_oklch,var(--brand),white_4%)]',
        outline: 'border-border bg-transparent text-foreground hover:bg-muted',
        secondary: 'border-border bg-card text-foreground hover:bg-muted',
        ghost: 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
        destructive:
          'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40',
        link: 'text-brand underline-offset-4 hover:underline',
      },
      size: {
        default: "h-10 gap-2 px-4 after:absolute after:-inset-0.5 after:content-['']",
        xs: "h-6 gap-1 px-2 after:absolute after:-inset-2.5 after:content-['']",
        sm: "h-9 gap-1.5 px-3 after:absolute after:-inset-1 after:content-['']",
        lg: "h-11 gap-2 px-5 after:absolute after:content-['']",
        icon: "size-10 after:absolute after:-inset-0.5 after:content-['']",
        'icon-xs': "size-6 after:absolute after:-inset-2.5 after:content-['']",
        'icon-sm': "size-7 after:absolute after:-inset-2 after:content-['']",
        'icon-lg': "size-9 after:absolute after:-inset-1 after:content-['']",
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  loading = false,
  disabled,
  children,
  ref,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    /** Spinner replaces the leading icon, label stays, sets `aria-busy` and disables the button. */
    loading?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      ref={ref}
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size, className }), loading && 'opacity-90')}
      {...props}
    >
      {/* Two JSX children are an array even when the first is `null`, and Slot requires exactly
          one child — so `asChild` has to pass `children` through untouched or it throws. A
          link-shaped button has no loading state; `loading` still sets aria-busy and disabled. */}
      {asChild ? (
        children
      ) : (
        <>
          {loading ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : null}
          {children}
        </>
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
