import { cva, type VariantProps } from 'class-variance-authority';
import { mergeClasses } from '../../lib/utils';
import { type ButtonHTMLAttributes, forwardRef } from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        default:   'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline:   'border border-border bg-transparent hover:bg-accent hover:text-accent-foreground',
        ghost:     'hover:bg-accent hover:text-accent-foreground',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        success:   'bg-emerald-600 text-white hover:bg-emerald-500',
        warning:   'border border-amber-600/60 text-amber-400 hover:bg-amber-950/40',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm:      'h-7 px-2.5 py-1 text-xs',
        lg:      'h-11 px-6',
        icon:    'h-8 w-8 p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={mergeClasses(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = 'Button';

export { Button, buttonVariants };
