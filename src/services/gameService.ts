/** Game catalogue, bet history and live feed endpoints (mocked). */
import type { Bet, GameId, GameMeta, LiveWin } from '@/types';
import { GAMES } from '@/lib/constants';
import { generateBet, generateBets, generateLiveWin, generateLiveWins } from '@/lib/mockData';
import { randInt } from '@/lib/utils';
import { createChannel, request } from './apiClient';

export const gameService = {
  listGames: () =>
    request<GameMeta[]>('/games', () =>
      GAMES.map((g) => ({ ...g, players: g.players + randInt(-60, 90) })),
    ),

  getGame: (id: GameId) => request<GameMeta | undefined>(`/games/${id}`, () => GAMES.find((g) => g.id === id)),

  betHistory: (gameId?: GameId, limit = 20) =>
    request<Bet[]>(`/bets${gameId ? `?game=${gameId}` : ''}`, () => generateBets(limit, gameId)),

  liveWins: (limit = 14) => request<LiveWin[]>('/feed/wins', () => generateLiveWins(limit)),

  /** Realtime substitutes — swap `createChannel` for socket listeners later. */
  liveWinChannel: createChannel<LiveWin>(generateLiveWin, 2_600),
  liveBetChannel: createChannel<Bet>(() => generateBet(), 1_900),
};
