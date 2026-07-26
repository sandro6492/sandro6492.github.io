/** Glassmorphic surface used across the app. */
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  interactive?: boolean;
  children: ReactNode;
}

export function Card({ className, glow, interactive, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'glass rounded-2xl',
        interactive && 'glass-hover cursor-pointer',
        glow && 'shadow-[0_0_60px_-24px_rgba(34,211,238,0.8)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center justify-between gap-3 border-b border-white/5 px-5 py-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('font-display text-sm font-semibold tracking-wide text-slate-100 uppercase', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardBody({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5', className)} {...props}>{children}</div>;
}
