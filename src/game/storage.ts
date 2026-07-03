import { hydrateOwnedSupport } from './supports';
import { hydrateOwnedWeapon } from './weapons';
import type { OwnedSupport } from './supports';
import type { EquippedWeaponsByCharacter, OwnedWeapon } from './weapons';

const OWNED_COINS_KEY = 'g-no-heya-shooting:owned-coins';
const OWNED_WEAPONS_KEY = 'g-no-heya-shooting:owned-weapons';
const EQUIPPED_WEAPONS_KEY = 'g-no-heya-shooting:equipped-weapons';
const OWNED_SUPPORTS_KEY = 'g-no-heya-shooting:owned-supports';
const FREE_SUPPORT_SUMMON_USED_KEY = 'g-no-heya-shooting:free-support-summon-used';

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
    return typeof equipped.socho === 'string' ? { socho: equipped.socho } : {};
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
      support.id === 'myouou') &&
    typeof support.count === 'number' &&
    support.count > 0
  );
}
