'use client';
/** Animated pill tabs with a shared layout indicator. */
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  count?: number;
}

interface TabsProps<T extends string> {
  tabs: TabItem<T>[];
  active: T;
  onChange: (id: T) => void;
  className?: string;
  size?: 'sm' | 'md';
  layoutId?: string;
}

export function Tabs<T extends string>({ tabs, active, onChange, className, size = 'md', layoutId = 'tab' }: TabsProps<T>) {
  return (
    <div className={cn('inline-flex flex-wrap gap-1 rounded-xl border border-white/8 bg-void-900/60 p-1', className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative rounded-lg font-semibold transition-colors',
              size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm',
              isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200',
            )}
          >
            {isActive && (
              <motion.span
                layoutId={layoutId}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/25 to-violet-500/25 ring-1 ring-cyan-400/40"
              />
            )}
            <span className="relative z-10">
              {tab.label}
              {tab.count !== undefined && <span className="ml-1.5 text-[10px] text-slate-500">{tab.count}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
