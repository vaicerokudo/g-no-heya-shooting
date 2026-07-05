import type { SupportId } from './types';

export type AuraId =
  | 'socho'
  | 'tsutsu'
  | 'rokudo'
  | 'nanaichi'
  | 'yabuko'
  | 'hibiki'
  | 'myoo'
  | 'ushimaru'
  | 'deli'
  | 'rockel'
  | 'player';

export type AuraDefinition = {
  id: AuraId;
  name: string;
  colorName: string;
  supportId: SupportId;
  description: string;
  cssClass: string;
};

export const AURA_EXCHANGE_COST = 5;

export const auraDefinitions: AuraDefinition[] = [
  {
    id: 'socho',
    name: '総長の白オーラ',
    colorName: '白',
    supportId: 'socho',
    description: '前方斬撃援護をオーラ能力として追加する。',
    cssClass: 'aura-socho',
  },
  {
    id: 'tsutsu',
    name: 'つつの緑オーラ',
    colorName: '緑',
    supportId: 'tsutsu',
    description: '3way弓援護をオーラ能力として追加する。',
    cssClass: 'aura-tsutsu',
  },
  {
    id: 'rokudo',
    name: 'ROKUDOの黒オーラ',
    colorName: '黒',
    supportId: 'rokudo',
    description: '毒煙玉の妨害をオーラ能力として追加する。',
    cssClass: 'aura-rokudo',
  },
  {
    id: 'nanaichi',
    name: '7171の赤茶オーラ',
    colorName: '赤茶',
    supportId: '7171',
    description: 'コイン吸い寄せと追加コイン支援をオーラ能力として追加する。',
    cssClass: 'aura-nanaichi',
  },
  {
    id: 'yabuko',
    name: 'やぶこの青オーラ',
    colorName: '青',
    supportId: 'yabuko',
    description: '回復ハート支援をオーラ能力として追加する。',
    cssClass: 'aura-yabuko',
  },
  {
    id: 'hibiki',
    name: 'hibikiの紫オーラ',
    colorName: '紫',
    supportId: 'hibiki',
    description: '前方シールド支援をオーラ能力として追加する。',
    cssClass: 'aura-hibiki',
  },
  {
    id: 'myoo',
    name: '明王の赤金オーラ',
    colorName: '赤金',
    supportId: 'myouou',
    description: '迦楼羅顕現をオーラ能力として追加する。',
    cssClass: 'aura-myoo',
  },
  {
    id: 'ushimaru',
    name: 'うしまるの橙オーラ',
    colorName: '橙',
    supportId: 'ushimaru',
    description: '牙突カウンターをオーラ能力として追加する。',
    cssClass: 'aura-ushimaru',
  },
  {
    id: 'deli',
    name: 'Deliの藍オーラ',
    colorName: '藍',
    supportId: 'deli',
    description: '小型タレット設置をオーラ能力として追加する。',
    cssClass: 'aura-deli',
  },
  {
    id: 'rockel',
    name: 'ROCKELの黄緑オーラ',
    colorName: '黄緑',
    supportId: 'rockel',
    description: 'MOUNTAIN BREAK援護をオーラ能力として追加する。',
    cssClass: 'aura-rockel',
  },
  {
    id: 'player',
    name: 'Playerの黄オーラ',
    colorName: '黄',
    supportId: 'player',
    description: '2丁拳銃援護射撃をオーラ能力として追加する。',
    cssClass: 'aura-player',
  },
];

export function getAuraById(auraId: AuraId | null): AuraDefinition | null {
  if (!auraId) return null;
  return auraDefinitions.find((aura) => aura.id === auraId) ?? null;
}

export function isAuraId(value: unknown): value is AuraId {
  return auraDefinitions.some((aura) => aura.id === value);
}
