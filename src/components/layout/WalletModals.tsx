'use client';
/** Deposit / withdraw mock flows + Roblox connection modal. */
import { useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, CreditCard, Gamepad2, Link2, Sparkles } from 'lucide-react';
import { Avatar, Button, Input, Modal } from '@/components/ui';
import { CoinAmount } from '@/components/common/CoinAmount';
import { useRoblox, useWallet } from '@/hooks';
import { useUIStore, useUserStore } from '@/lib/store';
import { avatarFor } from '@/lib/mockData';
import { BRAND } from '@/lib/constants';
import { cn } from '@/lib/utils';

const PRESETS = [500, 2_500, 10_000, 50_000];
const METHODS = [
  { id: 'card', label: 'Card', icon: CreditCard },
  { id: 'crypto', label: 'Crypto', icon: Sparkles },
  { id: 'robux', label: 'Robux', icon: Gamepad2 },
];

export function WalletModals() {
  const modal = useUIStore((s) => s.modal);
  const closeModal = useUIStore((s) => s.closeModal);
  const user = useUserStore((s) => s.user);
  const { depositMutation, withdrawMutation } = useWallet();
  const robloxMutation = useRoblox();

  const [amount, setAmount] = useState(2_500);
  const [method, setMethod] = useState('card');
  const [robloxName, setRobloxName] = useState('');
  const [tradeUrl, setTradeUrl] = useState('');
  const [avatarSeed, setAvatarSeed] = useState(0);

  const previewName = robloxName || 'RiftPilot';
  const avatarOptions = [0, 1, 2, 3].map((i) => avatarFor(`${previewName}-${i}`));

  return (
    <>
      <Modal open={modal === 'deposit'} onClose={closeModal} title="Top up balance" subtitle="Instant, simulated, zero fees.">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-xl border py-3 text-xs font-semibold transition',
                  method === m.id
                    ? 'border-cyan-400/60 bg-cyan-400/10 text-cyan-200'
                    : 'border-white/8 bg-white/[0.02] text-slate-400 hover:text-slate-200',
                )}
              >
                <m.icon className="size-4" /> {m.label}
              </button>
            ))}
          </div>

          <Input
            label={`Amount (${BRAND.currency})`}
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />

          <div className="grid grid-cols-4 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(p)}
                className={cn(
                  'rounded-lg border py-2 text-xs font-bold transition',
                  amount === p ? 'border-cyan-400/60 bg-cyan-400/12 text-cyan-200' : 'border-white/8 text-slate-400 hover:text-slate-200',
                )}
              >
                {p >= 1000 ? `${p / 1000}K` : p}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-xl border border-white/8 bg-void-900/60 px-3 py-2.5 text-xs text-slate-400">
            <span>New balance</span>
            <CoinAmount value={(user?.balance ?? 0) + amount} className="text-emerald-300" />
          </div>

          <Button size="lg" fullWidth loading={depositMutation.isPending} onClick={() => depositMutation.mutate(amount)} icon={<ArrowDownToLine className="size-4" />}>
            Deposit {amount.toLocaleString()} {BRAND.currency}
          </Button>
        </div>
      </Modal>

      <Modal open={modal === 'withdraw'} onClose={closeModal} title="Withdraw" subtitle="Payouts settle to your linked account (mock).">
        <div className="space-y-4">
          <Input label={`Amount (${BRAND.currency})`} type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          <div className="flex items-center justify-between rounded-xl border border-white/8 bg-void-900/60 px-3 py-2.5 text-xs text-slate-400">
            <span>Available</span>
            <CoinAmount value={user?.balance ?? 0} className="text-slate-200" />
          </div>
          <Button variant="secondary" size="lg" fullWidth loading={withdrawMutation.isPending} onClick={() => withdrawMutation.mutate(amount)} icon={<ArrowUpFromLine className="size-4" />}>
            Request withdrawal
          </Button>
        </div>
      </Modal>

      <Modal open={modal === 'roblox'} onClose={closeModal} title="Connect Roblox" subtitle="Link a username, pick an avatar and store a trade URL.">
        <div className="space-y-4">
          <Input label="Roblox username" value={robloxName} onChange={(e) => setRobloxName(e.target.value)} icon={<Gamepad2 className="size-4" />} placeholder="YourRobloxName" />

          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">Avatar preview</p>
            <div className="grid grid-cols-4 gap-2">
              {avatarOptions.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setAvatarSeed(i)}
                  className={cn(
                    'grid place-items-center rounded-xl border p-2 transition',
                    avatarSeed === i ? 'border-cyan-400/60 bg-cyan-400/10' : 'border-white/8 hover:border-white/20',
                  )}
                >
                  <Avatar src={src} alt={`Avatar ${i + 1}`} size={44} />
                </button>
              ))}
            </div>
          </div>

          <Input label="Trade URL (optional)" value={tradeUrl} onChange={(e) => setTradeUrl(e.target.value)} icon={<Link2 className="size-4" />} placeholder="https://roblox.com/trade/…" />

          <Button
            size="lg"
            fullWidth
            loading={robloxMutation.isPending}
            onClick={() => robloxMutation.mutate({ username: robloxName, tradeUrl })}
          >
            Verify & link
          </Button>
        </div>
      </Modal>
    </>
  );
}
