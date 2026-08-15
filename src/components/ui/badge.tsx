import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { type HTMLAttributes } from 'react';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:     'bg-primary/15 text-primary border border-primary/20',
        secondary:   'bg-secondary text-secondary-foreground',
        outline:     'border border-border text-foreground',
        destructive: 'bg-destructive/15 text-destructive border border-destructive/20',
        success:     'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 dark:text-emerald-400',
        warning:     'bg-amber-500/15 text-amber-600 border border-amber-500/20 dark:text-amber-400',
        blue:        'bg-blue-500/15 text-blue-700 border border-blue-500/20 dark:text-blue-400',
        muted:       'bg-muted text-muted-foreground border border-border',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
