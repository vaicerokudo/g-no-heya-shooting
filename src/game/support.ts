import {
  FIELD_HEIGHT,
  FIELD_WIDTH,
  COIN_MAGNET_RADIUS,
  COIN_PICKUP_RADIUS,
  HIBIKI_SHIELD_BLOCKS,
  HIBIKI_SHIELD_DURATION,
  HIBIKI_SHIELD_FLASH_TIME,
  HIBIKI_SHIELD_HEIGHT,
  HIBIKI_SHIELD_INTERVAL,
  HIBIKI_SHIELD_WIDTH,
  MYOUOU_GARUDA_BOSS_DAMAGE,
  MYOUOU_GARUDA_DAMAGE,
  MYOUOU_GARUDA_DURATION,
  MYOUOU_GARUDA_FRAME_INTERVAL,
  MYOUOU_GARUDA_FRAME_PATHS,
  MYOUOU_GARUDA_HEIGHT,
  MYOUOU_GARUDA_HIT_RANGE_X,
  MYOUOU_GARUDA_HIT_RANGE_Y,
  MYOUOU_GARUDA_INTERVAL,
  MYOUOU_GARUDA_WIDTH,
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
  YABUKO_HEART_DROP_CHANCE,
  YABUKO_RED_HEART_HEAL,
} from './constants';
import type {
  Boss,
  Coin,
  Enemy,
  FloatingEffect,
  GameState,
  HeartPickup,
  HibikiShieldState,
  MyououGarudaState,
  SupportBullet,
  SupportId,
  Vector,
} from './types';

const PLAYER_SUPPORT_DIRECTIONS: Vector[] = [
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: -0.72, y: -0.7 },
  { x: 0.72, y: -0.7 },
];

