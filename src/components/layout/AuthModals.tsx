'use client';
/** Login / Sign up / Forgot password modals driven by the UI store. */
import { useState, type FormEvent } from 'react';
import { AtSign, KeyRound, ShieldCheck, Sparkles, User as UserIcon } from 'lucide-react';
import { Button, Input, Modal } from '@/components/ui';
import { useAuth } from '@/hooks';
import { useUIStore } from '@/lib/store';
import { BRAND } from '@/lib/constants';

export function AuthModals() {
  const modal = useUIStore((s) => s.modal);
  const closeModal = useUIStore((s) => s.closeModal);
  const openModal = useUIStore((s) => s.openModal);
  const { loginMutation, signupMutation, forgotMutation } = useAuth();

  const [email, setEmail] = useState('pilot@novarift.gg');
  const [password, setPassword] = useState('riftdemo');
  const [username, setUsername] = useState('');

  const onLogin = (e: FormEvent) => { e.preventDefault(); loginMutation.mutate({ email, password }); };
  const onSignup = (e: FormEvent) => { e.preventDefault(); signupMutation.mutate({ username, email, password }); };
  const onForgot = (e: FormEvent) => { e.preventDefault(); forgotMutation.mutate(email); };

  return (
    <>
      <Modal open={modal === 'login'} onClose={closeModal} title="Enter the rift" subtitle="Sign in to resume your session.">
        <form onSubmit={onLogin} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} icon={<AtSign className="size-4" />} placeholder="you@novarift.gg" />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} icon={<KeyRound className="size-4" />} placeholder="••••••••" />
          <button type="button" onClick={() => openModal('forgot')} className="text-xs font-semibold text-cyan-300 hover:text-cyan-200">
            Forgot password?
          </button>
          <Button type="submit" size="lg" fullWidth loading={loginMutation.isPending}>Log in</Button>
          <p className="text-center text-xs text-slate-500">
            No account?{' '}
            <button type="button" onClick={() => openModal('signup')} className="font-semibold text-cyan-300 hover:text-cyan-200">
              Create one free
            </button>
          </p>
          <p className="flex items-center justify-center gap-1.5 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2 text-[11px] text-slate-500">
            <ShieldCheck className="size-3.5 text-emerald-400" /> Demo credentials are pre-filled — any email works.
          </p>
        </form>
      </Modal>

      <Modal open={modal === 'signup'} onClose={closeModal} title="Create your pilot" subtitle={`Claim 10,000 ${BRAND.currency} instantly.`}>
        <form onSubmit={onSignup} className="space-y-4">
          <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} icon={<UserIcon className="size-4" />} placeholder="NeonSaint" />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} icon={<AtSign className="size-4" />} placeholder="you@novarift.gg" />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} icon={<KeyRound className="size-4" />} hint="Minimum 6 characters." />
          <Button type="submit" size="lg" fullWidth loading={signupMutation.isPending} icon={<Sparkles className="size-4" />}>
            Create account
          </Button>
          <p className="text-center text-xs text-slate-500">
            Already registered?{' '}
            <button type="button" onClick={() => openModal('login')} className="font-semibold text-cyan-300 hover:text-cyan-200">Log in</button>
          </p>
        </form>
      </Modal>

      <Modal open={modal === 'forgot'} onClose={closeModal} title="Reset access" subtitle="We'll send a recovery link (simulated).">
        <form onSubmit={onForgot} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} icon={<AtSign className="size-4" />} />
          <Button type="submit" size="lg" fullWidth loading={forgotMutation.isPending}>Send reset link</Button>
          <button type="button" onClick={() => openModal('login')} className="w-full text-center text-xs font-semibold text-slate-400 hover:text-white">
            Back to login
          </button>
        </form>
      </Modal>
    </>
  );
}
