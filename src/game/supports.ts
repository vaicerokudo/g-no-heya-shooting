import type { SupportId } from './types';

export type SupportCharacter = {
  id: SupportId;
  name: string;
  role: string;
  description: string;
  effectDescription: string;
  image: string;
};

export type OwnedSupport = {
  id: SupportId;
  count: number;
};

export const supportCandidates: SupportCharacter[] = [
  {
    id: '7171',
    name: '7171',
    role: '収集＆金策',
    description: 'コインとドロップを集める周回向きサポート。',
    effectDescription: 'コイン吸い寄せと追加コインで周回を助ける。',
    image: '/assets/tcg/support-card-7171.png',
  },
  {
    id: 'yabuko',
    name: 'やぶこ',
    role: '回復',
    description: '回復で総長の継戦を支えるサポート。',
    effectDescription: '敵撃破時に回復ハートを出すことがある。',
    image: '/assets/tcg/support-card-yabuko.png',
  },
  {
    id: 'player',
    name: 'Player',
    role: '2丁拳銃で援護射撃',
    description: '弾幕と援護射撃で前線を支えるサポート。',
    effectDescription: '2丁拳銃で援護射撃する。',
    image: '/assets/tcg/support-card-player.png',
  },
  {
    id: 'hibiki',
    name: 'hibiki',
    role: '大盾で被弾軽減',
    description: '大盾で被弾を抑える防御型サポート。',
    effectDescription: '一定間隔で前方シールドを展開する。',
    image: '/assets/tcg/support-card-hibiki.png',
  },
  {
    id: 'myouou',
    name: '明王',
    role: '迦楼羅で敵を一掃',
    description: '神聖な範囲攻撃で戦場を切り開くサポート。',
    effectDescription: '迦楼羅を呼び、敵と敵弾を薙ぎ払う。',
    image: '/assets/tcg/support-card-myouou.png',
  },
];

export const SHOPKEEPER_SUPPORT_LINES: Record<SupportId, string> = {
  '7171': '金運の風が吹いてるね。',
  yabuko: 'この子がいれば、ちょっと無茶しても安心かもね。',
  player: '手数が欲しいなら、いい引きだよ。',
  hibiki: '守りを固めたい時に頼れるカードだね。',
  myouou: 'おお、強い気配だ。これは大事にしなよ。',
};

export function drawRandomSupport(): SupportCharacter {
  return supportCandidates[Math.floor(Math.random() * supportCandidates.length)];
}

export function getSupportById(supportId: SupportId): SupportCharacter {
  return supportCandidates.find((support) => support.id === supportId) ?? supportCandidates[0];
}

export function addOwnedSupport(ownedSupports: OwnedSupport[], supportId: SupportId): OwnedSupport[] {
  const existing = ownedSupports.find((support) => support.id === supportId);
  if (existing) {
    return ownedSupports.map((support) =>
      support.id === supportId ? { ...support, count: support.count + 1 } : support,
    );
  }

  return [...ownedSupports, { id: supportId, count: 1 }];
}
