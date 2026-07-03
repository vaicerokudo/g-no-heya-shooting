export type WeaponRarity = 'common' | 'rare' | 'epic';

export type WeaponDefinition = {
  id: string;
  name: string;
  owner: string;
  type: string;
  rarity: WeaponRarity;
  description: string;
};

export type OwnedWeapon = WeaponDefinition & {
  count: number;
};

export type CharacterId = 'socho';

export type EquippedWeaponsByCharacter = Partial<Record<CharacterId, string>>;

export const DEFAULT_SOCHO_WEAPON_ID = 'iron-tachi';

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
  },
  {
    id: 'star-vein-tachi',
    name: '星脈の太刀',
    owner: '総長',
    type: '太刀',
    rarity: 'rare',
    description: '総長用。斬撃に星脈の力を宿す。',
  },
  {
    id: 'repeating-crossbow-bow',
    name: '連弩式の弓',
    owner: 'つつ',
    type: '弓',
    rarity: 'rare',
    description: 'つつ用。連射しやすい弓。',
  },
  {
    id: 'shadow-stitch-blade',
    name: '影縫いの刀',
    owner: 'ROKUDO',
    type: '刀',
    rarity: 'rare',
    description: 'ROKUDO用。影をまとった刀。',
  },
  {
    id: 'prototype-turret-unit',
    name: '試作砲台ユニット',
    owner: 'Deli',
    type: '砲台',
    rarity: 'common',
    description: 'Deli用。設置砲撃用の試作兵装。',
  },
  {
    id: 'ironwall-greatshield',
    name: '鉄壁の大盾',
    owner: 'hibiki',
    type: '大盾',
    rarity: 'common',
    description: 'hibiki用。前方防御に優れた大盾。',
  },
  {
    id: 'fang-thrust-spear',
    name: '牙突の槍',
    owner: 'うしまる',
    type: '槍',
    rarity: 'common',
    description: 'うしまる用。直線突破に向いた槍。',
  },
  {
    id: 'mountain-breaker-axe',
    name: '破山の両刃斧',
    owner: 'ROCKEL',
    type: '両刃斧',
    rarity: 'epic',
    description: 'ROCKEL用。広範囲を薙ぎ払う斧。',
  },
  {
    id: 'twin-fang-pistols',
    name: '双牙の拳銃',
    owner: 'Player',
    type: '拳銃',
    rarity: 'common',
    description: 'Player用。2丁拳銃の基礎武器。',
  },
];

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
      ownedWeapon.id === weapon.id ? { ...ownedWeapon, count: ownedWeapon.count + 1 } : ownedWeapon,
    );
  }

  return [...ownedWeapons, { ...weapon, count: 1 }];
}

export function getWeaponById(weaponId: string): WeaponDefinition | undefined {
  return weaponCandidates.find((weapon) => weapon.id === weaponId);
}

export function getSochoWeaponOptions(ownedWeapons: OwnedWeapon[]): OwnedWeapon[] {
  return ownedWeapons.filter((weapon) => isSochoWeapon(weapon.id));
}

export function getEquippedSochoWeapon(equippedWeapons: EquippedWeaponsByCharacter): WeaponDefinition {
  return getWeaponById(equippedWeapons.socho ?? DEFAULT_SOCHO_WEAPON_ID) ?? weaponCandidates[0];
}

export function isSochoWeapon(weaponId: string): boolean {
  return weaponId === 'iron-tachi' || weaponId === 'star-vein-tachi';
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
