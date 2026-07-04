import {
  BOSS_PLAYER_LIMITS,
  BOSS_APPEAR_KILLS,
  BOSS_APPEAR_TIME,
  BOSS_Y,
  COIN_MAGNET_SPEED,
  DELI_TOOL_GUN_BOSS_DAMAGE,
  DELI_TOOL_GUN_DAMAGE,
  DELI_TOOL_GUN_LIFE,
  DELI_TOOL_GUN_RADIUS,
  DELI_TOOL_GUN_SPEED,
  DELI_TURRET_BULLET_LIFE,
  DELI_TURRET_BULLET_RADIUS,
  DELI_TURRET_BULLET_SPEED,
  FIELD_HEIGHT,
  FIELD_WIDTH,
  HEART_PICKUP_RADIUS,
  MOUNTAIN_BREAKER_BOSS_DAMAGE,
  MOUNTAIN_BREAKER_DAMAGE,
  MYOUOU_GARUDA_INITIAL_DELAY,
  PLAYER_LIMITS,
  PLAYER_MAX_HP,
  PLAYER_MAIN_GUN_BOSS_DAMAGE,
  PLAYER_MAIN_GUN_DAMAGE,
  PLAYER_MAIN_GUN_LIFE,
  PLAYER_MAIN_GUN_HAND_OFFSET,
  PLAYER_MAIN_GUN_RADIUS,
  PLAYER_MAIN_GUN_SPREAD_X,
  PLAYER_MAIN_GUN_SPEED,
  PLAYER_START,
  PLAYER_SPEED,
  ROKUDO_SUPPORT_POISON_SLOW_MULTIPLIER,
  ROKUDO_SHADOW_SLASH_BOSS_DAMAGE,
  ROKUDO_SHADOW_SLASH_BOSS_RADIUS,
  ROKUDO_SHADOW_SLASH_DAMAGE,
  ROKUDO_SHADOW_SLASH_HALF_WIDTH,
  ROKUDO_SHADOW_SLASH_RADIUS,
  ROKUDO_SHADOW_SLASH_VISIBLE_TIME,
  ROCKEL_AXE_BOSS_DAMAGE,
  ROCKEL_AXE_BOSS_RANGE,
  ROCKEL_AXE_DAMAGE,
  ROCKEL_AXE_VISIBLE_TIME,
  SLASH_BOSS_RADIUS,
  SLASH_DAMAGE,
  SLASH_HALF_WIDTH,
  SLASH_RADIUS,
  SLASH_VISIBLE_TIME,
  TSUTSU_ARROW_BOSS_DAMAGE,
  TSUTSU_ARROW_DAMAGE,
  TSUTSU_ARROW_LIFE,
  TSUTSU_ARROW_RADIUS,
  TSUTSU_ARROW_SPEED,
  USHIMARU_SPEAR_BOSS_DAMAGE,
  USHIMARU_SPEAR_BOSS_RANGE,
  USHIMARU_SPEAR_DAMAGE,
  USHIMARU_SPEAR_VISIBLE_TIME,
  USHIMARU_PIERCING_SPEAR_COOLDOWN,
  USHIMARU_THROWN_SPEAR_LIFE,
  STARBREAKER_SHOCKWAVE_BOSS_DAMAGE,
  STARBREAKER_SHOCKWAVE_DAMAGE,
  STARBREAKER_SHOCKWAVE_VISIBLE_TIME,
  YABUKO_FM_HAMMER_BOSS_DAMAGE,
  YABUKO_FM_HAMMER_BOSS_RANGE,
  YABUKO_FM_HAMMER_DAMAGE,
  YABUKO_FM_HAMMER_KNOCKBACK,
  YABUKO_FM_HAMMER_VISIBLE_TIME,
} from './constants';
import type { MainCharacterId } from './characters';
import { chooseEnemyKind, createEnemy } from './enemies';
import { DEFAULT_STAGE_ID, getStageById } from './stages';
import type { StageId } from './stages';
import {
  createEnemyCoinDrops,
  createYabukoHeartDrop,
  get7171BossClearCoinBonus,
  getCoinMagnetRadius,
  getCoinPickupRadius,
  resolveHibikiContactGuard,
  is7171Support,
  updateSupportEffects,
} from './support';
import type { Boss, Coin, DeliTurret, Enemy, EnemyBullet, FloatingEffect, GameState, Player, PlayerArrow, SupportId, Vector } from './types';
import {
  getDeliWeaponTuning,
  getPlayerWeaponTuning,
  getRokudoWeaponTuning,
  getRockelWeaponTuning,
  getSochoWeaponTuning,
  getTsutsuWeaponTuning,
  getUshimaruWeaponTuning,
  getYabukoFmWeaponTuning,
  hasSochoSlashWave,
} from './weapons';

export const createInitialGameState = (): GameState => ({
  status: 'title',
  stageId: DEFAULT_STAGE_ID,
  stageName: getStageById(DEFAULT_STAGE_ID).name,
  player: createPlayer(),
  enemies: [],
  coins: [],
  hearts: [],
  bullets: [],
  playerArrows: [],
  supportBullets: [],
  turrets: [],
  supportTurrets: [],
  supportPoisonSmokes: [],
  supportShield: {
    cooldown: 1.8,
    timer: 0,
    blocksRemaining: 0,
    flashTimer: 0,
  },
  supportGaruda: {
    cooldown: MYOUOU_GARUDA_INITIAL_DELAY,
    timer: 0,
    direction: 'bottomToTop',
    hitEnemyIds: [],
    hasHitBoss: false,
  },
  supportRockelBreak: {
    timer: 0,
  },
  effects: [],
  boss: null,
  bossIntroTimer: 0,
  elapsed: 0,
  coinsCollected: 0,
  defeatedEnemies: 0,
  hasTakenDamage: false,
  nextId: 1,
  spawnTimer: 0.6,
  supportCooldowns: {
    playerGunfire: 0.8,
    ushimaruCounter: 1.2,
    deliTurret: 1.6,
    rockelBreak: 1.4,
    rokudoPoison: 1.2,
    tsutsuArrow: 1.0,
  },
  message: '',
});

export const startGame = (stageId: StageId = DEFAULT_STAGE_ID): GameState => {
  const stage = getStageById(stageId);
  return {
    ...createInitialGameState(),
    status: 'playing',
    stageId: stage.id,
    stageName: stage.name,
    message: '\u30b9\u30c6\u30fc\u30b8\u958b\u59cb',
  };
};

function createPlayer(): Player {
  return {
    x: PLAYER_START.x,
    y: PLAYER_START.y,
    radius: 19,
    hp: PLAYER_MAX_HP,
    maxHp: PLAYER_MAX_HP,
    attackCooldown: 0.2,
    slashTimer: 0,
    invincibleTimer: 0,
    nextGunHand: 'left',
    spearThrowCooldown: 0,
    turretDeployCooldown: 1.0,
    hammerBreakCooldown: 0,
    hammerBreakTimer: 0,
    axeSwingCount: 0,
    axeBreakTimer: 0,
  };
}

