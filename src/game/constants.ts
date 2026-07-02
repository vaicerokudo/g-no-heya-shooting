export const FIELD_WIDTH = 420;
export const FIELD_HEIGHT = 720;

export const STAGE_NAME = 'アストリア草原';

export const PLAYER_START = {
  x: FIELD_WIDTH / 2,
  y: FIELD_HEIGHT - 130,
};

export const PLAYER_LIMITS = {
  minX: 34,
  maxX: FIELD_WIDTH - 34,
  minY: FIELD_HEIGHT * 0.42,
  maxY: FIELD_HEIGHT - 42,
};

export const BOSS_PLAYER_LIMITS = {
  ...PLAYER_LIMITS,
  minY: FIELD_HEIGHT * 0.32,
};

export const PLAYER_SPEED = 280;
export const PLAYER_MAX_HP = 100;

export const SLASH_COOLDOWN = 0.72;
export const SLASH_VISIBLE_TIME = 0.18;
export const SLASH_RADIUS = 128;
export const SLASH_BOSS_RADIUS = 144;
export const SLASH_HALF_WIDTH = 102;
export const SLASH_DAMAGE = 1;

export const COIN_PICKUP_RADIUS = 56;
export const COIN_MAGNET_RADIUS = 104;
export const COIN_MAGNET_SPEED = 360;
export const BOSS_APPEAR_TIME = 54;
export const BOSS_APPEAR_KILLS = 32;
export const BOSS_Y = 238;
