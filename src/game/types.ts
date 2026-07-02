export type GameStatus = 'title' | 'playing' | 'clear' | 'gameOver';

export type EnemyKind = 'small' | 'flying' | 'charger';

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

export type EffectKind = 'hit' | 'damage' | 'coin';

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
  effects: FloatingEffect[];
  boss: Boss | null;
  elapsed: number;
  coinsCollected: number;
  defeatedEnemies: number;
  nextId: number;
  spawnTimer: number;
  message: string;
};
