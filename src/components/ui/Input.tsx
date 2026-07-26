'use client';
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: ReactNode;
  suffix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, hint, error, icon, suffix, id, ...props },
  ref,
) {
  const inputId = id ?? props.name ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-400 uppercase">
          {label}
        </label>
      )}
      <div
        className={cn(
          'group flex items-center gap-2 rounded-xl border bg-void-900/70 px-3 transition',
          'border-white/10 focus-within:border-cyan-400/60 focus-within:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]',
          error && 'border-rose-500/60',
        )}
      >
        {icon && <span className="text-slate-500 transition group-focus-within:text-cyan-300">{icon}</span>}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-11 w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none',
            className,
          )}
          {...props}
        />
        {suffix}
      </div>
      {(hint || error) && (
        <p className={cn('mt-1.5 text-xs', error ? 'text-rose-400' : 'text-slate-500')}>{error ?? hint}</p>
      )}
    </div>
  );
});
