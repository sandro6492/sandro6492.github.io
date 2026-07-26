import type { Rarity } from '@/types';
import { RARITY } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function RarityChip({ rarity, className }: { rarity: Rarity; className?: string }) {
  const r = RARITY[rarity];
  return (
    <span className={cn('rounded-md border px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase', r.text, r.border, className)}>
      {r.label}
    </span>
  );
}
