export type StageId = 'astoria-grassland-1' | 'astoria-grassland-2' | 'astoria-grassland-3';
export type BossType = 'boar' | 'goblin' | 'bear';
export type StageDifficulty = 'low' | 'medium' | 'high';

export type StageDefinition = {
  id: StageId;
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

export const ASTORIA_GRASSLAND_STAGES: StageDefinition[] = [
  {
    id: 'astoria-grassland-1',
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

export const DEFAULT_STAGE_ID: StageId = 'astoria-grassland-1';

export function getStageById(stageId: StageId): StageDefinition {
  return ASTORIA_GRASSLAND_STAGES.find((stage) => stage.id === stageId) ?? ASTORIA_GRASSLAND_STAGES[0];
}

export function isStageId(value: unknown): value is StageId {
  return value === 'astoria-grassland-1' || value === 'astoria-grassland-2' || value === 'astoria-grassland-3';
}