export function updateGame(
  state: GameState,
  dt: number,
  move: Vector,
  supportId: SupportId | null = null,
  supportLevel = 1,
  weaponId: string | undefined = undefined,
  weaponLevel = 1,
  mainCharacterId: MainCharacterId = 'socho',
): GameState {
  if (state.status !== 'playing') return state;

  let next: GameState = {
    ...state,
    elapsed: state.elapsed + dt,
    player: updatePlayer(state.player, dt, move, Boolean(state.boss)),
    spawnTimer: state.spawnTimer - dt,
  };

  next = maybeSpawnEnemy(next);
  next = maybeSpawnBoss(next);
  next = updateBossIntro(next, dt);
  next = updateEnemies(next, dt);
  next = updateBoss(next, dt);
  next = updateBullets(next, dt);
  next = updateSupportEffects(next, dt, supportId, supportLevel);
  if (mainCharacterId === 'tsutsu') {
    next = runAutoBow(next, weaponId, weaponLevel);
  } else if (mainCharacterId === 'rokudo') {
    next = runAutoShadowSlash(next, dt, supportId, supportLevel, weaponId, weaponLevel);
  } else if (mainCharacterId === 'player') {
    next = runAutoGunfire(next, weaponId, weaponLevel);
  } else if (mainCharacterId === 'ushimaru') {
    next = runAutoSpearThrust(next, weaponId, weaponLevel, supportId, supportLevel);
  } else if (mainCharacterId === 'deli') {
    next = runAutoToolGun(next, weaponId, weaponLevel);
  } else if (mainCharacterId === 'yabuko-fm') {
    next = runAutoHammerBreaker(next, weaponId, weaponLevel, supportId, supportLevel);
  } else if (mainCharacterId === 'rockel') {
    next = runAutoAxeBerserker(next, weaponId, weaponLevel, supportId, supportLevel);
  } else {
    next = runAutoSlash(next, dt, supportId, supportLevel, weaponId, weaponLevel);
  }
  next = updateDeliTurrets(next, dt, mainCharacterId, weaponId, weaponLevel);
  next = updatePlayerArrows(next, dt, supportId, supportLevel);
  next = updateCoins(next, dt, supportId, supportLevel);
  next = collectCoins(next, supportId, supportLevel);
  next = collectHearts(next);
  next = resolvePlayerDamage(next);
  next = updateEffects(next, dt);

  if (next.player.hp <= 0) {
    return {
      ...next,
      status: 'gameOver',
      message: `Game over. Stage coins: ${next.coinsCollected}`,
    };
  }

  if (next.boss && next.boss.hp <= 0) {
    const supportBonusCoins = get7171BossClearCoinBonus(supportId, supportLevel);
    const stageCoins = next.coinsCollected + supportBonusCoins;
    return {
      ...next,
      boss: null,
      status: 'clear',
      coinsCollected: stageCoins,
      message: `Stage clear. Stage coins: ${stageCoins}`,
    };
  }

  return next;
}

function updatePlayer(player: Player, dt: number, move: Vector, isBossBattle: boolean): Player {
  const length = Math.hypot(move.x, move.y);
  const normalized = length > 1 ? { x: move.x / length, y: move.y / length } : move;
  const limits = isBossBattle ? BOSS_PLAYER_LIMITS : PLAYER_LIMITS;

  return {
    ...player,
    x: clamp(player.x + normalized.x * PLAYER_SPEED * dt, limits.minX, limits.maxX),
    y: clamp(player.y + normalized.y * PLAYER_SPEED * dt, limits.minY, limits.maxY),
    attackCooldown: Math.max(0, player.attackCooldown - dt),
    slashTimer: Math.max(0, player.slashTimer - dt),
    invincibleTimer: Math.max(0, player.invincibleTimer - dt),
    spearThrowCooldown: Math.max(0, player.spearThrowCooldown - dt),
    turretDeployCooldown: Math.max(0, player.turretDeployCooldown - dt),
    hammerBreakCooldown: Math.max(0, player.hammerBreakCooldown - dt),
    hammerBreakTimer: Math.max(0, player.hammerBreakTimer - dt),
    axeBreakTimer: Math.max(0, player.axeBreakTimer - dt),
  };
}

function maybeSpawnEnemy(state: GameState): GameState {
  if (state.boss || state.bossIntroTimer > 0 || state.elapsed > BOSS_APPEAR_TIME + 6 || state.spawnTimer > 0) return state;

  const kind = chooseEnemyKind(state.elapsed, state.defeatedEnemies);
  const enemy = createEnemy(state.nextId, kind, state.elapsed);
  const spawnRate = Math.max(0.55, 1.35 - state.elapsed * 0.012);

  return {
    ...state,
    enemies: [...state.enemies, enemy],
    nextId: state.nextId + 1,
    spawnTimer: spawnRate,
  };
}

function maybeSpawnBoss(state: GameState): GameState {
  if (state.boss || state.bossIntroTimer > 0) return state;
  if (state.elapsed < BOSS_APPEAR_TIME && state.defeatedEnemies < BOSS_APPEAR_KILLS) return state;

  return {
    ...state,
    enemies: [],
    bossIntroTimer: 1.25,
    message: 'BOSS APPEARS!',
  };
}

function updateBossIntro(state: GameState, dt: number): GameState {
  if (state.bossIntroTimer <= 0 || state.boss) return state;

  const timer = Math.max(0, state.bossIntroTimer - dt);
  if (timer > 0) {
    return { ...state, bossIntroTimer: timer };
  }

  const stage = getStageById(state.stageId);
  return {
    ...state,
    enemies: [],
    bossIntroTimer: 0,
    boss: {
      type: stage.bossType,
      name: stage.bossName,
      image: stage.bossImage,
      x: FIELD_WIDTH / 2,
      y: BOSS_Y,
      radius: stage.bossRadius,
      hp: stage.bossHp,
      maxHp: stage.bossHp,
      phaseTimer: 0,
      shotTimer: 1.1,
      slamTimer: 3.2,
    },
    message: `${stage.bossName} BOSS`,
  };
}

function updateEnemies(state: GameState, dt: number): GameState {
  const enemies = state.enemies
    .map((enemy) => moveEnemy(enemy, state.player, state.elapsed, dt))
    .map((enemy) => ({
      ...enemy,
      hitTimer: Math.max(0, (enemy.hitTimer ?? 0) - dt),
      slowTimer: Math.max(0, (enemy.slowTimer ?? 0) - dt),
    }))
    .filter((enemy) => enemy.y < FIELD_HEIGHT + 60);

  return { ...state, enemies };
}

function moveEnemy(enemy: Enemy, player: Player, elapsed: number, dt: number): Enemy {
  const speedMultiplier = (enemy.slowTimer ?? 0) > 0 ? ROKUDO_SUPPORT_POISON_SLOW_MULTIPLIER : 1;
  if (enemy.kind === 'flying') {
    return {
      ...enemy,
      x: enemy.x + Math.sin((elapsed - enemy.spawnTime) * 4) * 44 * dt,
      y: enemy.y + enemy.speed * speedMultiplier * dt,
    };
  }

  if (enemy.kind === 'charger') {
    const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (!enemy.isCharging && distance < 230) {
      const direction = normalize({ x: player.x - enemy.x, y: player.y - enemy.y });
      return {
        ...enemy,
        isCharging: true,
        chargeTarget: { x: direction.x * 225, y: direction.y * 225 },
      };
    }

    if (enemy.isCharging && enemy.chargeTarget) {
      return {
        ...enemy,
        x: enemy.x + enemy.chargeTarget.x * speedMultiplier * dt,
        y: enemy.y + enemy.chargeTarget.y * speedMultiplier * dt,
      };
    }
  }

  return {
    ...enemy,
    y: enemy.y + enemy.speed * speedMultiplier * dt,
  };
}

function updateBoss(state: GameState, dt: number): GameState {
  if (!state.boss) return state;

  let boss: Boss = {
    ...state.boss,
    x: FIELD_WIDTH / 2 + Math.sin(state.elapsed * 1.1) * 72,
    y: BOSS_Y + Math.sin(state.elapsed * 0.8) * 12,
    phaseTimer: state.boss.phaseTimer + dt,
    shotTimer: state.boss.shotTimer - dt,
    slamTimer: state.boss.slamTimer - dt,
    hitTimer: Math.max(0, (state.boss.hitTimer ?? 0) - dt),
  };
  let bullets = state.bullets;
  let nextId = state.nextId;

  if (boss.shotTimer <= 0 && (boss.type === 'goblin' || boss.type === 'bear')) {
    const spread = [-0.75, 0, 0.75];
    const newBullets = spread.map((offset) => ({
      id: nextId++,
      x: boss.x,
      y: boss.y + boss.radius * 0.65,
      vx: offset * 70,
      vy: 160,
      radius: 7,
    }));
    bullets = [...bullets, ...newBullets];
    boss = { ...boss, shotTimer: 1.25 };
  }

  if (boss.slamTimer <= 0 && (boss.type === 'boar' || boss.type === 'bear')) {
    const direction = normalize({ x: state.player.x - boss.x, y: state.player.y - boss.y });
    bullets = [
      ...bullets,
      {
        id: nextId++,
        x: boss.x,
        y: boss.y + boss.radius,
        vx: direction.x * 120,
        vy: Math.max(170, direction.y * 220),
        radius: 13,
      },
    ];
    boss = { ...boss, slamTimer: 3.6 };
  }

  if (boss.shotTimer <= 0 && boss.type === 'boar') {
    boss = { ...boss, shotTimer: 1.25 };
  }

  if (boss.slamTimer <= 0 && boss.type === 'goblin') {
    boss = { ...boss, slamTimer: 3.6 };
  }

  return { ...state, boss, bullets, nextId };
}

