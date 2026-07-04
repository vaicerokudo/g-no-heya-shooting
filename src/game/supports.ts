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
  level: number;
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
  {
    id: 'ushimaru',
    name: 'うしまる',
    role: '牙突カウンター',
    description: '接近してきた敵を槍で迎撃する防御寄りサポート。',
    effectDescription: '接近してきた敵を牙突カウンターで迎撃し、通常敵を少し押し返す。',
    image: '/assets/tcg/support-card-ushimaru.webp',
  },
  {
    id: 'deli',
    name: 'Deli',
    role: '小型タレット設置',
    description: '小型タレットを設置して戦線を支える援護サポート。',
    effectDescription: '一定間隔で小型タレットを設置し、近い敵または前方へ控えめな自動射撃を行う。',
    image: '/assets/tcg/support-card-deli.webp',
  },
  {
    id: 'rockel',
    name: 'ROCKEL',
    role: '山砕き援護',
    description: '定期的なMOUNTAIN BREAKで前方の敵をまとめて薙ぎ払う火力サポート。',
    effectDescription: '一定間隔でMOUNTAIN BREAKを放ち、前方から左右にかけて広めの敵に1ダメージを与える。',
    image: '/assets/tcg/support-card-rockel.webp',
  },
  {
    id: 'rokudo',
    name: 'ROKUDO',
    role: '毒煙玉',
    description: '毒煙玉で敵の進軍を鈍らせる妨害サポート。',
    effectDescription: '一定間隔で毒煙玉を投げ、範囲内の敵をスロウにしながら小さな継続ダメージを与える。',
    image: '/assets/tcg/support-card-rokudo.webp',
  },
  {
    id: 'tsutsu',
    name: 'つつ',
    role: '3way弓援護',
    description: '遠距離から3wayの矢で前方を支援するサポート。',
    effectDescription: '一定間隔で中央・左斜め・右斜めの3方向へ矢を放ち、通常敵とボスに1ダメージを与える。',
    image: '/assets/tcg/support-card-tsutsu.webp',
  },
  {
    id: 'socho',
    name: '総長',
    role: '前方斬撃援護',
    description: '前方へ安定した斬撃を放つ基準型サポート。',
    effectDescription: '一定間隔でプレイヤー前方へ青白い斬撃を放ち、通常敵とボスに1ダメージを与える。',
    image: '/assets/tcg/support-card-socho.webp',
  },
];

export const SHOPKEEPER_SUPPORT_LINES: Record<SupportId, string> = {
  '7171': '金運の風が吹いてるね。',
  yabuko: 'この子がいれば、ちょっと無茶しても安心かもね。',
  player: '手数が欲しいなら、いい引きだよ。',
  hibiki: '守りを固めたい時に頼れるカードだね。',
  myouou: 'おお、強い気配だ。これは大事にしなよ。',
  ushimaru: '前に出るなら、頼れる槍使いだね。',
  deli: '設置で支えるなら、この子の工夫が光るよ。',
  rockel: '派手にいくなら、頼れる斧使いだね。',
  rokudo: '足止めが欲しいなら、影の煙が効くはずだよ。',
  tsutsu: '遠くを任せたいなら、この弓の援護が頼りになるよ。',
  socho: 'まっすぐ斬り開くなら、この一枚が頼りになるね。',
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
      support.id === supportId
        ? { ...support, count: support.count + 1, level: normalizeSupportLevel((support.level ?? support.count) + 1) }
        : support,
    );
  }

  return [...ownedSupports, { id: supportId, count: 1, level: 1 }];
}

export function hydrateOwnedSupport(support: OwnedSupport): OwnedSupport {
  return {
    id: support.id,
    count: Math.max(1, Math.floor(support.count)),
    level: normalizeSupportLevel(support.level ?? support.count),
  };
}

export function getOwnedSupportLevel(ownedSupports: OwnedSupport[], supportId: SupportId | null): number {
  if (!supportId) return 1;
  const ownedSupport = ownedSupports.find((support) => support.id === supportId);
  return normalizeSupportLevel(ownedSupport?.level ?? ownedSupport?.count ?? 1);
}

export function normalizeSupportLevel(level: number | undefined): number {
  return Math.min(5, Math.max(1, Math.floor(level ?? 1)));
}
