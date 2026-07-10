export type StageId =
  | 'astoria-grassland-1'
  | 'astoria-grassland-2'
  | 'astoria-grassland-3'
  | 'sandstorm-wilderness-1'
  | 'sandstorm-wilderness-2'
  | 'sandstorm-wilderness-3'
  | 'delta-facility-1'
  | 'delta-facility-2'
  | 'delta-facility-3';
export type BossType =
  | 'boar'
  | 'goblin'
  | 'bear'
  | 'giant-scorpion'
  | 'wyvern'
  | 'rock-golem'
  | 'security-drone-chief'
  | 'rampant-experiment'
  | 'black-noise-roku';
export type StageDifficulty = 'low' | 'medium' | 'high';
export type StageAreaId = 'astoria-grassland' | 'sandstorm-wilderness' | 'delta-facility';

export type StageDefinition = {
  id: StageId;
  areaId: StageAreaId;
  name: string;
  bossName: string;
  bossType: BossType;
  bossImage: string;
  difficulty: StageDifficulty;
  difficultyLabel: string;
  clearBonus: number;
  bossHp: number;
  bossRadius: number;
};

export type StageAreaDefinition = {
  id: StageAreaId;
  name: string;
  description: string;
  stages: StageDefinition[];
};

export const ASTORIA_GRASSLAND_STAGES: StageDefinition[] = [
  {
    id: 'astoria-grassland-1',
    areaId: 'astoria-grassland',
    name: '\u30a2\u30b9\u30c8\u30ea\u30a2\u8349\u539f 1',
    bossName: '\u732a',
    bossType: 'boar',
    bossImage: '/assets/tcg/enemy-boar.png',
    difficulty: 'low',
    difficultyLabel: '\u4f4e',
    clearBonus: 10,
    bossHp: 24,
    bossRadius: 48,
  },
  {
    id: 'astoria-grassland-2',
    areaId: 'astoria-grassland',
    name: '\u30a2\u30b9\u30c8\u30ea\u30a2\u8349\u539f 2',
    bossName: '\u30b4\u30d6\u30ea\u30f3',
    bossType: 'goblin',
    bossImage: '/assets/tcg/enemy-goblin.png',
    difficulty: 'medium',
    difficultyLabel: '\u4e2d',
    clearBonus: 15,
    bossHp: 29,
    bossRadius: 50,
  },
  {
    id: 'astoria-grassland-3',
    areaId: 'astoria-grassland',
    name: '\u30a2\u30b9\u30c8\u30ea\u30a2\u8349\u539f 3',
    bossName: '\u718a',
    bossType: 'bear',
    bossImage: '/assets/tcg/boss-bear.png',
    difficulty: 'high',
    difficultyLabel: '\u9ad8',
    clearBonus: 22,
    bossHp: 34,
    bossRadius: 54,
  },
];

export const SANDSTORM_WILDERNESS_STAGES: StageDefinition[] = [
  {
    id: 'sandstorm-wilderness-1',
    areaId: 'sandstorm-wilderness',
    name: '\u7802\u5875\u306e\u8352\u91ce 1',
    bossName: '\u30b8\u30e3\u30a4\u30a2\u30f3\u30c8\u30b9\u30b3\u30fc\u30d4\u30aa\u30f3',
    bossType: 'giant-scorpion',
    bossImage: '/assets/tcg/boss-giant-scorpion.png',
    difficulty: 'medium',
    difficultyLabel: '\u4e2d',
    clearBonus: 28,
    bossHp: 38,
    bossRadius: 50,
  },
  {
    id: 'sandstorm-wilderness-2',
    areaId: 'sandstorm-wilderness',
    name: '\u7802\u5875\u306e\u8352\u91ce 2',
    bossName: '\u30ef\u30a4\u30d0\u30fc\u30f3',
    bossType: 'wyvern',
    bossImage: '/assets/tcg/enemy-lesser-wyvern.png',
    difficulty: 'high',
    difficultyLabel: '\u4e2d\u301c\u9ad8',
    clearBonus: 34,
    bossHp: 43,
    bossRadius: 48,
  },
  {
    id: 'sandstorm-wilderness-3',
    areaId: 'sandstorm-wilderness',
    name: '\u7802\u5875\u306e\u8352\u91ce 3',
    bossName: '\u30ed\u30c3\u30af\u30b4\u30fc\u30ec\u30e0',
    bossType: 'rock-golem',
    bossImage: '/assets/tcg/boss-rock-golem.png',
    difficulty: 'high',
    difficultyLabel: '\u9ad8',
    clearBonus: 42,
    bossHp: 54,
    bossRadius: 58,
  },
];