function updateBullets(state: GameState, dt: number): GameState {
  const bullets = state.bullets
    .map((bullet) => ({
      ...bullet,
      x: bullet.x + bullet.vx * dt,
      y: bullet.y + bullet.vy * dt,
    }))
    .filter((bullet) => bullet.y < FIELD_HEIGHT + 30 && bullet.x > -30 && bullet.x < FIELD_WIDTH + 30);

  return { ...state, bullets };
}

function runAutoSlash(
  state: GameState,
  dt: number,
  supportId: SupportId | null,
  supportLevel: number,
  weaponId: string | undefined,
  weaponLevel: number,
): GameState {
  if (state.player.attackCooldown > 0) return state;
  const hasSlashWave = hasSochoSlashWave(weaponId);
  const weaponTuning = getSochoWeaponTuning(weaponId, weaponLevel);

  const { enemies, defeated, coins, hearts, nextId, effects } = damageEnemiesWithSlash(
    state.enemies,
    state.coins,
    state.hearts,
    state.effects,
    state.nextId,
    state.player,
    supportId,
    supportLevel,
    hasSlashWave,
    weaponTuning,
  );
  const bossHit = damageBossWithSlash(state.boss, state.player, nextId, hasSlashWave, weaponTuning);

  return {
    ...state,
    enemies,
    boss: bossHit.boss,
    coins,
    hearts,
    effects: bossHit.effect ? [...effects, bossHit.effect] : effects,
    nextId: bossHit.nextId,
    defeatedEnemies: state.defeatedEnemies + defeated,
    player: {
      ...state.player,
      attackCooldown: weaponTuning.slashCooldown + dt,
      slashTimer: SLASH_VISIBLE_TIME,
    },
  };
}

function runAutoShadowSlash(
  state: GameState,
  dt: number,
  supportId: SupportId | null,
  supportLevel: number,
  weaponId: string | undefined,
  weaponLevel: number,
): GameState {
  if (state.player.attackCooldown > 0) return state;
  const weaponTuning = getRokudoWeaponTuning(weaponId, weaponLevel);

  const { enemies, defeated, coins, hearts, nextId, effects } = damageEnemiesWithShadowSlash(
    state.enemies,
    state.coins,
    state.hearts,
    state.effects,
    state.nextId,
    state.player,
    supportId,
    supportLevel,
  );
  const bossHit = damageBossWithShadowSlash(state.boss, state.player, nextId);

  return {
    ...state,
    enemies,
    boss: bossHit.boss,
    coins,
    hearts,
    effects: bossHit.effect ? [...effects, bossHit.effect] : effects,
    nextId: bossHit.nextId,
    defeatedEnemies: state.defeatedEnemies + defeated,
    player: {
      ...state.player,
      attackCooldown: weaponTuning.shadowSlashCooldown + dt,
      slashTimer: ROKUDO_SHADOW_SLASH_VISIBLE_TIME,
    },
  };
}

function runAutoBow(state: GameState, weaponId: string | undefined, weaponLevel: number): GameState {
  if (state.player.attackCooldown > 0) return state;
  const weaponTuning = getTsutsuWeaponTuning(weaponId, weaponLevel);
  let nextId = state.nextId;
  const arrow: PlayerArrow = {
    id: nextId++,
    x: state.player.x,
    y: state.player.y - 24,
    vy: -TSUTSU_ARROW_SPEED,
    radius: TSUTSU_ARROW_RADIUS,
    damage: TSUTSU_ARROW_DAMAGE,
    bossDamage: TSUTSU_ARROW_BOSS_DAMAGE,
    life: TSUTSU_ARROW_LIFE,
  };

  return {
    ...state,
    playerArrows: [...state.playerArrows, arrow],
    effects: [
      ...state.effects,
      {
        id: nextId++,
        kind: 'support',
        x: state.player.x,
        y: state.player.y - 38,
        text: 'SHOT',
        timer: 0.18,
      },
    ],
    nextId,
    player: {
      ...state.player,
      attackCooldown: weaponTuning.arrowCooldown,
      slashTimer: 0,
    },
  };
}

function runAutoGunfire(state: GameState, weaponId: string | undefined, weaponLevel: number): GameState {
  if (state.player.attackCooldown > 0) return state;
  const weaponTuning = getPlayerWeaponTuning(weaponId, weaponLevel);
  let nextId = state.nextId;
  const isLeftShot = state.player.nextGunHand === 'left';
  const handOffset = isLeftShot ? -PLAYER_MAIN_GUN_HAND_OFFSET : PLAYER_MAIN_GUN_HAND_OFFSET;
  const shot: PlayerArrow = {
    id: nextId++,
    x: state.player.x + handOffset,
    y: state.player.y - 22,
    vx: isLeftShot ? -PLAYER_MAIN_GUN_SPREAD_X : PLAYER_MAIN_GUN_SPREAD_X,
    vy: -PLAYER_MAIN_GUN_SPEED,
    radius: PLAYER_MAIN_GUN_RADIUS,
    damage: PLAYER_MAIN_GUN_DAMAGE,
    bossDamage: PLAYER_MAIN_GUN_BOSS_DAMAGE,
    life: PLAYER_MAIN_GUN_LIFE,
    kind: 'gun',
  };

  return {
    ...state,
    playerArrows: [...state.playerArrows, shot],
    effects: [
      ...state.effects,
      {
        id: nextId++,
        kind: 'support',
        x: state.player.x + handOffset,
        y: state.player.y - 34,
        text: 'BANG',
        timer: 0.16,
      },
    ],
    nextId,
    player: {
      ...state.player,
      attackCooldown: weaponTuning.gunCooldown,
      slashTimer: 0,
      nextGunHand: isLeftShot ? 'right' : 'left',
    },
  };
}

function runAutoToolGun(state: GameState, weaponId: string | undefined, weaponLevel: number): GameState {
  if (state.player.attackCooldown > 0) return state;
  const weaponTuning = getDeliWeaponTuning(weaponId, weaponLevel);
  let nextId = state.nextId;
  const shot: PlayerArrow = {
    id: nextId++,
    x: state.player.x,
    y: state.player.y - 22,
    vx: 0,
    vy: -DELI_TOOL_GUN_SPEED,
    radius: DELI_TOOL_GUN_RADIUS,
    damage: DELI_TOOL_GUN_DAMAGE,
    bossDamage: DELI_TOOL_GUN_BOSS_DAMAGE,
    life: DELI_TOOL_GUN_LIFE,
    kind: 'gun',
  };

  return {
    ...state,
    playerArrows: [...state.playerArrows, shot],
    effects: [
      ...state.effects,
      {
        id: nextId++,
        kind: 'support',
        x: state.player.x,
        y: state.player.y - 34,
        text: 'TOOL',
        timer: 0.16,
      },
    ],
    nextId,
    player: {
      ...state.player,
      attackCooldown: weaponTuning.toolGunCooldown,
      slashTimer: 0,
    },
  };
}

