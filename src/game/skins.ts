import { getMainCharacter } from './characters';
import type { MainCharacterId, MainCharacterDefinition } from './characters';
import { getOwnedSupportLevel, SUPPORT_SKIN_UNLOCK_LEVEL } from './supports';
import type { OwnedSupport } from './supports';
import type { StageId } from './stages';
import type { SupportId } from './types';

export type CharacterSkinId = 'default' | 'sound-comic' | 'travel' | 'dark';
export type SelectedSkinsByCharacter = Partial<Record<MainCharacterId, CharacterSkinId>>;
export type UnlockedDarkSkins = MainCharacterId[];
export type UnlockedTravelSkins = MainCharacterId[];

export const SKIN_CHARACTER_IDS = [
  'socho',
  'tsutsu',
  'rokudo',
  'player',
  'ushimaru',
  'deli',
  'yabuko-fm',
  'rockel',
  'nanaichi',
  'myoo',
  'hibiki',
] as const satisfies readonly MainCharacterId[];

export const SOUND_COMIC_SKIN_CHARACTER_IDS = SKIN_CHARACTER_IDS;

export const SOUND_COMIC_SKIN_SUPPORTS: Record<MainCharacterId, SupportId> = {
  socho: 'socho',
  tsutsu: 'tsutsu',
  rokudo: 'rokudo',
  player: 'player',
  ushimaru: 'ushimaru',
  deli: 'deli',
  'yabuko-fm': 'yabuko',
  rockel: 'rockel',
  nanaichi: '7171',
  myoo: 'myouou',
  hibiki: 'hibiki',
};

const SUPPORT_CHARACTER_IDS: Record<SupportId, MainCharacterId> = {
  socho: 'socho',
  tsutsu: 'tsutsu',
  rokudo: 'rokudo',
  player: 'player',
  ushimaru: 'ushimaru',
  deli: 'deli',
  yabuko: 'yabuko-fm',
  rockel: 'rockel',
  '7171': 'nanaichi',
  myouou: 'myoo',
  hibiki: 'hibiki',
};

// Keep support artwork entirely separate from playable-character skin artwork.
// Support UI must always resolve to a framed card, including its fallback.
const DEFAULT_SUPPORT_IMAGES: Record<SupportId, string> = {
  socho: '/assets/tcg/support-card-socho.webp',
  tsutsu: '/assets/tcg/support-card-tsutsu.webp',
  rokudo: '/assets/tcg/support-card-rokudo.webp',
  player: '/assets/tcg/support-card-player.png',
  ushimaru: '/assets/tcg/support-card-ushimaru.webp',
  deli: '/assets/tcg/support-card-deli.webp',
  yabuko: '/assets/tcg/support-card-yabuko.png',
  rockel: '/assets/tcg/support-card-rockel.webp',
  '7171': '/assets/tcg/support-card-7171.png',
  myouou: '/assets/tcg/support-card-myouou.png',
  hibiki: '/assets/tcg/support-card-hibiki.png',
};

const SOUND_COMIC_SKIN_IMAGES: Record<MainCharacterId, string> = {
  socho: '/assets/tcg/skin-sound-comic-socho.png',
  tsutsu: '/assets/tcg/skin-sound-comic-tsutsu.png',
  rokudo: '/assets/tcg/skin-sound-comic-rokudo.png',
  player: '/assets/tcg/skin-sound-comic-player.png',
  ushimaru: '/assets/tcg/skin-sound-comic-ushimaru.png',
  deli: '/assets/tcg/skin-sound-comic-deli.png',
  'yabuko-fm': '/assets/tcg/skin-sound-comic-yabuko-fm.png',
  rockel: '/assets/tcg/skin-sound-comic-rockel.png',
  nanaichi: '/assets/tcg/skin-sound-comic-nanaichi.png',
  myoo: '/assets/tcg/skin-sound-comic-myoo.png',
  hibiki: '/assets/tcg/skin-sound-comic-hibiki.png',
};

const TRAVEL_SKIN_IMAGES: Record<MainCharacterId, string> = {
  socho: '/assets/tcg/skin-travel-socho.png',
  tsutsu: '/assets/tcg/skin-travel-tsutsu.png',
  rokudo: '/assets/tcg/skin-travel-rokudo.png',
  player: '/assets/tcg/skin-travel-player.png',
  ushimaru: '/assets/tcg/skin-travel-ushimaru.png',
  deli: '/assets/tcg/skin-travel-deli.png',
  'yabuko-fm': '/assets/tcg/skin-travel-yabuko-fm.png',
  rockel: '/assets/tcg/skin-travel-rockel.png',
  nanaichi: '/assets/tcg/skin-travel-nanaichi.png',
  myoo: '/assets/tcg/skin-travel-myoo.png',
  hibiki: '/assets/tcg/skin-travel-hibiki.png',
};

