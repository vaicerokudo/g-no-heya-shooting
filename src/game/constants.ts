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
export const SLASH_RADIUS = 112;
export const SLASH_BOSS_RADIUS = 138;
export const SLASH_HALF_WIDTH = 90;
export const SLASH_DAMAGE = 1;
export const STAR_SLASH_WAVE_RANGE = 172;
export const STAR_SLASH_WAVE_HALF_WIDTH = 26;
export const STAR_SLASH_WAVE_DAMAGE = 1;
export const STAR_SLASH_WAVE_BOSS_DAMAGE = 1;

export const TSUTSU_ARROW_COOLDOWN = 0.64;
export const TSUTSU_ARROW_DAMAGE = 1;
export const TSUTSU_ARROW_BOSS_DAMAGE = 1;
export const TSUTSU_ARROW_SPEED = 460;
export const TSUTSU_ARROW_RADIUS = 5;
export const TSUTSU_ARROW_LIFE = 1.7;

// Support tuning is intentionally centralized so future Lv growth can adjust it.
export const PLAYER_SUPPORT_FIRE_INTERVAL = 1.35;
export const PLAYER_SUPPORT_BULLET_SPEED = 286;
export const PLAYER_SUPPORT_BULLET_DAMAGE = 1;
export const PLAYER_SUPPORT_BULLET_RADIUS = 4;
export const PLAYER_SUPPORT_BULLET_LIFE = 1.18;
export const PLAYER_SUPPORT_SHOTS_PER_BURST = 2;

export const NANA_SUPPORT_MAGNET_MULTIPLIER = 1.6;
export const NANA_SUPPORT_PICKUP_MULTIPLIER = 1.18;
export const NANA_SUPPORT_BONUS_COIN_CHANCE = 0.25;
export const NANA_SUPPORT_BOSS_BONUS_COINS = 3;

export const CLEAR_COIN_BONUS = 10;
export const NO_DAMAGE_CLEAR_BONUS_MULTIPLIER = 1.5;
// Future 7171 Lv growth can raise this keep rate after game over.
export const GAME_OVER_COIN_KEEP_RATE = 0.5;

export const FORGE_WEAPON_COST = 30;
export const FORGE_ANIMATION_DURATION = 1100;
export const SHOP_SUPPORT_SUMMON_COST = 80;

export const YABUKO_HEART_DROP_CHANCE = 0.22;
export const YABUKO_RED_HEART_HEAL = 24;
export const HEART_PICKUP_RADIUS = 46;

export const HIBIKI_SHIELD_INTERVAL = 7;
export const HIBIKI_SHIELD_DURATION = 2.4;
export const HIBIKI_SHIELD_BLOCKS = 3;
export const HIBIKI_SHIELD_WIDTH = 118;
export const HIBIKI_SHIELD_HEIGHT = 104;
export const HIBIKI_SHIELD_FLASH_TIME = 0.22;

export const MYOUOU_GARUDA_INTERVAL = 14;
export const MYOUOU_GARUDA_INITIAL_DELAY = 4.2;
export const MYOUOU_GARUDA_DURATION = 1.25;
export const MYOUOU_GARUDA_WIDTH = 150;
export const MYOUOU_GARUDA_HEIGHT = 170;
export const MYOUOU_GARUDA_FRAME_INTERVAL = 0.11;
// Future Myouou Lv growth can increase visual size and sweep range from these base values.
export const MYOUOU_GARUDA_FRAME_PATHS = [
  '/assets/tcg/garuda-frame-1-keyed.png',
  '/assets/tcg/garuda-frame-2-keyed.png',
  '/assets/tcg/garuda-frame-3-keyed.png',
] as const;
export const MYOUOU_GARUDA_DAMAGE = 4;
export const MYOUOU_GARUDA_BOSS_DAMAGE = 4;
export const MYOUOU_GARUDA_HIT_RANGE_X = 112;
export const MYOUOU_GARUDA_HIT_RANGE_Y = 88;

export const COIN_PICKUP_RADIUS = 56;
export const COIN_MAGNET_RADIUS = 104;
export const COIN_MAGNET_SPEED = 360;
export const BOSS_APPEAR_TIME = 54;
export const BOSS_APPEAR_KILLS = 32;
export const BOSS_Y = 238;