function runAutoSpearThrust(
  state: GameState,
  weaponId: string | undefined,
  weaponLevel: number,
  supportId: SupportId | null,
  supportLevel: number,
): GameState {
  if (state.player.attackCooldown > 0) return state;
  const weaponTuning = getUshimaruWeaponTuning(weaponId, weaponLevel);
  let nextId = state.nextId;
  const enemyHit = damageEnemiesWithSpearThrust(
    state.enemies,
    state.coins,
    state.hearts,
    state.effects,
    nextId,
    state.player,
    supportId,
    supportLevel,
    weaponTuning,
  );
  nextId = enemyHit.nextId;
  const bossHit = damageBossWithSpearThrust(state.boss, state.player, nextId, weaponTuning);
  nextId = bossHit.nextId;

  const shouldThrowPiercingSpear = weaponTuning.hasPiercingThrow && state.player.spearThrowCooldown <= 0;
  const thrownSpear: PlayerArrow[] = shouldThrowPiercingSpear
    ? [
        {
          id: nextId++,
          x: state.player.x,
          y: state.player.y - 34,
          vx: 0,
          vy: -weaponTuning.thrownSpearSpeed,
          radius: weaponTuning.thrownSpearRadius,
          damage: 1,
          bossDamage: 1,
          life: USHIMARU_THROWN_SPEAR_LIFE,
          kind: 'spear',
          piercing: true,
          hitEnemyIds: [],
          hasHitBoss: false,
        },
      ]
    : [];
  const spearThrowEffect: FloatingEffect[] = shouldThrowPiercingSpear
    ? [
        {
          id: nextId++,
          kind: 'support',
          x: state.player.x,
          y: state.player.y - 72,
          text: 'GATOTSU',
          timer: 0.26,
        },
      ]
    : [];

  return {
    ...state,
    enemies: enemyHit.enemies,
    coins: enemyHit.coins,
    hearts: enemyHit.hearts,
    effects: [
      ...enemyHit.effects,
      ...(bossHit.effect ? [bossHit.effect] : []),
      ...spearThrowEffect,
      {
        id: nextId++,
        kind: 'support',
        x: state.player.x,
        y: state.player.y - 46,
        text: 'THRUST',
        timer: 0.16,
      },
    ],
    boss: bossHit.boss,
    defeatedEnemies: state.defeatedEnemies + enemyHit.defeated,
    playerArrows: [...state.playerArrows, ...thrownSpear],
    nextId,
    player: {
      ...state.player,
      attackCooldown: weaponTuning.spearCooldown,
      slashTimer: USHIMARU_SPEAR_VISIBLE_TIME,
      spearThrowCooldown: shouldThrowPiercingSpear ? USHIMARU_PIERCING_SPEAR_COOLDOWN : state.player.spearThrowCooldown,
    },
  };
}

function runAutoHammerBreaker(
  state: GameState,
  weaponId: string | undefined,
  weaponLevel: number,
  supportId: SupportId | null,
  supportLevel: number,
): GameState {
  if (state.player.attackCooldown > 0) return state;
  const weaponTuning = getYabukoFmWeaponTuning(weaponId, weaponLevel);
  const shouldStarBreak = weaponTuning.hasStarbreakerShockwave && state.player.hammerBreakCooldown <= 0;
  let nextId = state.nextId;

  const enemyHit = damageEnemiesWithHammerBreaker(
    state.enemies,
    state.coins,
    state.hearts,
    state.effects,
    nextId,
    state.player,
    supportId,
    supportLevel,
    weaponTuning,
    shouldStarBreak,
  );
  nextId = enemyHit.nextId;
  const bossHit = damageBossWithHammerBreaker(state.boss, state.player, nextId, weaponTuning, shouldStarBreak);
  nextId = bossHit.nextId;

  const starBreakEffect: FloatingEffect[] = shouldStarBreak
    ? [
        {
          id: nextId++,
          kind: 'support',
          x: state.player.x,
          y: state.player.y - 88,
          text: 'STAR BREAK',
          timer: 0.42,
        },
      ]
    : [];

  return {
    ...state,
    enemies: enemyHit.enemies,
    coins: enemyHit.coins,
    hearts: enemyHit.hearts,
    effects: [
      ...enemyHit.effects,
      ...(bossHit.effect ? [bossHit.effect] : []),
      ...starBreakEffect,
      {
        id: nextId++,
        kind: 'support',
        x: state.player.x,
        y: state.player.y - 48,
        text: 'HAMMER',
        timer: 0.2,
      },
    ],
    boss: bossHit.boss,
    defeatedEnemies: state.defeatedEnemies + enemyHit.defeated,
    nextId,
    player: {
      ...state.player,
      attackCooldown: weaponTuning.hammerCooldown,
      slashTimer: YABUKO_FM_HAMMER_VISIBLE_TIME,
      hammerBreakCooldown: shouldStarBreak ? weaponTuning.starbreakerCooldown : state.player.hammerBreakCooldown,
      hammerBreakTimer: shouldStarBreak ? STARBREAKER_SHOCKWAVE_VISIBLE_TIME : 0,
    },
  };
}

function runAutoAxeBerserker(
  state: GameState,
  weaponId: string | undefined,
  weaponLevel: number,
  supportId: SupportId | null,
  supportLevel: number,
): GameState {
  if (state.player.attackCooldown > 0) return state;
  const weaponTuning = getRockelWeaponTuning(weaponId, weaponLevel);
  const nextSwingCount = state.player.axeSwingCount + 1;
  const shouldMountainBreak = weaponTuning.hasMountainBreaker && nextSwingCount % weaponTuning.strongEvery === 0;
  let nextId = state.nextId;

  const enemyHit = damageEnemiesWithAxeBerserker(
    state.enemies,
    state.coins,
    state.hearts,
    state.effects,
    nextId,
    state.player,
    supportId,
    supportLevel,
    weaponTuning,
    shouldMountainBreak,
  );
  nextId = enemyHit.nextId;
  const bossHit = damageBossWithAxeBerserker(state.boss, state.player, nextId, weaponTuning, shouldMountainBreak);
  nextId = bossHit.nextId;

  const mountainBreakEffect: FloatingEffect[] = shouldMountainBreak
    ? [
        {
          id: nextId++,
          kind: 'support',
          x: state.player.x,
          y: state.player.y - 92,
          text: 'MOUNTAIN BREAK',
          timer: 0.44,
        },
      ]
    : [];

  return {
    ...state,
    enemies: enemyHit.enemies,
    coins: enemyHit.coins,
    hearts: enemyHit.hearts,
    effects: [
      ...enemyHit.effects,
      ...(bossHit.effect ? [bossHit.effect] : []),
      ...mountainBreakEffect,
      {
        id: nextId++,
        kind: 'support',
        x: state.player.x,
        y: state.player.y - 48,
        text: 'AXE',
        timer: 0.2,
      },
    ],
    boss: bossHit.boss,
    defeatedEnemies: state.defeatedEnemies + enemyHit.defeated,
    nextId,
    player: {
      ...state.player,
      attackCooldown: weaponTuning.axeCooldown,
      slashTimer: ROCKEL_AXE_VISIBLE_TIME,
      axeSwingCount: nextSwingCount,
      axeBreakTimer: shouldMountainBreak ? weaponTuning.strongVisibleTime : 0,
    },
  };
}

function updateDeliTurrets(
  state: GameState,
  dt: number,
  mainCharacterId: MainCharacterId,
  weaponId: string | undefined,
  weaponLevel: number,
): GameState {
  if (mainCharacterId !== 'deli') {
    return state.turrets.length > 0 ? { ...state, turrets: [] } : state;
  }

  const weaponTuning = getDeliWeaponTuning(weaponId, weaponLevel);
  let nextId = state.nextId;
  const effects = [...state.effects];
  const bullets: PlayerArrow[] = [];
  let turrets = state.turrets
    .map((turret) => ({
      ...turret,
      timer: turret.timer - dt,
      fireCooldown: turret.fireCooldown - dt,
    }))
    .filter((turret) => turret.timer > 0);

  if (state.player.turretDeployCooldown <= 0) {
    const turret: DeliTurret = {
      id: nextId++,
      x: clamp(state.player.x + 28, 36, FIELD_WIDTH - 36),
      y: clamp(state.player.y + 26, FIELD_HEIGHT * 0.46, FIELD_HEIGHT - 36),
      timer: weaponTuning.turretDuration,
      fireCooldown: 0.2,
    };
    turrets = [...turrets, turret].slice(-weaponTuning.turretMaxCount);
    effects.push({
      id: nextId++,
      kind: 'support',
      x: turret.x,
      y: turret.y - 28,
      text: 'TURRET',
      timer: 0.34,
    });
  }

  turrets = turrets.map((turret) => {
    if (turret.fireCooldown > 0) return turret;
    const target = findTurretTarget(state, turret);
    if (!target) {
      return { ...turret, fireCooldown: weaponTuning.turretFireInterval };
    }

    const direction = normalize({ x: target.x - turret.x, y: target.y - turret.y });
    bullets.push({
      id: nextId++,
      x: turret.x,
      y: turret.y - 12,
      vx: direction.x * DELI_TURRET_BULLET_SPEED,
      vy: direction.y * DELI_TURRET_BULLET_SPEED,
      radius: DELI_TURRET_BULLET_RADIUS,
      damage: 1,
      bossDamage: 1,
      life: DELI_TURRET_BULLET_LIFE,
      kind: 'turret',
    });
    return { ...turret, fireCooldown: weaponTuning.turretFireInterval };
  });

  return {
    ...state,
    turrets,
    playerArrows: [...state.playerArrows, ...bullets],
    effects,
    nextId,
    player: {
      ...state.player,
      turretDeployCooldown: state.player.turretDeployCooldown <= 0 ? weaponTuning.turretDeployInterval : state.player.turretDeployCooldown,
    },
  };
}

