import { CLEAR_COIN_BONUS, GAME_OVER_COIN_KEEP_RATE, NO_DAMAGE_CLEAR_BONUS_MULTIPLIER } from './constants';
import type { GameStatus } from './types';

export type CoinRewardResult = {
  status: Extract<GameStatus, 'clear' | 'gameOver'>;
  stageCoins: number;
  clearBonus: number;
  keepRate: number;
  baseClearReward: number;
  noDamageMultiplier: number;
  noDamageBonus: number;
  isNoDamageClear: boolean;
  addedCoins: number;
};

export function calculateCoinReward(
  status: GameStatus,
  stageCoins: number,
  hasTakenDamage = true,
): CoinRewardResult | null {
  if (status === 'clear') {
    const baseClearReward = stageCoins + CLEAR_COIN_BONUS;
    const isNoDamageClear = !hasTakenDamage;
    const addedCoins = isNoDamageClear
      ? Math.floor(baseClearReward * NO_DAMAGE_CLEAR_BONUS_MULTIPLIER)
      : baseClearReward;

    return {
      status,
      stageCoins,
      clearBonus: CLEAR_COIN_BONUS,
      keepRate: 1,
      baseClearReward,
      noDamageMultiplier: isNoDamageClear ? NO_DAMAGE_CLEAR_BONUS_MULTIPLIER : 1,
      noDamageBonus: addedCoins - baseClearReward,
      isNoDamageClear,
      addedCoins,
    };
  }

  if (status === 'gameOver') {
    return {
      status,
      stageCoins,
      clearBonus: 0,
      keepRate: GAME_OVER_COIN_KEEP_RATE,
      baseClearReward: 0,
      noDamageMultiplier: 1,
      noDamageBonus: 0,
      isNoDamageClear: false,
      addedCoins: Math.floor(stageCoins * GAME_OVER_COIN_KEEP_RATE),
    };
  }

  return null;
}
