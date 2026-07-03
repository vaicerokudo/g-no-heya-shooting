import { hydrateOwnedWeapon } from './weapons';
import type { EquippedWeaponsByCharacter, OwnedWeapon } from './weapons';

const OWNED_COINS_KEY = 'g-no-heya-shooting:owned-coins';
const OWNED_WEAPONS_KEY = 'g-no-heya-shooting:owned-weapons';
const EQUIPPED_WEAPONS_KEY = 'g-no-heya-shooting:equipped-weapons';

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
