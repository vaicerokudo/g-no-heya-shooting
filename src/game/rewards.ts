import { CLEAR_COIN_BONUS, GAME_OVER_COIN_KEEP_RATE } from './constants';
import type { GameStatus } from './types';

export type CoinRewardResult = {
  status: Extract<GameStatus, 'clear' | 'gameOver'>;
  stageCoins: number;
  clearBonus: number;
  keepRate: number;
  addedCoins: number;
};

export function calculateCoinReward(status: GameStatus, stageCoins: number): CoinRewardResult | null {
  if (status === 'clear') {
    return {
      status,
      stageCoins,
      clearBonus: CLEAR_COIN_BONUS,
      keepRate: 1,
      addedCoins: stageCoins + CLEAR_COIN_BONUS,
    };
  }

  if (status === 'gameOver') {
    return {
      status,
      stageCoins,
      clearBonus: 0,
      keepRate: GAME_OVER_COIN_KEEP_RATE,
      addedCoins: Math.floor(stageCoins * GAME_OVER_COIN_KEEP_RATE),
    };
  }

  return null;
}
