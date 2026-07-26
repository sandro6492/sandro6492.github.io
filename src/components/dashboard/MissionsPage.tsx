'use client';
/** Daily / weekly / season quest log with claimable rewards. */
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Gift } from 'lucide-react';
import { Badge, Button, Card, Icon, ProgressBar } from '@/components/ui';
import { CoinAmount } from '@/components/common/CoinAmount';
import { SectionHeading } from '@/components/common/SectionHeading';
import { useMissions } from '@/hooks';
import type { Mission } from '@/types';
import { cn } from '@/lib/utils';

const TIER_META: Record<Mission['tier'], { label: string; tone: 'cyan' | 'violet' | 'amber'; gradient: string }> = {
  daily: { label: 'Daily', tone: 'cyan', gradient: 'from-cyan-400 to-blue-500' },
  weekly: { label: 'Weekly', tone: 'violet', gradient: 'from-violet-400 to-fuchsia-500' },
  season: { label: 'Season', tone: 'amber', gradient: 'from-amber-300 to-orange-500' },
};

export function MissionsPage() {
  const { missions, claim } = useMissions();
  const tiers: Mission['tier'][] = ['daily', 'weekly', 'season'];

  const totalClaimable = missions.filter((m) => !m.claimed && m.progress >= m.target).reduce((s, m) => s + m.reward, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <SectionHeading
        eyebrow="Quest log"
        title="Missions & objectives"
        subtitle="Complete objectives across every arena to bank bonus coins and season XP."
      />

      <Card className="mt-8 flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 text-void-950">
            <Gift className="size-5" />
          </span>
          <div>
            <p className="text-xs tracking-wider text-slate-500 uppercase">Ready to claim</p>
            <CoinAmount value={totalClaimable} size="lg" decimals={0} className="text-amber-300" />
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="size-3.5" /> Daily missions reset in 08:24:11
        </span>
      </Card>

      {tiers.map((tier) => {
        const list = missions.filter((m) => m.tier === tier);
        if (!list.length) return null;
        const meta = TIER_META[tier];
        return (
          <section key={tier} className="mt-8">
            <div className="mb-3 flex items-center gap-2">
              <h2 className="font-display text-sm font-bold tracking-widest text-slate-200 uppercase">{meta.label}</h2>
              <Badge tone={meta.tone}>{list.filter((m) => m.claimed).length}/{list.length} done</Badge>
            </div>

            <div className="space-y-2.5">
              {list.map((m, i) => {
                const complete = m.progress >= m.target;
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className={cn('flex flex-col gap-4 p-4 sm:flex-row sm:items-center', m.claimed && 'opacity-60')}>
                      <span className={cn('grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-void-950', meta.gradient)}>
                        <Icon name={m.icon} className="size-5" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{m.title}</h3>
                          {m.claimed && <CheckCircle2 className="size-3.5 text-emerald-400" />}
                        </div>
                        <p className="mt-0.5 text-xs text-slate-400">{m.description}</p>
                        <div className="mt-2.5 flex items-center gap-3">
                          <ProgressBar value={m.progress} max={m.target} gradient={meta.gradient} className="flex-1" />
                          <span className="shrink-0 font-mono text-[11px] text-slate-400">
                            {m.progress.toLocaleString()}/{m.target.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
                        <CoinAmount value={m.reward} size="sm" decimals={0} className="text-amber-300" />
                        <Button
                          size="sm"
                          variant={complete && !m.claimed ? 'primary' : 'secondary'}
                          disabled={!complete || m.claimed}
                          onClick={() => claim(m.id)}
                        >
                          {m.claimed ? 'Claimed' : complete ? 'Claim' : 'In progress'}
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
