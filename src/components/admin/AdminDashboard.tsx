'use client';
/**
 * Admin console prototype: platform KPIs, user management, system toggles and
 * a promo-code manager. All mutations are local-state only.
 */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Activity, Ban, BarChart3, CheckCircle2, Coins, Plus, Search, Settings2,
  ShieldAlert, Ticket, TrendingUp, UserCog, Users,
} from 'lucide-react';
import { Avatar, Badge, Button, Card, CardBody, CardHeader, CardTitle, Input, Skeleton, Tabs, Toggle } from '@/components/ui';
import { CoinAmount } from '@/components/common/CoinAmount';
import { adminService } from '@/services';
import { usePlatformStats } from '@/hooks';
import { useUIStore } from '@/lib/store';
import type { AdminUserRow, PromoCode, SystemToggle } from '@/types';
import { cn, formatCoins, formatCompact } from '@/lib/utils';

type Section = 'overview' | 'users' | 'promos' | 'settings';

const STATUS_TONE: Record<AdminUserRow['status'], 'emerald' | 'amber' | 'rose'> = {
  active: 'emerald',
  flagged: 'amber',
  suspended: 'rose',
};

/** Lightweight inline sparkline (no chart dependency). */
function Sparkline({ data, color = '#22d3ee' }: { data: number[]; color?: string }) {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / Math.max(1, max - min)) * 92}`)
    .join(' ');
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-16 w-full">
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,100 ${points} 100,100`} fill="url(#sparkFill)" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function AdminDashboard() {
  const [section, setSection] = useState<Section>('overview');
  const [search, setSearch] = useState('');
  const notify = useUIStore((s) => s.notify);
  const stats = usePlatformStats();

  const { data: fetchedUsers, isLoading: usersLoading } = useQuery({ queryKey: ['admin-users'], queryFn: adminService.users });
  const { data: fetchedPromos } = useQuery({ queryKey: ['admin-promos'], queryFn: adminService.promoCodes });
  const { data: fetchedToggles } = useQuery({ queryKey: ['admin-toggles'], queryFn: adminService.toggles });
  const { data: series } = useQuery({ queryKey: ['admin-series'], queryFn: adminService.revenueSeries });

  // Local mirrors so the prototype supports optimistic edits
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [toggles, setToggles] = useState<SystemToggle[]>([]);
  const [newCode, setNewCode] = useState('');
  const [newReward, setNewReward] = useState(500);

  useEffect(() => { if (fetchedUsers) setUsers(fetchedUsers); }, [fetchedUsers]);
  useEffect(() => { if (fetchedPromos) setPromos(fetchedPromos); }, [fetchedPromos]);
  useEffect(() => { if (fetchedToggles) setToggles(fetchedToggles); }, [fetchedToggles]);

  const filteredUsers = users.filter((u) => u.username.toLowerCase().includes(search.toLowerCase()));

  const kpis = [
    { label: 'Players online', value: stats?.onlinePlayers ?? 0, icon: Users, tone: 'from-emerald-400 to-teal-500', fmt: formatCompact },
    { label: 'Bets today', value: stats?.betsToday ?? 0, icon: Activity, tone: 'from-cyan-400 to-blue-500', fmt: formatCompact },
    { label: 'House P&L', value: stats?.housePnl ?? 0, icon: TrendingUp, tone: 'from-violet-400 to-fuchsia-500', coins: true },
    { label: 'Jackpot pool', value: stats?.jackpotPool ?? 0, icon: Coins, tone: 'from-amber-300 to-orange-500', coins: true },
  ];

  const cycleStatus = (id: string) => {
    setUsers((list) =>
      list.map((u) => {
        if (u.id !== id) return u;
        const next: AdminUserRow['status'] = u.status === 'active' ? 'flagged' : u.status === 'flagged' ? 'suspended' : 'active';
        return { ...u, status: next };
      }),
    );
    notify('info', 'User status updated', 'Change applied to the local mock dataset.');
  };

  const createPromo = async () => {
    try {
      const promo = await adminService.createPromo(newCode, newReward, 5_000);
      setPromos((p) => [promo, ...p]);
      setNewCode('');
      notify('success', 'Promo created', `${promo.code} · ${promo.reward} RC`);
    } catch (e) {
      notify('error', 'Could not create promo', (e as Error).message);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-rose-400 to-fuchsia-600 text-void-950">
            <ShieldAlert className="size-5" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-black text-white sm:text-3xl">Admin console</h1>
            <p className="text-xs text-slate-400">Prototype control surface — all data is mocked in-browser.</p>
          </div>
        </div>
        <Badge tone="rose" pulse>Restricted area</Badge>
      </div>

      <Tabs
        active={section}
        onChange={setSection}
        layoutId="admin"
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'users', label: 'Users', count: users.length },
          { id: 'promos', label: 'Promos', count: promos.length },
          { id: 'settings', label: 'Settings' },
        ]}
      />

      {/* Overview */}
      {section === 'overview' && (
        <div className="mt-5 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((k, i) => (
              <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <span className={cn('grid size-10 place-items-center rounded-xl bg-gradient-to-br text-void-950', k.tone)}>
                      <k.icon className="size-4.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] tracking-wider text-slate-500 uppercase">{k.label}</p>
                      {k.coins ? (
                        <CoinAmount value={k.value} size="md" decimals={0} signed={k.label === 'House P&L'} className={cn('text-white', k.label === 'House P&L' && k.value >= 0 && 'text-emerald-300')} />
                      ) : (
                        <p className="font-display text-lg font-extrabold text-white">{k.fmt!(k.value)}</p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Wager volume · 28 days</CardTitle>
                <Badge tone="cyan"><BarChart3 className="mr-1 size-3" />Live mock</Badge>
              </CardHeader>
              <CardBody>{series ? <Sparkline data={series} /> : <Skeleton className="h-16 w-full" />}</CardBody>
            </Card>

            <Card>
              <CardHeader><CardTitle>Platform health</CardTitle></CardHeader>
              <CardBody className="space-y-2.5">
                {[
                  { label: 'Game engine', status: 'Operational' },
                  { label: 'Mock socket feed', status: 'Streaming' },
                  { label: 'Wallet service', status: 'Operational' },
                  { label: 'Withdrawals', status: 'Paused' },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between rounded-lg border border-white/8 bg-void-900/50 px-3 py-2">
                    <span className="text-xs text-slate-300">{s.label}</span>
                    <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-semibold', s.status === 'Paused' ? 'text-amber-300' : 'text-emerald-300')}>
                      <span className="size-1.5 animate-pulse rounded-full bg-current" />{s.status}
                    </span>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* Users */}
      {section === 'users' && (
        <Card className="mt-5 overflow-hidden">
          <CardHeader>
            <CardTitle>User management</CardTitle>
            <div className="w-56">
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search players…" icon={<Search className="size-4" />} />
            </div>
          </CardHeader>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem]">
              <thead>
                <tr className="border-b border-white/8 text-left text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                  <th className="px-5 py-3">Player</th>
                  <th className="px-3 py-3">Role</th>
                  <th className="px-3 py-3 text-right">Balance</th>
                  <th className="px-3 py-3 text-right">Wagered</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {usersLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i}><td colSpan={6} className="px-5 py-3"><Skeleton className="h-7 w-full" /></td></tr>
                    ))
                  : filteredUsers.map((u) => (
                      <tr key={u.id} className="transition hover:bg-white/[0.02]">
                        <td className="px-5 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <Avatar src={u.avatarUrl} alt={u.username} size={28} />
                            <span className="text-sm font-semibold text-slate-100">{u.username}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5"><Badge tone={u.role === 'admin' ? 'fuchsia' : u.role === 'moderator' ? 'cyan' : u.role === 'vip' ? 'amber' : 'slate'}>{u.role}</Badge></td>
                        <td className="px-3 py-2.5 text-right"><CoinAmount value={u.balance} size="xs" decimals={0} className="justify-end text-slate-300" /></td>
                        <td className="px-3 py-2.5 text-right font-mono text-[11px] text-slate-400">{formatCoins(u.wagered, 0)}</td>
                        <td className="px-3 py-2.5"><Badge tone={STATUS_TONE[u.status]}>{u.status}</Badge></td>
                        <td className="px-5 py-2.5">
                          <div className="flex justify-end gap-1.5">
                            <Button size="sm" variant="ghost" icon={<UserCog className="size-3.5" />} onClick={() => cycleStatus(u.id)}>Cycle</Button>
                            <Button size="sm" variant="ghost" icon={<Ban className="size-3.5" />} onClick={() => notify('info', 'Action logged', `${u.username} flagged for review.`)} />
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Promos */}
      {section === 'promos' && (
        <div className="mt-5 grid gap-4 lg:grid-cols-[20rem_1fr]">
          <Card className="h-fit">
            <CardHeader><CardTitle>New promo code</CardTitle></CardHeader>
            <CardBody className="space-y-3">
              <Input label="Code" value={newCode} onChange={(e) => setNewCode(e.target.value.toUpperCase())} placeholder="SUMMER500" icon={<Ticket className="size-4" />} />
              <Input label="Reward (RC)" type="number" value={newReward} onChange={(e) => setNewReward(Number(e.target.value))} />
              <Button fullWidth icon={<Plus className="size-4" />} onClick={createPromo}>Create code</Button>
            </CardBody>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader><CardTitle>Active promotions</CardTitle><Badge tone="cyan">{promos.filter((p) => p.active).length} live</Badge></CardHeader>
            <ul className="divide-y divide-white/5">
              {promos.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <span className="font-mono text-sm font-bold text-cyan-300">{p.code}</span>
                  <CoinAmount value={p.reward} size="xs" decimals={0} className="text-amber-300" />
                  <span className="text-[11px] text-slate-500">{p.uses.toLocaleString()}/{p.maxUses.toLocaleString()} used</span>
                  <div className="ml-auto flex items-center gap-3">
                    <span className="text-[11px] text-slate-600">Exp {new Date(p.expiresAt).toLocaleDateString()}</span>
                    <Toggle
                      size="sm"
                      checked={p.active}
                      label={`Toggle ${p.code}`}
                      onChange={(v) => setPromos((list) => list.map((x) => (x.id === p.id ? { ...x, active: v } : x)))}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* Settings */}
      {section === 'settings' && (
        <Card className="mt-5">
          <CardHeader><CardTitle>System toggles</CardTitle><Settings2 className="size-4 text-slate-500" /></CardHeader>
          <CardBody className="grid gap-3 sm:grid-cols-2">
            {toggles.map((t) => (
              <div key={t.id} className="flex items-start justify-between gap-3 rounded-xl border border-white/8 bg-void-900/50 p-3.5">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-100">
                    {t.label}
                    {t.enabled && <CheckCircle2 className="size-3.5 text-emerald-400" />}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{t.description}</p>
                </div>
                <Toggle
                  checked={t.enabled}
                  label={t.label}
                  onChange={(v) => {
                    setToggles((list) => list.map((x) => (x.id === t.id ? { ...x, enabled: v } : x)));
                    notify('info', `${t.label} ${v ? 'enabled' : 'disabled'}`, 'Applied to the local mock config.');
                  }}
                />
              </div>
            ))}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
