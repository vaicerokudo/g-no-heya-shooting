import {
  DELI_TOOL_GUN_COOLDOWN,
  DELI_TURRET_DEPLOY_INTERVAL,
  DELI_TURRET_DURATION,
  DELI_TURRET_FIRE_INTERVAL,
  DELI_TURRET_MAX_COUNT,
  HIBIKI_SHIELD_BASH_COOLDOWN,
  HIBIKI_SHIELD_BASH_HALF_WIDTH,
  HIBIKI_SHIELD_BASH_RANGE,
  IRONWALL_SHOCKWAVE_COOLDOWN,
  IRONWALL_SHOCKWAVE_HALF_WIDTH,
  IRONWALL_SHOCKWAVE_MIN_COOLDOWN,
  IRONWALL_SHOCKWAVE_RANGE,
  MOUNTAIN_BREAKER_VISIBLE_TIME,
  MYOO_FLAME_SWORD_COOLDOWN,
  NANAICHI_ICE_SWORD_COOLDOWN,
  PLAYER_MAIN_GUN_COOLDOWN,
  ROKUDO_SHADOW_SLASH_COOLDOWN,
  ROCKEL_AXE_COOLDOWN,
  ROCKEL_AXE_HALF_WIDTH,
  ROCKEL_AXE_RANGE,
  SLASH_COOLDOWN,
  STARBREAKER_SHOCKWAVE_COOLDOWN,
  STARBREAKER_SHOCKWAVE_HALF_WIDTH,
  STARBREAKER_SHOCKWAVE_MIN_COOLDOWN,
  STARBREAKER_SHOCKWAVE_RANGE,
  STAR_SLASH_WAVE_BOSS_DAMAGE,
  STAR_SLASH_WAVE_DAMAGE,
  STAR_SLASH_WAVE_HALF_WIDTH,
  STAR_SLASH_WAVE_RANGE,
  TSUTSU_ARROW_COOLDOWN,
  USHIMARU_SPEAR_COOLDOWN,
  USHIMARU_SPEAR_HALF_WIDTH,
  USHIMARU_SPEAR_RANGE,
  YABUKO_FM_HAMMER_COOLDOWN,
  YABUKO_FM_HAMMER_HALF_WIDTH,
  YABUKO_FM_HAMMER_RANGE,
} from './constants';

export type WeaponRarity = 'common' | 'rare' | 'epic';

export type WeaponDefinition = {
  id: string;
  name: string;
  owner: string;
  type: string;
  rarity: WeaponRarity;
  description: string;
  effectDescription: string;
  imagePath?: string;
};

export type OwnedWeapon = WeaponDefinition & {
  count: number;
  level: number;
};

export type CharacterId = 'socho' | 'tsutsu' | 'rokudo' | 'player' | 'ushimaru' | 'deli' | 'yabuko-fm' | 'rockel' | 'nanaichi' | 'myoo' | 'hibiki';

export type EquippedWeaponsByCharacter = Partial<Record<CharacterId, string>>;

export const WEAPON_MAX_LEVEL = 5;

export type SochoWeaponEffect = 'standardSlash' | 'starSlashWave';

export type SochoWeaponTuning = {
  slashCooldown: number;
  starWaveRange: number;
  starWaveHalfWidth: number;
  starWaveDamage: number;
  starWaveBossDamage: number;
};

export type TsutsuWeaponTuning = {
  arrowCooldown: number;
};

export type RokudoWeaponTuning = {
  shadowSlashCooldown: number;
};

export type PlayerWeaponTuning = {
  gunCooldown: number;
};

export type UshimaruWeaponTuning = {
  spearCooldown: number;
  spearRange: number;
  spearHalfWidth: number;
  thrustOffsets: number[];
  hasPiercingThrow: boolean;
  thrownSpearRadius: number;
  thrownSpearSpeed: number;
};

export type DeliWeaponTuning = {
  toolGunCooldown: number;
  turretDeployInterval: number;
  turretDuration: number;
  turretFireInterval: number;
  turretMaxCount: number;
};

export type YabukoFmWeaponTuning = {
  hammerCooldown: number;
  hammerRange: number;
  hammerHalfWidth: number;
  hasStarbreakerShockwave: boolean;
  starbreakerCooldown: number;
  starbreakerRange: number;
  starbreakerHalfWidth: number;
};

export type RockelWeaponTuning = {
  axeCooldown: number;
  axeRange: number;
  axeHalfWidth: number;
  hasMountainBreaker: boolean;
  strongEvery: number;
  strongRange: number;
  strongHalfWidth: number;
  strongVisibleTime: number;
};

export type NanaichiWeaponTuning = {
  iceSwordCooldown: number;
  iceShardCount: number;
};

export type MyooWeaponTuning = {
  flameSwordCooldown: number;
  flameBulletCount: number;
};

export type HibikiWeaponTuning = {
  shieldBashCooldown: number;
  shieldBashRange: number;
  shieldBashHalfWidth: number;
  hasIronwallShockwave: boolean;
  shockwaveCooldown: number;
  shockwaveRange: number;
  shockwaveHalfWidth: number;
};

