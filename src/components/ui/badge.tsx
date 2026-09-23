import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Slot } from 'radix-ui'

const badgeVariants = cva(
  'group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-sm border px-2 py-0.5 font-mono text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!',
  {
    variants: {
      variant: {
        /** Base badge (02 "Badge / TagList"): muted fill, border hairline. */
        default: 'border-border bg-muted text-foreground [a]:hover:bg-muted/70',
        secondary: 'border-border bg-muted text-foreground [a]:hover:bg-muted/70',
        /** Leadership / featured tags (02 "Team Lead"): brand at 15% fill, brand text, brand at 35% border. */
        brand: 'border-brand/35 bg-brand/15 text-brand-ink [a]:hover:bg-brand/20',
        destructive:
          'border-transparent bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20',
        outline: 'border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground',
        ghost:
          'border-transparent hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50',
        link: 'border-transparent text-brand underline-offset-4 hover:underline',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span'

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
