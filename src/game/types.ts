import type { BossType, StageId } from './stages';

export type GameStatus =
  | 'title'
  | 'astoriaMap'
  | 'astoriaPlaza'
  | 'trainingGround'
  | 'guildLobby'
  | 'guildParty'
  | 'guildSummon'
  | 'guildEquipment'
  | 'guildWeapons'
  | 'guildSkins'
  | 'forge'
  | 'forgeDraw'
  | 'forgeWeapons'
  | 'shop'
  | 'shopSupportSummon'
  | 'shopSupportList'
  | 'gate'
  | 'playing'
  | 'paused'
  | 'clear'
  | 'gameOver';

export type EnemyKind = 'small' | 'flying' | 'charger';

export type SupportId =
  | '7171'
  | 'yabuko'
  | 'player'
  | 'hibiki'
  | 'myouou'
  | 'ushimaru'
  | 'deli'
  | 'rockel'
  | 'rokudo'
  | 'tsutsu'
  | 'socho';

export type Enemy = {
  id: number;
  kind: EnemyKind;
  x: number;
  y: number;
  radius: number;
  hp: number;
  maxHp: number;
  speed: number;
  spawnTime: number;
  hitTimer?: number;
  slowTimer?: number;
  chargeTarget?: Vector;
  isCharging?: boolean;
};

export type Boss = {
  type: BossType;
  name: string;
  image: string;
  x: number;
  y: number;
  radius: number;
  hp: number;
  maxHp: number;
  phaseTimer: number;
  shotTimer: number;
  slamTimer: number;
  hitTimer?: number;
};

export type Coin = {
  id: number;
  x: number;
  y: number;
  value: number;
  isBonus?: boolean;
};

export type HeartType = 'red';

export type HeartPickup = {
  id: number;
  x: number;
  y: number;
  heartType: HeartType;
  healAmount: number;
};

export type EnemyBullet = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
};

export type SupportBullet = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  life: number;
};

export type DeliTurret = {
  id: number;
  x: number;
  y: number;
  timer: number;
  fireCooldown: number;
};

export type PoisonSmoke = {
  id: number;
  x: number;
  y: number;
  timer: number;
  damageCooldown: number;
};

export type PlayerArrow = {
  id: number;
  x: number;
  y: number;
  vx?: number;
  vy: number;
  radius: number;
  damage: number;
  bossDamage: number;
  life: number;
  kind?: 'arrow' | 'gun' | 'spear' | 'turret' | 'ice' | 'flame';
  piercing?: boolean;
  hitEnemyIds?: number[];
  hasHitBoss?: boolean;
};

export type HibikiShieldState = {
  cooldown: number;
  timer: number;
  blocksRemaining: number;
  flashTimer: number;
};

export type GarudaDirection = 'bottomToTop';

export type MyououGarudaState = {
  cooldown: number;
  timer: number;
  direction: GarudaDirection;
  hitEnemyIds: number[];
  hasHitBoss: boolean;
};

export type RockelSupportBreakState = {
  timer: number;
};

export type SochoSupportSlashState = {
  timer: number;
};

export type EffectKind = 'hit' | 'damage' | 'coin' | 'support' | 'bonus' | 'heal';

export type FloatingEffect = {
  id: number;
  kind: EffectKind;
  x: number;
  y: number;
  text?: string;
  timer: number;
};

export type Player = {
  x: number;
  y: number;
  radius: number;
  hp: number;
  maxHp: number;
  attackCooldown: number;
  slashTimer: number;
  invincibleTimer: number;
  nextGunHand: 'left' | 'right';
  spearThrowCooldown: number;
  turretDeployCooldown: number;
  hammerBreakCooldown: number;
  hammerBreakTimer: number;
  axeSwingCount: number;
  axeBreakTimer: number;
};

export type Vector = {
  x: number;
  y: number;
};

export type GameState = {
  status: GameStatus;
  stageId: StageId;
  stageName: string;
  isTraining: boolean;
  player: Player;
  enemies: Enemy[];
  coins: Coin[];
  hearts: HeartPickup[];
  bullets: EnemyBullet[];
  playerArrows: PlayerArrow[];
  supportBullets: SupportBullet[];
  turrets: DeliTurret[];
  supportTurrets: DeliTurret[];
  supportPoisonSmokes: PoisonSmoke[];
  supportShield: HibikiShieldState;
  supportGaruda: MyououGarudaState;
  supportRockelBreak: RockelSupportBreakState;
  supportSochoSlash: SochoSupportSlashState;
  effects: FloatingEffect[];
  boss: Boss | null;
  bossIntroTimer: number;
  elapsed: number;
  coinsCollected: number;
  defeatedEnemies: number;
  hasTakenDamage: boolean;
  nextId: number;
  spawnTimer: number;
  supportCooldowns: {
    playerGunfire: number;
    ushimaruCounter: number;
    deliTurret: number;
    rockelBreak: number;
    rokudoPoison: number;
    tsutsuArrow: number;
    sochoSlash: number;
  };
  message: string;
};
