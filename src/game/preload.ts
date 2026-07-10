import { getStageById } from './stages';
import type { StageId } from './stages';

const BASE_ASSETS = [
  '/assets/tcg/scenario-forest.png',
  '/assets/tcg/stage-desert.webp',
  '/assets/tcg/scenario-delta.png',
  '/assets/tcg/enemy-goblin.png',
  '/assets/tcg/enemy-lesser-wyvern.png',
  '/assets/tcg/enemy-boar.png',
  '/assets/tcg/enemy-scorpion.png',
  '/assets/tcg/enemy-rock-golem.png',
  '/assets/tcg/boss-black-noise-roku.png',
  '/assets/tcg/boss-black-noise-roku-clone.png',
];

const loaded = new Set<string>();

function preloadImage(src: string) {
  if (!src || loaded.has(src) || typeof Image === 'undefined') return;
  loaded.add(src);
  const image = new Image();
  image.decoding = 'async';
  image.src = src;
}

export function preloadStageAssets(stageId: StageId) {
  const stage = getStageById(stageId);
  [...BASE_ASSETS, stage.bossImage].forEach(preloadImage);
}
