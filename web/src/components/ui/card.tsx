// Card primitives from 21st.dev "Stats cards with links" (ephraimduncan, shadcn). Kept as delivered
// except the radius and border, which read the site tokens (rounded-md = 16px, border = --line).
import * as React from 'react';
import { cn } from '@/lib/utils';

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} data-slot="card" className={cn('flex flex-col rounded-md border border-line bg-card text-card-foreground', className)} {...props} />
  ),
);
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} data-slot="card-header" className={cn('flex items-baseline justify-between gap-4 px-6 pt-6', className)} {...props} />
  ),
);
CardHeader.displayName = 'CardHeader';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} data-slot="card-content" className={cn('px-6', className)} {...props} />,
);
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} data-slot="card-footer" className={cn('flex items-center border-t border-line px-6', className)} {...props} />
  ),
);
CardFooter.displayName = 'CardFooter';
