'use client';
/** Global live chat drawer with rank badges, tipping and rain events. */
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CloudRain, Crown, Send, Shield, Sparkles, Users, X } from 'lucide-react';
import { Avatar, Badge, Button } from '@/components/ui';
import { CoinAmount } from '@/components/common/CoinAmount';
import { useChat } from '@/hooks';
import { useUIStore, useUserStore } from '@/lib/store';
import { cn, formatCoins, formatTime } from '@/lib/utils';
import type { ChatMessage, UserRole } from '@/types';

const ROLE_BADGE: Partial<Record<UserRole, { label: string; icon: typeof Crown; tone: string }>> = {
  vip: { label: 'VIP', icon: Crown, tone: 'text-amber-300 border-amber-400/30 bg-amber-400/10' },
  moderator: { label: 'MOD', icon: Shield, tone: 'text-cyan-300 border-cyan-400/30 bg-cyan-400/10' },
  admin: { label: 'ADMIN', icon: Sparkles, tone: 'text-fuchsia-300 border-fuchsia-400/30 bg-fuchsia-400/10' },
};

function MessageRow({ msg }: { msg: ChatMessage }) {
  if (msg.kind === 'rain' || msg.kind === 'tip') {
    const isRain = msg.kind === 'rain';
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'flex items-center gap-2 rounded-xl border px-3 py-2 text-xs',
          isRain ? 'border-cyan-400/30 bg-cyan-400/8' : 'border-emerald-400/25 bg-emerald-400/8',
        )}
      >
        {isRain ? <CloudRain className="size-4 shrink-0 text-cyan-300" /> : <Sparkles className="size-4 shrink-0 text-emerald-300" />}
        <span className="min-w-0 flex-1 truncate text-slate-300">
          <span className="font-semibold text-white">{msg.username}</span> {msg.body}
        </span>
        <CoinAmount value={msg.amount ?? 0} size="xs" decimals={0} className={isRain ? 'text-cyan-300' : 'text-emerald-300'} />
      </motion.div>
    );
  }

  const role = ROLE_BADGE[msg.role];
  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="group flex gap-2.5">
      <Avatar src={msg.avatarUrl} alt={msg.username} size={30} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="rounded bg-white/5 px-1 text-[9px] font-bold text-slate-400">{msg.level}</span>
          {role && (
            <span className={cn('rounded border px-1 text-[9px] font-bold', role.tone)}>{role.label}</span>
          )}
          <span className="truncate text-xs font-semibold text-slate-200">{msg.username}</span>
          <span className="ml-auto text-[9px] text-slate-600 opacity-0 transition group-hover:opacity-100">
            {formatTime(msg.createdAt)}
          </span>
        </div>
        <p className="mt-0.5 text-xs leading-relaxed break-words text-slate-400">{msg.body}</p>
      </div>
    </motion.div>
  );
}

export function ChatDrawer() {
  const open = useUIStore((s) => s.chatOpen);
  const setChat = useUIStore((s) => s.setChat);
  const notify = useUIStore((s) => s.notify);
  const user = useUserStore((s) => s.user);
  const adjustBalance = useUserStore((s) => s.adjustBalance);
  const { messages, onlineCount, rainCountdown, send, triggerRain } = useChat();
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const submit = () => {
    if (!draft.trim()) return;
    if (!user) return notify('info', 'Sign in to chat', 'Chat is available to registered pilots.');
    send({
      userId: user.id, username: user.username, avatarUrl: user.avatarUrl,
      level: user.level, role: user.role, body: draft.trim(), kind: 'message',
    });
    setDraft('');
  };

  const rain = () => {
    if (!user) return notify('info', 'Sign in to make it rain', 'Chat rain requires an account.');
    const amount = 1_000;
    if (user.balance < amount) return notify('error', 'Not enough coins', 'You need 1,000 RC to start a rain.');
    adjustBalance(-amount);
    triggerRain(user.username, user.avatarUrl, amount);
    notify('reward', 'Rain started!', `${formatCoins(amount, 0)} RC split across active chatters.`);
  };

  const mins = String(Math.floor(rainCountdown / 60)).padStart(2, '0');
  const secs = String(rainCountdown % 60).padStart(2, '0');

  return (
    <>
      {/* Floating launcher */}
      <motion.button
        onClick={() => setChat(!open)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="fixed right-4 bottom-4 z-40 grid size-13 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 p-3.5 text-void-950 shadow-[0_14px_40px_-12px_rgba(34,211,238,0.9)] lg:right-6 lg:bottom-6"
        aria-label="Toggle live chat"
      >
        {open ? <X className="size-5" /> : <Send className="size-5" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setChat(false)}
              className="fixed inset-0 z-40 bg-void-950/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
              className="glass-strong fixed top-0 right-0 z-50 flex h-full w-[min(23rem,100vw)] flex-col border-l border-white/10"
            >
              <div className="flex items-center justify-between border-b border-white/8 px-4 py-3.5">
                <div>
                  <h3 className="font-display flex items-center gap-2 text-sm font-bold text-white">
                    Rift Chat
                    <Badge tone="emerald" pulse>
                      <Users className="mr-0.5 size-2.5" />{onlineCount.toLocaleString()}
                    </Badge>
                  </h3>
                  <p className="mt-0.5 text-[11px] text-slate-500">Next rain in {mins}:{secs}</p>
                </div>
                <button onClick={() => setChat(false)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white" aria-label="Close chat">
                  <X className="size-4" />
                </button>
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
                <AnimatePresence initial={false}>
                  {messages.map((m) => <MessageRow key={m.id} msg={m} />)}
                </AnimatePresence>
                <div ref={endRef} />
              </div>

              <div className="space-y-2 border-t border-white/8 p-3">
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" icon={<CloudRain className="size-3.5" />} onClick={rain} className="flex-1">
                    Rain 1K
                  </Button>
                  <Button
                    variant="secondary" size="sm" icon={<Sparkles className="size-3.5" />} className="flex-1"
                    onClick={() => notify('info', 'Tip a player', 'Click a username in chat to tip them (mock).')}
                  >
                    Tip
                  </Button>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-void-900/70 px-3 focus-within:border-cyan-400/50">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submit()}
                    placeholder="Say something to the rift…"
                    maxLength={180}
                    className="h-10 w-full bg-transparent text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none"
                  />
                  <button onClick={submit} className="text-cyan-300 transition hover:text-cyan-200" aria-label="Send message">
                    <Send className="size-4" />
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
