import {
  FIELD_HEIGHT,
  FIELD_WIDTH,
  COIN_MAGNET_RADIUS,
  COIN_PICKUP_RADIUS,
  NANA_SUPPORT_BONUS_COIN_CHANCE,
  NANA_SUPPORT_BOSS_BONUS_COINS,
  NANA_SUPPORT_MAGNET_MULTIPLIER,
  NANA_SUPPORT_PICKUP_MULTIPLIER,
  PLAYER_SUPPORT_BULLET_DAMAGE,
  PLAYER_SUPPORT_BULLET_LIFE,
  PLAYER_SUPPORT_BULLET_RADIUS,
  PLAYER_SUPPORT_BULLET_SPEED,
  PLAYER_SUPPORT_FIRE_INTERVAL,
  PLAYER_SUPPORT_SHOTS_PER_BURST,
} from './constants';
import type { Boss, Coin, Enemy, FloatingEffect, GameState, SupportBullet, SupportId, Vector } from './types';

const PLAYER_SUPPORT_DIRECTIONS: Vector[] = [
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: -0.72, y: -0.7 },
  { x: 0.72, y: -0.7 },
];

export function updateSupportEffects(state: GameState, dt: number, supportId: SupportId | null): GameState {
  let next = updateSupportBullets(state, dt);

  if (supportId !== 'player') {
    return next;
  }

  const cooldown = next.supportCooldowns.playerGunfire - dt;
  if (cooldown > 0) {
    return {
      ...next,
      supportCooldowns: {
        ...next.supportCooldowns,
        playerGunfire: cooldown,
      },
    };
  }

  return spawnPlayerGunfire(next, cooldown);
}

export function is7171Support(supportId: SupportId | null): boolean {
  return supportId === '7171';
}

export function getCoinMagnetRadius(supportId: SupportId | null): number {
  return is7171Support(supportId) ? COIN_MAGNET_RADIUS * NANA_SUPPORT_MAGNET_MULTIPLIER : COIN_MAGNET_RADIUS;
}

export function getCoinPickupRadius(supportId: SupportId | null): number {
  return is7171Support(supportId) ? COIN_PICKUP_RADIUS * NANA_SUPPORT_PICKUP_MULTIPLIER : COIN_PICKUP_RADIUS;
}

export function get7171BossClearCoinBonus(supportId: SupportId | null): number {
  return is7171Support(supportId) ? NANA_SUPPORT_BOSS_BONUS_COINS : 0;
}

export function createEnemyCoinDrops(enemy: Enemy, nextId: number, supportId: SupportId | null) {
  const coins: Coin[] = [{ id: nextId++, x: enemy.x, y: enemy.y, value: enemy.kind === 'charger' ? 3 : 1 }];
  const effects: FloatingEffect[] = [];

  if (is7171Support(supportId) && Math.random() < NANA_SUPPORT_BONUS_COIN_CHANCE) {
    const xOffset = Math.random() > 0.5 ? 14 : -14;
    coins.push({ id: nextId++, x: enemy.x + xOffset, y: enemy.y - 8, value: 1, isBonus: true });
    effects.push({
      id: nextId++,
      kind: 'bonus',
      x: enemy.x,
      y: enemy.y - 22,
      text: 'BONUS',
      timer: 0.46,
    });
  }

  return { coins, effects, nextId };
}