export const DEFAULT_SOCHO_WEAPON_ID = 'iron-tachi';
export const DEFAULT_TSUTSU_WEAPON_ID = 'basic-bow';
export const DEFAULT_ROKUDO_WEAPON_ID = 'shadow-starter-blade';
export const DEFAULT_PLAYER_WEAPON_ID = 'starter-pistols';
export const DEFAULT_USHIMARU_WEAPON_ID = 'starter-spear';
export const DEFAULT_DELI_WEAPON_ID = 'starter-tool-gun';
export const DEFAULT_YABUKO_FM_WEAPON_ID = 'starter-war-hammer';
export const DEFAULT_ROCKEL_WEAPON_ID = 'starter-double-axe';
export const DEFAULT_NANAICHI_WEAPON_ID = 'starter-ice-sword';
export const DEFAULT_MYOO_WEAPON_ID = 'starter-kurikara-sword';
export const DEFAULT_HIBIKI_WEAPON_ID = 'starter-guard-shield';

export const defaultWeaponDefinitions: WeaponDefinition[] = [
  {
    id: DEFAULT_TSUTSU_WEAPON_ID,
    name: '初期弓',
    owner: 'つつ',
    type: '弓',
    rarity: 'common',
    description: 'つつ用。最初から使える基本の弓。',
    effectDescription: '一定間隔で前方へ矢を放つ標準の弓。',
  },
  {
    id: DEFAULT_ROKUDO_WEAPON_ID,
    name: '影の小刀',
    owner: 'ROKUDO',
    type: '刀',
    rarity: 'common',
    description: 'ROKUDO用。最初から使える影の小刀。',
    effectDescription: '短い間隔で前方へ影斬りを放つ標準の刀。',
  },
  {
    id: DEFAULT_PLAYER_WEAPON_ID,
    name: '支給拳銃',
    owner: 'Player',
    type: '拳銃',
    rarity: 'common',
    description: 'Player用。最初から使える支給品の二丁拳銃。',
    effectDescription: '左右の銃から交互に斜め前方へ弾を放つ。',
  },
  {
    id: DEFAULT_USHIMARU_WEAPON_ID,
    name: '支給槍',
    owner: 'うしまる',
    type: '槍',
    rarity: 'common',
    description: 'うしまる用。最初から使える基本の槍。',
    effectDescription: '正面へ細い直線突きを放つ標準の槍。',
  },
  {
    id: DEFAULT_DELI_WEAPON_ID,
    name: '支給工具銃',
    owner: 'Deli',
    type: '工具銃',
    rarity: 'common',
    description: 'Deli用。最初から使える工具銃。',
    effectDescription: '単発拳銃と短時間の簡易タレットで戦う。',
  },
  {
    id: DEFAULT_YABUKO_FM_WEAPON_ID,
    name: '支給大槌',
    owner: 'FMやぶこ',
    type: '大槌',
    rarity: 'common',
    description: 'FMやぶこ用。最初から使える基本の大槌。',
    effectDescription: '遅めの大槌打撃で前方範囲を叩き、通常敵を少し押し返す。',
  },
  {
    id: DEFAULT_ROCKEL_WEAPON_ID,
    name: '支給両刃斧',
    owner: 'ROCKEL',
    type: '両刃斧',
    rarity: 'common',
    description: 'ROCKEL用。最初から使える基本の両刃斧。',
    effectDescription: '前方を大きく横薙ぎし、広めの円弧で敵を巻き込む。',
  },
  {
    id: DEFAULT_HIBIKI_WEAPON_ID,
    name: '支給盾',
    owner: 'hibiki',
    type: '盾',
    rarity: 'common',
    description: 'hibiki用。最初から使える扱いやすい盾。',
    effectDescription: '約1.0秒ごとに前方へシールドバッシュを放ち、通常敵を押し返す。',
  },
  {
    id: DEFAULT_NANAICHI_WEAPON_ID,
    name: '支給氷剣',
    owner: '7171',
    type: '片手剣',
    rarity: 'common',
    description: '7171用。最初から使える氷の片手剣。',
    effectDescription: '氷剣の斬撃から氷弾を1発放ち、通常敵に短時間スロウを付与する。',
  },
  {
    id: DEFAULT_MYOO_WEAPON_ID,
    name: '支給倶利伽羅剣',
    owner: '明王',
    type: '倶利伽羅剣',
    rarity: 'common',
    description: '明王用。最初から使える倶利伽羅剣。',
    effectDescription: '炎剣の斬撃から炎弾を1発放つ。状態異常はない。',
  },
];

export const WEAPON_RARITY_WEIGHTS: Record<WeaponRarity, number> = {
  common: 65,
  rare: 27,
  epic: 8,
};

