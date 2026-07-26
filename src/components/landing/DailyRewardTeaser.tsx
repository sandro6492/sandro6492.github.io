'use client';
/** Daily streak ladder with a claim CTA. */
import { motion } from 'framer-motion';
import { CalendarCheck, Flame, Gift } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { CoinAmount } from '@/components/common/CoinAmount';
import { DAILY_REWARDS, BRAND } from '@/lib/constants';
import { useUIStore, useUserStore } from '@/lib/store';
import { useCelebration } from '@/hooks';
import { cn, formatCoins } from '@/lib/utils';

export function DailyRewardTeaser() {
  const user = useUserStore((s) => s.user);
  const claimDaily = useUserStore((s) => s.claimDaily);
  const notify = useUIStore((s) => s.notify);
  const openModal = useUIStore((s) => s.openModal);
  const { burst } = useCelebration();

  const streak = user?.streak ?? 0;
  const next = DAILY_REWARDS[Math.min(streak, DAILY_REWARDS.length - 1)];

  const claim = () => {
    if (!user) {
      openModal('signup');
      return;
    }
    claimDaily(next.amount);
    burst('medium');
    notify('reward', `Day ${next.day} claimed`, `+${formatCoins(next.amount, 0)} ${BRAND.currency}`);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <Card className="relative overflow-hidden">
          <div className="pointer-events-none absolute -top-24 -left-16 size-64 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 -bottom-24 size-64 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
            <div className="max-w-md">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-400/8 px-2.5 py-1 text-[11px] font-bold tracking-wider text-amber-300 uppercase">
                <Flame className="size-3" /> {streak}-day streak
              </span>
              <h3 className="font-display mt-3 text-2xl font-extrabold text-white sm:text-3xl">Daily rift dividend</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Log in every day to escalate your reward. Miss a day and the ladder resets to day one — reach day 7 for the
                jackpot drop.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button size="lg" icon={<Gift className="size-4" />} onClick={claim}>
                  Claim {formatCoins(next.amount, 0)} {BRAND.currency}
                </Button>
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <CalendarCheck className="size-3.5" /> Resets in 08:24:11
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7 lg:max-w-md">
              {DAILY_REWARDS.map((d) => {
                const claimed = d.day <= streak;
                const isNext = d.day === streak + 1;
                return (
                  <motion.div
                    key={d.day}
                    whileHover={{ y: -4 }}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center transition',
                      claimed && 'border-emerald-400/40 bg-emerald-400/10',
                      isNext && 'border-amber-400/60 bg-amber-400/10 shadow-[0_0_28px_-8px_rgba(251,191,36,0.9)]',
                      !claimed && !isNext && 'border-white/8 bg-white/[0.02]',
                    )}
                  >
                    <span className="text-[9px] font-bold tracking-wider text-slate-500 uppercase">Day {d.day}</span>
                    <span className="text-lg">{d.day === 7 ? '💎' : claimed ? '✅' : '🎁'}</span>
                    <CoinAmount value={d.amount} size="xs" decimals={0} className="text-slate-300" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </Card>
      </motion.div>
    </section>
  );
}
