'use client';
/** Profile: badges, Roblox link, detailed stats and account settings. */
import { motion } from 'framer-motion';
import { CheckCircle2, Gamepad2, Link2, Unlink } from 'lucide-react';
import { Avatar, Badge, Button, Card, CardBody, CardHeader, CardTitle, Icon, Toggle } from '@/components/ui';
import { ALL_BADGES } from '@/lib/mockData';
import { useUIStore, useUserStore } from '@/lib/store';
import { cn, formatCoins } from '@/lib/utils';
import { useState } from 'react';

export function ProfilePanel() {
  const user = useUserStore((s) => s.user)!;
  const disconnectRoblox = useUserStore((s) => s.disconnectRoblox);
  const openModal = useUIStore((s) => s.openModal);
  const soundEnabled = useUIStore((s) => s.soundEnabled);
  const toggleSound = useUIStore((s) => s.toggleSound);
  const [publicProfile, setPublicProfile] = useState(true);
  const [hideWagers, setHideWagers] = useState(false);

  const earned = new Set(user.badges.map((b) => b.id));

  const detailed = [
    { label: 'Games played', value: user.stats.gamesPlayed.toLocaleString() },
    { label: 'Wins', value: user.stats.wins.toLocaleString() },
    { label: 'Losses', value: user.stats.losses.toLocaleString() },
    { label: 'Win rate', value: `${user.stats.winRate}%` },
    { label: 'Wagered', value: `${formatCoins(user.stats.wagered, 0)} RC` },
    { label: 'Biggest win', value: `${formatCoins(user.stats.biggestWin, 0)} RC` },
    { label: 'Member since', value: new Date(user.createdAt).toLocaleDateString() },
    { label: 'Account tier', value: user.role.toUpperCase() },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Badges */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Badges</CardTitle>
          <Badge tone="violet">{user.badges.length}/{ALL_BADGES.length} earned</Badge>
        </CardHeader>
        <CardBody className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_BADGES.map((b, i) => {
            const has = earned.has(b.id);
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className={cn(
                  'flex items-start gap-3 rounded-xl border p-3 transition',
                  has ? 'border-white/12 bg-white/[0.03]' : 'border-white/6 bg-white/[0.01] opacity-45 grayscale',
                )}
              >
                <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-void-950', b.tint)}>
                  <Icon name={b.icon} className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1 text-xs font-bold text-white">
                    {b.label} {has && <CheckCircle2 className="size-3 text-emerald-400" />}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{b.description}</p>
                </div>
              </motion.div>
            );
          })}
        </CardBody>
      </Card>

      {/* Roblox */}
      <Card className="h-fit">
        <CardHeader><CardTitle>Roblox link</CardTitle>{user.roblox.connected && <Badge tone="emerald" pulse>Linked</Badge>}</CardHeader>
        <CardBody className="space-y-3">
          {user.roblox.connected ? (
            <>
              <div className="flex items-center gap-3 rounded-xl border border-emerald-400/25 bg-emerald-400/8 p-3">
                <Avatar src={user.roblox.avatarUrl ?? user.avatarUrl} alt={user.roblox.username ?? ''} size={40} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">{user.roblox.username}</p>
                  <p className="text-[11px] text-slate-500">ID #{user.roblox.userId}</p>
                </div>
              </div>
              {user.roblox.tradeUrl && (
                <p className="truncate rounded-lg border border-white/8 bg-void-900/60 px-3 py-2 font-mono text-[10px] text-slate-400">
                  {user.roblox.tradeUrl}
                </p>
              )}
              <Button variant="secondary" fullWidth icon={<Unlink className="size-4" />} onClick={disconnectRoblox}>
                Disconnect
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-white/12 p-4">
                <Gamepad2 className="size-5 text-slate-500" />
                <p className="text-xs text-slate-400">Link a Roblox account to preview your avatar and store a trade URL.</p>
              </div>
              <Button fullWidth icon={<Link2 className="size-4" />} onClick={() => openModal('roblox')}>
                Connect Roblox
              </Button>
            </>
          )}
        </CardBody>
      </Card>

      {/* Stats */}
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>Statistics</CardTitle></CardHeader>
        <CardBody className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {detailed.map((s) => (
            <div key={s.label} className="rounded-xl border border-white/8 bg-void-900/50 px-3 py-2.5">
              <p className="text-[10px] tracking-wider text-slate-500 uppercase">{s.label}</p>
              <p className="mt-0.5 truncate font-display text-sm font-bold text-white">{s.value}</p>
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Preferences */}
      <Card className="h-fit">
        <CardHeader><CardTitle>Preferences</CardTitle></CardHeader>
        <CardBody className="space-y-3">
          {[
            { label: 'Sound effects', desc: 'Global audio for all games.', value: soundEnabled, onChange: () => toggleSound() },
            { label: 'Public profile', desc: 'Show on leaderboards.', value: publicProfile, onChange: setPublicProfile },
            { label: 'Hide wager amounts', desc: 'Mask coins in the live feed.', value: hideWagers, onChange: setHideWagers },
          ].map((p) => (
            <div key={p.label} className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-void-900/50 px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200">{p.label}</p>
                <p className="text-[10px] text-slate-500">{p.desc}</p>
              </div>
              <Toggle checked={p.value} onChange={p.onChange} size="sm" label={p.label} />
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
