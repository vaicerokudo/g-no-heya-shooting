export type GameStatus = 'title' | 'prepare' | 'playing' | 'paused' | 'clear' | 'gameOver';

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

export type EffectKind = 'hit' | 'damage' | 'coin' | 'support';

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
  bullets: EnemyBullet[];
  supportBullets: SupportBullet[];
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
