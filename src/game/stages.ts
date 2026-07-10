export type StageId =
  | 'astoria-grassland-1' | 'astoria-grassland-2' | 'astoria-grassland-3'
  | 'sandstorm-wilderness-1' | 'sandstorm-wilderness-2' | 'sandstorm-wilderness-3'
  | 'delta-facility-1' | 'delta-facility-2' | 'delta-facility-3'
  | 'black-noise-bay-1' | 'black-noise-bay-2' | 'black-noise-bay-3';

export type BossType =
  | 'boar' | 'goblin' | 'bear' | 'giant-scorpion' | 'wyvern' | 'rock-golem'
  | 'security-drone-chief' | 'rampant-experiment' | 'black-noise-roku'
  | 'bay-guardian' | 'mist-leviathan' | 'leviathan';

export type StageDifficulty = 'low' | 'medium' | 'high';
export type StageAreaId = 'astoria-grassland' | 'sandstorm-wilderness' | 'delta-facility' | 'black-noise-bay';

export type StageDefinition = {
  id: StageId; areaId: StageAreaId; name: string; bossName: string; bossType: BossType; bossImage: string;
  difficulty: StageDifficulty; difficultyLabel: string; clearBonus: number; bossHp: number; bossRadius: number;
};

export type StageAreaDefinition = { id: StageAreaId; name: string; description: string; stages: StageDefinition[] };

export const ASTORIA_GRASSLAND_STAGES: StageDefinition[] = [
  { id: 'astoria-grassland-1', areaId: 'astoria-grassland', name: 'アストリア草原 1', bossName: '猪', bossType: 'boar', bossImage: '/assets/tcg/enemy-boar.png', difficulty: 'low', difficultyLabel: '低', clearBonus: 10, bossHp: 24, bossRadius: 48 },
  { id: 'astoria-grassland-2', areaId: 'astoria-grassland', name: 'アストリア草原 2', bossName: 'ゴブリン', bossType: 'goblin', bossImage: '/assets/tcg/enemy-goblin.png', difficulty: 'medium', difficultyLabel: '中', clearBonus: 15, bossHp: 29, bossRadius: 50 },
  { id: 'astoria-grassland-3', areaId: 'astoria-grassland', name: 'アストリア草原 3', bossName: '熊', bossType: 'bear', bossImage: '/assets/tcg/boss-bear.png', difficulty: 'high', difficultyLabel: '高', clearBonus: 22, bossHp: 34, bossRadius: 54 },
];

export const SANDSTORM_WILDERNESS_STAGES: StageDefinition[] = [
  { id: 'sandstorm-wilderness-1', areaId: 'sandstorm-wilderness', name: '砂塵の荒野 1', bossName: 'ジャイアントスコーピオン', bossType: 'giant-scorpion', bossImage: '/assets/tcg/boss-giant-scorpion.png', difficulty: 'medium', difficultyLabel: '中', clearBonus: 28, bossHp: 38, bossRadius: 50 },
  { id: 'sandstorm-wilderness-2', areaId: 'sandstorm-wilderness', name: '砂塵の荒野 2', bossName: 'ワイバーン', bossType: 'wyvern', bossImage: '/assets/tcg/enemy-lesser-wyvern.png', difficulty: 'high', difficultyLabel: '中〜高', clearBonus: 34, bossHp: 43, bossRadius: 48 },
  { id: 'sandstorm-wilderness-3', areaId: 'sandstorm-wilderness', name: '砂塵の荒野 3', bossName: 'ロックゴーレム', bossType: 'rock-golem', bossImage: '/assets/tcg/boss-rock-golem.png', difficulty: 'high', difficultyLabel: '高', clearBonus: 42, bossHp: 54, bossRadius: 58 },
];

export const DELTA_FACILITY_STAGES: StageDefinition[] = [
  { id: 'delta-facility-1', areaId: 'delta-facility', name: '研究施設デルタ 1', bossName: '警備ドローン隊長', bossType: 'security-drone-chief', bossImage: '/assets/tcg/boss-security-drone-chief.png', difficulty: 'high', difficultyLabel: '高', clearBonus: 50, bossHp: 60, bossRadius: 46 },
  { id: 'delta-facility-2', areaId: 'delta-facility', name: '研究施設デルタ 2', bossName: '暴走実験体', bossType: 'rampant-experiment', bossImage: '/assets/tcg/boss-rampant-experiment.png', difficulty: 'high', difficultyLabel: '高', clearBonus: 60, bossHp: 68, bossRadius: 52 },
  { id: 'delta-facility-3', areaId: 'delta-facility', name: '研究施設デルタ 3', bossName: 'ブラックノイズ・ロク', bossType: 'black-noise-roku', bossImage: '/assets/tcg/boss-black-noise-roku.png', difficulty: 'high', difficultyLabel: '超高', clearBonus: 75, bossHp: 82, bossRadius: 48 },
];

export const BLACK_NOISE_BAY_STAGES: StageDefinition[] = [
  { id: 'black-noise-bay-1', areaId: 'black-noise-bay', name: 'ブラックノイズ湾 1', bossName: '湾の番人', bossType: 'bay-guardian', bossImage: '/assets/tcg/enemy-mist-leviathan.png', difficulty: 'high', difficultyLabel: '超高', clearBonus: 90, bossHp: 94, bossRadius: 50 },
  { id: 'black-noise-bay-2', areaId: 'black-noise-bay', name: 'ブラックノイズ湾 2', bossName: 'ミスト・リヴァイアサン', bossType: 'mist-leviathan', bossImage: '/assets/tcg/enemy-mist-leviathan.png', difficulty: 'high', difficultyLabel: '超高', clearBonus: 105, bossHp: 108, bossRadius: 56 },
  { id: 'black-noise-bay-3', areaId: 'black-noise-bay', name: 'ブラックノイズ湾 3', bossName: 'リヴァイアサン', bossType: 'leviathan', bossImage: '/assets/tcg/boss-leviathan.png', difficulty: 'high', difficultyLabel: '極高', clearBonus: 125, bossHp: 126, bossRadius: 64 },
];

export const STAGE_AREAS: StageAreaDefinition[] = [
  { id: 'astoria-grassland', name: 'アストリア草原', description: '冒険の起点になる緑の草原エリア。', stages: ASTORIA_GRASSLAND_STAGES },
  { id: 'sandstorm-wilderness', name: '砂塵の荒野', description: '草原の先に広がる砂塵と岩場の第2エリア。', stages: SANDSTORM_WILDERNESS_STAGES },
  { id: 'delta-facility', name: '研究施設デルタ', description: '機械と実験体が徘徊する危険な研究施設エリア。', stages: DELTA_FACILITY_STAGES },
  { id: 'black-noise-bay', name: 'ブラックノイズ湾', description: '黒い海とノイズに侵食された夜の湾。', stages: BLACK_NOISE_BAY_STAGES },
];

export const ALL_STAGES: StageDefinition[] = STAGE_AREAS.flatMap((area) => area.stages);
export const DEFAULT_STAGE_ID: StageId = 'astoria-grassland-1';
export function getStageById(stageId: StageId): StageDefinition { return ALL_STAGES.find((stage) => stage.id === stageId) ?? ALL_STAGES[0]; }
export function isStageId(value: unknown): value is StageId { return ALL_STAGES.some((stage) => stage.id === value); }