export function updateSupportEffects(state: GameState, dt: number, supportId: SupportId | null): GameState {
  let next = updateSupportBullets(state, dt);
  next = updateHibikiShield(next, dt, supportId);
  next = updateMyououGaruda(next, dt, supportId);

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

export function isYabukoSupport(supportId: SupportId | null): boolean {
  return supportId === 'yabuko';
}

export function isHibikiSupport(supportId: SupportId | null): boolean {
  return supportId === 'hibiki';
}

export function isMyououSupport(supportId: SupportId | null): boolean {
  return supportId === 'myouou';
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

export function createYabukoHeartDrop(enemy: Enemy, nextId: number, supportId: SupportId | null) {
  const hearts: HeartPickup[] = [];
  const effects: FloatingEffect[] = [];

  if (isYabukoSupport(supportId) && Math.random() < YABUKO_HEART_DROP_CHANCE) {
    hearts.push({
      id: nextId++,
      x: enemy.x + (Math.random() > 0.5 ? 12 : -12),
      y: enemy.y - 10,
      heartType: 'red',
      healAmount: YABUKO_RED_HEART_HEAL,
    });
    effects.push({
      id: nextId++,
      kind: 'heal',
      x: enemy.x,
      y: enemy.y - 26,
      text: 'HEART',
      timer: 0.46,
    });
  }

  return { hearts, effects, nextId };
}

export function resolveHibikiContactGuard(state: GameState, enemy: Enemy | null): GameState | null {
  if (!enemy || !isShieldActive(state.supportShield) || !isPointInHibikiShield(state, enemy.x, enemy.y, enemy.radius)) {
    return null;
  }

  let nextId = state.nextId;
  return {
    ...state,
    effects: [
      ...state.effects,
      {
        id: nextId++,
        kind: 'support',
        x: state.player.x,
        y: state.player.y - 74,
        text: 'GUARD',
        timer: 0.36,
      },
    ],
    nextId,
    supportShield: consumeShieldBlock(state.supportShield),
    player: {
      ...state.player,
      invincibleTimer: Math.max(state.player.invincibleTimer, 0.38),
    },
  };
}

export function getHibikiShieldView(state: GameState) {
  if (!isShieldActive(state.supportShield)) return null;
  return {
    x: state.player.x,
    y: state.player.y - HIBIKI_SHIELD_HEIGHT * 0.52,
    width: HIBIKI_SHIELD_WIDTH,
    height: HIBIKI_SHIELD_HEIGHT,
    blocksRemaining: state.supportShield.blocksRemaining,
    isGuarding: state.supportShield.flashTimer > 0,
  };
}

export function getMyououGarudaView(state: GameState) {
  if (!isGarudaActive(state.supportGaruda)) return null;
  const { x, y } = getGarudaPosition(state.supportGaruda);
  const elapsed = MYOUOU_GARUDA_DURATION - state.supportGaruda.timer;
  const framePattern = [0, 1, 2, 1];
  const frameIndex = framePattern[Math.floor(elapsed / MYOUOU_GARUDA_FRAME_INTERVAL) % framePattern.length];
  return {
    x,
    y,
    width: MYOUOU_GARUDA_WIDTH,
    height: MYOUOU_GARUDA_HEIGHT,
    direction: state.supportGaruda.direction,
    frameSrc: MYOUOU_GARUDA_FRAME_PATHS[frameIndex],
  };
}

function updateMyououGaruda(state: GameState, dt: number, supportId: SupportId | null): GameState {
  const garuda: MyououGarudaState = {
    ...state.supportGaruda,
    cooldown: Math.max(0, state.supportGaruda.cooldown - dt),
    timer: Math.max(0, state.supportGaruda.timer - dt),
  };

  if (!isMyououSupport(supportId)) {
    return {
      ...state,
      supportGaruda: garuda.timer > 0 ? { ...garuda, timer: 0, hitEnemyIds: [], hasHitBoss: false } : garuda,
    };
  }

  let next: GameState = { ...state, supportGaruda: garuda };
  if (garuda.timer <= 0 && garuda.cooldown <= 0) {
    next = activateMyououGaruda(next);
  }

  if (isGarudaActive(next.supportGaruda)) {
    next = damageWithGaruda(next);
  }

  return next;
}

function activateMyououGaruda(state: GameState): GameState {
  let nextId = state.nextId;
  return {
    ...state,
    supportGaruda: {
      cooldown: MYOUOU_GARUDA_INTERVAL,
      timer: MYOUOU_GARUDA_DURATION,
      direction: 'bottomToTop',
      hitEnemyIds: [],
      hasHitBoss: false,
    },
    effects: [
      ...state.effects,
      {
        id: nextId++,
        kind: 'support',
        x: FIELD_WIDTH / 2,
        y: FIELD_HEIGHT * 0.28,
        text: '迦楼羅顕現',
        timer: 0.58,
      },
    ],
    nextId,
  };
}

function damageWithGaruda(state: GameState): GameState {
  let nextId = state.nextId;
  let defeatedEnemies = state.defeatedEnemies;
  let boss = state.boss;
  let garuda = state.supportGaruda;
  const coins = [...state.coins];
  const effects = [...state.effects];
  const { x, y } = getGarudaPosition(garuda);
  const enemies: GameState['enemies'] = [];

  for (const enemy of state.enemies) {
    if (garuda.hitEnemyIds.includes(enemy.id) || !isPointInGarudaPath(x, y, enemy.x, enemy.y, enemy.radius)) {
      enemies.push(enemy);
      continue;
    }

    const hp = enemy.hp - MYOUOU_GARUDA_DAMAGE;
    garuda = { ...garuda, hitEnemyIds: [...garuda.hitEnemyIds, enemy.id] };
    effects.push({
      id: nextId++,
      kind: 'support',
      x: enemy.x,
      y: enemy.y,
      text: `-${MYOUOU_GARUDA_DAMAGE}`,
      timer: 0.34,
    });

    if (hp <= 0) {
      defeatedEnemies += 1;
      const drops = createEnemyCoinDrops(enemy, nextId, 'myouou');
      coins.push(...drops.coins);
      effects.push(...drops.effects);
      nextId = drops.nextId;
    } else {
      enemies.push({ ...enemy, hp, hitTimer: 0.18 });
    }
  }

  if (boss && !garuda.hasHitBoss && isPointInGarudaPath(x, y, boss.x, boss.y, boss.radius * 0.72)) {
    boss = {
      ...boss,
      hp: boss.hp - MYOUOU_GARUDA_BOSS_DAMAGE,
      hitTimer: 0.22,
    };
    garuda = { ...garuda, hasHitBoss: true };
    effects.push({
      id: nextId++,
      kind: 'support',
      x: boss.x,
      y: boss.y + boss.radius * 0.12,
      text: `-${MYOUOU_GARUDA_BOSS_DAMAGE}`,
      timer: 0.38,
    });
  }

  const bullets: GameState['bullets'] = [];
  for (const bullet of state.bullets) {
    if (isPointInGarudaPath(x, y, bullet.x, bullet.y, bullet.radius)) {
      effects.push({
        id: nextId++,
        kind: 'support',
        x: bullet.x,
        y: bullet.y,
        text: '浄化',
        timer: 0.26,
      });
      continue;
    }
    bullets.push(bullet);
  }

  return {
    ...state,
    enemies,
    coins,
    bullets,
    effects,
    boss,
    defeatedEnemies,
    nextId,
    supportGaruda: garuda,
  };
}

function getGarudaPosition(garuda: MyououGarudaState): Vector {
  const progress = 1 - garuda.timer / MYOUOU_GARUDA_DURATION;
  const startY = FIELD_HEIGHT + MYOUOU_GARUDA_HEIGHT * 0.52;
  const endY = -MYOUOU_GARUDA_HEIGHT * 0.52;
  return {
    x: FIELD_WIDTH / 2 + Math.sin(progress * Math.PI * 2) * 18,
    y: startY + (endY - startY) * progress,
  };
}

function isGarudaActive(garuda: MyououGarudaState): boolean {
  return garuda.timer > 0;
}

function isPointInGarudaPath(garudaX: number, garudaY: number, x: number, y: number, radius: number): boolean {
  const dx = Math.abs(x - garudaX);
  const dy = Math.abs(y - garudaY);
  return dx < MYOUOU_GARUDA_HIT_RANGE_X + radius && dy < MYOUOU_GARUDA_HIT_RANGE_Y + radius;
}

function updateHibikiShield(state: GameState, dt: number, supportId: SupportId | null): GameState {
  const shield: HibikiShieldState = {
    cooldown: Math.max(0, state.supportShield.cooldown - dt),
    timer: Math.max(0, state.supportShield.timer - dt),
    blocksRemaining: state.supportShield.blocksRemaining,
    flashTimer: Math.max(0, state.supportShield.flashTimer - dt),
  };

  if (!isHibikiSupport(supportId)) {
    return {
      ...state,
      supportShield: shield.timer > 0 ? { ...shield, timer: 0, blocksRemaining: 0 } : shield,
    };
  }

  let next: GameState = { ...state, supportShield: shield };
  if (shield.timer <= 0 && shield.cooldown <= 0) {
    next = activateHibikiShield(next);
  }

  if (isShieldActive(next.supportShield)) {
    next = blockEnemyBulletsWithShield(next);
  }

  return next;
}

function activateHibikiShield(state: GameState): GameState {
  let nextId = state.nextId;
  return {
    ...state,
    supportShield: {
      cooldown: HIBIKI_SHIELD_INTERVAL,
      timer: HIBIKI_SHIELD_DURATION,
      blocksRemaining: HIBIKI_SHIELD_BLOCKS,
      flashTimer: HIBIKI_SHIELD_FLASH_TIME,
    },
    effects: [
      ...state.effects,
      {
        id: nextId++,
        kind: 'support',
        x: state.player.x,
        y: state.player.y - 66,
        text: '大盾展開',
        timer: 0.44,
      },
    ],
    nextId,
  };
}

function blockEnemyBulletsWithShield(state: GameState): GameState {
  let nextId = state.nextId;
  let shield = state.supportShield;
  const effects = [...state.effects];
  const bullets: GameState['bullets'] = [];

  for (const bullet of state.bullets) {
    if (isShieldActive(shield) && isPointInHibikiShield(state, bullet.x, bullet.y, bullet.radius)) {
      effects.push({
        id: nextId++,
        kind: 'support',
        x: bullet.x,
        y: bullet.y,
        text: 'GUARD',
        timer: 0.28,
      });
      shield = consumeShieldBlock(shield);
      continue;
    }
    bullets.push(bullet);
  }

  return {
    ...state,
    bullets,
    effects,
    nextId,
    supportShield: shield,
  };
}

function consumeShieldBlock(shield: HibikiShieldState): HibikiShieldState {
  const blocksRemaining = Math.max(0, shield.blocksRemaining - 1);
  return {
    ...shield,
    blocksRemaining,
    timer: blocksRemaining > 0 ? shield.timer : 0,
    flashTimer: HIBIKI_SHIELD_FLASH_TIME,
  };
}

function isShieldActive(shield: HibikiShieldState): boolean {
  return shield.timer > 0 && shield.blocksRemaining > 0;
}

function isPointInHibikiShield(state: GameState, x: number, y: number, radius: number): boolean {
  const dx = x - state.player.x;
  const dy = state.player.y - y;
  if (dy < -radius * 0.35 || dy > HIBIKI_SHIELD_HEIGHT + radius) return false;

  const normalizedX = dx / (HIBIKI_SHIELD_WIDTH * 0.5 + radius);
  const normalizedY = (dy - HIBIKI_SHIELD_HEIGHT * 0.46) / (HIBIKI_SHIELD_HEIGHT * 0.58 + radius);
  return normalizedX * normalizedX + normalizedY * normalizedY < 1.15;
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
