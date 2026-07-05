export type MainCharacterId = 'socho' | 'tsutsu' | 'rokudo' | 'player' | 'ushimaru' | 'deli' | 'yabuko-fm' | 'rockel' | 'nanaichi' | 'myoo';
export type MainCharacterStatus = 'available' | 'locked';
export type MainCharacterAttackType = 'slash' | 'bow' | 'shadowSlash' | 'gun' | 'spearThrust' | 'turretEngineer' | 'hammerBreaker' | 'axeBerserker' | 'iceSword' | 'flameSword';

export type MainCharacterDefinition = {
  id: MainCharacterId;
  name: string;
  role: string;
  description: string;
  status: MainCharacterStatus;
  statusLabel: string;
  weaponType: string;
  attackType: MainCharacterAttackType;
  attackLabel: string;
  image?: string;
};

export const mainCharacters: Record<MainCharacterId, MainCharacterDefinition> = {
  socho: {
    id: 'socho',
    name: '総長',
    role: '近接型リーダー',
    description: '前方半円斬撃で敵を切り開く。',
    status: 'available',
    statusLabel: '使用可能',
    weaponType: '太刀',
    attackType: 'slash',
    attackLabel: '前方半円斬撃',
    image: '/assets/tcg/chibi-socho.png',
  },
  tsutsu: {
    id: 'tsutsu',
    name: 'つつ',
    role: '遠距離支援',
    description: '弓で遠くの敵を狙い撃つ。',
    status: 'available',
    statusLabel: '使用可能',
    weaponType: '弓',
    attackType: 'bow',
    attackLabel: '弓射撃',
    image: '/assets/tcg/tsutsu-player.png',
  },
  rokudo: {
    id: 'rokudo',
    name: 'ROKUDO',
    role: '影の忍び',
    description: '素早い移動と刀で敵を翻弄する。',
    status: 'available',
    statusLabel: '使用可能',
    weaponType: '刀',
    attackType: 'shadowSlash',
    attackLabel: '影斬り',
    image: '/assets/tcg/rokudo-player.png',
  },
  player: {
    id: 'player',
    name: 'Player',
    role: '二丁拳銃',
    description: '連射と手数で敵を制圧する。',
    status: 'available',
    statusLabel: '使用可能',
    weaponType: '拳銃',
    attackType: 'gun',
    attackLabel: '二丁拳銃',
    image: '/assets/tcg/player-player.png',
  },
  ushimaru: {
    id: 'ushimaru',
    name: 'うしまる',
    role: '槍の一点突破',
    description: '槍の直線突きで前方の敵を貫く。',
    status: 'available',
    statusLabel: '使用可能',
    weaponType: '槍',
    attackType: 'spearThrust',
    attackLabel: '槍突き',
    image: '/assets/tcg/ushimaru-player.png',
  },
  deli: {
    id: 'deli',
    name: 'Deli',
    role: '設置型技工士',
    description: '単発拳銃と設置タレットで敵を迎え撃つ。',
    status: 'available',
    statusLabel: '使用可能',
    weaponType: '砲台ユニット',
    attackType: 'turretEngineer',
    attackLabel: '工具銃 + タレット',
    image: '/assets/tcg/deli-player.png',
  },
  'yabuko-fm': {
    id: 'yabuko-fm',
    name: 'FMやぶこ',
    role: '重撃・範囲制圧型',
    description: '大槌を振り下ろし、前方の敵をまとめて押し返す。',
    status: 'available',
    statusLabel: '使用可能',
    weaponType: '大槌',
    attackType: 'hammerBreaker',
    attackLabel: '大槌重撃',
    image: '/assets/tcg/yabuko-fm-player.png',
  },
  rockel: {
    id: 'rockel',
    name: 'ROCKEL',
    role: '広範囲ぶん回し型',
    description: '両刃斧の横薙ぎで、前方の敵をまとめて巻き込む。',
    status: 'available',
    statusLabel: '使用可能',
    weaponType: '両刃斧',
    attackType: 'axeBerserker',
    attackLabel: '斧ぶん回し',
    image: '/assets/tcg/rockel-player.png',
  },
  nanaichi: {
    id: 'nanaichi',
    name: '7171',
    role: '氷剣・散弾スロウ型',
    description: '氷の片手剣から散弾状の氷弾を放ち、敵の動きを鈍らせる。',
    status: 'available',
    statusLabel: '使用可能',
    weaponType: '片手剣',
    attackType: 'iceSword',
    attackLabel: '氷剣散弾',
    image: '/assets/tcg/nanaichi-player.png',
  },
  myoo: {
    id: 'myoo',
    name: '明王',
    role: '炎弾ばらまき・火力制圧型',
    description: '倶利伽羅剣から炎弾をばらまき、前方の敵を火力で押し切る。',
    status: 'available',
    statusLabel: '使用可能',
    weaponType: '倶利伽羅剣',
    attackType: 'flameSword',
    attackLabel: '炎剣散弾',
    image: '/assets/tcg/myoo-player.png',
  },
};

export const DEFAULT_MAIN_CHARACTER_ID: MainCharacterId = 'socho';
export const mainCharacterList = Object.values(mainCharacters);

export function getMainCharacter(characterId: MainCharacterId = DEFAULT_MAIN_CHARACTER_ID): MainCharacterDefinition {
  return mainCharacters[characterId];
}

export function isMainCharacterId(value: unknown): value is MainCharacterId {
  return (
    value === 'socho' ||
    value === 'tsutsu' ||
    value === 'rokudo' ||
    value === 'player' ||
    value === 'ushimaru' ||
    value === 'deli' ||
    value === 'yabuko-fm' ||
    value === 'rockel' ||
    value === 'nanaichi' ||
    value === 'myoo'
  );
}

export function isMainCharacterAvailable(characterId: MainCharacterId): boolean {
  return mainCharacters[characterId].status === 'available';
}

export function resolveActiveMainCharacterId(value: unknown): MainCharacterId {
  return isMainCharacterId(value) && isMainCharacterAvailable(value) ? value : DEFAULT_MAIN_CHARACTER_ID;
}
