import { FIELD_WIDTH } from './constants';
import type { Enemy, EnemyKind } from './types';

const enemyStats: Record<EnemyKind, Pick<Enemy, 'radius' | 'hp' | 'maxHp' | 'speed'>> = {
  small: { radius: 15, hp: 1, maxHp: 1, speed: 90 },
  flying: { radius: 17, hp: 1, maxHp: 1, speed: 74 },
  charger: { radius: 19, hp: 2, maxHp: 2, speed: 58 },
};

export function chooseEnemyKind(elapsed: number, defeatedEnemies: number): EnemyKind {
  if (elapsed < 10) return 'small';
  if (defeatedEnemies % 7 === 4) return 'charger';
  if (defeatedEnemies % 3 === 1) return 'flying';
  return 'small';
}

export function createEnemy(id: number, kind: EnemyKind, elapsed: number): Enemy {
  const stats = enemyStats[kind];
  const laneOffset = Math.sin(id * 1.9) * 120;
  const x = Math.max(38, Math.min(FIELD_WIDTH - 38, FIELD_WIDTH / 2 + laneOffset));

  return {
    id,
    kind,
    x,
    y: -36,
    spawnTime: elapsed,
    ...stats,
  };
}
