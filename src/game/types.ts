export type GameStatus =
  | 'title'
  | 'astoriaMap'
  | 'guildLobby'
  | 'guildParty'
  | 'guildSummon'
  | 'guildEquipment'
  | 'guildWeapons'
  | 'forge'
  | 'forgeDraw'
  | 'forgeWeapons'
  | 'shop'
  | 'gate'
  | 'playing'
  | 'paused'
  | 'clear'
  | 'gameOver';

export type EnemyKind = 'small' | 'flying' | 'charger';

export type SupportId = '7171' | 'yabuko' | 'player' | 'hibiki' | 'myouou';

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
  chargeTarget?: Vector;
  isCharging?: boolean;
};

export type Boss = {
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
};

export type Vector = {
  x: number;
  y: number;
};

export type GameState = {
  status: GameStatus;
  player: Player;
  enemies: Enemy[];
  coins: Coin[];
  hearts: HeartPickup[];
  bullets: EnemyBullet[];
  supportBullets: SupportBullet[];
  supportShield: HibikiShieldState;
  supportGaruda: MyououGarudaState;
  effects: FloatingEffect[];
  boss: Boss | null;
  elapsed: number;
  coinsCollected: number;
  defeatedEnemies: number;
  nextId: number;
  spawnTimer: number;
  supportCooldowns: {
    playerGunfire: number;
  };
  message: string;
};
