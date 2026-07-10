import { FIELD_WIDTH } from './constants';
import type { StageAreaId } from './stages';
import type { Enemy, EnemyKind } from './types';

const enemyStats: Record<EnemyKind, Pick<Enemy, 'radius' | 'hp' | 'maxHp' | 'speed'>> = {
  small: { radius: 15, hp: 1, maxHp: 1, speed: 90 },
  flying: { radius: 17, hp: 1, maxHp: 1, speed: 74 },
  charger: { radius: 19, hp: 2, maxHp: 2, speed: 58 },
  scorpion: { radius: 17, hp: 2, maxHp: 2, speed: 74 },
  rockGolem: { radius: 24, hp: 5, maxHp: 5, speed: 34 },
  securityDrone: { radius: 16, hp: 2, maxHp: 2, speed: 78 },
  experiment: { radius: 21, hp: 4, maxHp: 4, speed: 48 },
  killerFish: { radius: 16, hp: 2, maxHp: 2, speed: 70 },
  noiseShade: { radius: 18, hp: 3, maxHp: 3, speed: 56 },
  bayShell: { radius: 24, hp: 5, maxHp: 5, speed: 34 },
};

export function chooseEnemyKind(elapsed: number, defeatedEnemies: number, areaId: StageAreaId = 'astoria-grassland'): EnemyKind {
  if (areaId === 'sandstorm-wilderness') {
    if (elapsed < 8) return 'scorpion';
    if (defeatedEnemies % 6 === 4 || defeatedEnemies % 9 === 6) return 'rockGolem';
    return 'scorpion';
  }

  if (areaId === 'delta-facility') {
    if (elapsed < 8) return 'securityDrone';
    if (defeatedEnemies % 5 === 3) return 'experiment';
    return 'securityDrone';
  }

  if (areaId === 'black-noise-bay') {
    if (elapsed < 7) return 'killerFish';
    if (defeatedEnemies % 7 === 4) return 'bayShell';
    if (defeatedEnemies % 4 === 1) return 'noiseShade';
    return 'killerFish';
  }

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
    ...(kind === 'scorpion' ? { shotCooldown: 1.1 + (id % 3) * 0.32 } : {}),
    ...(kind === 'securityDrone' ? { shotCooldown: 0.9 + (id % 3) * 0.28 } : {}),
    ...(kind === 'killerFish' ? { shotCooldown: 1.2 + (id % 3) * 0.3 } : {}),
    ...(kind === 'bayShell' ? { shotCooldown: 1.8 + (id % 3) * 0.35 } : {}),
    ...stats,
  };
}
