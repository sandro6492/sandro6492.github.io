import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'cyan' | 'violet' | 'amber' | 'emerald' | 'rose' | 'slate' | 'fuchsia';

const TONES: Record<Tone, string> = {
  cyan: 'bg-cyan-400/12 text-cyan-300 border-cyan-400/30',
  violet: 'bg-violet-400/12 text-violet-300 border-violet-400/30',
  amber: 'bg-amber-400/12 text-amber-300 border-amber-400/30',
  emerald: 'bg-emerald-400/12 text-emerald-300 border-emerald-400/30',
  rose: 'bg-rose-400/12 text-rose-300 border-rose-400/30',
  fuchsia: 'bg-fuchsia-400/12 text-fuchsia-300 border-fuchsia-400/30',
  slate: 'bg-slate-400/10 text-slate-300 border-slate-400/25',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  pulse?: boolean;
}

export function Badge({ className, tone = 'cyan', pulse, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase',
        TONES[tone],
        className,
      )}
      {...props}
    >
      {pulse && <span className="size-1.5 animate-pulse rounded-full bg-current" />}
      {children}
    </span>
  );
}
