'use client';
/**
 * Shared round lifecycle used by every game:
 * validate → debit → (game logic) → settle → history + XP + celebration.
 */
import { useCallback } from 'react';
import type { Bet, BetOutcome, GameId } from '@/types';
import { useGameStore, useUIStore, useUserStore } from '@/lib/store';
import { uid } from '@/lib/utils';
import { useCelebration } from './useCelebration';

export interface SettleArgs {
  amount: number;
  payout: number;
  multiplier: number;
  detail?: string;
  /** Skip confetti (e.g. tiny wins or non-terminal steps). */
  silent?: boolean;
}

export function useGamePlay(gameId: GameId) {
  const user = useUserStore((s) => s.user);
  const adjustBalance = useUserStore((s) => s.adjustBalance);
  const recordResult = useUserStore((s) => s.recordResult);
  const pushBet = useGameStore((s) => s.pushBet);
  const bumpNonce = useGameStore((s) => s.bumpNonce);
  const notify = useUIStore((s) => s.notify);
  const openModal = useUIStore((s) => s.openModal);
  const { burst, shake } = useCelebration();

  /** Returns false (and surfaces a toast/modal) when the wager can't be placed. */
  const canPlay = useCallback(
    (amount: number) => {
      if (!user) {
        openModal('login');
        notify('info', 'Sign in required', 'Create a free demo account to play.');
        return false;
      }
      if (amount <= 0) {
        notify('error', 'Invalid bet', 'Enter an amount greater than zero.');
        return false;
      }
      if (amount > user.balance) {
        notify('error', 'Insufficient balance', 'Top up from the wallet to keep playing.');
        return false;
      }
      return true;
    },
    [user, notify, openModal],
  );

  /** Debit the wager at round start. */
  const placeBet = useCallback(
    (amount: number) => {
      if (!canPlay(amount)) return false;
      adjustBalance(-amount);
      bumpNonce(gameId);
      return true;
    },
    [canPlay, adjustBalance, bumpNonce, gameId],
  );

  /** Credit the payout, log the bet and fire celebration effects. */
  const settle = useCallback(
    ({ amount, payout, multiplier, detail, silent }: SettleArgs) => {
      if (!user) return;
      if (payout > 0) adjustBalance(payout);
      recordResult(amount, payout);

      const outcome: BetOutcome = payout > amount ? 'win' : payout === amount ? 'push' : 'loss';
      const bet: Bet = {
        id: uid('bet'),
        gameId,
        user: { id: user.id, username: user.username, avatarUrl: user.avatarUrl, level: user.level },
        amount,
        multiplier,
        payout,
        outcome,
        createdAt: new Date().toISOString(),
        detail,
      };
      pushBet(gameId, bet);

      if (!silent && outcome === 'win') {
        burst(multiplier >= 10 ? 'large' : multiplier >= 3 ? 'medium' : 'small');
        if (multiplier >= 10) shake();
      }
      return bet;
    },
    [user, adjustBalance, recordResult, pushBet, gameId, burst, shake],
  );

  return { user, canPlay, placeBet, settle, burst, shake, notify };
}
