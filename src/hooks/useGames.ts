'use client';
/** React Query hooks for the game catalogue, bet history and live feeds. */
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Bet, GameId, LiveWin } from '@/types';
import { gameService } from '@/services';

export function useGames() {
  return useQuery({ queryKey: ['games'], queryFn: gameService.listGames, staleTime: 30_000 });
}

export function useGame(id: GameId) {
  return useQuery({ queryKey: ['game', id], queryFn: () => gameService.getGame(id) });
}

export function useBetHistory(gameId?: GameId, limit = 20) {
  return useQuery({
    queryKey: ['bets', gameId, limit],
    queryFn: () => gameService.betHistory(gameId, limit),
    staleTime: 15_000,
  });
}

/** Live win ticker backed by the mock channel (drop-in for a socket stream). */
export function useLiveWins(max = 16) {
  const { data } = useQuery({ queryKey: ['live-wins'], queryFn: () => gameService.liveWins(max) });
  const [wins, setWins] = useState<LiveWin[]>([]);

  useEffect(() => { if (data) setWins(data); }, [data]);

  useEffect(
    () => gameService.liveWinChannel.subscribe((win) => setWins((prev) => [win, ...prev].slice(0, max))),
    [max],
  );

  return wins;
}

/** Live bet stream for the "all games" feed. */
export function useLiveBets(max = 12) {
  const [bets, setBets] = useState<Bet[]>([]);
  useEffect(
    () => gameService.liveBetChannel.subscribe((bet) => setBets((prev) => [bet, ...prev].slice(0, max))),
    [max],
  );
  return bets;
}
