import { hydrateOwnedSupport } from './supports';
import { hydrateOwnedWeapon } from './weapons';
import { resolveActiveMainCharacterId } from './characters';
import type { MainCharacterId } from './characters';
import { isAuraId } from './auras';
import type { AuraId } from './auras';
import { normalizeCharacterSkinId, SKIN_CHARACTER_IDS } from './skins';
import type { SelectedSkinsByCharacter, UnlockedDarkSkins, UnlockedTravelSkins } from './skins';
import type { OwnedSupport } from './supports';
import type { SupportId } from './types';
import type { StageId } from './stages';
import type { EquippedWeaponsByCharacter, OwnedWeapon } from './weapons';

const OWNED_COINS_KEY = 'g-no-heya-shooting:owned-coins';
const OWNED_WEAPONS_KEY = 'g-no-heya-shooting:owned-weapons';
const EQUIPPED_WEAPONS_KEY = 'g-no-heya-shooting:equipped-weapons';
const OWNED_SUPPORTS_KEY = 'g-no-heya-shooting:owned-supports';
const STAR_DUST_FRAGMENTS_KEY = 'g-no-heya-shooting:star-dust-fragments';
const STAR_VEIN_STEEL_KEY = 'g-no-heya-shooting:star-vein-steel';
const G_WEAPONS_KEY = 'g-no-heya-shooting:g-weapons';
const G_WEAPON_EFFECTS_KEY = 'g-no-heya-shooting:g-weapon-effects';
const SUPPORT_DAMAGE_UPGRADES_KEY = 'g-no-heya-shooting:support-damage-upgrades';
const OWNED_AURAS_KEY = 'g-no-heya-shooting:owned-auras';
const SELECTED_AURA_KEY = 'g-no-heya-shooting:selected-aura';
const FREE_SUPPORT_SUMMON_USED_KEY = 'g-no-heya-shooting:free-support-summon-used';
const ACTIVE_SUPPORT_ID_KEY = 'g-no-heya-shooting:active-support-id';
const ACTIVE_MAIN_CHARACTER_ID_KEY = 'g-no-heya-shooting:active-main-character-id';
const SELECTED_SKINS_BY_CHARACTER_KEY = 'g-no-heya-shooting:selected-skins-by-character';
const UNLOCKED_DARK_SKINS_KEY = 'g-no-heya-shooting:unlocked-dark-skins';
const UNLOCKED_TRAVEL_SKINS_KEY = 'g-no-heya-shooting:unlocked-travel-skins';
const CLEARED_STAGES_KEY = 'g-no-heya-shooting:cleared-stages';

export function loadOwnedCoins(): number {
  if (typeof window === 'undefined') return 0;

  const rawValue = window.localStorage.getItem(OWNED_COINS_KEY);
  const parsed = rawValue ? Number.parseInt(rawValue, 10) : 0;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function saveOwnedCoins(coins: number) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(OWNED_COINS_KEY, String(Math.max(0, Math.floor(coins))));
}

export function resetOwnedCoins() {
  saveOwnedCoins(0);
}

export function loadStarDustFragments(): number {
  if (typeof window === 'undefined') return 0;

  const rawValue = window.localStorage.getItem(STAR_DUST_FRAGMENTS_KEY);
  const parsed = rawValue ? Number.parseInt(rawValue, 10) : 0;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function saveStarDustFragments(fragments: number) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STAR_DUST_FRAGMENTS_KEY, String(Math.max(0, Math.floor(fragments))));
}

export function loadStarVeinSteel(): number {
  if (typeof window === 'undefined') return 0;

  const rawValue = window.localStorage.getItem(STAR_VEIN_STEEL_KEY);
  const parsed = rawValue ? Number.parseInt(rawValue, 10) : 0;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function saveStarVeinSteel(steel: number) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STAR_VEIN_STEEL_KEY, String(Math.max(0, Math.floor(steel))));
}

export function loadGWeapons(): string[] {
  if (typeof window === 'undefined') return [];

  const rawValue = window.localStorage.getItem(G_WEAPONS_KEY);
  if (!rawValue) return [];

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];
    return Array.from(new Set(parsed.filter((weaponId): weaponId is string => typeof weaponId === 'string' && weaponId.length > 0)));
  } catch {
    return [];
  }
}