export const DELTA_FACILITY_STAGES: StageDefinition[] = [
  {
    id: 'delta-facility-1', areaId: 'delta-facility', name: '研究施設デルタ 1',
    bossName: '警備ドローン隊長', bossType: 'security-drone-chief', bossImage: '/assets/tcg/boss-security-drone-chief.png',
    difficulty: 'high', difficultyLabel: '高', clearBonus: 50, bossHp: 60, bossRadius: 46,
  },
  {
    id: 'delta-facility-2', areaId: 'delta-facility', name: '研究施設デルタ 2',
    bossName: '暴走実験体', bossType: 'rampant-experiment', bossImage: '/assets/tcg/boss-rampant-experiment.png',
    difficulty: 'high', difficultyLabel: '高', clearBonus: 60, bossHp: 68, bossRadius: 52,
  },
  {
    id: 'delta-facility-3', areaId: 'delta-facility', name: '研究施設デルタ 3',
    bossName: 'ブラックノイズ・ロク', bossType: 'black-noise-roku', bossImage: '/assets/tcg/boss-black-noise-roku.png',
    difficulty: 'high', difficultyLabel: '極', clearBonus: 75, bossHp: 82, bossRadius: 48,
  },
];

export const STAGE_AREAS: StageAreaDefinition[] = [
  {
    id: 'astoria-grassland',
    name: '\u30a2\u30b9\u30c8\u30ea\u30a2\u8349\u539f',
    description: '\u5192\u967a\u306e\u8d77\u70b9\u306b\u306a\u308b\u7dd1\u306e\u8349\u539f\u30a8\u30ea\u30a2\u3002',
    stages: ASTORIA_GRASSLAND_STAGES,
  },
  {
    id: 'sandstorm-wilderness',
    name: '\u7802\u5875\u306e\u8352\u91ce',
    description: '\u8349\u539f\u306e\u5148\u306b\u5e83\u304c\u308b\u7802\u5875\u3068\u5ca9\u5834\u306e\u7b2c2\u30a8\u30ea\u30a2\u3002',
    stages: SANDSTORM_WILDERNESS_STAGES,
  },
  {
    id: 'delta-facility',
    name: '研究施設デルタ',
    description: '青緑の警報灯が揺れる、封鎖された研究施設エリア。',
    stages: DELTA_FACILITY_STAGES,
  },
];

export const ALL_STAGES: StageDefinition[] = STAGE_AREAS.flatMap((area) => area.stages);

export const DEFAULT_STAGE_ID: StageId = 'astoria-grassland-1';

export function getStageById(stageId: StageId): StageDefinition {
  return ALL_STAGES.find((stage) => stage.id === stageId) ?? ALL_STAGES[0];
}

export function isStageId(value: unknown): value is StageId {
  return (
    value === 'astoria-grassland-1' ||
    value === 'astoria-grassland-2' ||
    value === 'astoria-grassland-3' ||
    value === 'sandstorm-wilderness-1' ||
    value === 'sandstorm-wilderness-2' ||
    value === 'sandstorm-wilderness-3' ||
    value === 'delta-facility-1' ||
    value === 'delta-facility-2' ||
    value === 'delta-facility-3'
  );
}
