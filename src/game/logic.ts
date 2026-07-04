import {
  BOSS_PLAYER_LIMITS,
  BOSS_APPEAR_KILLS,
  BOSS_APPEAR_TIME,
  BOSS_Y,
  COIN_MAGNET_SPEED,
  FIELD_HEIGHT,
  FIELD_WIDTH,
  HEART_PICKUP_RADIUS,
  MYOUOU_GARUDA_INITIAL_DELAY,
  PLAYER_LIMITS,
  PLAYER_MAX_HP,
  PLAYER_START,
  PLAYER_SPEED,
  SLASH_BOSS_RADIUS,
  SLASH_DAMAGE,
  SLASH_HALF_WIDTH,
  SLASH_RADIUS,
  SLASH_VISIBLE_TIME,
  TSUTSU_ARROW_BOSS_DAMAGE,
  TSUTSU_ARROW_COOLDOWN,
  TSUTSU_ARROW_DAMAGE,
  TSUTSU_ARROW_LIFE,
  TSUTSU_ARROW_RADIUS,
  TSUTSU_ARROW_SPEED,
} from './constants';
import type { MainCharacterId } from './characters';
import { chooseEnemyKind, createEnemy } from './enemies';
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
import type { Boss, Coin, Enemy, EnemyBullet, FloatingEffect, GameState, Player, PlayerArrow, SupportId, Vector } from './types';
import { getSochoWeaponTuning, hasSochoSlashWave } from './weapons';

export const createInitialGameState = (): GameState => ({
  status: 'title',
  player: createPlayer(),
  enemies: [],
  coins: [],
  hearts: [],
  bullets: [],
  playerArrows: [],
  supportBullets: [],
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
  effects: [],
  boss: null,
  elapsed: 0,
  coinsCollected: 0,
  defeatedEnemies: 0,
  nextId: 1,
  spawnTimer: 0.6,
  supportCooldowns: {
    playerGunfire: 0.8,
  },
  message: '',
});

export const startGame = (): GameState => ({
  ...createInitialGameState(),
  status: 'playing',
  message: '星門反応を確認。総長、出撃。',
});

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
  next = updateEnemies(next, dt);
  next = updateBoss(next, dt);
  next = updateBullets(next, dt);
  next = updateSupportEffects(next, dt, supportId, supportLevel);
  next =
    mainCharacterId === 'tsutsu'
      ? runAutoBow(next)
      : runAutoSlash(next, dt, supportId, supportLevel, weaponId, weaponLevel);
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
  };
}

function maybeSpawnEnemy(state: GameState): GameState {
  if (state.boss || state.elapsed > BOSS_APPEAR_TIME + 6 || state.spawnTimer > 0) return state;

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
  if (state.boss) return state;
  if (state.elapsed < BOSS_APPEAR_TIME && state.defeatedEnemies < BOSS_APPEAR_KILLS) return state;

  return {
    ...state,
    enemies: [],
    boss: {
      x: FIELD_WIDTH / 2,
      y: BOSS_Y,
      radius: 54,
      hp: 34,
      maxHp: 34,
      phaseTimer: 0,
      shotTimer: 1.1,
      slamTimer: 3.2,
    },
    message: '星門から大型魔獣が出現！',
  };
}

function updateEnemies(state: GameState, dt: number): GameState {
  const enemies = state.enemies
    .map((enemy) => moveEnemy(enemy, state.player, state.elapsed, dt))
    .map((enemy) => ({ ...enemy, hitTimer: Math.max(0, (enemy.hitTimer ?? 0) - dt) }))
    .filter((enemy) => enemy.y < FIELD_HEIGHT + 60);

  return { ...state, enemies };
}

function moveEnemy(enemy: Enemy, player: Player, elapsed: number, dt: number): Enemy {
  if (enemy.kind === 'flying') {
    return {
      ...enemy,
      x: enemy.x + Math.sin((elapsed - enemy.spawnTime) * 4) * 44 * dt,
      y: enemy.y + enemy.speed * dt,
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
        x: enemy.x + enemy.chargeTarget.x * dt,
        y: enemy.y + enemy.chargeTarget.y * dt,
      };
    }
  }

  return {
    ...enemy,
    y: enemy.y + enemy.speed * dt,
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

  if (boss.shotTimer <= 0) {
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

  if (boss.slamTimer <= 0) {
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

function runAutoBow(state: GameState): GameState {
  if (state.player.attackCooldown > 0) return state;
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
      attackCooldown: TSUTSU_ARROW_COOLDOWN,
      slashTimer: 0,
    },
  };
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
      (enemy) => Math.hypot(enemy.x - arrow.x, enemy.y - arrow.y) < enemy.radius + arrow.radius,
    );

    if (enemyIndex >= 0) {
      const enemy = enemies[enemyIndex];
      const hp = enemy.hp - arrow.damage;
      effects.push(createHitEffect(nextId++, enemy.x, enemy.y, `-${arrow.damage}`));

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
      continue;
    }

    if (boss && Math.hypot(boss.x - arrow.x, boss.y - arrow.y) < boss.radius * 0.72 + arrow.radius) {
      boss = {
        ...boss,
        hp: boss.hp - arrow.bossDamage,
        hitTimer: 0.16,
      };
      effects.push(createHitEffect(nextId++, arrow.x, arrow.y, `-${arrow.bossDamage}`));
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

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalize(vector: Vector): Vector {
  const length = Math.hypot(vector.x, vector.y) || 1;
  return { x: vector.x / length, y: vector.y / length };
}