export function saveGWeapons(weaponIds: string[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(G_WEAPONS_KEY, JSON.stringify(Array.from(new Set(weaponIds))));
}

export function resetGWeapons() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(G_WEAPONS_KEY);
}

export function loadGWeaponEffects(): string[] {
  if (typeof window === 'undefined') return [];
  const rawValue = window.localStorage.getItem(G_WEAPON_EFFECTS_KEY);
  if (!rawValue) return [];
  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];
    return Array.from(new Set(parsed.filter((weaponId): weaponId is string => typeof weaponId === 'string' && weaponId.length > 0)));
  } catch {
    return [];
  }
}

export function saveGWeaponEffects(weaponIds: string[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(G_WEAPON_EFFECTS_KEY, JSON.stringify(Array.from(new Set(weaponIds))));
}

export function resetGWeaponEffects() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(G_WEAPON_EFFECTS_KEY);
}

export function loadSupportDamageUpgrades(): SupportId[] {
  if (typeof window === 'undefined') return [];
  const rawValue = window.localStorage.getItem(SUPPORT_DAMAGE_UPGRADES_KEY);
  if (!rawValue) return [];
  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? Array.from(new Set(parsed.filter(isSupportId))) : [];
  } catch {
    return [];
  }
}

export function saveSupportDamageUpgrades(supportIds: SupportId[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SUPPORT_DAMAGE_UPGRADES_KEY, JSON.stringify(Array.from(new Set(supportIds))));
}

export function loadOwnedAuras(): AuraId[] {
  if (typeof window === 'undefined') return [];

  const rawValue = window.localStorage.getItem(OWNED_AURAS_KEY);
  if (!rawValue) return [];

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];
    return Array.from(new Set(parsed.filter(isAuraId)));
  } catch {
    return [];
  }
}

export function saveOwnedAuras(ownedAuras: AuraId[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(OWNED_AURAS_KEY, JSON.stringify(Array.from(new Set(ownedAuras.filter(isAuraId)))));
}

export function loadSelectedAura(): AuraId | null {
  if (typeof window === 'undefined') return null;
  const rawValue = window.localStorage.getItem(SELECTED_AURA_KEY);
  return isAuraId(rawValue) ? rawValue : null;
}

export function saveSelectedAura(auraId: AuraId | null) {
  if (typeof window === 'undefined') return;
  if (!auraId) {
    window.localStorage.removeItem(SELECTED_AURA_KEY);
    return;
  }
  window.localStorage.setItem(SELECTED_AURA_KEY, auraId);
}

export function loadOwnedWeapons(): OwnedWeapon[] {
  if (typeof window === 'undefined') return [];

  const rawValue = window.localStorage.getItem(OWNED_WEAPONS_KEY);
  if (!rawValue) return [];

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isOwnedWeapon).map(hydrateOwnedWeapon);
  } catch {
    return [];
  }
}

export function saveOwnedWeapons(weapons: OwnedWeapon[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(OWNED_WEAPONS_KEY, JSON.stringify(weapons));
}

export function resetOwnedWeapons() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(OWNED_WEAPONS_KEY);
}

export function loadEquippedWeapons(): EquippedWeaponsByCharacter {
  if (typeof window === 'undefined') return {};

  const rawValue = window.localStorage.getItem(EQUIPPED_WEAPONS_KEY);
  if (!rawValue) return {};

  try {
    const parsed = JSON.parse(rawValue);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const equipped = parsed as Record<string, unknown>;
    return {
      ...(typeof equipped.socho === 'string' ? { socho: equipped.socho } : {}),
      ...(typeof equipped.tsutsu === 'string' ? { tsutsu: equipped.tsutsu } : {}),
      ...(typeof equipped.rokudo === 'string' ? { rokudo: equipped.rokudo } : {}),
      ...(typeof equipped.player === 'string' ? { player: equipped.player } : {}),
      ...(typeof equipped.ushimaru === 'string' ? { ushimaru: equipped.ushimaru } : {}),
      ...(typeof equipped.deli === 'string' ? { deli: equipped.deli } : {}),
      ...(typeof equipped['yabuko-fm'] === 'string' ? { 'yabuko-fm': equipped['yabuko-fm'] } : {}),
      ...(typeof equipped.rockel === 'string' ? { rockel: equipped.rockel } : {}),
      ...(typeof equipped.nanaichi === 'string' ? { nanaichi: equipped.nanaichi } : {}),
      ...(typeof equipped.myoo === 'string' ? { myoo: equipped.myoo } : {}),
      ...(typeof equipped.hibiki === 'string' ? { hibiki: equipped.hibiki } : {}),
    };
  } catch {
    return {};
  }
}

