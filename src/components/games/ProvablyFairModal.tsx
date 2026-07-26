'use client';
/**
 * Provably-fair inspector. Mirrors the real flow: client seed (editable),
 * hashed server seed, nonce and the resulting round hash.
 */
import { useState } from 'react';
import { Check, Copy, RefreshCw, ShieldCheck } from 'lucide-react';
import { Button, Input, Modal } from '@/components/ui';
import { useGameStore } from '@/lib/store';
import { mockHash } from '@/lib/utils';
import type { GameId } from '@/types';

export function ProvablyFairModal({ gameId, open, onClose }: { gameId: GameId; open: boolean; onClose: () => void }) {
  const seed = useGameStore((s) => s.seeds[gameId]);
  const rotateSeed = useGameStore((s) => s.rotateSeed);
  const [draft, setDraft] = useState(seed?.clientSeed ?? '');
  const [copied, setCopied] = useState<string | null>(null);

  if (!seed) return null;
  const serverHash = mockHash(seed.serverSeed, 64);
  const roundHash = mockHash(`${seed.serverSeed}:${seed.clientSeed}:${seed.nonce}`, 64);

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(null), 1400);
    } catch { /* clipboard unavailable */ }
  };

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="rounded-xl border border-white/8 bg-void-900/60 p-3">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">{label}</span>
        <button onClick={() => copy(label, value)} className="text-slate-500 transition hover:text-cyan-300" aria-label={`Copy ${label}`}>
          {copied === label ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
        </button>
      </div>
      <p className="font-mono text-[11px] leading-relaxed break-all text-slate-300">{value}</p>
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title="Provably Fair" subtitle="Verify every round before and after it happens." className="max-w-lg">
      <div className="space-y-3">
        <div className="flex items-start gap-3 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-3">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-cyan-300" />
          <p className="text-xs leading-relaxed text-slate-300">
            Outcomes derive from <span className="text-cyan-300">HMAC(serverSeed, clientSeed:nonce)</span>. The server seed hash is
            published up front — rotate your seed anytime to reveal the previous one.
          </p>
        </div>

        <Row label="Client seed" value={seed.clientSeed} />
        <Row label="Server seed (hashed)" value={serverHash} />
        <Row label="Nonce" value={String(seed.nonce)} />
        <Row label="Round hash" value={roundHash} />

        <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-end">
          <Input label="New client seed" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Enter a custom seed" />
          <Button
            variant="secondary"
            size="lg"
            icon={<RefreshCw className="size-4" />}
            onClick={() => rotateSeed(gameId, draft || undefined)}
            className="sm:w-auto"
          >
            Rotate
          </Button>
        </div>
      </div>
    </Modal>
  );
}
