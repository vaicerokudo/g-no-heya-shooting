import { getMainCharacter } from './characters';
import type { MainCharacterId, MainCharacterDefinition } from './characters';
import { getOwnedSupportLevel } from './supports';
import type { OwnedSupport } from './supports';
import type { SupportId } from './types';

export type CharacterSkinId = 'default' | 'sound-comic';
export type SelectedSkinsByCharacter = Partial<Record<MainCharacterId, CharacterSkinId>>;

export const SOUND_COMIC_SKIN_CHARACTER_IDS = [
  'socho',
  'tsutsu',
  'rokudo',
  'nanaichi',
  'myoo',
  'ushimaru',
  'deli',
  'rockel',
] as const satisfies readonly MainCharacterId[];

export const SOUND_COMIC_SKIN_SUPPORTS: Record<(typeof SOUND_COMIC_SKIN_CHARACTER_IDS)[number], SupportId> = {
  socho: 'socho',
  tsutsu: 'tsutsu',
  rokudo: 'rokudo',
  nanaichi: '7171',
  myoo: 'myouou',
  ushimaru: 'ushimaru',
  deli: 'deli',
  rockel: 'rockel',
};

const SOUND_COMIC_SKIN_IMAGES: Partial<Record<MainCharacterId, string>> = {
  socho: '/assets/tcg/skin-sound-comic-socho.png',
  tsutsu: '/assets/tcg/skin-sound-comic-tsutsu.png',
  rokudo: '/assets/tcg/skin-sound-comic-rokudo.png',
  nanaichi: '/assets/tcg/skin-sound-comic-nanaichi.png',
  myoo: '/assets/tcg/skin-sound-comic-myoo.png',
  ushimaru: '/assets/tcg/skin-sound-comic-ushimaru.png',
  deli: '/assets/tcg/skin-sound-comic-deli.png',
  rockel: '/assets/tcg/skin-sound-comic-rockel.png',
};

export function normalizeCharacterSkinId(value: unknown): CharacterSkinId {
  return value === 'sound-comic' ? 'sound-comic' : 'default';
}

export function isSoundComicSkinSupported(characterId: MainCharacterId): characterId is (typeof SOUND_COMIC_SKIN_CHARACTER_IDS)[number] {
  return (SOUND_COMIC_SKIN_CHARACTER_IDS as readonly MainCharacterId[]).includes(characterId);
}

export function getSoundComicSkinSupportId(characterId: MainCharacterId): SupportId | null {
  return isSoundComicSkinSupported(characterId) ? SOUND_COMIC_SKIN_SUPPORTS[characterId] : null;
}

export function isSoundComicSkinUnlocked(characterId: MainCharacterId, ownedSupports: OwnedSupport[]): boolean {
  const supportId = getSoundComicSkinSupportId(characterId);
  return supportId ? getOwnedSupportLevel(ownedSupports, supportId) >= 5 : false;
}

export function getEffectiveCharacterSkinId(
  characterId: MainCharacterId,
  selectedSkins: SelectedSkinsByCharacter,
  ownedSupports: OwnedSupport[],
): CharacterSkinId {
  const selectedSkin = normalizeCharacterSkinId(selectedSkins[characterId]);
  if (selectedSkin === 'sound-comic' && isSoundComicSkinUnlocked(characterId, ownedSupports)) {
    return 'sound-comic';
  }
  return 'default';
}

export function getCharacterSkinImage(characterId: MainCharacterId, skinId: CharacterSkinId): string | undefined {
  const character = getMainCharacter(characterId);
  if (skinId === 'sound-comic') {
    return SOUND_COMIC_SKIN_IMAGES[characterId] ?? character.image;
  }
  return character.image;
}

export function getCharacterWithSkin(
  characterId: MainCharacterId,
  selectedSkins: SelectedSkinsByCharacter,
  ownedSupports: OwnedSupport[],
): MainCharacterDefinition {
  const character = getMainCharacter(characterId);
  const skinId = getEffectiveCharacterSkinId(characterId, selectedSkins, ownedSupports);
  return {
    ...character,
    image: getCharacterSkinImage(characterId, skinId),
  };
}

export function getCharacterSkinLabel(skinId: CharacterSkinId): string {
  return skinId === 'sound-comic' ? 'サウンドコミック' : '通常';
}