export function saveEquippedWeapons(equippedWeapons: EquippedWeaponsByCharacter) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(EQUIPPED_WEAPONS_KEY, JSON.stringify(equippedWeapons));
}

export function loadOwnedSupports(): OwnedSupport[] {
  if (typeof window === 'undefined') return [];

  const rawValue = window.localStorage.getItem(OWNED_SUPPORTS_KEY);
  if (!rawValue) return [];

  try {
    const parsed = JSON.parse(rawValue);
    if (Array.isArray(parsed)) return parsed.filter(isOwnedSupport).map(hydrateOwnedSupport);
    if (!parsed || typeof parsed !== 'object') return [];

    return Object.values(parsed).filter(isOwnedSupport).map(hydrateOwnedSupport);
  } catch {
    return [];
  }
}

export function saveOwnedSupports(ownedSupports: OwnedSupport[]) {
  if (typeof window === 'undefined') return;
  const byId = Object.fromEntries(ownedSupports.map((support) => [support.id, support]));
  window.localStorage.setItem(OWNED_SUPPORTS_KEY, JSON.stringify(byId));
}

export function loadFreeSupportSummonUsed(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(FREE_SUPPORT_SUMMON_USED_KEY) === 'true';
}

export function saveFreeSupportSummonUsed(isUsed: boolean) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(FREE_SUPPORT_SUMMON_USED_KEY, String(isUsed));
}

export function loadActiveSupportId(): SupportId | null {
  if (typeof window === 'undefined') return null;
  const rawValue = window.localStorage.getItem(ACTIVE_SUPPORT_ID_KEY);
  return isSupportId(rawValue) ? rawValue : null;
}

export function saveActiveSupportId(supportId: SupportId | null) {
  if (typeof window === 'undefined') return;
  if (!supportId) {
    window.localStorage.removeItem(ACTIVE_SUPPORT_ID_KEY);
    return;
  }
  window.localStorage.setItem(ACTIVE_SUPPORT_ID_KEY, supportId);
}

export function loadActiveMainCharacterId(): MainCharacterId {
  if (typeof window === 'undefined') return 'socho';
  return resolveActiveMainCharacterId(window.localStorage.getItem(ACTIVE_MAIN_CHARACTER_ID_KEY));
}

export function saveActiveMainCharacterId(characterId: MainCharacterId) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ACTIVE_MAIN_CHARACTER_ID_KEY, resolveActiveMainCharacterId(characterId));
}

export function loadSelectedSkinsByCharacter(): SelectedSkinsByCharacter {
  if (typeof window === 'undefined') return {};

  const rawValue = window.localStorage.getItem(SELECTED_SKINS_BY_CHARACTER_KEY);
  if (!rawValue) return {};

  try {
    const parsed = JSON.parse(rawValue);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const skins = parsed as Record<string, unknown>;
    return {
      ...(typeof skins.socho === 'string' ? { socho: normalizeCharacterSkinId(skins.socho) } : {}),
      ...(typeof skins.tsutsu === 'string' ? { tsutsu: normalizeCharacterSkinId(skins.tsutsu) } : {}),
      ...(typeof skins.rokudo === 'string' ? { rokudo: normalizeCharacterSkinId(skins.rokudo) } : {}),
      ...(typeof skins.player === 'string' ? { player: normalizeCharacterSkinId(skins.player) } : {}),
      ...(typeof skins.nanaichi === 'string' ? { nanaichi: normalizeCharacterSkinId(skins.nanaichi) } : {}),
      ...(typeof skins.myoo === 'string' ? { myoo: normalizeCharacterSkinId(skins.myoo) } : {}),
      ...(typeof skins.ushimaru === 'string' ? { ushimaru: normalizeCharacterSkinId(skins.ushimaru) } : {}),
      ...(typeof skins.deli === 'string' ? { deli: normalizeCharacterSkinId(skins.deli) } : {}),
      ...(typeof skins['yabuko-fm'] === 'string' ? { 'yabuko-fm': normalizeCharacterSkinId(skins['yabuko-fm']) } : {}),
      ...(typeof skins.rockel === 'string' ? { rockel: normalizeCharacterSkinId(skins.rockel) } : {}),
      ...(typeof skins.hibiki === 'string' ? { hibiki: normalizeCharacterSkinId(skins.hibiki) } : {}),
    };
  } catch {
    return {};
  }
}

