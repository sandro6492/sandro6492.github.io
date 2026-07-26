'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  size?: 'sm' | 'md';
}

export function Toggle({ checked, onChange, label, size = 'md' }: ToggleProps) {
  const dims = size === 'sm' ? { w: 'w-9', h: 'h-5', k: 14 } : { w: 'w-12', h: 'h-6', k: 18 };
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative shrink-0 rounded-full border transition-colors',
        dims.w, dims.h,
        checked
          ? 'border-cyan-400/60 bg-gradient-to-r from-cyan-500/70 to-violet-500/70 shadow-[0_0_20px_-6px_rgba(34,211,238,0.9)]'
          : 'border-white/10 bg-void-800',
      )}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 520, damping: 32 }}
        className={cn('absolute top-1/2 block -translate-y-1/2 rounded-full bg-white shadow')}
        style={{ width: dims.k, height: dims.k, left: checked ? `calc(100% - ${dims.k + 3}px)` : 3 }}
      />
    </button>
  );
}
