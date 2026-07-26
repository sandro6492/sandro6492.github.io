'use client';
/** Rarity-aware loot tile used in inventory, cases and the upgrader. */
import { motion } from 'framer-motion';
import type { Item } from '@/types';
import { RARITY } from '@/lib/constants';
import { CoinAmount } from '@/components/common/CoinAmount';
import { cn } from '@/lib/utils';

export function ItemCard({
  item,
  selected,
  onClick,
  size = 'md',
  showValue = true,
  className,
}: {
  item: Item;
  selected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}) {
  const r = RARITY[item.rarity];
  const pad = { sm: 'p-2', md: 'p-3', lg: 'p-4' }[size];
  const glyph = { sm: 'text-2xl', md: 'text-4xl', lg: 'text-5xl' }[size];

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={onClick ? { y: -4, scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      className={cn(
        'group relative flex w-full flex-col items-center gap-1.5 overflow-hidden rounded-xl border bg-gradient-to-b text-center transition',
        r.border, r.bg, pad,
        selected && cn('ring-2 ring-offset-2 ring-offset-void-950', r.glow),
        selected && `ring-[${r.hex}]`,
        className,
      )}
      style={selected ? { boxShadow: `0 0 30px -6px ${r.hex}`, borderColor: r.hex } : undefined}
    >
      <span
        className="absolute inset-x-0 top-0 h-0.5 opacity-80"
        style={{ background: `linear-gradient(90deg, transparent, ${r.hex}, transparent)` }}
      />
      <span className={cn('drop-shadow-[0_0_12px_rgba(255,255,255,0.25)] transition group-hover:scale-110', glyph)}>
        {item.glyph}
      </span>
      <span className="line-clamp-1 w-full text-[11px] font-semibold text-slate-200">{item.name}</span>
      <span className={cn('text-[9px] font-bold tracking-wider uppercase', r.text)}>{r.label}</span>
      {showValue && <CoinAmount value={item.value} size="xs" decimals={0} className="text-slate-300" />}
    </motion.button>
  );
}