export const weaponCandidates: WeaponDefinition[] = [
  {
    id: 'iron-tachi',
    name: '鉄の太刀',
    owner: '総長',
    type: '太刀',
    rarity: 'common',
    description: '総長用。基本の太刀。',
    effectDescription: '標準の前方半円斬撃。',
    imagePath: '/assets/tcg/weapon-iron-tachi.png',
  },
  {
    id: 'star-vein-tachi',
    name: '星脈の太刀',
    owner: '総長',
    type: '太刀',
    rarity: 'rare',
    description: '総長用。斬撃に星脈の力を宿した太刀。',
    effectDescription: '前方半円斬撃に加え、正面へ細い星脈の斬撃波を放つ。',
    imagePath: '/assets/tcg/weapon-star-vein-tachi.png',
  },
  {
    id: 'repeating-crossbow-bow',
    name: '疾風の弓',
    owner: 'つつ',
    type: '弓',
    rarity: 'rare',
    description: 'つつ用。風をまとい、素早く矢を番えられる弓。',
    effectDescription: 'つつの矢の発射間隔を短縮する。Lvが上がるほど少し速くなる。',
    imagePath: '/assets/tcg/weapon-shippu-bow.png',
  },
  {
    id: 'shadow-stitch-blade',
    name: '影縫いの刀',
    owner: 'ROKUDO',
    type: '刀',
    rarity: 'rare',
    description: 'ROKUDO用。影をまとった刀。',
    effectDescription: 'ROKUDOの影斬り間隔を短縮する。Lvが上がるほど少し速くなる。',
    imagePath: '/assets/tcg/weapon-shadow-stitch-blade.png',
  },
  {
    id: 'prototype-turret-unit',
    name: '試作砲台ユニット',
    owner: 'Deli',
    type: '砲台ユニット',
    rarity: 'common',
    description: 'Deli用。設置砲撃用の試作兵装。',
    effectDescription: 'タレットの持続時間と射撃間隔を強化する。Lv5で同時設置数が2台になる。',
    imagePath: '/assets/tcg/weapon-prototype-turret.png',
  },
  {
    id: 'ironwall-greatshield',
    name: '鉄壁の大盾',
    owner: 'hibiki',
    type: '大盾',
    rarity: 'common',
    description: 'hibiki用。前方防御に優れた大盾。',
    effectDescription: '一定間隔でIRON BASHの盾衝撃波を追加する。Lvで発動間隔と範囲が強化される。',
    imagePath: '/assets/tcg/weapon-ironwall-shield.png',
  },
  {
    id: 'fang-thrust-spear',
    name: '牙突の槍',
    owner: 'うしまる',
    type: '槍',
    rarity: 'common',
    description: 'うしまる用。直線突破に向いた槍。',
    effectDescription: '約6秒ごとに前方へ貫通槍投げを追加する。Lvで通常突きの位置と本数が強化される。',
    imagePath: '/assets/tcg/weapon-fang-spear.png',
  },
  {
    id: 'mountain-breaker-axe',
    name: '山砕きの斧',
    owner: 'ROCKEL',
    type: '両刃斧',
    rarity: 'epic',
    description: 'ROCKEL用。広範囲を薙ぎ払う重い両刃斧。',
    effectDescription: '一定回数ごとにMOUNTAIN BREAKを発動し、通常より広い斧撃を放つ。',
    imagePath: '/assets/tcg/weapon-mountain-breaker-axe.png',
  },
  {
    id: 'twin-fang-pistols',
    name: '双牙の拳銃',
    owner: 'Player',
    type: '拳銃',
    rarity: 'common',
    description: 'Player用。2丁拳銃の基礎武器。',
    effectDescription: '左右交互射撃の発射間隔を短縮する。Lvが上がるほど少し速くなる。',
    imagePath: '/assets/tcg/weapon-twin-fang-pistols.png',
  },
  {
    id: 'starbreaker-hammer',
    name: '星砕きの大槌',
    owner: 'FMやぶこ',
    type: '大槌',
    rarity: 'rare',
    description: 'FMやぶこ用。星脈の力を込めて地面ごと叩き割る大槌。',
    effectDescription: '一定間隔でSTAR BREAKの星砕き衝撃波を放つ。Lvで間隔、射程、幅が強化される。',
    imagePath: '/assets/tcg/weapon-starbreaker-hammer.png',
  },
  {
    id: 'ice-crystal-sword',
    name: '氷晶の片手剣',
    owner: '7171',
    type: '片手剣',
    rarity: 'rare',
    description: '7171用。氷晶を宿した片手剣。',
    effectDescription: 'Lvに応じて氷弾数が1〜5発に増加する。氷弾は通常敵にスロウを付与する。',
    imagePath: '/assets/tcg/weapon-ice-crystal-sword.png',
  },
  {
    id: 'kurikara-flame-sword',
    name: '倶利伽羅炎剣',
    owner: '明王',
    type: '倶利伽羅剣',
    rarity: 'epic',
    description: '明王用。炎を宿した倶利伽羅剣。',
    effectDescription: 'Lvに応じて炎弾数が2/4/6/8/10発に増加する。状態異常なしの火力武器。',
    imagePath: '/assets/tcg/weapon-kurikara-flame-sword.png',
  },
];

export const FORGE_RESULT_LINES: Record<WeaponRarity, string> = {
  common: 'まずまずの出来だな。',
  rare: 'お、なかなかいいもんが打てたぜ。',
  epic: 'こいつは大当たりだ。大事に使えよ。',
};

