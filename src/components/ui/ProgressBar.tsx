'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  gradient?: string;
  showShimmer?: boolean;
  height?: string;
}

export function ProgressBar({
  value,
  max = 100,
  className,
  gradient = 'from-cyan-400 to-violet-500',
  showShimmer = true,
  height = 'h-2',
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));
  return (
    <div className={cn('relative w-full overflow-hidden rounded-full bg-void-800/90 ring-1 ring-white/5', height, className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 22 }}
        className={cn('relative h-full rounded-full bg-gradient-to-r', gradient)}
      >
        {showShimmer && pct > 0 && <span className="shimmer absolute inset-0 rounded-full" />}
      </motion.div>
    </div>
  );
}
