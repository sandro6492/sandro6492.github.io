'use client';
/** /cases — case grid + inline unboxing view. */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Sparkles } from 'lucide-react';
import { Badge, Card } from '@/components/ui';
import { CaseOpener } from './CaseOpener';
import { CoinAmount } from '@/components/common/CoinAmount';
import { SectionHeading } from '@/components/common/SectionHeading';
import { RarityChip } from '@/components/common/RarityChip';
import { CASES } from '@/lib/mockData';
import { RARITY_ORDER } from '@/lib/constants';
import type { CaseDefinition } from '@/types';
import { cn } from '@/lib/utils';

export function CasesPage() {
  const [active, setActive] = useState<CaseDefinition | null>(null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {active ? (
        <Card className="p-5 sm:p-6">
          <CaseOpener def={active} onClose={() => setActive(null)} />
        </Card>
      ) : (
        <>
          <SectionHeading
            eyebrow="Case Rift"
            title="Four tiers. Five rarities. One mythic dream."
            subtitle="Every case publishes its full drop table and odds up front — no hidden weighting, no pity timers."
            align="left"
          />

          <div className="mt-8 flex flex-wrap gap-2">
            {RARITY_ORDER.map((r) => <RarityChip key={r} rarity={r} />)}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CASES.map((c, i) => {
              const best = c.drops.slice().sort((a, b) => b.item.value - a.item.value)[0];
              return (
                <motion.button
                  key={c.id}
                  initial={{ opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                  whileHover={{ y: -8 }}
                  onClick={() => setActive(c)}
                  className="group glass glass-hover relative overflow-hidden rounded-2xl p-5 text-left"
                >
                  <div className={cn('pointer-events-none absolute -top-20 -right-14 size-48 rounded-full bg-gradient-to-br opacity-20 blur-3xl transition group-hover:opacity-45', c.accent)} />
                  <div className="relative">
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 3.4, repeat: Infinity, delay: i * 0.3 }}
                      className="mx-auto grid size-24 place-items-center text-6xl"
                      style={{ filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.6))' }}
                    >
                      {c.glyph}
                    </motion.div>

                    <h3 className="font-display mt-3 text-center text-base font-bold text-white">{c.name}</h3>
                    <p className="mt-1 text-center text-[11px] text-slate-400">{c.tagline}</p>

                    <div className="mt-4 flex items-center justify-between rounded-xl border border-white/8 bg-void-900/60 px-3 py-2">
                      <span className="text-[10px] tracking-wider text-slate-500 uppercase">Price</span>
                      <CoinAmount value={c.price} size="sm" decimals={0} className="text-amber-300" />
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                      <span className="inline-flex items-center gap-1"><Package className="size-3" /> {c.opens.toLocaleString()} opens</span>
                      <span className="inline-flex items-center gap-1 text-fuchsia-300"><Sparkles className="size-3" /> {best.item.glyph} {best.item.name}</span>
                    </div>

                    <div className="mt-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-violet-500/20 py-2 text-center text-xs font-bold text-cyan-200 transition group-hover:from-cyan-500/35 group-hover:to-violet-500/35">
                      Open case →
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Total opens', value: CASES.reduce((s, c) => s + c.opens, 0).toLocaleString(), tone: 'cyan' as const },
              { label: 'Rarity tiers', value: '5', tone: 'violet' as const },
              { label: 'Max item value', value: '21,000 RC', tone: 'amber' as const },
            ].map((s) => (
              <Card key={s.label} className="flex items-center justify-between p-5">
                <span className="text-xs tracking-wider text-slate-500 uppercase">{s.label}</span>
                <Badge tone={s.tone}>{s.value}</Badge>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