export function saveSelectedSkinsByCharacter(selectedSkins: SelectedSkinsByCharacter) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SELECTED_SKINS_BY_CHARACTER_KEY, JSON.stringify(selectedSkins));
}

export function loadUnlockedDarkSkins(): UnlockedDarkSkins {
  if (typeof window === 'undefined') return [];
  const rawValue = window.localStorage.getItem(UNLOCKED_DARK_SKINS_KEY);
  if (!rawValue) return [];
  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];
    return Array.from(new Set(parsed.filter((value): value is MainCharacterId =>
      typeof value === 'string' && (SKIN_CHARACTER_IDS as readonly string[]).includes(value),
    )));
  } catch {
    return [];
  }
}

export function saveUnlockedDarkSkins(characterIds: readonly MainCharacterId[]) {
  if (typeof window === 'undefined') return;
  const validIds = Array.from(new Set(characterIds.filter((value) =>
    (SKIN_CHARACTER_IDS as readonly MainCharacterId[]).includes(value),
  )));
  window.localStorage.setItem(UNLOCKED_DARK_SKINS_KEY, JSON.stringify(validIds));
}

export function loadUnlockedTravelSkins(): UnlockedTravelSkins {
  if (typeof window === 'undefined') return [];
  const rawValue = window.localStorage.getItem(UNLOCKED_TRAVEL_SKINS_KEY);
  if (!rawValue) return [];
  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];
    return Array.from(new Set(parsed.filter((value): value is MainCharacterId =>
      typeof value === 'string' && (SKIN_CHARACTER_IDS as readonly string[]).includes(value),
    )));
  } catch {
    return [];
  }
}

export function saveUnlockedTravelSkins(characterIds: readonly MainCharacterId[]) {
  if (typeof window === 'undefined') return;
  const validIds = Array.from(new Set(characterIds.filter((value) =>
    (SKIN_CHARACTER_IDS as readonly MainCharacterId[]).includes(value),
  )));
  window.localStorage.setItem(UNLOCKED_TRAVEL_SKINS_KEY, JSON.stringify(validIds));
}

export function loadClearedStages(): StageId[] {
  if (typeof window === 'undefined') return [];
  const rawValue = window.localStorage.getItem(CLEARED_STAGES_KEY);
  if (!rawValue) return [];
  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed)
      ? Array.from(new Set(parsed.filter((value): value is StageId => typeof value === 'string')))
      : [];
  } catch {
    return [];
  }
}

export function saveClearedStages(stageIds: readonly StageId[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CLEARED_STAGES_KEY, JSON.stringify(Array.from(new Set(stageIds))));
}

function isOwnedWeapon(value: unknown): value is OwnedWeapon {
  if (!value || typeof value !== 'object') return false;
  const weapon = value as Partial<OwnedWeapon>;
  return (
    typeof weapon.id === 'string' &&
    typeof weapon.name === 'string' &&
    typeof weapon.owner === 'string' &&
    typeof weapon.type === 'string' &&
    (weapon.rarity === 'common' || weapon.rarity === 'rare' || weapon.rarity === 'epic') &&
    typeof weapon.description === 'string' &&
    typeof weapon.count === 'number'
  );
}

function isOwnedSupport(value: unknown): value is OwnedSupport {
  if (!value || typeof value !== 'object') return false;
  const support = value as Partial<OwnedSupport>;
  return (
    (support.id === '7171' ||
      support.id === 'yabuko' ||
      support.id === 'player' ||
      support.id === 'hibiki' ||
      support.id === 'myouou' ||
      support.id === 'ushimaru' ||
      support.id === 'deli' ||
      support.id === 'rockel' ||
      support.id === 'rokudo' ||
      support.id === 'tsutsu' ||
      support.id === 'socho') &&
    typeof support.count === 'number' &&
    support.count > 0
  );
}

function isSupportId(value: unknown): value is SupportId {
  return (
    value === '7171' ||
    value === 'yabuko' ||
    value === 'player' ||
    value === 'hibiki' ||
    value === 'myouou' ||
    value === 'ushimaru' ||
    value === 'deli' ||
    value === 'rockel' ||
    value === 'rokudo' ||
    value === 'tsutsu' ||
    value === 'socho'
  );
}