function findTurretTarget(state: GameState, turret: DeliTurret): Vector | null {
  let target: Vector | null = null;
  let distance = Number.POSITIVE_INFINITY;

  for (const enemy of state.enemies) {
    const dy = turret.y - enemy.y;
    if (dy < -32) continue;
    const currentDistance = Math.hypot(enemy.x - turret.x, enemy.y - turret.y);
    if (currentDistance < distance) {
      distance = currentDistance;
      target = { x: enemy.x, y: enemy.y };
    }
  }

  if (!target && state.boss) {
    target = { x: state.boss.x, y: state.boss.y + state.boss.radius * 0.28 };
  }

  return target ?? { x: turret.x, y: turret.y - 120 };
}

function updatePlayerArrows(
  state: GameState,
  dt: number,
  supportId: SupportId | null,
  supportLevel: number,
): GameState {
  const movedArrows = state.playerArrows
    .map((arrow) => ({
      ...arrow,
      x: arrow.x + (arrow.vx ?? 0) * dt,
      y: arrow.y + arrow.vy * dt,
      life: arrow.life - dt,
    }))
    .filter((arrow) => arrow.life > 0 && arrow.y > -40);

  return resolvePlayerArrowHits({ ...state, playerArrows: movedArrows }, supportId, supportLevel);
}

function resolvePlayerArrowHits(
  state: GameState,
  supportId: SupportId | null,
  supportLevel: number,
): GameState {
  let nextId = state.nextId;
  let defeatedEnemies = state.defeatedEnemies;
  let boss = state.boss;
  const coins = [...state.coins];
  const hearts = [...state.hearts];
  const effects = [...state.effects];
  const enemies = state.enemies.map((enemy) => ({ ...enemy }));
  const remainingArrows: PlayerArrow[] = [];

  for (const arrow of state.playerArrows) {
    const enemyIndex = enemies.findIndex(
      (enemy) => !(arrow.hitEnemyIds ?? []).includes(enemy.id) && Math.hypot(enemy.x - arrow.x, enemy.y - arrow.y) < enemy.radius + arrow.radius,
    );
    let nextArrow = arrow;

    if (enemyIndex >= 0) {
      const enemy = enemies[enemyIndex];
      const hp = enemy.hp - arrow.damage;
      effects.push(createHitEffect(nextId++, enemy.x, enemy.y, `-${arrow.damage}`));
      nextArrow = arrow.piercing ? { ...arrow, hitEnemyIds: [...(arrow.hitEnemyIds ?? []), enemy.id] } : arrow;

      if (hp <= 0) {
        defeatedEnemies += 1;
        const drops = createEnemyCoinDrops(enemy, nextId, supportId, supportLevel);
        coins.push(...drops.coins);
        effects.push(...drops.effects);
        nextId = drops.nextId;
        const heartDrop = createYabukoHeartDrop(enemy, nextId, supportId, supportLevel);
        hearts.push(...heartDrop.hearts);
        effects.push(...heartDrop.effects);
        nextId = heartDrop.nextId;
        enemies.splice(enemyIndex, 1);
      } else {
        enemies[enemyIndex] = { ...enemy, hp, hitTimer: 0.12 };
      }
      if (arrow.piercing) {
        remainingArrows.push(nextArrow);
      }
      continue;
    }

    if (!arrow.hasHitBoss && boss && Math.hypot(boss.x - arrow.x, boss.y - arrow.y) < boss.radius * 0.72 + arrow.radius) {
      boss = {
        ...boss,
        hp: boss.hp - arrow.bossDamage,
        hitTimer: 0.16,
      };
      effects.push(createHitEffect(nextId++, arrow.x, arrow.y, `-${arrow.bossDamage}`));
      if (arrow.piercing) {
        remainingArrows.push({ ...arrow, hasHitBoss: true });
      }
      continue;
    }

    remainingArrows.push(arrow);
  }

  return {
    ...state,
    enemies,
    boss,
    coins,
    hearts,
    effects,
    defeatedEnemies,
    nextId,
    playerArrows: remainingArrows,
  };
}

function damageEnemiesWithSlash(
  enemies: Enemy[],
  coins: Coin[],
  hearts: GameState['hearts'],
  effects: FloatingEffect[],
  nextId: number,
  player: Player,
  supportId: SupportId | null,
  supportLevel: number,
  hasSlashWave: boolean,
  weaponTuning: ReturnType<typeof getSochoWeaponTuning>,
) {
  let defeated = 0;
  const nextCoins = [...coins];
  const nextHearts = [...hearts];
  const nextEffects = [...effects];
  const nextEnemies: Enemy[] = [];

  for (const enemy of enemies) {
    const slashHit = isInSlash(player, enemy.x, enemy.y, enemy.radius);
    const waveHit = hasSlashWave && isInStarSlashWave(player, enemy.x, enemy.y, enemy.radius, weaponTuning);
    if (!slashHit && !waveHit) {
      nextEnemies.push(enemy);
      continue;
    }

    const damage = (slashHit ? SLASH_DAMAGE : 0) + (waveHit ? weaponTuning.starWaveDamage : 0);
    const hp = enemy.hp - damage;
    nextEffects.push(createHitEffect(nextId++, enemy.x, enemy.y, `-${damage}`));
    if (hp <= 0) {
      defeated += 1;
      const drops = createEnemyCoinDrops(enemy, nextId, supportId, supportLevel);
      nextCoins.push(...drops.coins);
      nextEffects.push(...drops.effects);
      nextId = drops.nextId;
      const heartDrop = createYabukoHeartDrop(enemy, nextId, supportId, supportLevel);
      nextHearts.push(...heartDrop.hearts);
      nextEffects.push(...heartDrop.effects);
      nextId = heartDrop.nextId;
    } else {
      nextEnemies.push({ ...enemy, hp, hitTimer: 0.16 });
    }
  }

  return { enemies: nextEnemies, defeated, coins: nextCoins, hearts: nextHearts, nextId, effects: nextEffects };
}

function damageBossWithSlash(
  boss: Boss | null,
  player: Player,
  nextId: number,
  hasSlashWave: boolean,
  weaponTuning: ReturnType<typeof getSochoWeaponTuning>,
) {
  if (!boss) return { boss, nextId };
  const slashHit = isInBossSlash(player, boss);
  const waveHit = hasSlashWave && isInBossStarSlashWave(player, boss, weaponTuning);
  if (!slashHit && !waveHit) return { boss, nextId };
  const damage = (slashHit ? SLASH_DAMAGE : 0) + (waveHit ? weaponTuning.starWaveBossDamage : 0);
  return {
    boss: { ...boss, hp: boss.hp - damage, hitTimer: 0.18 },
    effect: createHitEffect(nextId++, boss.x, boss.y + boss.radius * 0.2, `-${damage}`),
    nextId,
  };
}

