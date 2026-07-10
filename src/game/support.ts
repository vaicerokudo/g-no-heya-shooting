import {
  FIELD_HEIGHT,
  FIELD_WIDTH,
  COIN_MAGNET_RADIUS,
  COIN_PICKUP_RADIUS,
  DELI_SUPPORT_TURRET_BULLET_DAMAGE,
  DELI_SUPPORT_TURRET_BULLET_LIFE,
  DELI_SUPPORT_TURRET_BULLET_RADIUS,
  DELI_SUPPORT_TURRET_BULLET_SPEED,
  DELI_SUPPORT_TURRET_DEPLOY_INTERVAL,
  DELI_SUPPORT_TURRET_DURATION,
  DELI_SUPPORT_TURRET_FIRE_INTERVAL,
  DELI_SUPPORT_TURRET_MAX_COUNT,
  DELI_SUPPORT_TURRET_MIN_DEPLOY_INTERVAL,
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
  ROKUDO_SUPPORT_POISON_BOSS_DAMAGE,
  ROKUDO_SUPPORT_POISON_DAMAGE,
  ROKUDO_SUPPORT_POISON_DAMAGE_INTERVAL,
  ROKUDO_SUPPORT_POISON_DURATION,
  ROKUDO_SUPPORT_POISON_INTERVAL,
  ROKUDO_SUPPORT_POISON_MAX_DURATION,
  ROKUDO_SUPPORT_POISON_MIN_INTERVAL,
  ROKUDO_SUPPORT_POISON_RADIUS,
  ROCKEL_SUPPORT_BREAK_BOSS_DAMAGE,
  ROCKEL_SUPPORT_BREAK_COOLDOWN,
  ROCKEL_SUPPORT_BREAK_DAMAGE,
  ROCKEL_SUPPORT_BREAK_DURATION,
  ROCKEL_SUPPORT_BREAK_HALF_WIDTH,
  ROCKEL_SUPPORT_BREAK_MIN_COOLDOWN,
  ROCKEL_SUPPORT_BREAK_RANGE,
  SOCHO_SUPPORT_SLASH_BOSS_DAMAGE,
  SOCHO_SUPPORT_SLASH_COOLDOWN,
  SOCHO_SUPPORT_SLASH_DAMAGE,
  SOCHO_SUPPORT_SLASH_DURATION,
  SOCHO_SUPPORT_SLASH_HALF_WIDTH,
  SOCHO_SUPPORT_SLASH_MIN_COOLDOWN,
  SOCHO_SUPPORT_SLASH_RANGE,
  TSUTSU_SUPPORT_ARROW_COOLDOWN,
  TSUTSU_SUPPORT_ARROW_DAMAGE,
  TSUTSU_SUPPORT_ARROW_LIFE,
  TSUTSU_SUPPORT_ARROW_MIN_COOLDOWN,
  TSUTSU_SUPPORT_ARROW_RADIUS,
  TSUTSU_SUPPORT_ARROW_SPEED,
  USHIMARU_SUPPORT_COUNTER_COOLDOWN,
  USHIMARU_SUPPORT_COUNTER_DAMAGE,
  USHIMARU_SUPPORT_COUNTER_KNOCKBACK,
  USHIMARU_SUPPORT_COUNTER_MIN_COOLDOWN,
  USHIMARU_SUPPORT_COUNTER_RANGE,
  YABUKO_HEART_DROP_CHANCE,
  YABUKO_RED_HEART_HEAL,
} from './constants';
import type {
  Boss,
  Coin,
  DeliTurret,
  Enemy,
  FloatingEffect,
  GameState,
  HeartPickup,
  HibikiShieldState,
  MyououGarudaState,
  PoisonSmoke,
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

const TSUTSU_SUPPORT_DIRECTIONS: Vector[] = [
  { x: 0, y: -1 },
  { x: -0.34, y: -0.94 },
  { x: 0.34, y: -0.94 },
];

export type SupportAbilitySource = {
  id: SupportId;
  level: number;
};

export function updateSupportEffects(
  state: GameState,
  dt: number,
  supportId: SupportId | null,
  supportLevel = 1,
  auraSupportId: SupportId | null = null,
  auraSupportLevel = 1,
  supportDamageUpgrades: SupportId[] = [],
): GameState {
  let next = updateSupportBullets(state, dt);
  const supportSources = createSupportAbilitySources(supportId, supportLevel, auraSupportId, auraSupportLevel);
  const hibikiLevel = getSupportAbilityLevel(supportSources, 1, 'hibiki');
  const myououLevel = getSupportAbilityLevel(supportSources, 1, 'myouou');
  const ushimaruLevel = getSupportAbilityLevel(supportSources, 1, 'ushimaru');
  const deliLevel = getSupportAbilityLevel(supportSources, 1, 'deli');
  const rockelLevel = getSupportAbilityLevel(supportSources, 1, 'rockel');
  const rokudoLevel = getSupportAbilityLevel(supportSources, 1, 'rokudo');
  const tsutsuLevel = getSupportAbilityLevel(supportSources, 1, 'tsutsu');
  const sochoLevel = getSupportAbilityLevel(supportSources, 1, 'socho');
  const playerLevel = getSupportAbilityLevel(supportSources, 1, 'player');

  next = updateHibikiShield(next, dt, hibikiLevel > 0 ? 'hibiki' : null, Math.max(1, hibikiLevel));
  next = updateMyououGaruda(next, dt, myououLevel > 0 ? 'myouou' : null, Math.max(1, myououLevel), getSupportDamageBonus(supportDamageUpgrades, 'myouou'));
  next = updateUshimaruCounter(next, dt, ushimaruLevel > 0 ? 'ushimaru' : null, Math.max(1, ushimaruLevel), getSupportDamageBonus(supportDamageUpgrades, 'ushimaru'));
  next = updateDeliSupportTurrets(next, dt, deliLevel > 0 ? 'deli' : null, Math.max(1, deliLevel), getSupportDamageBonus(supportDamageUpgrades, 'deli'));
  next = updateRockelMountainBreak(next, dt, rockelLevel > 0 ? 'rockel' : null, Math.max(1, rockelLevel), getSupportDamageBonus(supportDamageUpgrades, 'rockel'));
  next = updateRokudoPoisonSmoke(next, dt, rokudoLevel > 0 ? 'rokudo' : null, Math.max(1, rokudoLevel), getSupportDamageBonus(supportDamageUpgrades, 'rokudo'));
  next = updateTsutsuArrowSupport(next, dt, tsutsuLevel > 0 ? 'tsutsu' : null, Math.max(1, tsutsuLevel), getSupportDamageBonus(supportDamageUpgrades, 'tsutsu'));
  next = updateSochoSlashSupport(next, dt, sochoLevel > 0 ? 'socho' : null, Math.max(1, sochoLevel), getSupportDamageBonus(supportDamageUpgrades, 'socho'));

  if (playerLevel <= 0) {
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

  return spawnPlayerGunfire(next, cooldown, playerLevel, getSupportDamageBonus(supportDamageUpgrades, 'player'));
}

function getSupportDamageBonus(upgradedSupportIds: SupportId[], supportId: SupportId): number {
  return upgradedSupportIds.includes(supportId) ? 1 : 0;
}

type SupportAbilityTarget = SupportId | null | SupportAbilitySource[];

function createSupportAbilitySources(
  supportId: SupportId | null,
  supportLevel: number,
  auraSupportId: SupportId | null,
  auraSupportLevel: number,
): SupportAbilitySource[] {
  const sources: SupportAbilitySource[] = [];
  if (supportId) sources.push({ id: supportId, level: supportLevel });
  if (auraSupportId && auraSupportId !== supportId) sources.push({ id: auraSupportId, level: auraSupportLevel });
  return sources;
}

function getSupportAbilityLevel(supportId: SupportAbilityTarget, supportLevel: number, targetId: SupportId): number {
  if (Array.isArray(supportId)) {
    return supportId.find((source) => source.id === targetId)?.level ?? 0;
  }
  return supportId === targetId ? supportLevel : 0;
}

export function is7171Support(supportId: SupportAbilityTarget): boolean {
  return getSupportAbilityLevel(supportId, 1, '7171') > 0;
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

export function isUshimaruSupport(supportId: SupportId | null): boolean {
  return supportId === 'ushimaru';
}

export function isDeliSupport(supportId: SupportId | null): boolean {
  return supportId === 'deli';
}

export function isRockelSupport(supportId: SupportId | null): boolean {
  return supportId === 'rockel';
}

export function isRokudoSupport(supportId: SupportId | null): boolean {
  return supportId === 'rokudo';
}

export function isTsutsuSupport(supportId: SupportId | null): boolean {
  return supportId === 'tsutsu';
}

export function isSochoSupport(supportId: SupportId | null): boolean {
  return supportId === 'socho';
}

export function getCoinMagnetRadius(supportId: SupportAbilityTarget, supportLevel = 1): number {
  const nanaLevel = getSupportAbilityLevel(supportId, supportLevel, '7171');
  if (nanaLevel <= 0) return COIN_MAGNET_RADIUS;
  return COIN_MAGNET_RADIUS * (NANA_SUPPORT_MAGNET_MULTIPLIER + getLevelBonus(nanaLevel) * 0.06);
}

export function getCoinPickupRadius(supportId: SupportAbilityTarget, supportLevel = 1): number {
  const nanaLevel = getSupportAbilityLevel(supportId, supportLevel, '7171');
  if (nanaLevel <= 0) return COIN_PICKUP_RADIUS;
  return COIN_PICKUP_RADIUS * (NANA_SUPPORT_PICKUP_MULTIPLIER + getLevelBonus(nanaLevel) * 0.025);
}

export function get7171BossClearCoinBonus(supportId: SupportAbilityTarget, supportLevel = 1): number {
  const nanaLevel = getSupportAbilityLevel(supportId, supportLevel, '7171');
  return nanaLevel > 0 ? NANA_SUPPORT_BOSS_BONUS_COINS + Math.floor(getLevelBonus(nanaLevel) / 2) : 0;
}

export function createEnemyCoinDrops(enemy: Enemy, nextId: number, supportId: SupportAbilityTarget, supportLevel = 1) {
  const coins: Coin[] = [{ id: nextId++, x: enemy.x, y: enemy.y, value: enemy.kind === 'charger' ? 3 : 1 }];
  const effects: FloatingEffect[] = [];

  const nanaLevel = getSupportAbilityLevel(supportId, supportLevel, '7171');
  const bonusCoinChance = Math.min(0.42, NANA_SUPPORT_BONUS_COIN_CHANCE + getLevelBonus(nanaLevel) * 0.018);
  if (nanaLevel > 0 && Math.random() < bonusCoinChance) {
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

export function createYabukoHeartDrop(enemy: Enemy, nextId: number, supportId: SupportAbilityTarget, supportLevel = 1) {
  const hearts: HeartPickup[] = [];
  const effects: FloatingEffect[] = [];

  const yabukoLevel = getSupportAbilityLevel(supportId, supportLevel, 'yabuko');
  const heartDropChance = Math.min(0.36, YABUKO_HEART_DROP_CHANCE + getLevelBonus(yabukoLevel) * 0.012);
  if (yabukoLevel > 0 && Math.random() < heartDropChance) {
    hearts.push({
      id: nextId++,
      x: enemy.x + (Math.random() > 0.5 ? 12 : -12),
      y: enemy.y - 10,
      heartType: 'red',
      healAmount: YABUKO_RED_HEART_HEAL + getLevelBonus(yabukoLevel) * 2,
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

function updateUshimaruCounter(state: GameState, dt: number, supportId: SupportId | null, supportLevel: number, damageBonus = 0): GameState {
  const cooldown = Math.max(0, state.supportCooldowns.ushimaruCounter - dt);
  const baseState: GameState = {
    ...state,
    supportCooldowns: {
      ...state.supportCooldowns,
      ushimaruCounter: cooldown,
    },
  };

  if (!isUshimaruSupport(supportId) || cooldown > 0) return baseState;

  const targetIndex = findUshimaruCounterTarget(baseState);
  const bossInRange = baseState.boss && isPointNearPlayer(baseState, baseState.boss.x, baseState.boss.y + baseState.boss.radius * 0.32, baseState.boss.radius * 0.35);
  if (targetIndex < 0 && !bossInRange) return baseState;

  let nextId = baseState.nextId;
  const effects = [...baseState.effects];
  let enemies = baseState.enemies;
  let boss = baseState.boss;
  let defeatedEnemies = baseState.defeatedEnemies;
  let coins = baseState.coins;

  if (targetIndex >= 0) {
    const enemy = enemies[targetIndex];
    const damage = USHIMARU_SUPPORT_COUNTER_DAMAGE + damageBonus;
    const hp = enemy.hp - damage;
    effects.push({
      id: nextId++,
      kind: 'support',
      x: enemy.x,
      y: enemy.y - 10,
      text: '牙突カウンター',
      timer: 0.42,
    });

    if (hp <= 0) {
      defeatedEnemies += 1;
      const drops = createEnemyCoinDrops(enemy, nextId, supportId, supportLevel);
      coins = [...coins, ...drops.coins];
      effects.push(...drops.effects);
      nextId = drops.nextId;
      enemies = enemies.filter((_, index) => index !== targetIndex);
    } else {
      const knockedEnemy = knockEnemyBack(baseState, { ...enemy, hp, hitTimer: 0.16 });
      enemies = enemies.map((currentEnemy, index) => (index === targetIndex ? knockedEnemy : currentEnemy));
    }
  } else if (boss) {
    boss = {
      ...boss,
      hp: boss.hp - USHIMARU_SUPPORT_COUNTER_DAMAGE - damageBonus,
      hitTimer: 0.16,
    };
    effects.push({
      id: nextId++,
      kind: 'support',
      x: boss.x,
      y: boss.y + boss.radius * 0.12,
      text: '牙突カウンター',
      timer: 0.42,
    });
  }

  return {
    ...baseState,
    enemies,
    boss,
    coins,
    effects,
    defeatedEnemies,
    nextId,
    supportCooldowns: {
      ...baseState.supportCooldowns,
      ushimaruCounter: getUshimaruCounterCooldown(supportLevel),
    },
  };
}

function findUshimaruCounterTarget(state: GameState): number {
  let targetIndex = -1;
  let targetDistance = Number.POSITIVE_INFINITY;

  state.enemies.forEach((enemy, index) => {
    if (!isPointNearPlayer(state, enemy.x, enemy.y, enemy.radius)) return;
    const distance = Math.hypot(enemy.x - state.player.x, enemy.y - state.player.y);
    if (distance < targetDistance) {
      targetDistance = distance;
      targetIndex = index;
    }
  });

  return targetIndex;
}

function isPointNearPlayer(state: GameState, x: number, y: number, radius: number): boolean {
  return Math.hypot(x - state.player.x, y - state.player.y) < USHIMARU_SUPPORT_COUNTER_RANGE + radius;
}

function knockEnemyBack(state: GameState, enemy: Enemy): Enemy {
  const dx = enemy.x - state.player.x;
  const dy = enemy.y - state.player.y;
  const distance = Math.hypot(dx, dy) || 1;
  return {
    ...enemy,
    x: clamp(enemy.x + (dx / distance) * USHIMARU_SUPPORT_COUNTER_KNOCKBACK, enemy.radius, FIELD_WIDTH - enemy.radius),
    y: clamp(enemy.y + (dy / distance) * USHIMARU_SUPPORT_COUNTER_KNOCKBACK, -enemy.radius, FIELD_HEIGHT + enemy.radius),
  };
}

function getUshimaruCounterCooldown(supportLevel: number): number {
  return Math.max(USHIMARU_SUPPORT_COUNTER_MIN_COOLDOWN, USHIMARU_SUPPORT_COUNTER_COOLDOWN - getLevelBonus(supportLevel) * 0.5);
}

function updateDeliSupportTurrets(state: GameState, dt: number, supportId: SupportId | null, supportLevel: number, damageBonus = 0): GameState {
  const cooldown = Math.max(0, state.supportCooldowns.deliTurret - dt);
  let nextId = state.nextId;
  const effects = [...state.effects];
  const bullets: SupportBullet[] = [];
  let supportTurrets = state.supportTurrets
    .map((turret) => ({
      ...turret,
      timer: turret.timer - dt,
      fireCooldown: turret.fireCooldown - dt,
    }))
    .filter((turret) => turret.timer > 0);

  if (!isDeliSupport(supportId)) {
    return {
      ...state,
      supportTurrets: [],
      supportCooldowns: {
        ...state.supportCooldowns,
        deliTurret: cooldown,
      },
    };
  }

  const tuning = getDeliSupportTurretTuning(supportLevel);

  if (cooldown <= 0) {
    const turret: DeliTurret = {
      id: nextId++,
      x: clamp(state.player.x - 32, 34, FIELD_WIDTH - 34),
      y: clamp(state.player.y + 28, FIELD_HEIGHT * 0.46, FIELD_HEIGHT - 36),
      timer: tuning.duration,
      fireCooldown: 0.32,
    };
    supportTurrets = [...supportTurrets, turret].slice(-DELI_SUPPORT_TURRET_MAX_COUNT);
    effects.push({
      id: nextId++,
      kind: 'support',
      x: turret.x,
      y: turret.y - 28,
      text: 'MINI TURRET',
      timer: 0.34,
    });
  }

  supportTurrets = supportTurrets.map((turret) => {
    if (turret.fireCooldown > 0) return turret;
    const target = findDeliSupportTurretTarget(state, turret);
    if (!target) return { ...turret, fireCooldown: tuning.fireInterval };

    const direction = normalize({ x: target.x - turret.x, y: target.y - turret.y });
    bullets.push({
      id: nextId++,
      x: turret.x,
      y: turret.y - 10,
      vx: direction.x * DELI_SUPPORT_TURRET_BULLET_SPEED,
      vy: direction.y * DELI_SUPPORT_TURRET_BULLET_SPEED,
      radius: DELI_SUPPORT_TURRET_BULLET_RADIUS,
      damage: DELI_SUPPORT_TURRET_BULLET_DAMAGE + damageBonus,
      life: DELI_SUPPORT_TURRET_BULLET_LIFE,
    });
    return { ...turret, fireCooldown: tuning.fireInterval };
  });

  return {
    ...state,
    supportBullets: [...state.supportBullets, ...bullets],
    supportTurrets,
    effects,
    nextId,
    supportCooldowns: {
      ...state.supportCooldowns,
      deliTurret: cooldown <= 0 ? tuning.deployInterval : cooldown,
    },
  };
}

function getDeliSupportTurretTuning(supportLevel: number) {
  const levelBonus = getLevelBonus(supportLevel);
  return {
    deployInterval: Math.max(DELI_SUPPORT_TURRET_MIN_DEPLOY_INTERVAL, DELI_SUPPORT_TURRET_DEPLOY_INTERVAL - levelBonus * 0.5),
    duration: DELI_SUPPORT_TURRET_DURATION + levelBonus * 0.5,
    fireInterval: Math.max(1.0, DELI_SUPPORT_TURRET_FIRE_INTERVAL - levelBonus * 0.05),
  };
}

function findDeliSupportTurretTarget(state: GameState, turret: DeliTurret): Vector | null {
  let target: Vector | null = null;
  let distance = Number.POSITIVE_INFINITY;

  for (const enemy of state.enemies) {
    const dy = turret.y - enemy.y;
    if (dy < -36) continue;
    const currentDistance = Math.hypot(enemy.x - turret.x, enemy.y - turret.y);
    if (currentDistance < distance) {
      distance = currentDistance;
      target = { x: enemy.x, y: enemy.y };
    }
  }

  if (!target && state.boss) {
    target = { x: state.boss.x, y: state.boss.y + state.boss.radius * 0.28 };
  }

  return target ?? { x: turret.x, y: turret.y - 112 };
}

function updateRockelMountainBreak(state: GameState, dt: number, supportId: SupportId | null, supportLevel: number, damageBonus = 0): GameState {
  const cooldown = Math.max(0, state.supportCooldowns.rockelBreak - dt);
  const breakState = {
    timer: Math.max(0, state.supportRockelBreak.timer - dt),
  };
  const baseState: GameState = {
    ...state,
    supportRockelBreak: breakState,
    supportCooldowns: {
      ...state.supportCooldowns,
      rockelBreak: cooldown,
    },
  };

  if (!isRockelSupport(supportId)) {
    return breakState.timer > 0 ? { ...baseState, supportRockelBreak: { timer: 0 } } : baseState;
  }

  if (cooldown > 0) return baseState;

  let nextId = baseState.nextId;
  let defeatedEnemies = baseState.defeatedEnemies;
  let boss = baseState.boss;
  let coins = baseState.coins;
  const effects = [...baseState.effects];
  const enemies: Enemy[] = [];

  for (const enemy of baseState.enemies) {
    if (!isInRockelSupportBreak(baseState, enemy.x, enemy.y, enemy.radius)) {
      enemies.push(enemy);
      continue;
    }

    const damage = ROCKEL_SUPPORT_BREAK_DAMAGE + damageBonus;
    const hp = enemy.hp - damage;
    effects.push({
      id: nextId++,
      kind: 'support',
      x: enemy.x,
      y: enemy.y - 8,
      text: `-${damage}`,
      timer: 0.34,
    });

    if (hp <= 0) {
      defeatedEnemies += 1;
      const drops = createEnemyCoinDrops(enemy, nextId, 'rockel');
      coins = [...coins, ...drops.coins];
      effects.push(...drops.effects);
      nextId = drops.nextId;
    } else {
      enemies.push({ ...enemy, hp, hitTimer: 0.16 });
    }
  }

  if (boss && isInRockelSupportBreak(baseState, boss.x, boss.y + boss.radius * 0.54, boss.radius * 0.58)) {
    boss = {
      ...boss,
      hp: boss.hp - ROCKEL_SUPPORT_BREAK_BOSS_DAMAGE - damageBonus,
      hitTimer: 0.18,
    };
    effects.push({
      id: nextId++,
      kind: 'support',
      x: boss.x,
      y: boss.y + boss.radius * 0.12,
      text: `-${ROCKEL_SUPPORT_BREAK_BOSS_DAMAGE}`,
      timer: 0.36,
    });
  }

  effects.push({
    id: nextId++,
    kind: 'support',
    x: baseState.player.x,
    y: baseState.player.y - 84,
    text: 'MOUNTAIN BREAK',
    timer: 0.44,
  });

  return {
    ...baseState,
    enemies,
    boss,
    coins,
    effects,
    defeatedEnemies,
    nextId,
    supportRockelBreak: {
      timer: ROCKEL_SUPPORT_BREAK_DURATION,
    },
    supportCooldowns: {
      ...baseState.supportCooldowns,
      rockelBreak: getRockelBreakCooldown(supportLevel),
    },
  };
}

function isInRockelSupportBreak(state: GameState, x: number, y: number, radius: number): boolean {
  const dx = x - state.player.x;
  const dy = state.player.y - y;
  if (dy < -radius * 0.24) return false;
  if (dy > ROCKEL_SUPPORT_BREAK_RANGE + radius) return false;

  const widthAtPoint = ROCKEL_SUPPORT_BREAK_HALF_WIDTH * (0.86 + Math.max(0, dy) / ROCKEL_SUPPORT_BREAK_RANGE * 0.34);
  return Math.abs(dx) < widthAtPoint + radius * 0.72 && Math.hypot(dx * 0.6, dy) < ROCKEL_SUPPORT_BREAK_RANGE + radius;
}

function getRockelBreakCooldown(supportLevel: number): number {
  return Math.max(ROCKEL_SUPPORT_BREAK_MIN_COOLDOWN, ROCKEL_SUPPORT_BREAK_COOLDOWN - getLevelBonus(supportLevel) * 0.3);
}

function updateRokudoPoisonSmoke(state: GameState, dt: number, supportId: SupportId | null, supportLevel: number, damageBonus = 0): GameState {
  const cooldown = Math.max(0, state.supportCooldowns.rokudoPoison - dt);
  let smokes = state.supportPoisonSmokes
    .map((smoke) => ({
      ...smoke,
      timer: smoke.timer - dt,
      damageCooldown: Math.max(0, smoke.damageCooldown - dt),
    }))
    .filter((smoke) => smoke.timer > 0);

  let baseState: GameState = {
    ...state,
    supportPoisonSmokes: smokes,
    supportCooldowns: {
      ...state.supportCooldowns,
      rokudoPoison: cooldown,
    },
  };

  if (!isRokudoSupport(supportId)) {
    return smokes.length > 0 ? { ...baseState, supportPoisonSmokes: [] } : baseState;
  }

  let nextId = baseState.nextId;
  const effects = [...baseState.effects];
  if (cooldown <= 0) {
    const target = choosePoisonSmokeTarget(baseState);
    smokes = [
      ...smokes,
      {
        id: nextId++,
        x: target.x,
        y: target.y,
        timer: getRokudoPoisonDuration(supportLevel),
        damageCooldown: 0.45,
      },
    ];
    effects.push({
      id: nextId++,
      kind: 'support',
      x: target.x,
      y: target.y - 18,
      text: '毒煙玉',
      timer: 0.48,
    });
    baseState = {
      ...baseState,
      supportPoisonSmokes: smokes,
      effects,
      nextId,
      supportCooldowns: {
        ...baseState.supportCooldowns,
        rokudoPoison: getRokudoPoisonInterval(supportLevel),
      },
    };
  }

  const shouldDamage = smokes.some((smoke) => smoke.damageCooldown <= 0);
  let coins = baseState.coins;
  let defeatedEnemies = baseState.defeatedEnemies;
  let boss = baseState.boss;
  const nextEffects = [...baseState.effects];
  const enemies: Enemy[] = [];

  for (const enemy of baseState.enemies) {
    if (!isInAnyPoisonSmoke(smokes, enemy.x, enemy.y, enemy.radius)) {
      enemies.push(enemy);
      continue;
    }

    const slowedEnemy = { ...enemy, slowTimer: 0.24 };
    if (!shouldDamage) {
      enemies.push(slowedEnemy);
      continue;
    }

    const damage = ROKUDO_SUPPORT_POISON_DAMAGE + damageBonus;
    const hp = slowedEnemy.hp - damage;
    nextEffects.push({
      id: nextId++,
      kind: 'support',
      x: slowedEnemy.x,
      y: slowedEnemy.y - 8,
      text: `-${damage}`,
      timer: 0.32,
    });

    if (hp <= 0) {
      defeatedEnemies += 1;
      const drops = createEnemyCoinDrops(slowedEnemy, nextId, 'rokudo');
      coins = [...coins, ...drops.coins];
      nextEffects.push(...drops.effects);
      nextId = drops.nextId;
    } else {
      enemies.push({ ...slowedEnemy, hp, hitTimer: 0.16 });
    }
  }

  if (boss && shouldDamage && isInAnyPoisonSmoke(smokes, boss.x, boss.y + boss.radius * 0.36, boss.radius * 0.54)) {
    boss = {
      ...boss,
      hp: boss.hp - ROKUDO_SUPPORT_POISON_BOSS_DAMAGE - damageBonus,
      hitTimer: 0.16,
      phaseTimer: boss.phaseTimer * 0.98,
      shotTimer: boss.shotTimer + 0.08,
    };
    nextEffects.push({
      id: nextId++,
      kind: 'support',
      x: boss.x,
      y: boss.y,
      text: `-${ROKUDO_SUPPORT_POISON_BOSS_DAMAGE}`,
      timer: 0.32,
    });
  }

  return {
    ...baseState,
    enemies,
    boss,
    coins,
    effects: nextEffects,
    defeatedEnemies,
    nextId,
    supportPoisonSmokes: shouldDamage
      ? smokes.map((smoke) => ({ ...smoke, damageCooldown: ROKUDO_SUPPORT_POISON_DAMAGE_INTERVAL }))
      : smokes,
  };
}

function choosePoisonSmokeTarget(state: GameState): Vector {
  let target: Vector | null = null;
  let distance = Infinity;

  for (const enemy of state.enemies) {
    const dy = state.player.y - enemy.y;
    if (dy < -28 || dy > 260) continue;
    const currentDistance = Math.hypot(enemy.x - state.player.x, enemy.y - state.player.y);
    if (currentDistance < distance) {
      distance = currentDistance;
      target = { x: enemy.x, y: enemy.y };
    }
  }

  if (!target && state.boss) {
    target = { x: state.boss.x, y: state.boss.y + state.boss.radius * 0.55 };
  }

  return target ?? {
    x: state.player.x,
    y: Math.max(ROKUDO_SUPPORT_POISON_RADIUS + 20, state.player.y - 138),
  };
}

function isInAnyPoisonSmoke(smokes: PoisonSmoke[], x: number, y: number, radius: number): boolean {
  return smokes.some((smoke) => Math.hypot(x - smoke.x, y - smoke.y) <= ROKUDO_SUPPORT_POISON_RADIUS + radius);
}

function getRokudoPoisonInterval(supportLevel: number): number {
  return Math.max(ROKUDO_SUPPORT_POISON_MIN_INTERVAL, ROKUDO_SUPPORT_POISON_INTERVAL - getLevelBonus(supportLevel) * 0.5);
}

function getRokudoPoisonDuration(supportLevel: number): number {
  return Math.min(ROKUDO_SUPPORT_POISON_MAX_DURATION, ROKUDO_SUPPORT_POISON_DURATION + getLevelBonus(supportLevel) * 0.375);
}

function updateMyououGaruda(state: GameState, dt: number, supportId: SupportId | null, supportLevel: number, damageBonus = 0): GameState {
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
    next = damageWithGaruda(next, supportLevel, damageBonus);
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

function damageWithGaruda(state: GameState, supportLevel: number, damageBonus = 0): GameState {
  let nextId = state.nextId;
  let defeatedEnemies = state.defeatedEnemies;
  let boss = state.boss;
  let garuda = state.supportGaruda;
  const coins = [...state.coins];
  const effects = [...state.effects];
  const { x, y } = getGarudaPosition(garuda);
  const enemies: GameState['enemies'] = [];
  const garudaDamage = MYOUOU_GARUDA_DAMAGE + Math.floor(getLevelBonus(supportLevel) / 3) + damageBonus;
  const garudaBossDamage = MYOUOU_GARUDA_BOSS_DAMAGE + Math.floor(getLevelBonus(supportLevel) / 4) + damageBonus;

  for (const enemy of state.enemies) {
    if (garuda.hitEnemyIds.includes(enemy.id) || !isPointInGarudaPath(x, y, enemy.x, enemy.y, enemy.radius)) {
      enemies.push(enemy);
      continue;
    }

    const hp = enemy.hp - garudaDamage;
    garuda = { ...garuda, hitEnemyIds: [...garuda.hitEnemyIds, enemy.id] };
    effects.push({
      id: nextId++,
      kind: 'support',
      x: enemy.x,
      y: enemy.y,
      text: `-${garudaDamage}`,
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
      hp: boss.hp - garudaBossDamage,
      hitTimer: 0.22,
    };
    garuda = { ...garuda, hasHitBoss: true };
    effects.push({
      id: nextId++,
      kind: 'support',
      x: boss.x,
      y: boss.y + boss.radius * 0.12,
      text: `-${garudaBossDamage}`,
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

function updateHibikiShield(state: GameState, dt: number, supportId: SupportId | null, supportLevel: number): GameState {
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
    next = activateHibikiShield(next, supportLevel);
  }

  if (isShieldActive(next.supportShield)) {
    next = blockEnemyBulletsWithShield(next);
  }

  return next;
}

function activateHibikiShield(state: GameState, supportLevel: number): GameState {
  let nextId = state.nextId;
  return {
    ...state,
    supportShield: {
      cooldown: Math.max(5.8, HIBIKI_SHIELD_INTERVAL - getLevelBonus(supportLevel) * 0.08),
      timer: HIBIKI_SHIELD_DURATION + getLevelBonus(supportLevel) * 0.08,
      blocksRemaining: HIBIKI_SHIELD_BLOCKS + Math.floor(getLevelBonus(supportLevel) / 5),
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

function updateTsutsuArrowSupport(state: GameState, dt: number, supportId: SupportId | null, supportLevel: number, damageBonus = 0): GameState {
  const cooldown = state.supportCooldowns.tsutsuArrow - dt;
  if (!isTsutsuSupport(supportId)) {
    return {
      ...state,
      supportCooldowns: {
        ...state.supportCooldowns,
        tsutsuArrow: Math.max(0, cooldown),
      },
    };
  }

  if (cooldown > 0) {
    return {
      ...state,
      supportCooldowns: {
        ...state.supportCooldowns,
        tsutsuArrow: cooldown,
      },
    };
  }

  return spawnTsutsuArrowVolley(state, cooldown, supportLevel, damageBonus);
}

function spawnTsutsuArrowVolley(state: GameState, cooldownRemainder: number, supportLevel: number, damageBonus = 0): GameState {
  let nextId = state.nextId;
  const bullets: SupportBullet[] = TSUTSU_SUPPORT_DIRECTIONS.map((direction, index) => {
    const normalized = normalize(direction);
    const xOffset = (index - 1) * 10;
    return {
      id: nextId++,
      x: state.player.x + xOffset,
      y: state.player.y - 24,
      vx: normalized.x * TSUTSU_SUPPORT_ARROW_SPEED,
      vy: normalized.y * TSUTSU_SUPPORT_ARROW_SPEED,
      radius: TSUTSU_SUPPORT_ARROW_RADIUS,
      damage: TSUTSU_SUPPORT_ARROW_DAMAGE + damageBonus,
      life: TSUTSU_SUPPORT_ARROW_LIFE,
    };
  });

  return {
    ...state,
    supportBullets: [...state.supportBullets, ...bullets],
    effects: [
      ...state.effects,
      {
        id: nextId++,
        kind: 'support',
        x: state.player.x,
        y: state.player.y - 44,
        text: '3WAY ARROW',
        timer: 0.38,
      },
    ],
    nextId,
    supportCooldowns: {
      ...state.supportCooldowns,
      tsutsuArrow: getTsutsuArrowCooldown(supportLevel) + cooldownRemainder,
    },
  };
}

function getTsutsuArrowCooldown(supportLevel: number): number {
  return Math.max(TSUTSU_SUPPORT_ARROW_MIN_COOLDOWN, TSUTSU_SUPPORT_ARROW_COOLDOWN - getLevelBonus(supportLevel) * 0.3);
}

function updateSochoSlashSupport(state: GameState, dt: number, supportId: SupportId | null, supportLevel: number, damageBonus = 0): GameState {
  const cooldown = Math.max(0, state.supportCooldowns.sochoSlash - dt);
  const slashState = {
    timer: Math.max(0, state.supportSochoSlash.timer - dt),
  };
  const baseState: GameState = {
    ...state,
    supportSochoSlash: slashState,
    supportCooldowns: {
      ...state.supportCooldowns,
      sochoSlash: cooldown,
    },
  };

  if (!isSochoSupport(supportId)) {
    return slashState.timer > 0 ? { ...baseState, supportSochoSlash: { timer: 0 } } : baseState;
  }

  if (cooldown > 0) return baseState;
  return activateSochoSupportSlash(baseState, supportId, supportLevel, damageBonus);
}

function activateSochoSupportSlash(state: GameState, supportId: SupportId | null, supportLevel: number, damageBonus = 0): GameState {
  let nextId = state.nextId;
  let defeatedEnemies = state.defeatedEnemies;
  let boss = state.boss;
  let coins = state.coins;
  const effects = [...state.effects];
  const enemies: Enemy[] = [];

  for (const enemy of state.enemies) {
    if (!isInSochoSupportSlash(state, enemy.x, enemy.y, enemy.radius)) {
      enemies.push(enemy);
      continue;
    }

    const damage = SOCHO_SUPPORT_SLASH_DAMAGE + damageBonus;
    const hp = enemy.hp - damage;
    effects.push({
      id: nextId++,
      kind: 'support',
      x: enemy.x,
      y: enemy.y - 8,
      text: `-${damage}`,
      timer: 0.32,
    });

    if (hp <= 0) {
      defeatedEnemies += 1;
      const drops = createEnemyCoinDrops(enemy, nextId, supportId, supportLevel);
      coins = [...coins, ...drops.coins];
      effects.push(...drops.effects);
      nextId = drops.nextId;
    } else {
      enemies.push({ ...enemy, hp, hitTimer: 0.14 });
    }
  }

  if (boss && isInSochoSupportSlash(state, boss.x, boss.y + boss.radius * 0.52, boss.radius * 0.56)) {
    boss = {
      ...boss,
      hp: boss.hp - SOCHO_SUPPORT_SLASH_BOSS_DAMAGE - damageBonus,
      hitTimer: 0.16,
    };
    effects.push({
      id: nextId++,
      kind: 'support',
      x: boss.x,
      y: boss.y + boss.radius * 0.12,
      text: `-${SOCHO_SUPPORT_SLASH_BOSS_DAMAGE}`,
      timer: 0.34,
    });
  }

  effects.push({
    id: nextId++,
    kind: 'support',
    x: state.player.x,
    y: state.player.y - 70,
    text: 'SOCHO SLASH',
    timer: 0.4,
  });

  return {
    ...state,
    enemies,
    boss,
    coins,
    effects,
    defeatedEnemies,
    nextId,
    supportSochoSlash: {
      timer: SOCHO_SUPPORT_SLASH_DURATION,
    },
    supportCooldowns: {
      ...state.supportCooldowns,
      sochoSlash: getSochoSlashCooldown(supportLevel),
    },
  };
}

function isInSochoSupportSlash(state: GameState, x: number, y: number, radius: number): boolean {
  const dx = x - state.player.x;
  const dy = state.player.y - y;
  if (dy < -radius * 0.24) return false;
  if (dy > SOCHO_SUPPORT_SLASH_RANGE + radius) return false;

  const widthAtPoint = SOCHO_SUPPORT_SLASH_HALF_WIDTH * (0.82 + Math.max(0, dy) / SOCHO_SUPPORT_SLASH_RANGE * 0.26);
  return Math.abs(dx) < widthAtPoint + radius * 0.7 && Math.hypot(dx * 0.74, dy) < SOCHO_SUPPORT_SLASH_RANGE + radius;
}

function getSochoSlashCooldown(supportLevel: number): number {
  return Math.max(SOCHO_SUPPORT_SLASH_MIN_COOLDOWN, SOCHO_SUPPORT_SLASH_COOLDOWN - getLevelBonus(supportLevel) * 0.3);
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

function spawnPlayerGunfire(state: GameState, cooldownRemainder: number, supportLevel: number, damageBonus = 0): GameState {
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
        damage: PLAYER_SUPPORT_BULLET_DAMAGE + Math.floor(getLevelBonus(supportLevel) / 4) + damageBonus,
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
      playerGunfire: Math.max(1.02, PLAYER_SUPPORT_FIRE_INTERVAL - getLevelBonus(supportLevel) * 0.035) + cooldownRemainder,
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

function normalize(vector: Vector): Vector {
  const length = Math.hypot(vector.x, vector.y) || 1;
  return {
    x: vector.x / length,
    y: vector.y / length,
  };
}

function getLevelBonus(level: number): number {
  return Math.max(0, Math.floor(level) - 1);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