function spawnPlayerGunfire(state: GameState, cooldownRemainder: number): GameState {
  let nextId = state.nextId;
  const bullets: SupportBullet[] = [];

  for (let index = 0; index < PLAYER_SUPPORT_SHOTS_PER_BURST; index += 1) {
    const direction = chooseDirection();
    const handOffset = index % 2 === 0 ? -12 : 12;
    bullets.push({
      id: nextId++,
      x: state.player.x + handOffset,
      y: state.player.y - 12,
      vx: direction.x * PLAYER_SUPPORT_BULLET_SPEED,
      vy: direction.y * PLAYER_SUPPORT_BULLET_SPEED,
      radius: PLAYER_SUPPORT_BULLET_RADIUS,
      damage: PLAYER_SUPPORT_BULLET_DAMAGE,
      life: PLAYER_SUPPORT_BULLET_LIFE,
    });
  }

  const effects: FloatingEffect[] = [
    ...state.effects,
    {
      id: nextId++,
      kind: 'support',
      x: state.player.x,
      y: state.player.y - 34,
      text: '援護射撃',
      timer: 0.42,
    },
  ];

  return {
    ...state,
    supportBullets: [...state.supportBullets, ...bullets],
    effects,
    nextId,
    supportCooldowns: {
      ...state.supportCooldowns,
      playerGunfire: PLAYER_SUPPORT_FIRE_INTERVAL + cooldownRemainder,
    },
  };
}

function updateSupportBullets(state: GameState, dt: number): GameState {
  const movedBullets = state.supportBullets
    .map((bullet) => ({
      ...bullet,
      x: bullet.x + bullet.vx * dt,
      y: bullet.y + bullet.vy * dt,
      life: bullet.life - dt,
    }))
    .filter(
      (bullet) =>
        bullet.life > 0 &&
        bullet.x > -40 &&
        bullet.x < FIELD_WIDTH + 40 &&
        bullet.y > -40 &&
        bullet.y < FIELD_HEIGHT + 40,
    );

  return resolveSupportBulletHits({ ...state, supportBullets: movedBullets });
}

function resolveSupportBulletHits(state: GameState): GameState {
  let nextId = state.nextId;
  let defeatedEnemies = state.defeatedEnemies;
  let boss = state.boss;
  const coins: Coin[] = [...state.coins];
  const effects: FloatingEffect[] = [...state.effects];
  const enemies: Enemy[] = state.enemies.map((enemy) => ({ ...enemy }));
  const remainingBullets: SupportBullet[] = [];

  for (const bullet of state.supportBullets) {
    const enemyIndex = enemies.findIndex(
      (enemy) => Math.hypot(enemy.x - bullet.x, enemy.y - bullet.y) < enemy.radius + bullet.radius,
    );

    if (enemyIndex >= 0) {
      const enemy = enemies[enemyIndex];
      const hp = enemy.hp - bullet.damage;
      effects.push(createSupportHitEffect(nextId++, enemy.x, enemy.y, `-${bullet.damage}`));

      if (hp <= 0) {
        defeatedEnemies += 1;
        const drops = createEnemyCoinDrops(enemy, nextId, 'player');
        coins.push(...drops.coins);
        effects.push(...drops.effects);
        nextId = drops.nextId;
        enemies.splice(enemyIndex, 1);
      } else {
        enemies[enemyIndex] = { ...enemy, hp, hitTimer: 0.12 };
      }
      continue;
    }

    if (boss && isBossHit(boss, bullet)) {
      boss = {
        ...boss,
        hp: boss.hp - bullet.damage,
        hitTimer: 0.14,
      };
      effects.push(createSupportHitEffect(nextId++, bullet.x, bullet.y, `-${bullet.damage}`));
      continue;
    }

    remainingBullets.push(bullet);
  }

  return {
    ...state,
    enemies,
    coins,
    effects,
    boss,
    defeatedEnemies,
    nextId,
    supportBullets: remainingBullets,
  };
}

function isBossHit(boss: Boss, bullet: SupportBullet): boolean {
  const hitRadius = boss.radius * 0.68 + bullet.radius;
  return Math.hypot(boss.x - bullet.x, boss.y - bullet.y) < hitRadius;
}

function createSupportHitEffect(id: number, x: number, y: number, text: string): FloatingEffect {
  return {
    id,
    kind: 'hit',
    x,
    y,
    text,
    timer: 0.3,
  };
}

function chooseDirection(): Vector {
  const direction = PLAYER_SUPPORT_DIRECTIONS[Math.floor(Math.random() * PLAYER_SUPPORT_DIRECTIONS.length)];
  const length = Math.hypot(direction.x, direction.y) || 1;
  return {
    x: direction.x / length,
    y: direction.y / length,
  };
}