function damageEnemiesWithShadowSlash(
  enemies: Enemy[],
  coins: Coin[],
  hearts: GameState['hearts'],
  effects: FloatingEffect[],
  nextId: number,
  player: Player,
  supportId: SupportId | null,
  supportLevel: number,
) {
  let defeated = 0;
  const nextCoins = [...coins];
  const nextHearts = [...hearts];
  const nextEffects = [...effects];
  const nextEnemies: Enemy[] = [];

  for (const enemy of enemies) {
    if (!isInShadowSlash(player, enemy.x, enemy.y, enemy.radius)) {
      nextEnemies.push(enemy);
      continue;
    }

    const hp = enemy.hp - ROKUDO_SHADOW_SLASH_DAMAGE;
    nextEffects.push(createShadowHitEffect(nextId++, enemy.x, enemy.y, `-${ROKUDO_SHADOW_SLASH_DAMAGE}`));
    if (hp <= 0) {
      defeated += 1;
      const drops = createEnemyCoinDrops(enemy, nextId, supportId, supportLevel);
      nextCoins.push(...drops.coins);
      nextEffects.push(...drops.effects);
      nextId = drops.nextId;
      const heartDrop = createYabukoHeartDrop(enemy, nextId, supportId, supportLevel);
      nextHearts.push(...heartDrop.hearts);
      nextEffects.push(...heartDrop.effects);
      nextId = heartDrop.nextId;
    } else {
      nextEnemies.push({ ...enemy, hp, hitTimer: 0.14 });
    }
  }

  return { enemies: nextEnemies, defeated, coins: nextCoins, hearts: nextHearts, nextId, effects: nextEffects };
}

function damageBossWithShadowSlash(boss: Boss | null, player: Player, nextId: number) {
  if (!boss || !isInBossShadowSlash(player, boss)) return { boss, nextId };
  return {
    boss: { ...boss, hp: boss.hp - ROKUDO_SHADOW_SLASH_BOSS_DAMAGE, hitTimer: 0.16 },
    effect: createShadowHitEffect(nextId++, boss.x, boss.y + boss.radius * 0.2, `-${ROKUDO_SHADOW_SLASH_BOSS_DAMAGE}`),
    nextId,
  };
}

function damageEnemiesWithSpearThrust(
  enemies: Enemy[],
  coins: Coin[],
  hearts: GameState['hearts'],
  effects: FloatingEffect[],
  nextId: number,
  player: Player,
  supportId: SupportId | null,
  supportLevel: number,
  weaponTuning: ReturnType<typeof getUshimaruWeaponTuning>,
) {
  let defeated = 0;
  const nextCoins = [...coins];
  const nextHearts = [...hearts];
  const nextEffects = [...effects];
  const nextEnemies: Enemy[] = [];

  for (const enemy of enemies) {
    if (!isInSpearThrust(player, enemy.x, enemy.y, enemy.radius, weaponTuning)) {
      nextEnemies.push(enemy);
      continue;
    }

    const hp = enemy.hp - USHIMARU_SPEAR_DAMAGE;
    nextEffects.push(createHitEffect(nextId++, enemy.x, enemy.y, `-${USHIMARU_SPEAR_DAMAGE}`));
    if (hp <= 0) {
      defeated += 1;
      const drops = createEnemyCoinDrops(enemy, nextId, supportId, supportLevel);
      nextCoins.push(...drops.coins);
      nextEffects.push(...drops.effects);
      nextId = drops.nextId;
      const heartDrop = createYabukoHeartDrop(enemy, nextId, supportId, supportLevel);
      nextHearts.push(...heartDrop.hearts);
      nextEffects.push(...heartDrop.effects);
      nextId = heartDrop.nextId;
    } else {
      nextEnemies.push({ ...enemy, hp, hitTimer: 0.14 });
    }
  }

  return { enemies: nextEnemies, defeated, coins: nextCoins, hearts: nextHearts, nextId, effects: nextEffects };
}

function damageBossWithSpearThrust(
  boss: Boss | null,
  player: Player,
  nextId: number,
  weaponTuning: ReturnType<typeof getUshimaruWeaponTuning>,
) {
  if (!boss || !isInBossSpearThrust(player, boss, weaponTuning)) return { boss, nextId };
  return {
    boss: { ...boss, hp: boss.hp - USHIMARU_SPEAR_BOSS_DAMAGE, hitTimer: 0.16 },
    effect: createHitEffect(nextId++, boss.x, boss.y + boss.radius * 0.2, `-${USHIMARU_SPEAR_BOSS_DAMAGE}`),
    nextId,
  };
}

function damageEnemiesWithHammerBreaker(
  enemies: Enemy[],
  coins: Coin[],
  hearts: GameState['hearts'],
  effects: FloatingEffect[],
  nextId: number,
  player: Player,
  supportId: SupportId | null,
  supportLevel: number,
  weaponTuning: ReturnType<typeof getYabukoFmWeaponTuning>,
  shouldStarBreak: boolean,
) {
  let defeated = 0;
  const nextCoins = [...coins];
  const nextHearts = [...hearts];
  const nextEffects = [...effects];
  const nextEnemies: Enemy[] = [];

  for (const enemy of enemies) {
    const hammerHit = isInHammerBreaker(player, enemy.x, enemy.y, enemy.radius, weaponTuning);
    const starBreakHit = shouldStarBreak && isInStarbreakerShockwave(player, enemy.x, enemy.y, enemy.radius, weaponTuning);
    if (!hammerHit && !starBreakHit) {
      nextEnemies.push(enemy);
      continue;
    }

    const damage = (hammerHit ? YABUKO_FM_HAMMER_DAMAGE : 0) + (starBreakHit ? STARBREAKER_SHOCKWAVE_DAMAGE : 0);
    const hp = enemy.hp - damage;
    nextEffects.push(createHitEffect(nextId++, enemy.x, enemy.y, `-${damage}`));

    if (hp <= 0) {
      defeated += 1;
      const drops = createEnemyCoinDrops(enemy, nextId, supportId, supportLevel);
      nextCoins.push(...drops.coins);
      nextEffects.push(...drops.effects);
      nextId = drops.nextId;
      const heartDrop = createYabukoHeartDrop(enemy, nextId, supportId, supportLevel);
      nextHearts.push(...heartDrop.hearts);
      nextEffects.push(...heartDrop.effects);
      nextId = heartDrop.nextId;
    } else {
      nextEnemies.push(knockEnemyFromPlayer(player, { ...enemy, hp, hitTimer: 0.18 }, hammerHit ? YABUKO_FM_HAMMER_KNOCKBACK : YABUKO_FM_HAMMER_KNOCKBACK * 0.45));
    }
  }

  return { enemies: nextEnemies, defeated, coins: nextCoins, hearts: nextHearts, nextId, effects: nextEffects };
}

function damageBossWithHammerBreaker(
  boss: Boss | null,
  player: Player,
  nextId: number,
  weaponTuning: ReturnType<typeof getYabukoFmWeaponTuning>,
  shouldStarBreak: boolean,
) {
  if (!boss) return { boss, nextId };
  const hammerHit = isInBossHammerBreaker(player, boss, weaponTuning);
  const starBreakHit = shouldStarBreak && isInBossStarbreakerShockwave(player, boss, weaponTuning);
  if (!hammerHit && !starBreakHit) return { boss, nextId };
  const damage = (hammerHit ? YABUKO_FM_HAMMER_BOSS_DAMAGE : 0) + (starBreakHit ? STARBREAKER_SHOCKWAVE_BOSS_DAMAGE : 0);

  return {
    boss: { ...boss, hp: boss.hp - damage, hitTimer: 0.18 },
    effect: createHitEffect(nextId++, boss.x, boss.y + boss.radius * 0.18, `-${damage}`),
    nextId,
  };
}

function damageEnemiesWithAxeBerserker(
  enemies: Enemy[],
  coins: Coin[],
  hearts: GameState['hearts'],
  effects: FloatingEffect[],
  nextId: number,
  player: Player,
  supportId: SupportId | null,
  supportLevel: number,
  weaponTuning: ReturnType<typeof getRockelWeaponTuning>,
  shouldMountainBreak: boolean,
) {
  let defeated = 0;
  const nextCoins = [...coins];
  const nextHearts = [...hearts];
  const nextEffects = [...effects];
  const nextEnemies: Enemy[] = [];

  for (const enemy of enemies) {
    const axeHit = isInAxeBerserker(player, enemy.x, enemy.y, enemy.radius, weaponTuning);
    const mountainBreakHit = shouldMountainBreak && isInMountainBreaker(player, enemy.x, enemy.y, enemy.radius, weaponTuning);
    if (!axeHit && !mountainBreakHit) {
      nextEnemies.push(enemy);
      continue;
    }

    const damage = mountainBreakHit ? MOUNTAIN_BREAKER_DAMAGE : ROCKEL_AXE_DAMAGE;
    const hp = enemy.hp - damage;
    nextEffects.push(createHitEffect(nextId++, enemy.x, enemy.y, `-${damage}`));

    if (hp <= 0) {
      defeated += 1;
      const drops = createEnemyCoinDrops(enemy, nextId, supportId, supportLevel);
      nextCoins.push(...drops.coins);
      nextEffects.push(...drops.effects);
      nextId = drops.nextId;
      const heartDrop = createYabukoHeartDrop(enemy, nextId, supportId, supportLevel);
      nextHearts.push(...heartDrop.hearts);
      nextEffects.push(...heartDrop.effects);
      nextId = heartDrop.nextId;
    } else {
      nextEnemies.push({ ...enemy, hp, hitTimer: 0.16 });
    }
  }

  return { enemies: nextEnemies, defeated, coins: nextCoins, hearts: nextHearts, nextId, effects: nextEffects };
}

