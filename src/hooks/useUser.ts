'use client';
/** Auth + wallet mutations bridging the service layer and the Zustand store. */
import { useMutation } from '@tanstack/react-query';
import { userService, type Credentials } from '@/services';
import { useUIStore, useUserStore } from '@/lib/store';
import { BRAND } from '@/lib/constants';
import { formatCoins } from '@/lib/utils';

export function useAuth() {
  const login = useUserStore((s) => s.login);
  const signup = useUserStore((s) => s.signup);
  const logout = useUserStore((s) => s.logout);
  const notify = useUIStore((s) => s.notify);
  const closeModal = useUIStore((s) => s.closeModal);

  const loginMutation = useMutation({
    mutationFn: (creds: Credentials) => userService.login(creds),
    onSuccess: (user) => {
      login(user.email, user.username);
      closeModal();
      notify('success', `Welcome back, ${user.username}`, 'Your rift session is live.');
    },
    onError: (e: Error) => notify('error', 'Login failed', e.message),
  });

  const signupMutation = useMutation({
    mutationFn: ({ username, ...creds }: Credentials & { username: string }) =>
      userService.signup(username, creds),
    onSuccess: (user) => {
      signup(user.username, user.email);
      closeModal();
      notify('reward', 'Account created', `10,000 ${BRAND.currency} demo balance credited.`);
    },
    onError: (e: Error) => notify('error', 'Signup failed', e.message),
  });

  const forgotMutation = useMutation({
    mutationFn: (email: string) => userService.requestPasswordReset(email),
    onSuccess: () => notify('info', 'Reset link sent', 'Check your inbox (simulated).'),
    onError: (e: Error) => notify('error', 'Could not send reset', e.message),
  });

  return {
    loginMutation,
    signupMutation,
    forgotMutation,
    logout: () => {
      logout();
      notify('info', 'Signed out', 'See you back in the rift.');
    },
  };
}

export function useWallet() {
  const user = useUserStore((s) => s.user);
  const depositLocal = useUserStore((s) => s.deposit);
  const withdrawLocal = useUserStore((s) => s.withdraw);
  const notify = useUIStore((s) => s.notify);
  const closeModal = useUIStore((s) => s.closeModal);

  const depositMutation = useMutation({
    mutationFn: (amount: number) => userService.deposit(amount),
    onSuccess: ({ amount, reference }) => {
      depositLocal(amount);
      closeModal();
      notify('reward', `+${formatCoins(amount, 0)} ${BRAND.currency}`, `Deposit ${reference} settled.`);
    },
    onError: (e: Error) => notify('error', 'Deposit failed', e.message),
  });

  const withdrawMutation = useMutation({
    mutationFn: (amount: number) => userService.withdraw(amount, user?.balance ?? 0),
    onSuccess: ({ amount, reference }) => {
      withdrawLocal(amount);
      closeModal();
      notify('success', `Withdrawal queued`, `${formatCoins(amount, 0)} ${BRAND.currency} · ${reference}`);
    },
    onError: (e: Error) => notify('error', 'Withdrawal failed', e.message),
  });

  const promoMutation = useMutation({
    mutationFn: (code: string) => userService.redeemPromo(code),
    onSuccess: ({ code, reward }) => {
      depositLocal(reward);
      notify('reward', `${code} redeemed`, `+${formatCoins(reward, 0)} ${BRAND.currency}`);
    },
    onError: (e: Error) => notify('error', 'Invalid code', e.message),
  });

  return { depositMutation, withdrawMutation, promoMutation };
}

export function useRoblox() {
  const connect = useUserStore((s) => s.connectRoblox);
  const notify = useUIStore((s) => s.notify);
  const closeModal = useUIStore((s) => s.closeModal);

  return useMutation({
    mutationFn: ({ username, tradeUrl }: { username: string; tradeUrl?: string }) =>
      userService.linkRoblox(username, tradeUrl),
    onSuccess: (res) => {
      connect({ username: res.username, userId: res.userId, tradeUrl: res.tradeUrl });
      closeModal();
      notify('success', 'Roblox linked', `${res.username} · #${res.userId}`);
    },
    onError: (e: Error) => notify('error', 'Link failed', e.message),
  });
}
