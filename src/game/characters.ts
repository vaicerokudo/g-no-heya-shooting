export type MainCharacterId = 'socho';

export type MainCharacterDefinition = {
  id: MainCharacterId;
  name: string;
  role: string;
  description: string;
  status: string;
  image: string;
};

export const mainCharacters: Record<MainCharacterId, MainCharacterDefinition> = {
  socho: {
    id: 'socho',
    name: '総長',
    role: '近接型リーダー',
    description: '前方半円斬撃で敵を切り開く。',
    status: '現在は総長のみ出撃可能',
    image: '/assets/tcg/chibi-socho.png',
  },
};

export const DEFAULT_MAIN_CHARACTER_ID: MainCharacterId = 'socho';

export function getMainCharacter(characterId: MainCharacterId = DEFAULT_MAIN_CHARACTER_ID): MainCharacterDefinition {
  return mainCharacters[characterId];
}