function damageBossWithAxeBerserker(
  boss: Boss | null,
  player: Player,
  nextId: number,
  weaponTuning: ReturnType<typeof getRockelWeaponTuning>,
  shouldMountainBreak: boolean,
) {
  if (!boss) return { boss, nextId };
  const axeHit = isInBossAxeBerserker(player, boss, weaponTuning);
  const mountainBreakHit = shouldMountainBreak && isInBossMountainBreaker(player, boss, weaponTuning);
  if (!axeHit && !mountainBreakHit) return { boss, nextId };
  const damage = (axeHit ? ROCKEL_AXE_BOSS_DAMAGE : 0) + (mountainBreakHit ? MOUNTAIN_BREAKER_BOSS_DAMAGE : 0);

  return {
    boss: { ...boss, hp: boss.hp - damage, hitTimer: 0.18 },
    effect: createHitEffect(nextId++, boss.x, boss.y + boss.radius * 0.18, `-${damage}`),
    nextId,
  };
}

function updateCoins(state: GameState, dt: number, supportId: SupportId | null, supportLevel: number): GameState {
  const magnetRadius = getCoinMagnetRadius(supportId, supportLevel);
  const coins = state.coins.map((coin) => {
    const dx = state.player.x - coin.x;
    const dy = state.player.y - coin.y;
    const distance = Math.hypot(dx, dy);
    if (distance > magnetRadius || distance <= 1) return coin;

    const pull = Math.min(distance, (COIN_MAGNET_SPEED + (magnetRadius - distance) * 4) * dt);
    return {
      ...coin,
      x: coin.x + (dx / distance) * pull,
      y: coin.y + (dy / distance) * pull,
    };
  });

  return { ...state, coins };
}

function collectCoins(state: GameState, supportId: SupportId | null, supportLevel: number): GameState {
  let collected = 0;
  let nextId = state.nextId;
  const effects = [...state.effects];
  const pickupRadius = getCoinPickupRadius(supportId, supportLevel);
  const coins = state.coins.filter((coin) => {
    const pickup = Math.hypot(state.player.x - coin.x, state.player.y - coin.y) < pickupRadius;
    if (pickup) {
      collected += coin.value;
      effects.push({
        id: nextId++,
        kind: is7171Support(supportId) || coin.isBonus ? 'bonus' : 'coin',
        x: state.player.x,
        y: state.player.y - 24,
        text: `+${coin.value}`,
        timer: 0.48,
      });
    }
    return !pickup;
  });

  return {
    ...state,
    coins,
    effects,
    nextId,
    coinsCollected: state.coinsCollected + collected,
  };
}

function collectHearts(state: GameState): GameState {
  let nextId = state.nextId;
  let player = state.player;
  const effects = [...state.effects];
  const hearts = state.hearts.filter((heart) => {
    const pickup = Math.hypot(state.player.x - heart.x, state.player.y - heart.y) < HEART_PICKUP_RADIUS;
    if (pickup) {
      const recovered = Math.min(heart.healAmount, player.maxHp - player.hp);
      player = {
        ...player,
        hp: Math.min(player.maxHp, player.hp + heart.healAmount),
      };
      effects.push({
        id: nextId++,
        kind: 'heal',
        x: state.player.x,
        y: state.player.y - 34,
        text: recovered > 0 ? `+HP ${recovered}` : 'HP MAX',
        timer: 0.52,
      });
    }
    return !pickup;
  });

  return {
    ...state,
    player,
    hearts,
    effects,
    nextId,
  };
}

function resolvePlayerDamage(state: GameState): GameState {
  if (state.player.invincibleTimer > 0) return state;

  const hitEnemy = state.enemies.find(
    (enemy) => Math.hypot(state.player.x - enemy.x, state.player.y - enemy.y) < state.player.radius + enemy.radius,
  );
  const hitBullet = state.bullets.find(
    (bullet) => Math.hypot(state.player.x - bullet.x, state.player.y - bullet.y) < state.player.radius + bullet.radius,
  );

  if (!hitEnemy && !hitBullet) return state;

  const guarded = resolveHibikiContactGuard(state, hitEnemy ?? null);
  if (guarded) return guarded;

  return {
    ...state,
    bullets: hitBullet ? state.bullets.filter((bullet) => bullet.id !== hitBullet.id) : state.bullets,
    hasTakenDamage: true,
    player: {
      ...state.player,
      hp: Math.max(0, state.player.hp - (hitEnemy?.kind === 'charger' ? 18 : 12)),
      invincibleTimer: 0.85,
    },
  };
}

function isInSlash(player: Player, x: number, y: number, radius: number): boolean {
  const dx = x - player.x;
  const dy = player.y - y;
  if (dy < -radius * 0.3) return false;
  if (dy > SLASH_RADIUS + radius) return false;

  const widthAtPoint = SLASH_HALF_WIDTH * (0.35 + Math.max(0, dy) / SLASH_RADIUS);
  return Math.abs(dx) < widthAtPoint + radius && Math.hypot(dx, dy) < SLASH_RADIUS + radius;
}

function isInBossSlash(player: Player, boss: Boss): boolean {
  const bossLowerBodyY = boss.y + boss.radius * 0.55;
  const dx = boss.x - player.x;
  const dy = player.y - bossLowerBodyY;
  if (dy < -boss.radius * 0.25) return false;
  if (dy > SLASH_BOSS_RADIUS + boss.radius * 0.45) return false;

  const widthAtPoint = SLASH_HALF_WIDTH * (0.4 + Math.max(0, dy) / SLASH_BOSS_RADIUS);
  return Math.abs(dx) < widthAtPoint + boss.radius * 0.55 && Math.hypot(dx, dy) < SLASH_BOSS_RADIUS + boss.radius * 0.45;
}

function isInStarSlashWave(
  player: Player,
  x: number,
  y: number,
  radius: number,
  weaponTuning: ReturnType<typeof getSochoWeaponTuning>,
): boolean {
  const dx = x - player.x;
  const dy = player.y - y;
  if (dy < -radius * 0.2) return false;
  if (dy > weaponTuning.starWaveRange + radius) return false;

  const waveWidth = weaponTuning.starWaveHalfWidth * (0.8 + Math.max(0, dy) / weaponTuning.starWaveRange);
  return Math.abs(dx) < waveWidth + radius * 0.72;
}

function isInBossStarSlashWave(
  player: Player,
  boss: Boss,
  weaponTuning: ReturnType<typeof getSochoWeaponTuning>,
): boolean {
  const bossLowerBodyY = boss.y + boss.radius * 0.58;
  return isInStarSlashWave(player, boss.x, bossLowerBodyY, boss.radius * 0.5, weaponTuning);
}

function isInShadowSlash(player: Player, x: number, y: number, radius: number): boolean {
  const dx = x - player.x;
  const dy = player.y - y;
  if (dy < -radius * 0.24) return false;
  if (dy > ROKUDO_SHADOW_SLASH_RADIUS + radius) return false;

  const widthAtPoint = ROKUDO_SHADOW_SLASH_HALF_WIDTH * (0.34 + Math.max(0, dy) / ROKUDO_SHADOW_SLASH_RADIUS);
  return Math.abs(dx) < widthAtPoint + radius * 0.68 && Math.hypot(dx, dy) < ROKUDO_SHADOW_SLASH_RADIUS + radius;
}