export function forgeRandomWeapon(): WeaponDefinition {
  const rarity = pickWeightedRarity();
  const rarityPool = weaponCandidates.filter((weapon) => weapon.rarity === rarity);
  const pool = rarityPool.length > 0 ? rarityPool : weaponCandidates;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function addOwnedWeapon(ownedWeapons: OwnedWeapon[], weapon: WeaponDefinition): OwnedWeapon[] {
  const existingWeapon = ownedWeapons.find((ownedWeapon) => ownedWeapon.id === weapon.id);
  if (existingWeapon) {
    return ownedWeapons.map((ownedWeapon) =>
      ownedWeapon.id === weapon.id
        ? { ...ownedWeapon, count: ownedWeapon.count + 1, level: normalizeWeaponLevel((ownedWeapon.level ?? ownedWeapon.count) + 1) }
        : ownedWeapon,
    );
  }

  return [...ownedWeapons, { ...weapon, count: 1, level: 1 }];
}

export function getWeaponExcessCount(weapon: OwnedWeapon): number {
  if ((weapon.level ?? 1) < WEAPON_MAX_LEVEL) return 0;
  return Math.max(0, Math.floor(weapon.count) - WEAPON_MAX_LEVEL);
}

export function getTotalWeaponExcessCount(ownedWeapons: OwnedWeapon[]): number {
  return ownedWeapons.reduce((total, weapon) => total + getWeaponExcessCount(weapon), 0);
}

export function convertWeaponExcessToStarVeinSteel(
  ownedWeapons: OwnedWeapon[],
  weaponId?: string,
): { weapons: OwnedWeapon[]; gained: number } {
  let gained = 0;
  const weapons = ownedWeapons.map((weapon) => {
    if (weaponId && weapon.id !== weaponId) return weapon;

    const excess = getWeaponExcessCount(weapon);
    if (excess <= 0) return weapon;

    gained += excess;
    return {
      ...weapon,
      count: WEAPON_MAX_LEVEL,
      level: normalizeWeaponLevel(weapon.level ?? WEAPON_MAX_LEVEL),
    };
  });

  return { weapons, gained };
}

export function getWeaponById(weaponId: string): WeaponDefinition | undefined {
  return [...defaultWeaponDefinitions, ...weaponCandidates].find((weapon) => weapon.id === weaponId);
}

export function hydrateOwnedWeapon(weapon: OwnedWeapon): OwnedWeapon {
  const currentDefinition = getWeaponById(weapon.id);
  const count = Math.max(1, Math.floor(weapon.count));
  const level = normalizeWeaponLevel(weapon.level ?? weapon.count);
  return currentDefinition ? { ...currentDefinition, count, level } : { ...weapon, count, level };
}

export function getSochoWeaponOptions(ownedWeapons: OwnedWeapon[]): OwnedWeapon[] {
  return ownedWeapons.filter((weapon) => isSochoWeapon(weapon.id));
}

export function getTsutsuWeaponOptions(ownedWeapons: OwnedWeapon[]): OwnedWeapon[] {
  return [getDefaultOwnedWeapon(DEFAULT_TSUTSU_WEAPON_ID), ...ownedWeapons.filter((weapon) => isTsutsuWeapon(weapon.id))];
}

export function getRokudoWeaponOptions(ownedWeapons: OwnedWeapon[]): OwnedWeapon[] {
  return [getDefaultOwnedWeapon(DEFAULT_ROKUDO_WEAPON_ID), ...ownedWeapons.filter((weapon) => isRokudoWeapon(weapon.id))];
}

export function getPlayerWeaponOptions(ownedWeapons: OwnedWeapon[]): OwnedWeapon[] {
  return [getDefaultOwnedWeapon(DEFAULT_PLAYER_WEAPON_ID), ...ownedWeapons.filter((weapon) => isPlayerWeapon(weapon.id))];
}

export function getUshimaruWeaponOptions(ownedWeapons: OwnedWeapon[]): OwnedWeapon[] {
  return [getDefaultOwnedWeapon(DEFAULT_USHIMARU_WEAPON_ID), ...ownedWeapons.filter((weapon) => isUshimaruWeapon(weapon.id))];
}

export function getDeliWeaponOptions(ownedWeapons: OwnedWeapon[]): OwnedWeapon[] {
  return [getDefaultOwnedWeapon(DEFAULT_DELI_WEAPON_ID), ...ownedWeapons.filter((weapon) => isDeliWeapon(weapon.id))];
}

export function getYabukoFmWeaponOptions(ownedWeapons: OwnedWeapon[]): OwnedWeapon[] {
  return [getDefaultOwnedWeapon(DEFAULT_YABUKO_FM_WEAPON_ID), ...ownedWeapons.filter((weapon) => isYabukoFmWeapon(weapon.id))];
}

export function getRockelWeaponOptions(ownedWeapons: OwnedWeapon[]): OwnedWeapon[] {
  return [getDefaultOwnedWeapon(DEFAULT_ROCKEL_WEAPON_ID), ...ownedWeapons.filter((weapon) => isRockelWeapon(weapon.id))];
}

export function getNanaichiWeaponOptions(ownedWeapons: OwnedWeapon[]): OwnedWeapon[] {
  return [getDefaultOwnedWeapon(DEFAULT_NANAICHI_WEAPON_ID), ...ownedWeapons.filter((weapon) => isNanaichiWeapon(weapon.id))];
}

export function getMyooWeaponOptions(ownedWeapons: OwnedWeapon[]): OwnedWeapon[] {
  return [getDefaultOwnedWeapon(DEFAULT_MYOO_WEAPON_ID), ...ownedWeapons.filter((weapon) => isMyooWeapon(weapon.id))];
}

export function getHibikiWeaponOptions(ownedWeapons: OwnedWeapon[]): OwnedWeapon[] {
  return [getDefaultOwnedWeapon(DEFAULT_HIBIKI_WEAPON_ID), ...ownedWeapons.filter((weapon) => isHibikiWeapon(weapon.id))];
}

export function getEquippedSochoWeapon(equippedWeapons: EquippedWeaponsByCharacter): WeaponDefinition {
  return getWeaponById(equippedWeapons.socho ?? DEFAULT_SOCHO_WEAPON_ID) ?? weaponCandidates[0];
}

export function getEquippedTsutsuWeapon(equippedWeapons: EquippedWeaponsByCharacter): WeaponDefinition {
  return getWeaponById(equippedWeapons.tsutsu ?? DEFAULT_TSUTSU_WEAPON_ID) ?? defaultWeaponDefinitions[0];
}

export function getEquippedRokudoWeapon(equippedWeapons: EquippedWeaponsByCharacter): WeaponDefinition {
  return getWeaponById(equippedWeapons.rokudo ?? DEFAULT_ROKUDO_WEAPON_ID) ?? defaultWeaponDefinitions[1];
}

export function getEquippedPlayerWeapon(equippedWeapons: EquippedWeaponsByCharacter): WeaponDefinition {
  return getWeaponById(equippedWeapons.player ?? DEFAULT_PLAYER_WEAPON_ID) ?? defaultWeaponDefinitions[2];
}

export function getEquippedUshimaruWeapon(equippedWeapons: EquippedWeaponsByCharacter): WeaponDefinition {
  return getWeaponById(equippedWeapons.ushimaru ?? DEFAULT_USHIMARU_WEAPON_ID) ?? defaultWeaponDefinitions[3];
}

export function getEquippedDeliWeapon(equippedWeapons: EquippedWeaponsByCharacter): WeaponDefinition {
  return getWeaponById(equippedWeapons.deli ?? DEFAULT_DELI_WEAPON_ID) ?? defaultWeaponDefinitions[4];
}

export function getEquippedYabukoFmWeapon(equippedWeapons: EquippedWeaponsByCharacter): WeaponDefinition {
  return getWeaponById(equippedWeapons['yabuko-fm'] ?? DEFAULT_YABUKO_FM_WEAPON_ID) ?? defaultWeaponDefinitions[5];
}

export function getEquippedRockelWeapon(equippedWeapons: EquippedWeaponsByCharacter): WeaponDefinition {
  return getWeaponById(equippedWeapons.rockel ?? DEFAULT_ROCKEL_WEAPON_ID) ?? defaultWeaponDefinitions[6];
}

export function getEquippedNanaichiWeapon(equippedWeapons: EquippedWeaponsByCharacter): WeaponDefinition {
  return getWeaponById(equippedWeapons.nanaichi ?? DEFAULT_NANAICHI_WEAPON_ID) ?? getDefaultOwnedWeapon(DEFAULT_NANAICHI_WEAPON_ID);
}

export function getEquippedMyooWeapon(equippedWeapons: EquippedWeaponsByCharacter): WeaponDefinition {
  return getWeaponById(equippedWeapons.myoo ?? DEFAULT_MYOO_WEAPON_ID) ?? getDefaultOwnedWeapon(DEFAULT_MYOO_WEAPON_ID);
}

export function getEquippedHibikiWeapon(equippedWeapons: EquippedWeaponsByCharacter): WeaponDefinition {
  return getWeaponById(equippedWeapons.hibiki ?? DEFAULT_HIBIKI_WEAPON_ID) ?? getDefaultOwnedWeapon(DEFAULT_HIBIKI_WEAPON_ID);
}

export function getEquippedWeaponForCharacter(
  equippedWeapons: EquippedWeaponsByCharacter,
  characterId: CharacterId,
): WeaponDefinition {
  if (characterId === 'tsutsu') return getEquippedTsutsuWeapon(equippedWeapons);
  if (characterId === 'rokudo') return getEquippedRokudoWeapon(equippedWeapons);
  if (characterId === 'player') return getEquippedPlayerWeapon(equippedWeapons);
  if (characterId === 'ushimaru') return getEquippedUshimaruWeapon(equippedWeapons);
  if (characterId === 'deli') return getEquippedDeliWeapon(equippedWeapons);
  if (characterId === 'yabuko-fm') return getEquippedYabukoFmWeapon(equippedWeapons);
  if (characterId === 'rockel') return getEquippedRockelWeapon(equippedWeapons);
  if (characterId === 'nanaichi') return getEquippedNanaichiWeapon(equippedWeapons);
  if (characterId === 'myoo') return getEquippedMyooWeapon(equippedWeapons);
  if (characterId === 'hibiki') return getEquippedHibikiWeapon(equippedWeapons);
  return getEquippedSochoWeapon(equippedWeapons);
}

export function getOwnedWeaponLevel(ownedWeapons: OwnedWeapon[], weaponId: string | undefined): number {
  if (
    !weaponId ||
    weaponId === DEFAULT_SOCHO_WEAPON_ID ||
    weaponId === DEFAULT_TSUTSU_WEAPON_ID ||
    weaponId === DEFAULT_ROKUDO_WEAPON_ID ||
    weaponId === DEFAULT_PLAYER_WEAPON_ID ||
    weaponId === DEFAULT_USHIMARU_WEAPON_ID ||
    weaponId === DEFAULT_DELI_WEAPON_ID ||
    weaponId === DEFAULT_YABUKO_FM_WEAPON_ID ||
    weaponId === DEFAULT_ROCKEL_WEAPON_ID ||
    weaponId === DEFAULT_NANAICHI_WEAPON_ID ||
    weaponId === DEFAULT_MYOO_WEAPON_ID ||
    weaponId === DEFAULT_HIBIKI_WEAPON_ID
  ) {
    return ownedWeapons.find((weapon) => weapon.id === weaponId)?.level ?? 1;
  }

  return normalizeWeaponLevel(
    ownedWeapons.find((weapon) => weapon.id === weaponId)?.level ??
      ownedWeapons.find((weapon) => weapon.id === weaponId)?.count ??
      1,
  );
}

export function getWeaponOptionsForCharacter(characterId: CharacterId, ownedWeapons: OwnedWeapon[]): OwnedWeapon[] {
  if (characterId === 'tsutsu') return getTsutsuWeaponOptions(ownedWeapons);
  if (characterId === 'rokudo') return getRokudoWeaponOptions(ownedWeapons);
  if (characterId === 'player') return getPlayerWeaponOptions(ownedWeapons);
  if (characterId === 'ushimaru') return getUshimaruWeaponOptions(ownedWeapons);
  if (characterId === 'deli') return getDeliWeaponOptions(ownedWeapons);
  if (characterId === 'yabuko-fm') return getYabukoFmWeaponOptions(ownedWeapons);
  if (characterId === 'rockel') return getRockelWeaponOptions(ownedWeapons);
  if (characterId === 'nanaichi') return getNanaichiWeaponOptions(ownedWeapons);
  if (characterId === 'myoo') return getMyooWeaponOptions(ownedWeapons);
  if (characterId === 'hibiki') return getHibikiWeaponOptions(ownedWeapons);
  return getSochoWeaponOptions(ownedWeapons);
}

export function getSochoWeaponTuning(weaponId: string | undefined, level = 1): SochoWeaponTuning {
  const normalizedLevel = normalizeWeaponLevel(level);
  const levelBonus = normalizedLevel - 1;
  const cooldownReduction = Math.min(0.1, levelBonus * 0.018);
  const hasWave = hasSochoSlashWave(weaponId);

  return {
    slashCooldown: Math.max(0.58, SLASH_COOLDOWN - cooldownReduction),
    starWaveRange: hasWave ? STAR_SLASH_WAVE_RANGE + levelBonus * 7 : STAR_SLASH_WAVE_RANGE,
    starWaveHalfWidth: hasWave ? STAR_SLASH_WAVE_HALF_WIDTH + levelBonus * 1.6 : STAR_SLASH_WAVE_HALF_WIDTH,
    starWaveDamage: hasWave ? STAR_SLASH_WAVE_DAMAGE + Math.floor(levelBonus / 4) : STAR_SLASH_WAVE_DAMAGE,
    starWaveBossDamage: hasWave ? STAR_SLASH_WAVE_BOSS_DAMAGE + Math.floor(levelBonus / 5) : STAR_SLASH_WAVE_BOSS_DAMAGE,
  };
}

export function getTsutsuWeaponTuning(weaponId: string | undefined, level = 1): TsutsuWeaponTuning {
  const normalizedLevel = normalizeWeaponLevel(level);
  const levelBonus = normalizedLevel - 1;
  const isShippuBow = weaponId === 'repeating-crossbow-bow';
  const weaponReduction = isShippuBow ? 0.08 : 0;
  const levelReduction = isShippuBow ? Math.min(0.1, levelBonus * 0.016) : 0;

  return {
    arrowCooldown: Math.max(0.48, TSUTSU_ARROW_COOLDOWN - weaponReduction - levelReduction),
  };
}

export function getRokudoWeaponTuning(weaponId: string | undefined, level = 1): RokudoWeaponTuning {
  const normalizedLevel = normalizeWeaponLevel(level);
  const isShadowStitchBlade = weaponId === 'shadow-stitch-blade';
  const baseCooldown = isShadowStitchBlade ? 0.46 : ROKUDO_SHADOW_SLASH_COOLDOWN;
  const levelReduction = isShadowStitchBlade ? Math.min(0.04, (normalizedLevel - 1) * 0.01) : 0;

  return {
    shadowSlashCooldown: Math.max(0.42, baseCooldown - levelReduction),
  };
}

export function getPlayerWeaponTuning(weaponId: string | undefined, level = 1): PlayerWeaponTuning {
  const normalizedLevel = normalizeWeaponLevel(level);
  const isTwinFangPistols = weaponId === 'twin-fang-pistols';
  const baseCooldown = isTwinFangPistols ? 0.72 : PLAYER_MAIN_GUN_COOLDOWN;
  const levelReduction = isTwinFangPistols ? Math.min(0.08, (normalizedLevel - 1) * 0.02) : 0;

  return {
    gunCooldown: Math.max(0.64, baseCooldown - levelReduction),
  };
}

export function getUshimaruWeaponTuning(weaponId: string | undefined, level = 1): UshimaruWeaponTuning {
  const normalizedLevel = normalizeWeaponLevel(level);
  const isFangSpear = weaponId === 'fang-thrust-spear';
  const levelBonus = normalizedLevel - 1;
  const thrustOffsets = normalizedLevel >= 5 ? [0, -18, 18] : normalizedLevel >= 4 ? [0, -16] : normalizedLevel >= 3 ? [0, 16] : [0];

  return {
    spearCooldown: Math.max(0.5, USHIMARU_SPEAR_COOLDOWN - (isFangSpear ? Math.min(0.04, levelBonus * 0.01) : 0)),
    spearRange: USHIMARU_SPEAR_RANGE + (normalizedLevel >= 2 ? 8 : 0) + (isFangSpear ? levelBonus * 3 : 0),
    spearHalfWidth: USHIMARU_SPEAR_HALF_WIDTH + (normalizedLevel >= 2 ? 2 : 0),
    thrustOffsets,
    hasPiercingThrow: isFangSpear,
    thrownSpearRadius: 6 + Math.floor(levelBonus / 3),
    thrownSpearSpeed: 500 + levelBonus * 14,
  };
}

export function getDeliWeaponTuning(weaponId: string | undefined, level = 1): DeliWeaponTuning {
  const normalizedLevel = normalizeWeaponLevel(level);
  const isPrototypeTurret = weaponId === 'prototype-turret-unit';
  const levelBonus = normalizedLevel - 1;

  return {
    toolGunCooldown: DELI_TOOL_GUN_COOLDOWN,
    turretDeployInterval: DELI_TURRET_DEPLOY_INTERVAL,
    turretDuration: isPrototypeTurret ? 6 + levelBonus * 0.5 : DELI_TURRET_DURATION,
    turretFireInterval: isPrototypeTurret ? Math.max(0.75, 0.95 - levelBonus * 0.05) : DELI_TURRET_FIRE_INTERVAL,
    turretMaxCount: isPrototypeTurret && normalizedLevel >= 5 ? 2 : DELI_TURRET_MAX_COUNT,
  };
}

export function getYabukoFmWeaponTuning(weaponId: string | undefined, level = 1): YabukoFmWeaponTuning {
  const normalizedLevel = normalizeWeaponLevel(level);
  const levelBonus = normalizedLevel - 1;
  const hasStarbreakerShockwave = weaponId === 'starbreaker-hammer';

  return {
    hammerCooldown: YABUKO_FM_HAMMER_COOLDOWN,
    hammerRange: YABUKO_FM_HAMMER_RANGE,
    hammerHalfWidth: YABUKO_FM_HAMMER_HALF_WIDTH,
    hasStarbreakerShockwave,
    starbreakerCooldown: hasStarbreakerShockwave
      ? Math.max(STARBREAKER_SHOCKWAVE_MIN_COOLDOWN, STARBREAKER_SHOCKWAVE_COOLDOWN - levelBonus * 0.3)
      : STARBREAKER_SHOCKWAVE_COOLDOWN,
    starbreakerRange: hasStarbreakerShockwave ? STARBREAKER_SHOCKWAVE_RANGE + levelBonus * 8 : STARBREAKER_SHOCKWAVE_RANGE,
    starbreakerHalfWidth: hasStarbreakerShockwave ? STARBREAKER_SHOCKWAVE_HALF_WIDTH + levelBonus * 3 : STARBREAKER_SHOCKWAVE_HALF_WIDTH,
  };
}

export function getRockelWeaponTuning(weaponId: string | undefined, level = 1): RockelWeaponTuning {
  const normalizedLevel = normalizeWeaponLevel(level);
  const levelBonus = normalizedLevel - 1;
  const hasMountainBreaker = weaponId === 'mountain-breaker-axe';

  return {
    axeCooldown: ROCKEL_AXE_COOLDOWN,
    axeRange: ROCKEL_AXE_RANGE,
    axeHalfWidth: ROCKEL_AXE_HALF_WIDTH,
    hasMountainBreaker,
    strongEvery: normalizedLevel >= 3 ? 3 : 4,
    strongRange: hasMountainBreaker ? ROCKEL_AXE_RANGE + 22 + levelBonus * 8 : ROCKEL_AXE_RANGE,
    strongHalfWidth: hasMountainBreaker ? ROCKEL_AXE_HALF_WIDTH + 20 + levelBonus * 8 : ROCKEL_AXE_HALF_WIDTH,
    strongVisibleTime: MOUNTAIN_BREAKER_VISIBLE_TIME,
  };
}

export function getNanaichiWeaponTuning(weaponId: string | undefined, level = 1): NanaichiWeaponTuning {
  const normalizedLevel = normalizeWeaponLevel(level);
  const hasIceCrystalSword = weaponId === 'ice-crystal-sword';

  return {
    iceSwordCooldown: NANAICHI_ICE_SWORD_COOLDOWN,
    iceShardCount: hasIceCrystalSword ? normalizedLevel : 1,
  };
}

export function getMyooWeaponTuning(weaponId: string | undefined, level = 1): MyooWeaponTuning {
  const normalizedLevel = normalizeWeaponLevel(level);
  const hasKurikaraFlameSword = weaponId === 'kurikara-flame-sword';

  return {
    flameSwordCooldown: MYOO_FLAME_SWORD_COOLDOWN,
    flameBulletCount: hasKurikaraFlameSword ? normalizedLevel * 2 : 1,
  };
}

export function getHibikiWeaponTuning(weaponId: string | undefined, level = 1): HibikiWeaponTuning {
  const normalizedLevel = normalizeWeaponLevel(level);
  const levelBonus = normalizedLevel - 1;
  const hasIronwallShockwave = weaponId === 'ironwall-greatshield';

  return {
    shieldBashCooldown: HIBIKI_SHIELD_BASH_COOLDOWN,
    shieldBashRange: HIBIKI_SHIELD_BASH_RANGE,
    shieldBashHalfWidth: HIBIKI_SHIELD_BASH_HALF_WIDTH,
    hasIronwallShockwave,
    shockwaveCooldown: hasIronwallShockwave
      ? Math.max(IRONWALL_SHOCKWAVE_MIN_COOLDOWN, IRONWALL_SHOCKWAVE_COOLDOWN - levelBonus * 0.4)
      : IRONWALL_SHOCKWAVE_COOLDOWN,
    shockwaveRange: hasIronwallShockwave ? IRONWALL_SHOCKWAVE_RANGE + (normalizedLevel >= 3 ? 8 : 0) + (normalizedLevel >= 5 ? 8 : 0) : IRONWALL_SHOCKWAVE_RANGE,
    shockwaveHalfWidth: hasIronwallShockwave
      ? IRONWALL_SHOCKWAVE_HALF_WIDTH + (normalizedLevel >= 3 ? 5 : 0) + (normalizedLevel >= 5 ? 5 : 0)
      : IRONWALL_SHOCKWAVE_HALF_WIDTH,
  };
}

export function getSochoWeaponEffect(weaponId: string | undefined): SochoWeaponEffect {
  if (weaponId === 'star-vein-tachi') return 'starSlashWave';
  return 'standardSlash';
}

export function hasSochoSlashWave(weaponId: string | undefined): boolean {
  return getSochoWeaponEffect(weaponId) === 'starSlashWave';
}

export function isSochoWeapon(weaponId: string): boolean {
  return weaponId === 'iron-tachi' || weaponId === 'star-vein-tachi';
}

export function isTsutsuWeapon(weaponId: string): boolean {
  return weaponId === DEFAULT_TSUTSU_WEAPON_ID || weaponId === 'repeating-crossbow-bow';
}

export function isRokudoWeapon(weaponId: string): boolean {
  return weaponId === DEFAULT_ROKUDO_WEAPON_ID || weaponId === 'shadow-stitch-blade';
}

export function isPlayerWeapon(weaponId: string): boolean {
  return weaponId === DEFAULT_PLAYER_WEAPON_ID || weaponId === 'twin-fang-pistols';
}

export function isUshimaruWeapon(weaponId: string): boolean {
  return weaponId === DEFAULT_USHIMARU_WEAPON_ID || weaponId === 'fang-thrust-spear';
}

export function isDeliWeapon(weaponId: string): boolean {
  return weaponId === DEFAULT_DELI_WEAPON_ID || weaponId === 'prototype-turret-unit';
}

export function isYabukoFmWeapon(weaponId: string): boolean {
  return weaponId === DEFAULT_YABUKO_FM_WEAPON_ID || weaponId === 'starbreaker-hammer';
}

export function isRockelWeapon(weaponId: string): boolean {
  return weaponId === DEFAULT_ROCKEL_WEAPON_ID || weaponId === 'mountain-breaker-axe';
}

export function isNanaichiWeapon(weaponId: string): boolean {
  return weaponId === DEFAULT_NANAICHI_WEAPON_ID || weaponId === 'ice-crystal-sword';
}

export function isMyooWeapon(weaponId: string): boolean {
  return weaponId === DEFAULT_MYOO_WEAPON_ID || weaponId === 'kurikara-flame-sword';
}

export function isHibikiWeapon(weaponId: string): boolean {
  return weaponId === DEFAULT_HIBIKI_WEAPON_ID || weaponId === 'ironwall-greatshield';
}

function getDefaultOwnedWeapon(weaponId: string): OwnedWeapon {
  const definition = getWeaponById(weaponId) ?? defaultWeaponDefinitions[0];
  return { ...definition, count: 1, level: 1 };
}

function normalizeWeaponLevel(level: number | undefined): number {
  return Math.min(WEAPON_MAX_LEVEL, Math.max(1, Math.floor(level ?? 1)));
}

function pickWeightedRarity(): WeaponRarity {
  const entries = Object.entries(WEAPON_RARITY_WEIGHTS) as Array<[WeaponRarity, number]>;
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = Math.random() * total;

  for (const [rarity, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return rarity;
  }

  return 'common';
}