const DARK_SKIN_IMAGES: Record<MainCharacterId, string> = {
  socho: '/assets/tcg/skin-dark-socho.png',
  tsutsu: '/assets/tcg/skin-dark-tsutsu.png',
  rokudo: '/assets/tcg/skin-dark-rokudo.png',
  player: '/assets/tcg/skin-dark-player.png',
  ushimaru: '/assets/tcg/skin-dark-ushimaru.png',
  deli: '/assets/tcg/skin-dark-deli.png',
  'yabuko-fm': '/assets/tcg/skin-dark-yabuko-fm.png',
  rockel: '/assets/tcg/skin-dark-rockel.png',
  nanaichi: '/assets/tcg/skin-dark-nanaichi.png',
  myoo: '/assets/tcg/skin-dark-myoo.png',
  hibiki: '/assets/tcg/skin-dark-hibiki.png',
};

const TRAVEL_SUPPORT_IMAGES: Record<SupportId, string> = {
  socho: '/assets/tcg/support-card-travel-socho.webp',
  tsutsu: '/assets/tcg/support-card-travel-tsutsu.webp',
  rokudo: '/assets/tcg/support-card-travel-rokudo.webp',
  player: '/assets/tcg/support-card-travel-player.webp',
  ushimaru: '/assets/tcg/support-card-travel-ushimaru.webp',
  deli: '/assets/tcg/support-card-travel-deli.webp',
  yabuko: '/assets/tcg/support-card-travel-yabuko.webp',
  rockel: '/assets/tcg/support-card-travel-rockel.webp',
  '7171': '/assets/tcg/support-card-travel-7171.webp',
  myouou: '/assets/tcg/support-card-travel-myouou.webp',
  hibiki: '/assets/tcg/support-card-travel-hibiki.webp',
};

const SOUND_COMIC_SUPPORT_IMAGES: Record<SupportId, string> = {
  socho: '/assets/tcg/support-card-sound-comic-socho.webp',
  tsutsu: '/assets/tcg/support-card-sound-comic-tsutsu.webp',
  rokudo: '/assets/tcg/support-card-sound-comic-rokudo.webp',
  player: '/assets/tcg/support-card-sound-comic-player.webp',
  ushimaru: '/assets/tcg/support-card-sound-comic-ushimaru.webp',
  deli: '/assets/tcg/support-card-sound-comic-deli.webp',
  yabuko: '/assets/tcg/support-card-sound-comic-yabuko.webp',
  rockel: '/assets/tcg/support-card-sound-comic-rockel.webp',
  '7171': '/assets/tcg/support-card-sound-comic-7171.webp',
  myouou: '/assets/tcg/support-card-sound-comic-myouou.webp',
  hibiki: '/assets/tcg/support-card-sound-comic-hibiki.webp',
};

const DARK_SUPPORT_IMAGES: Record<SupportId, string> = {
  socho: '/assets/tcg/support-card-dark-socho.webp',
  tsutsu: '/assets/tcg/support-card-dark-tsutsu.webp',
  rokudo: '/assets/tcg/support-card-dark-rokudo.webp',
  player: '/assets/tcg/support-card-dark-player.webp',
  ushimaru: '/assets/tcg/support-card-dark-ushimaru.webp',
  deli: '/assets/tcg/support-card-dark-deli.webp',
  yabuko: '/assets/tcg/support-card-dark-yabuko.webp',
  rockel: '/assets/tcg/support-card-dark-rockel.webp',
  '7171': '/assets/tcg/support-card-dark-7171.webp',
  myouou: '/assets/tcg/support-card-dark-myouou.webp',
  hibiki: '/assets/tcg/support-card-dark-hibiki.webp',
};

const DARK_SKIN_STAGE_UNLOCKS: Partial<Record<StageId, readonly MainCharacterId[]>> = {
  'isolation-zone-1': ['rockel', 'player'],
  'isolation-zone-2': ['deli', 'yabuko-fm', 'tsutsu'],
  'isolation-zone-3': ['ushimaru', 'hibiki', 'socho'],
  'isolation-zone-4': ['nanaichi', 'rokudo', 'myoo'],
};

export function normalizeCharacterSkinId(value: unknown): CharacterSkinId {
  if (value === 'sound-comic' || value === 'travel' || value === 'dark') return value;
  return 'default';
}

export function getSoundComicSkinSupportId(characterId: MainCharacterId): SupportId {
  return SOUND_COMIC_SKIN_SUPPORTS[characterId];
}

export function isSoundComicSkinUnlocked(characterId: MainCharacterId, ownedSupports: OwnedSupport[]): boolean {
  return getOwnedSupportLevel(ownedSupports, getSoundComicSkinSupportId(characterId)) >= SUPPORT_SKIN_UNLOCK_LEVEL;
}