function isInBossShadowSlash(player: Player, boss: Boss): boolean {
  const bossLowerBodyY = boss.y + boss.radius * 0.55;
  const dx = boss.x - player.x;
  const dy = player.y - bossLowerBodyY;
  if (dy < -boss.radius * 0.22) return false;
  if (dy > ROKUDO_SHADOW_SLASH_BOSS_RADIUS + boss.radius * 0.4) return false;

  const widthAtPoint = ROKUDO_SHADOW_SLASH_HALF_WIDTH * (0.42 + Math.max(0, dy) / ROKUDO_SHADOW_SLASH_BOSS_RADIUS);
  return (
    Math.abs(dx) < widthAtPoint + boss.radius * 0.48 &&
    Math.hypot(dx, dy) < ROKUDO_SHADOW_SLASH_BOSS_RADIUS + boss.radius * 0.42
  );
}

function isInSpearThrust(
  player: Player,
  x: number,
  y: number,
  radius: number,
  weaponTuning: ReturnType<typeof getUshimaruWeaponTuning>,
): boolean {
  const dy = player.y - y;
  if (dy < -radius * 0.18) return false;
  if (dy > weaponTuning.spearRange + radius) return false;

  return weaponTuning.thrustOffsets.some((offset) => Math.abs(x - (player.x + offset)) < weaponTuning.spearHalfWidth + radius * 0.64);
}

function isInBossSpearThrust(
  player: Player,
  boss: Boss,
  weaponTuning: ReturnType<typeof getUshimaruWeaponTuning>,
): boolean {
  const bossLowerBodyY = boss.y + boss.radius * 0.56;
  const dy = player.y - bossLowerBodyY;
  if (dy < -boss.radius * 0.2) return false;
  if (dy > USHIMARU_SPEAR_BOSS_RANGE + boss.radius * 0.4) return false;

  return weaponTuning.thrustOffsets.some((offset) => Math.abs(boss.x - (player.x + offset)) < weaponTuning.spearHalfWidth + boss.radius * 0.5);
}

function isInHammerBreaker(
  player: Player,
  x: number,
  y: number,
  radius: number,
  weaponTuning: ReturnType<typeof getYabukoFmWeaponTuning>,
): boolean {
  const dx = x - player.x;
  const dy = player.y - y;
  if (dy < -radius * 0.18) return false;
  if (dy > weaponTuning.hammerRange + radius) return false;

  const widthAtPoint = weaponTuning.hammerHalfWidth * (0.7 + Math.max(0, dy) / weaponTuning.hammerRange * 0.35);
  return Math.abs(dx) < widthAtPoint + radius * 0.72 && Math.hypot(dx * 0.72, dy) < weaponTuning.hammerRange + radius;
}

function isInBossHammerBreaker(
  player: Player,
  boss: Boss,
  weaponTuning: ReturnType<typeof getYabukoFmWeaponTuning>,
): boolean {
  const bossLowerBodyY = boss.y + boss.radius * 0.56;
  const dy = player.y - bossLowerBodyY;
  if (dy < -boss.radius * 0.2) return false;
  if (dy > YABUKO_FM_HAMMER_BOSS_RANGE + boss.radius * 0.42) return false;

  const widthAtPoint = weaponTuning.hammerHalfWidth * (0.8 + Math.max(0, dy) / YABUKO_FM_HAMMER_BOSS_RANGE * 0.32);
  return Math.abs(boss.x - player.x) < widthAtPoint + boss.radius * 0.55;
}

function isInStarbreakerShockwave(
  player: Player,
  x: number,
  y: number,
  radius: number,
  weaponTuning: ReturnType<typeof getYabukoFmWeaponTuning>,
): boolean {
  const dx = x - player.x;
  const dy = player.y - y;
  if (dy < -radius * 0.15) return false;
  if (dy > weaponTuning.starbreakerRange + radius) return false;

  const widthAtPoint = weaponTuning.starbreakerHalfWidth * (0.72 + Math.max(0, dy) / weaponTuning.starbreakerRange * 0.56);
  return Math.abs(dx) < widthAtPoint + radius * 0.62;
}

function isInBossStarbreakerShockwave(
  player: Player,
  boss: Boss,
  weaponTuning: ReturnType<typeof getYabukoFmWeaponTuning>,
): boolean {
  const bossLowerBodyY = boss.y + boss.radius * 0.58;
  return isInStarbreakerShockwave(player, boss.x, bossLowerBodyY, boss.radius * 0.5, weaponTuning);
}

function isInAxeBerserker(
  player: Player,
  x: number,
  y: number,
  radius: number,
  weaponTuning: ReturnType<typeof getRockelWeaponTuning>,
): boolean {
  const dx = x - player.x;
  const dy = player.y - y;
  if (dy < -radius * 0.22) return false;
  if (dy > weaponTuning.axeRange + radius) return false;

  const widthAtPoint = weaponTuning.axeHalfWidth * (0.82 + Math.max(0, dy) / weaponTuning.axeRange * 0.3);
  return Math.abs(dx) < widthAtPoint + radius * 0.72 && Math.hypot(dx * 0.64, dy) < weaponTuning.axeRange + radius;
}

function isInBossAxeBerserker(
  player: Player,
  boss: Boss,
  weaponTuning: ReturnType<typeof getRockelWeaponTuning>,
): boolean {
  const bossLowerBodyY = boss.y + boss.radius * 0.56;
  const dy = player.y - bossLowerBodyY;
  if (dy < -boss.radius * 0.22) return false;
  if (dy > ROCKEL_AXE_BOSS_RANGE + boss.radius * 0.44) return false;

  const widthAtPoint = weaponTuning.axeHalfWidth * (0.88 + Math.max(0, dy) / ROCKEL_AXE_BOSS_RANGE * 0.28);
  return Math.abs(boss.x - player.x) < widthAtPoint + boss.radius * 0.58;
}

function isInMountainBreaker(
  player: Player,
  x: number,
  y: number,
  radius: number,
  weaponTuning: ReturnType<typeof getRockelWeaponTuning>,
): boolean {
  const dx = x - player.x;
  const dy = player.y - y;
  if (dy < -radius * 0.24) return false;
  if (dy > weaponTuning.strongRange + radius) return false;

  const widthAtPoint = weaponTuning.strongHalfWidth * (0.88 + Math.max(0, dy) / weaponTuning.strongRange * 0.38);
  return Math.abs(dx) < widthAtPoint + radius * 0.75 && Math.hypot(dx * 0.58, dy) < weaponTuning.strongRange + radius;
}

function isInBossMountainBreaker(
  player: Player,
  boss: Boss,
  weaponTuning: ReturnType<typeof getRockelWeaponTuning>,
): boolean {
  const bossLowerBodyY = boss.y + boss.radius * 0.58;
  return isInMountainBreaker(player, boss.x, bossLowerBodyY, boss.radius * 0.54, weaponTuning);
}

function knockEnemyFromPlayer(player: Player, enemy: Enemy, distance: number): Enemy {
  const dx = enemy.x - player.x;
  const dy = enemy.y - player.y;
  const length = Math.hypot(dx, dy) || 1;

  return {
    ...enemy,
    x: clamp(enemy.x + (dx / length) * distance, enemy.radius, FIELD_WIDTH - enemy.radius),
    y: clamp(enemy.y + (dy / length) * distance, -enemy.radius, FIELD_HEIGHT + enemy.radius),
  };
}

function updateEffects(state: GameState, dt: number): GameState {
  return {
    ...state,
    effects: state.effects
      .map((effect) => ({ ...effect, y: effect.y - 34 * dt, timer: effect.timer - dt }))
      .filter((effect) => effect.timer > 0),
  };
}

function createHitEffect(id: number, x: number, y: number, text: string): FloatingEffect {
  return {
    id,
    kind: 'hit',
    x,
    y,
    text,
    timer: 0.34,
  };
}

function createShadowHitEffect(id: number, x: number, y: number, text: string): FloatingEffect {
  return {
    id,
    kind: 'support',
    x,
    y,
    text,
    timer: 0.3,
  };
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalize(vector: Vector): Vector {
  const length = Math.hypot(vector.x, vector.y) || 1;
  return { x: vector.x / length, y: vector.y / length };
}
