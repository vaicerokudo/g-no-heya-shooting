export type MainCharacterId = 'socho' | 'tsutsu' | 'rokudo' | 'player';
export type MainCharacterStatus = 'available' | 'locked';
export type MainCharacterAttackType = 'slash' | 'bow' | 'shadowSlash';

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
    status: 'locked',
    statusLabel: '未解放',
    weaponType: '拳銃',
    attackType: 'bow',
    attackLabel: '未実装',
    image: '/assets/tcg/support-card-player.png',
  },
};

export const DEFAULT_MAIN_CHARACTER_ID: MainCharacterId = 'socho';
export const mainCharacterList = Object.values(mainCharacters);

export function getMainCharacter(characterId: MainCharacterId = DEFAULT_MAIN_CHARACTER_ID): MainCharacterDefinition {
  return mainCharacters[characterId];
}

export function isMainCharacterId(value: unknown): value is MainCharacterId {
  return value === 'socho' || value === 'tsutsu' || value === 'rokudo' || value === 'player';
}

export function isMainCharacterAvailable(characterId: MainCharacterId): boolean {
  return mainCharacters[characterId].status === 'available';
}

export function resolveActiveMainCharacterId(value: unknown): MainCharacterId {
  return isMainCharacterId(value) && isMainCharacterAvailable(value) ? value : DEFAULT_MAIN_CHARACTER_ID;
}
