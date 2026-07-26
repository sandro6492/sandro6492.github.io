'use client';
/** Wallet + inventory: balance actions, promo redemption, item grid with sell/upgrade. */
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowDownToLine, ArrowUpFromLine, ArrowUpRight, Coins, Ticket, Trash2 } from 'lucide-react';
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, Input, Tabs } from '@/components/ui';
import { ItemCard } from '@/components/games/ItemCard';
import { CoinAmount } from '@/components/common/CoinAmount';
import { EmptyState } from '@/components/common/EmptyState';
import { useWallet } from '@/hooks';
import { useUIStore, useUserStore } from '@/lib/store';
import { RARITY, RARITY_ORDER } from '@/lib/constants';
import type { Rarity } from '@/types';
import { cn, formatCoins } from '@/lib/utils';

type Sort = 'recent' | 'value' | 'rarity';

export function WalletPanel() {
  const user = useUserStore((s) => s.user)!;
  const inventory = useUserStore((s) => s.inventory);
  const sellItem = useUserStore((s) => s.sellItem);
  const sellAll = useUserStore((s) => s.sellAll);
  const openModal = useUIStore((s) => s.openModal);
  const notify = useUIStore((s) => s.notify);
  const { promoMutation } = useWallet();

  const [promo, setPromo] = useState('');
  const [sort, setSort] = useState<Sort>('recent');
  const [filter, setFilter] = useState<Rarity | 'all'>('all');
  const [selected, setSelected] = useState<string | null>(null);

  const inventoryValue = inventory.reduce((s, i) => s + i.value, 0);

  const items = useMemo(() => {
    const list = filter === 'all' ? inventory : inventory.filter((i) => i.rarity === filter);
    return list.slice().sort((a, b) => {
      if (sort === 'value') return b.value - a.value;
      if (sort === 'rarity') return RARITY_ORDER.indexOf(b.rarity) - RARITY_ORDER.indexOf(a.rarity);
      return +new Date(b.acquiredAt) - +new Date(a.acquiredAt);
    });
  }, [inventory, filter, sort]);

  const selectedItem = inventory.find((i) => i.instanceId === selected);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Balance */}
      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-16 -right-12 size-48 rounded-full bg-amber-500/12 blur-3xl" />
        <CardBody className="relative space-y-4">
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-slate-500 uppercase">
            <Coins className="size-3.5 text-amber-400" /> Available balance
          </div>
          <CoinAmount value={user.balance} size="xl" className="text-white" />
          <div className="grid grid-cols-2 gap-2">
            <Button icon={<ArrowDownToLine className="size-4" />} onClick={() => openModal('deposit')}>Deposit</Button>
            <Button variant="secondary" icon={<ArrowUpFromLine className="size-4" />} onClick={() => openModal('withdraw')}>Withdraw</Button>
          </div>
          <div className="space-y-2 border-t border-white/8 pt-3">
            <p className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">Redeem promo</p>
            <div className="flex gap-2">
              <Input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="RIFTOPEN" icon={<Ticket className="size-4" />} />
              <Button size="lg" loading={promoMutation.isPending} onClick={() => promoMutation.mutate(promo)}>Claim</Button>
            </div>
            <p className="text-[10px] text-slate-600">Try: RIFTOPEN · NEON250 · MYTHICHUNT</p>
          </div>
        </CardBody>
      </Card>

      {/* Inventory value + breakdown */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Inventory value</CardTitle>
          <CoinAmount value={inventoryValue} decimals={0} className="text-emerald-300" />
        </CardHeader>
        <CardBody className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            {RARITY_ORDER.map((r) => {
              const count = inventory.filter((i) => i.rarity === r).length;
              const cfg = RARITY[r];
              return (
                <button
                  key={r}
                  onClick={() => setFilter(filter === r ? 'all' : r)}
                  className={cn(
                    'rounded-xl border px-2 py-2.5 text-center transition',
                    filter === r ? cfg.border : 'border-white/8 hover:border-white/16',
                  )}
                >
                  <span className="mx-auto mb-1 block size-2 rounded-full" style={{ background: cfg.hex }} />
                  <p className={cn('font-display text-sm font-bold', cfg.text)}>{count}</p>
                  <p className="text-[9px] tracking-wider text-slate-500 uppercase">{cfg.label}</p>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <Tabs
              size="sm"
              layoutId="inv-sort"
              active={sort}
              onChange={setSort}
              tabs={[{ id: 'recent', label: 'Recent' }, { id: 'value', label: 'Value' }, { id: 'rarity', label: 'Rarity' }]}
            />
            <div className="flex gap-2">
              {filter !== 'all' && (
                <Button size="sm" variant="ghost" onClick={() => setFilter('all')}>Clear filter</Button>
              )}
              <Button
                size="sm"
                variant="secondary"
                icon={<Trash2 className="size-3.5" />}
                disabled={!inventory.length}
                onClick={() => {
                  sellAll();
                  notify('success', 'Inventory liquidated', `+${formatCoins(inventoryValue, 0)} RC credited.`);
                }}
              >
                Sell all
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Item grid */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Items</CardTitle>
          <Badge tone="cyan">{items.length} shown</Badge>
        </CardHeader>
        <CardBody>
          {items.length === 0 ? (
            <EmptyState
              icon="Package"
              title="Inventory is empty"
              body="Open a case in the Case Rift to start collecting."
              action={<Link href="/cases"><Button size="sm" className="mt-2">Browse cases</Button></Link>}
            />
          ) : (
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 lg:grid-cols-8">
              {items.map((item, i) => (
                <motion.div
                  key={item.instanceId}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                >
                  <ItemCard
                    item={item}
                    size="sm"
                    selected={selected === item.instanceId}
                    onClick={() => setSelected(selected === item.instanceId ? null : item.instanceId)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </CardBody>

        {selectedItem && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-between gap-3 border-t border-white/8 px-5 py-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedItem.glyph}</span>
              <div>
                <p className="text-sm font-bold text-white">{selectedItem.name}</p>
                <p className={cn('text-[10px] font-bold uppercase', RARITY[selectedItem.rarity].text)}>
                  {RARITY[selectedItem.rarity].label} · {selectedItem.collection}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/games/upgrader">
                <Button variant="secondary" size="sm" icon={<ArrowUpRight className="size-3.5" />}>Upgrade</Button>
              </Link>
              <Button
                variant="success"
                size="sm"
                onClick={() => {
                  sellItem(selectedItem.instanceId);
                  notify('success', 'Item sold', `+${formatCoins(selectedItem.value, 0)} RC`);
                  setSelected(null);
                }}
              >
                Sell for {formatCoins(selectedItem.value, 0)}
              </Button>
            </div>
          </motion.div>
        )}
      </Card>
    </div>
  );
}
