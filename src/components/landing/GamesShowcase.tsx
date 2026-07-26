'use client';
/** Landing game grid with live player counts. */
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, Users } from 'lucide-react';
import { Badge, Icon, Skeleton } from '@/components/ui';
import { SectionHeading } from '@/components/common/SectionHeading';
import { useGames } from '@/hooks';
import { GAMES } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function GamesShowcase() {
  const { data, isLoading } = useGames();
  const games = data ?? GAMES;

  return (
    <section id="games" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <SectionHeading eyebrow="Nine arenas" title="Pick your battleground" subtitle="Original game modes, each with its own risk curve, animation language and payout ceiling." />

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)
          : games.map((g, i) => (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.42, delay: (i % 3) * 0.07 }}
              >
                <Link href={g.href} className="group relative block overflow-hidden rounded-2xl">
                  <div className="glass glass-hover relative h-full p-5">
                    <div className={cn('pointer-events-none absolute -top-20 -right-14 size-44 rounded-full bg-gradient-to-br opacity-15 blur-3xl transition duration-500 group-hover:opacity-40', g.accent)} />

                    <div className="relative flex items-start justify-between">
                      <span className={cn('grid size-12 place-items-center rounded-2xl bg-gradient-to-br text-void-950 shadow-lg transition duration-300 group-hover:scale-110', g.accent)}>
                        <Icon name={g.icon} className="size-6" />
                      </span>
                      <div className="flex gap-1.5">
                        {g.hot && <Badge tone="rose">Hot</Badge>}
                        {g.isNew && <Badge tone="emerald">New</Badge>}
                      </div>
                    </div>

                    <h3 className="font-display mt-4 flex items-center gap-1.5 text-lg font-bold text-white">
                      {g.name}
                      <ArrowUpRight className="size-4 -translate-x-1 text-cyan-300 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">{g.tagline}</p>

                    <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                        <Users className="size-3" />
                        <span className="font-semibold text-slate-300">{g.players.toLocaleString()}</span> playing
                      </span>
                      <span className="text-[11px] font-semibold text-cyan-300">Play now →</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
      </div>
    </section>
  );
}