export function isDarkSkinUnlocked(characterId: MainCharacterId, unlockedDarkSkins: readonly MainCharacterId[]): boolean {
  return unlockedDarkSkins.includes(characterId);
}

export function isTravelSkinUnlocked(characterId: MainCharacterId, unlockedTravelSkins: readonly MainCharacterId[]): boolean {
  return unlockedTravelSkins.includes(characterId);
}

export function getTravelSkinUnlocksForStage(stageId: StageId): readonly MainCharacterId[] {
  return stageId === 'isolation-zone-5' ? SKIN_CHARACTER_IDS : [];
}

export function mergeUnlockedTravelSkins(
  current: readonly MainCharacterId[],
  additions: readonly MainCharacterId[],
): UnlockedTravelSkins {
  return Array.from(new Set([...current, ...additions])).filter((characterId): characterId is MainCharacterId =>
    (SKIN_CHARACTER_IDS as readonly MainCharacterId[]).includes(characterId),
  );
}

export function getDarkSkinUnlocksForStage(stageId: StageId): readonly MainCharacterId[] {
  return DARK_SKIN_STAGE_UNLOCKS[stageId] ?? [];
}

export function mergeUnlockedDarkSkins(
  current: readonly MainCharacterId[],
  additions: readonly MainCharacterId[],
): UnlockedDarkSkins {
  return Array.from(new Set([...current, ...additions])).filter((characterId): characterId is MainCharacterId =>
    (SKIN_CHARACTER_IDS as readonly MainCharacterId[]).includes(characterId),
  );
}

export function getEffectiveCharacterSkinId(
  characterId: MainCharacterId,
  selectedSkins: SelectedSkinsByCharacter,
  ownedSupports: OwnedSupport[],
  unlockedDarkSkins: readonly MainCharacterId[] = [],
  unlockedTravelSkins: readonly MainCharacterId[] = [],
): CharacterSkinId {
  const selectedSkin = normalizeCharacterSkinId(selectedSkins[characterId]);
  if (selectedSkin === 'sound-comic' && isSoundComicSkinUnlocked(characterId, ownedSupports)) return 'sound-comic';
  if (selectedSkin === 'travel' && isTravelSkinUnlocked(characterId, unlockedTravelSkins)) return 'travel';
  if (selectedSkin === 'dark' && isDarkSkinUnlocked(characterId, unlockedDarkSkins)) return 'dark';
  return 'default';
}

export function getCharacterSkinImage(characterId: MainCharacterId, skinId: CharacterSkinId): string | undefined {
  const character = getMainCharacter(characterId);
  if (skinId === 'sound-comic') return SOUND_COMIC_SKIN_IMAGES[characterId] || character.image;
  if (skinId === 'travel') return TRAVEL_SKIN_IMAGES[characterId] || character.image;
  if (skinId === 'dark') return DARK_SKIN_IMAGES[characterId] ?? character.image;
  return character.image;
}

export function getCharacterWithSkin(
  characterId: MainCharacterId,
  selectedSkins: SelectedSkinsByCharacter,
  ownedSupports: OwnedSupport[],
  unlockedDarkSkins: readonly MainCharacterId[] = [],
  unlockedTravelSkins: readonly MainCharacterId[] = [],
): MainCharacterDefinition {
  const character = getMainCharacter(characterId);
  const skinId = getEffectiveCharacterSkinId(characterId, selectedSkins, ownedSupports, unlockedDarkSkins, unlockedTravelSkins);
  return { ...character, image: getCharacterSkinImage(characterId, skinId) };
}

export function getSupportCardImage(
  supportId: SupportId,
  selectedSkins: SelectedSkinsByCharacter,
  ownedSupports: OwnedSupport[],
  unlockedDarkSkins: readonly MainCharacterId[],
  unlockedTravelSkins: readonly MainCharacterId[] = [],
): string {
  const characterId = SUPPORT_CHARACTER_IDS[supportId];
  const skinId = getEffectiveCharacterSkinId(characterId, selectedSkins, ownedSupports, unlockedDarkSkins, unlockedTravelSkins);
  const defaultCard = DEFAULT_SUPPORT_IMAGES[supportId];
  if (skinId === 'sound-comic') return SOUND_COMIC_SUPPORT_IMAGES[supportId] ?? defaultCard;
  if (skinId === 'travel') return TRAVEL_SUPPORT_IMAGES[supportId] ?? defaultCard;
  if (skinId === 'dark') return DARK_SUPPORT_IMAGES[supportId] ?? defaultCard;
  return defaultCard;
}

export function getCharacterSkinLabel(skinId: CharacterSkinId): string {
  if (skinId === 'sound-comic') return 'サウンドコミック';
  if (skinId === 'travel') return '旅装';
  if (skinId === 'dark') return '闇落ち';
  return '通常';
}
