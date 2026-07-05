import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BOSS_PLAYER_LIMITS,
  FIELD_HEIGHT,
  FIELD_WIDTH,
  PLAYER_LIMITS,
  MOUNTAIN_BREAKER_VISIBLE_TIME,
  MYOO_FLAME_SWORD_VISIBLE_TIME,
  NANAICHI_ICE_SWORD_VISIBLE_TIME,
  ROKUDO_SUPPORT_POISON_RADIUS,
  ROKUDO_SHADOW_SLASH_BOSS_RADIUS,
  ROKUDO_SHADOW_SLASH_HALF_WIDTH,
  ROKUDO_SHADOW_SLASH_RADIUS,
  ROCKEL_AXE_BOSS_RANGE,
  ROCKEL_SUPPORT_BREAK_DURATION,
  ROCKEL_SUPPORT_BREAK_HALF_WIDTH,
  ROCKEL_SUPPORT_BREAK_RANGE,
  SLASH_BOSS_RADIUS,
  SLASH_HALF_WIDTH,
  SLASH_RADIUS,
  SOCHO_SUPPORT_SLASH_DURATION,
  SOCHO_SUPPORT_SLASH_HALF_WIDTH,
  SOCHO_SUPPORT_SLASH_RANGE,
  USHIMARU_SPEAR_BOSS_RANGE,
  FORGE_ANIMATION_DURATION,
  FORGE_WEAPON_COST,
  SHOP_SUPPORT_SUMMON_COST,
  STARBREAKER_SHOCKWAVE_VISIBLE_TIME,
  YABUKO_FM_HAMMER_BOSS_RANGE,
} from './game/constants';
import { getMainCharacter, isMainCharacterAvailable, mainCharacterList, resolveActiveMainCharacterId } from './game/characters';
import type { MainCharacterDefinition, MainCharacterId } from './game/characters';
import { createInitialGameState, startGame, updateGame } from './game/logic';
import { calculateCoinReward } from './game/rewards';
import { ASTORIA_GRASSLAND_STAGES, DEFAULT_STAGE_ID, getStageById } from './game/stages';
import type { StageId } from './game/stages';
import {
  loadOwnedCoins,
  loadOwnedWeapons,
  loadActiveMainCharacterId,
  loadActiveSupportId,
  loadEquippedWeapons,
  loadFreeSupportSummonUsed,
  loadOwnedSupports,
  resetOwnedCoins,
  resetOwnedWeapons,
  saveOwnedCoins,
  saveActiveMainCharacterId,
  saveActiveSupportId,
  saveEquippedWeapons,
  saveFreeSupportSummonUsed,
  saveOwnedSupports,
  saveOwnedWeapons,
} from './game/storage';
import {
  addOwnedSupport,
  getOwnedSupportLevel,
  getSupportById,
  SHOPKEEPER_SUPPORT_LINES,
  supportCandidates,
} from './game/supports';
import type { OwnedSupport, SupportCharacter } from './game/supports';
import { getCoinMagnetRadius, getHibikiShieldView, getMyououGarudaView } from './game/support';
import type { EnemyKind, GameState, SupportId, Vector } from './game/types';
import {
  addOwnedWeapon,
  forgeRandomWeapon,
  FORGE_RESULT_LINES,
  getEquippedWeaponForCharacter,
  getEquippedSochoWeapon,
  getOwnedWeaponLevel,
  getRockelWeaponTuning,
  getSochoWeaponTuning,
  getUshimaruWeaponTuning,
  getWeaponOptionsForCharacter,
  getYabukoFmWeaponTuning,
  hasSochoSlashWave,
  WEAPON_RARITY_WEIGHTS,
} from './game/weapons';
import type { CharacterId, EquippedWeaponsByCharacter, OwnedWeapon, WeaponDefinition } from './game/weapons';

type SummonPhase = 'idle' | 'gate' | 'cards' | 'revealing' | 'done';
type SummonContext = 'shopFree' | 'shopPaid';

type JoystickState = {
  x: number;
  y: number;
  active: boolean;
};

type ForgeResult = {
  weapon: WeaponDefinition;
  isNew: boolean;
  count: number;
  level: number;
  sagLine: string;
};

type MapFacilityId = 'guildHouse' | 'forge' | 'shop' | 'gate' | 'plaza';
type GuildHotspotId = 'party' | 'summon' | 'equipment' | 'weapons' | 'map';

const EXTERNAL_LINKS = {
  gNoHeyaYouTube: 'https://www.youtube.com/@Gnoheya-6910',
  rokudoLineStamps: 'https://store.line.me/stickershop/product/34241793/ja?from=sticker',
} as const;

const trainingCharacters: Array<{
  id: MainCharacterId;
  name: string;
  summary: string;
}> = [
  { id: 'socho', name: '\u7dcf\u9577', summary: '\u8fd1\u63a5\u7bc4\u56f2\u30fb\u5b89\u5b9a\u578b' },
  { id: 'tsutsu', name: '\u3064\u3064', summary: '\u9060\u8ddd\u96e2\u901f\u5c04\u30fb\u5b89\u5168\u578b' },
  { id: 'rokudo', name: 'ROKUDO', summary: '\u9ad8\u901f\u8fd1\u63a5\u30fb\u624b\u6570\u578b' },
  { id: 'player', name: 'Player', summary: '\u4e8c\u4e01\u62f3\u9283\u30fb\u30c6\u30af\u30cb\u30ab\u30eb\u578b' },
  { id: 'ushimaru', name: '\u3046\u3057\u307e\u308b', summary: '\u76f4\u7dda\u8cab\u901a\u30fb\u4e00\u70b9\u7a81\u7834\u578b' },
  { id: 'deli', name: 'Deli', summary: '\u8a2d\u7f6e\u578b\u6280\u5de5\u58eb' },
  { id: 'yabuko-fm', name: 'FM\u3084\u3076\u3053', summary: '\u91cd\u6483\u30fb\u7bc4\u56f2\u5236\u5727\u578b' },
  { id: 'rockel', name: 'ROCKEL', summary: '\u4e21\u5203\u65a7\u30fb\u5e83\u7bc4\u56f2\u3076\u3093\u56de\u3057\u578b' },
  { id: 'nanaichi', name: '7171', summary: '\u6c37\u5263\u30fb\u6563\u5f3e\u30b9\u30ed\u30a6\u578b' },
  { id: 'myoo', name: '\u660e\u738b', summary: '\u708e\u5f3e\u3070\u3089\u307e\u304d\u30fb\u706b\u529b\u5236\u5727\u578b' },
];

const astoriaFacilities: Array<{
  id: MapFacilityId;
  label: string;
  xPercent: number;
  yPercent: number;
}> = [
  { id: 'guildHouse', label: 'G\u306e\u90e8\u5c4b', xPercent: 75, yPercent: 22 },
  { id: 'forge', label: '\u30b5\u30c3\u30b0\u306e\u935b\u51b6\u5c4b', xPercent: 13, yPercent: 31 },
  { id: 'shop', label: '\u96d1\u8ca8\u5c4b', xPercent: 13, yPercent: 47 },
  { id: 'plaza', label: '\u30a2\u30b9\u30c8\u30ea\u30a2\u5e83\u5834', xPercent: 50, yPercent: 52 },
  { id: 'gate', label: '\u51fa\u6483\u9580', xPercent: 50, yPercent: 76 },
];

const guildLobbyHotspots: Array<{
  id: GuildHotspotId;
  label: string;
  xPercent: number;
  yPercent: number;
}> = [
  { id: 'party', label: '\u7de8\u6210', xPercent: 23, yPercent: 72 },
  { id: 'summon', label: '\u540c\u884c\u30b5\u30dd\u30fc\u30c8', xPercent: 51, yPercent: 47 },
  { id: 'equipment', label: '\u88c5\u5099', xPercent: 80, yPercent: 27 },
  { id: 'weapons', label: '\u6240\u6301\u6b66\u5668', xPercent: 73, yPercent: 62 },
  { id: 'map', label: 'MAP\u3078\u623b\u308b', xPercent: 16, yPercent: 92 },
];

const keyMap: Record<string, Vector> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  W: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  S: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  A: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
  D: { x: 1, y: 0 },
};

const enemyLabels: Record<EnemyKind, string> = {
  small: '小型敵',
  flying: '飛行敵',
  charger: '突進敵',
};

const assetPaths = {
  player: '/assets/tcg/chibi-socho.png',
  boss: '/assets/tcg/boss-bear.png',
  cardBack: '/assets/tcg/card-back-default.png',
  sag: '/assets/tcg/sag-portrait.png',
  enemies: {
    small: '/assets/tcg/enemy-goblin.png',
    flying: '/assets/tcg/enemy-lesser-wyvern.png',
    charger: '/assets/tcg/enemy-boar.png',
  },
};

function App() {
  const [game, setGame] = useState<GameState>(() => createInitialGameState());
  const [selectedSupport, setSelectedSupport] = useState<SupportCharacter | null>(() => {
    const activeSupportId = loadActiveSupportId();
    return activeSupportId ? getSupportById(activeSupportId) : null;
  });
  const [summonPhase, setSummonPhase] = useState<SummonPhase>('idle');
  const [summonCards, setSummonCards] = useState<SupportCharacter[]>([]);
  const [revealingCardId, setRevealingCardId] = useState<string | null>(null);
  const [joystick, setJoystick] = useState<JoystickState>({ x: 0, y: 0, active: false });
  const [ownedCoins, setOwnedCoins] = useState(() => loadOwnedCoins());
  const [ownedWeapons, setOwnedWeapons] = useState<OwnedWeapon[]>(() => loadOwnedWeapons());
  const [ownedSupports, setOwnedSupports] = useState<OwnedSupport[]>(() => loadOwnedSupports());
  const [equippedWeapons, setEquippedWeapons] = useState<EquippedWeaponsByCharacter>(() => loadEquippedWeapons());
  const [activeMainCharacterId, setActiveMainCharacterId] = useState<MainCharacterId>(() => loadActiveMainCharacterId());
  const [trainingSelectedCharacterId, setTrainingSelectedCharacterId] = useState<MainCharacterId | null>(null);
  const [trainingRunCharacterId, setTrainingRunCharacterId] = useState<MainCharacterId | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<StageId>(DEFAULT_STAGE_ID);
  const [lockedMainCharacterNotice, setLockedMainCharacterNotice] = useState('');
  const [freeSupportSummonUsed, setFreeSupportSummonUsed] = useState(() => loadFreeSupportSummonUsed());
  const [forgeResult, setForgeResult] = useState<ForgeResult | null>(null);
  const [isForging, setIsForging] = useState(false);
  const [summonContext, setSummonContext] = useState<SummonContext>('shopPaid');
  const [shopSummonResult, setShopSummonResult] = useState<SupportCharacter | null>(null);
  const [guildReceptionOpen, setGuildReceptionOpen] = useState(false);
  const supportId = useRef<SupportId | null>(null);
  const supportLevel = useRef(1);
  const mainCharacterId = useRef<MainCharacterId>('socho');
  const equippedWeaponId = useRef('iron-tachi');
  const equippedWeaponLevel = useRef(1);
  const pressedKeys = useRef(new Set<string>());
  const dragTarget = useRef<Vector | null>(null);
  const joystickVector = useRef<Vector | null>(null);
  const joystickBaseRef = useRef<HTMLDivElement | null>(null);
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const lastFrame = useRef<number | null>(null);
  const rewardedResultKey = useRef<string | null>(null);

  useEffect(() => {
    supportId.current = selectedSupport?.id ?? null;
  }, [selectedSupport]);

  useEffect(() => {
    if (!selectedSupport) return;
    const isOwned = ownedSupports.some((support) => support.id === selectedSupport.id);
    if (isOwned) return;
    setSelectedSupport(null);
    saveActiveSupportId(null);
  }, [ownedSupports, selectedSupport]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'p' || event.key === 'P') {
        togglePause();
        event.preventDefault();
        return;
      }

      if (keyMap[event.key]) {
        pressedKeys.current.add(event.key);
        event.preventDefault();
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      pressedKeys.current.delete(event.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    let frameId = 0;

    const tick = (time: number) => {
      if (lastFrame.current === null) lastFrame.current = time;
      const dt = Math.min(0.034, (time - lastFrame.current) / 1000);
      lastFrame.current = time;

      setGame((current) =>
        updateGame(
          current,
          dt,
          getMoveVector(current, pressedKeys.current, dragTarget.current, joystickVector.current),
          supportId.current,
          supportLevel.current,
          equippedWeaponId.current,
          equippedWeaponLevel.current,
          mainCharacterId.current,
        ),
      );
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const hpPercent = Math.max(0, (game.player.hp / game.player.maxHp) * 100);
  const bossHpPercent = game.boss ? Math.max(0, (game.boss.hp / game.boss.maxHp) * 100) : 0;
  const bossHudImage = game.boss?.image || getStageById(game.stageId).bossImage || assetPaths.boss;
  const activeSlashRadius = game.boss ? SLASH_BOSS_RADIUS : SLASH_RADIUS;
  const activeShadowSlashRadius = game.boss ? ROKUDO_SHADOW_SLASH_BOSS_RADIUS : ROKUDO_SHADOW_SLASH_RADIUS;
  const hibikiShield = getHibikiShieldView(game);
  const myououGaruda = getMyououGarudaView(game);
  const equippedSochoWeapon = useMemo(() => getEquippedSochoWeapon(equippedWeapons), [equippedWeapons]);
  const runtimeMainCharacterId = game.isTraining && trainingRunCharacterId ? trainingRunCharacterId : activeMainCharacterId;
  const mainCharacter = useMemo(() => getMainCharacter(runtimeMainCharacterId), [runtimeMainCharacterId]);
  const selectedStage = useMemo(() => getStageById(selectedStageId), [selectedStageId]);
  const activeWeaponCharacterId: CharacterId =
    mainCharacter.id === 'tsutsu' ||
    mainCharacter.id === 'rokudo' ||
    mainCharacter.id === 'player' ||
    mainCharacter.id === 'ushimaru' ||
    mainCharacter.id === 'deli' ||
    mainCharacter.id === 'yabuko-fm' ||
    mainCharacter.id === 'rockel' ||
    mainCharacter.id === 'nanaichi' ||
    mainCharacter.id === 'myoo'
      ? mainCharacter.id
      : 'socho';
  const equippedMainWeapon = useMemo(
    () => getEquippedWeaponForCharacter(equippedWeapons, activeWeaponCharacterId),
    [equippedWeapons, activeWeaponCharacterId],
  );
  const weaponOptions = useMemo(
    () => getWeaponOptionsForCharacter(activeWeaponCharacterId, ownedWeapons),
    [activeWeaponCharacterId, ownedWeapons],
  );
  const selectedSupportLevel = useMemo(
    () => getOwnedSupportLevel(ownedSupports, selectedSupport?.id ?? null),
    [ownedSupports, selectedSupport?.id],
  );
  const equippedSochoWeaponLevel = useMemo(
    () => getOwnedWeaponLevel(ownedWeapons, equippedSochoWeapon.id),
    [ownedWeapons, equippedSochoWeapon.id],
  );
  const equippedMainWeaponLevel = useMemo(
    () => getOwnedWeaponLevel(ownedWeapons, equippedMainWeapon.id),
    [ownedWeapons, equippedMainWeapon.id],
  );
  const mainWeaponLabel = `${equippedMainWeapon.name} / Lv ${equippedMainWeaponLevel}`;
  const mainWeaponEffect = equippedMainWeapon.effectDescription;
  const sochoWeaponTuning = useMemo(
    () => getSochoWeaponTuning(equippedSochoWeapon.id, equippedSochoWeaponLevel),
    [equippedSochoWeapon.id, equippedSochoWeaponLevel],
  );
  const ushimaruWeaponTuning = useMemo(
    () => getUshimaruWeaponTuning(equippedMainWeapon.id, equippedMainWeaponLevel),
    [equippedMainWeapon.id, equippedMainWeaponLevel],
  );
  const yabukoFmWeaponTuning = useMemo(
    () => getYabukoFmWeaponTuning(equippedMainWeapon.id, equippedMainWeaponLevel),
    [equippedMainWeapon.id, equippedMainWeaponLevel],
  );
  const rockelWeaponTuning = useMemo(
    () => getRockelWeaponTuning(equippedMainWeapon.id, equippedMainWeaponLevel),
    [equippedMainWeapon.id, equippedMainWeaponLevel],
  );
  const sochoHasSlashWave = hasSochoSlashWave(equippedSochoWeapon.id);
  const screenTitle = useMemo(() => {
    if (game.status === 'clear') return '\u30b9\u30c6\u30fc\u30b8\u30af\u30ea\u30a2';
    if (game.status === 'gameOver') return '\u30b2\u30fc\u30e0\u30aa\u30fc\u30d0\u30fc';
    return 'G\u306e\u90e8\u5c4b STG';
  }, [game.status]);
  const rewardSummary = useMemo(
    () => (game.isTraining ? null : calculateCoinReward(game.status, game.coinsCollected, game.hasTakenDamage, getStageById(game.stageId).clearBonus)),
    [game.isTraining, game.status, game.coinsCollected, game.hasTakenDamage, game.stageId],
  );
  const shopSummonCost = freeSupportSummonUsed ? SHOP_SUPPORT_SUMMON_COST : 0;
  const canStartShopSummon =
    (summonPhase === 'idle' || summonPhase === 'done') && (shopSummonCost === 0 || ownedCoins >= shopSummonCost);

  useEffect(() => {
    document.title = 'G\u306e\u90e8\u5c4b STG';
  }, []);

  useEffect(() => {
    if (!rewardSummary) return;

    const resultKey = `${rewardSummary.status}:${Math.floor(game.elapsed * 1000)}:${game.defeatedEnemies}:${rewardSummary.stageCoins}:${rewardSummary.addedCoins}:${rewardSummary.isNoDamageClear}`;
    if (rewardedResultKey.current === resultKey) return;
    rewardedResultKey.current = resultKey;

    setOwnedCoins((current) => {
      const nextCoins = current + rewardSummary.addedCoins;
      saveOwnedCoins(nextCoins);
      return nextCoins;
    });
  }, [game.defeatedEnemies, game.elapsed, rewardSummary]);

  useEffect(() => {
    equippedWeaponId.current = equippedMainWeapon.id;
    equippedWeaponLevel.current = equippedMainWeaponLevel;
  }, [equippedMainWeapon.id, equippedMainWeaponLevel]);

  useEffect(() => {
    supportLevel.current = selectedSupportLevel;
  }, [selectedSupportLevel]);

  useEffect(() => {
    mainCharacterId.current = runtimeMainCharacterId;
  }, [runtimeMainCharacterId]);

  const begin = () => {
    if (!selectedSupport) return;
    setTrainingRunCharacterId(null);
    pressedKeys.current.clear();
    dragTarget.current = null;
    resetJoystick();
    rewardedResultKey.current = null;
    lastFrame.current = null;
    setGame(startGame(selectedStageId));
  };

  const beginTraining = () => {
    if (!trainingSelectedCharacterId) return;
    const trainingWeapon = getEquippedWeaponForCharacter(equippedWeapons, trainingSelectedCharacterId);
    const trainingWeaponLevel = getOwnedWeaponLevel(ownedWeapons, trainingWeapon.id);
    setTrainingRunCharacterId(trainingSelectedCharacterId);
    mainCharacterId.current = trainingSelectedCharacterId;
    equippedWeaponId.current = trainingWeapon.id;
    equippedWeaponLevel.current = trainingWeaponLevel;
    pressedKeys.current.clear();
    dragTarget.current = null;
    resetJoystick();
    rewardedResultKey.current = null;
    lastFrame.current = null;
    setGame(startGame(DEFAULT_STAGE_ID, { isTraining: true }));
  };

  const returnToTrainingGround = () => {
    pressedKeys.current.clear();
    dragTarget.current = null;
    resetJoystick();
    lastFrame.current = null;
    setTrainingRunCharacterId(null);
    setGame((current) => ({ ...current, status: 'trainingGround', isTraining: false }));
  };

  const retryCurrentRun = () => {
    if (game.isTraining) {
      beginTraining();
      return;
    }
    begin();
  };

  const goToAstoriaMap = () => {
    pressedKeys.current.clear();
    dragTarget.current = null;
    resetJoystick();
    setGuildReceptionOpen(false);
    setTrainingRunCharacterId(null);
    lastFrame.current = null;
    setGame((current) => ({ ...current, status: 'astoriaMap' }));
  };

  const goToPrepare = () => {
    pressedKeys.current.clear();
    dragTarget.current = null;
    resetJoystick();
    setTrainingRunCharacterId(null);
    lastFrame.current = null;
    setGame((current) => ({ ...current, status: 'guildLobby' }));
  };

  const goToGuildLobby = () => {
    goToPrepare();
  };

  const goToGuildParty = () => {
    setGuildReceptionOpen(false);
    setGame((current) => ({ ...current, status: 'guildParty' }));
  };

  const goToGuildSummon = () => {
    setGuildReceptionOpen(false);
    setGame((current) => ({ ...current, status: 'guildSummon' }));
  };

  const goToGuildEquipment = () => {
    setGuildReceptionOpen(false);
    setGame((current) => ({ ...current, status: 'guildEquipment' }));
  };

  const goToGuildWeapons = () => {
    setGuildReceptionOpen(false);
    setGame((current) => ({ ...current, status: 'guildWeapons' }));
  };

  const goToForge = () => {
    setGame((current) => ({ ...current, status: 'forge' }));
  };

  const goToForgeDraw = () => {
    setGame((current) => ({ ...current, status: 'forgeDraw' }));
  };

  const goToForgeWeapons = () => {
    setGame((current) => ({ ...current, status: 'forgeWeapons' }));
  };

  const goToShop = () => {
    setGame((current) => ({ ...current, status: 'shop' }));
  };

  const goToShopSupportSummon = () => {
    setSummonContext(freeSupportSummonUsed ? 'shopPaid' : 'shopFree');
    setSummonPhase('idle');
    setSummonCards([]);
    setRevealingCardId(null);
    setShopSummonResult(null);
    setGame((current) => ({ ...current, status: 'shopSupportSummon' }));
  };

  const goToShopSupportList = () => {
    setGame((current) => ({ ...current, status: 'shopSupportList' }));
  };

  const goToAstoriaPlaza = () => {
    setGame((current) => ({ ...current, status: 'astoriaPlaza' }));
  };

  const goToTrainingGround = () => {
    setTrainingRunCharacterId(null);
    setGame((current) => ({ ...current, status: 'trainingGround' }));
  };

  const goToGate = () => {
    pressedKeys.current.clear();
    dragTarget.current = null;
    resetJoystick();
    setTrainingRunCharacterId(null);
    lastFrame.current = null;
    setGame((current) => ({ ...current, status: 'gate' }));
  };

  const goToMapFacility = (facilityId: MapFacilityId) => {
    if (facilityId === 'guildHouse') goToPrepare();
    if (facilityId === 'forge') goToForge();
    if (facilityId === 'shop') goToShop();
    if (facilityId === 'plaza') goToAstoriaPlaza();
    if (facilityId === 'gate') goToGate();
  };

  const goToGuildHotspot = (hotspotId: GuildHotspotId) => {
    if (hotspotId === 'party') goToGuildParty();
    if (hotspotId === 'summon') goToGuildSummon();
    if (hotspotId === 'equipment') goToGuildEquipment();
    if (hotspotId === 'weapons') goToGuildWeapons();
    if (hotspotId === 'map') goToAstoriaMap();
  };

  const pauseGame = () => {
    pressedKeys.current.clear();
    dragTarget.current = null;
    resetJoystick();
    lastFrame.current = null;
    setGame((current) => (current.status === 'playing' ? { ...current, status: 'paused' } : current));
  };

  const resumeGame = () => {
    lastFrame.current = null;
    setGame((current) => (current.status === 'paused' ? { ...current, status: 'playing' } : current));
  };

  const togglePause = () => {
    pressedKeys.current.clear();
    dragTarget.current = null;
    resetJoystick();
    lastFrame.current = null;
    setGame((current) => {
      if (current.status === 'playing') return { ...current, status: 'paused' };
      if (current.status === 'paused') return { ...current, status: 'playing' };
      return current;
    });
  };

  const buySupportSummon = () => {
    const isFreeSummon = !freeSupportSummonUsed;
    if (!isFreeSummon && ownedCoins < SHOP_SUPPORT_SUMMON_COST) return;
    if (summonPhase !== 'idle' && summonPhase !== 'done') return;

    if (!isFreeSummon) {
      const nextCoins = ownedCoins - SHOP_SUPPORT_SUMMON_COST;
      setOwnedCoins(nextCoins);
      saveOwnedCoins(nextCoins);
    }
    setShopSummonResult(null);
    setSummonContext(isFreeSummon ? 'shopFree' : 'shopPaid');
    setSummonPhase('gate');
    window.setTimeout(() => {
      setSummonCards(shuffleSupports(supportCandidates));
      setSummonPhase('cards');
    }, 650);
  };

  const chooseSupportCard = (support: SupportCharacter) => {
    if (summonPhase !== 'cards') return;

    setRevealingCardId(support.id);
    setSummonPhase('revealing');
    window.setTimeout(() => {
      setSelectedSupport(support);
      saveActiveSupportId(support.id);
      setOwnedSupports((current) => {
        const nextSupports = addOwnedSupport(current, support.id);
        saveOwnedSupports(nextSupports);
        return nextSupports;
      });
      if (summonContext === 'shopFree') {
        setFreeSupportSummonUsed(true);
        saveFreeSupportSummonUsed(true);
      }
      setShopSummonResult(support);
      setSummonPhase('done');
    }, 760);
  };

  const chooseActiveSupport = (support: SupportCharacter) => {
    const isOwned = ownedSupports.some((ownedSupport) => ownedSupport.id === support.id);
    if (!isOwned) return;
    setSelectedSupport(support);
    saveActiveSupportId(support.id);
  };

  const chooseMainCharacter = (character: MainCharacterDefinition) => {
    if (!isMainCharacterAvailable(character.id)) {
      setLockedMainCharacterNotice(`${character.name}は今後のアップデートで解放予定です。`);
      return;
    }

    const nextCharacterId = resolveActiveMainCharacterId(character.id);
    setActiveMainCharacterId(nextCharacterId);
    saveActiveMainCharacterId(nextCharacterId);
    setLockedMainCharacterNotice('');
  };

  const updateJoystick = (event: React.PointerEvent<HTMLDivElement>) => {
    if (game.status !== 'playing' || !joystickBaseRef.current) return;
    event.preventDefault();
    event.stopPropagation();

    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxDistance = rect.width * 0.34;
    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;
    const distance = Math.hypot(dx, dy);
    const limitedDistance = Math.min(distance, maxDistance);
    const normalized = distance > 0 ? { x: dx / distance, y: dy / distance } : { x: 0, y: 0 };

    joystickVector.current = distance < 6 ? null : normalized;
    dragTarget.current = null;
    setJoystick({
      x: normalized.x * limitedDistance,
      y: normalized.y * limitedDistance,
      active: distance >= 6,
    });
  };

  const startJoystick = (event: React.PointerEvent<HTMLDivElement>) => {
    if (game.status !== 'playing') return;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateJoystick(event);
  };

  const resetJoystick = () => {
    joystickVector.current = null;
    setJoystick({ x: 0, y: 0, active: false });
  };

  const resetSavedCoins = () => {
    if (!window.confirm('所持コインを0にリセットしますか？')) return;
    resetOwnedCoins();
    setOwnedCoins(0);
  };

  const forgeWeapon = () => {
    if (ownedCoins < FORGE_WEAPON_COST || isForging) return;

    const nextCoins = ownedCoins - FORGE_WEAPON_COST;
    setForgeResult(null);
    setIsForging(true);
    setOwnedCoins(nextCoins);
    saveOwnedCoins(nextCoins);

    window.setTimeout(() => {
      const weapon = forgeRandomWeapon();
      const isNew = !ownedWeapons.some((ownedWeapon) => ownedWeapon.id === weapon.id);
      const nextWeapons = addOwnedWeapon(ownedWeapons, weapon);
      const forgedWeapon = nextWeapons.find((ownedWeapon) => ownedWeapon.id === weapon.id);

      setOwnedWeapons(nextWeapons);
      saveOwnedWeapons(nextWeapons);
      setForgeResult({
        weapon,
        isNew,
        count: forgedWeapon?.count ?? 1,
        level: forgedWeapon?.level ?? 1,
        sagLine: FORGE_RESULT_LINES[weapon.rarity],
      });
      setIsForging(false);
    }, FORGE_ANIMATION_DURATION);
  };

  const resetSavedWeapons = () => {
    if (!window.confirm('所持武器をリセットしますか？')) return;
    resetOwnedWeapons();
    setOwnedWeapons([]);
    setForgeResult(null);
  };

  const equipMainWeapon = (weaponId: string) => {
    const nextEquippedWeapons = { ...equippedWeapons, [activeWeaponCharacterId]: weaponId };
    setEquippedWeapons(nextEquippedWeapons);
    saveEquippedWeapons(nextEquippedWeapons);
  };

  return (
    <main className="app-shell">
      {game.status === 'title' && (
        <section className="menu-screen title-screen">
          <div>
            <p className="eyebrow">MVP / アストリア草原</p>
            <h1>{'G\u306e\u90e8\u5c4b STG'}</h1>
            <p className="lead">
              総長を操作し、前方半円斬撃で敵を倒し、コインを拾い、大型魔獣を撃破する最小体験です。
            </p>
          </div>
          <div className="title-visual" aria-hidden="true">
            <img src={assetPaths.player} alt="" />
          </div>
          <div className="owned-coins-panel">
            <span>所持コイン</span>
            <strong>{ownedCoins}</strong>
          </div>
          <button className="primary-button" onClick={goToAstoriaMap}>
            アストリアMAPへ
          </button>
          <button className="reset-coins-button" onClick={resetSavedCoins}>
            所持コインリセット
          </button>
          <p className="control-note">PC: WASD / 矢印キー　スマホ: 画面ドラッグ　攻撃: 自動</p>
        </section>
      )}

      {game.status === 'astoriaMap' && (
        <section className="astoria-map-screen">
          <div className="map-topbar">
            <div>
              <p className="eyebrow">Astoria</p>
              <h1>アストリアMAP</h1>
            </div>
            <div className="owned-coins-panel map-coins">
              <span>所持コイン</span>
              <strong>{ownedCoins}</strong>
            </div>
          </div>

          <div className="astoria-map-board" aria-label="Astoria map facilities">
            <img src="/assets/tcg/astoria-hub-map.png" alt="Astoria map" />
            {astoriaFacilities.map((facility) => (
              <button
                key={facility.id}
                className={`map-hotspot ${facility.id}`}
                style={{
                  left: `${facility.xPercent}%`,
                  top: `${facility.yPercent}%`,
                }}
                onClick={() => goToMapFacility(facility.id)}
              >
                <span className="map-pin" />
                <span className="map-label">{facility.label}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {game.status === 'astoriaPlaza' && (
        <section className="menu-screen facility-screen plaza-screen">
          <div className="facility-header-row">
            <div>
              <p className="eyebrow">ASTORIA PLAZA</p>
              <h1>{'\u30a2\u30b9\u30c8\u30ea\u30a2\u5e83\u5834'}</h1>
              <p>{'\u8857\u306e\u6848\u5185\u677f\u3068\u8a13\u7df4\u5834\u304c\u3042\u308b\u3001\u5192\u967a\u8005\u305f\u3061\u306e\u5c0f\u3055\u306a\u96c6\u5408\u5834\u6240\u3067\u3059\u3002'}</p>
            </div>
            <div className="owned-coins-panel compact-coins">
              <span>{'\u6240\u6301\u30b3\u30a4\u30f3'}</span>
              <strong>{ownedCoins}</strong>
            </div>
          </div>

          <div className="plaza-grid">
            <article className="plaza-board plaza-notice-board">
              <span className="plaza-board-tag">{'\u6848\u5185\u677f'}</span>
              <h2>{'\u8857\u306e\u63b2\u793a\u677f'}</h2>
              <p>{'\u5916\u306e\u4e16\u754c\u3078\u7e4b\u304c\u308b\u6848\u5185\u672d\u3067\u3059\u3002\u5225\u30bf\u30d6\u3067\u958b\u304d\u307e\u3059\u3002'}</p>
              <div className="plaza-link-list">
                <a className="notice-link" href={EXTERNAL_LINKS.gNoHeyaYouTube} target="_blank" rel="noreferrer">
                  <span>{'G\u306e\u90e8\u5c4b YouTube'}</span>
                </a>
                <a className="notice-link" href={EXTERNAL_LINKS.rokudoLineStamps} target="_blank" rel="noreferrer">
                  <span>{'\u30ed\u30af\u30c9\u306eLINE\u30b9\u30bf\u30f3\u30d7'}</span>
                </a>
              </div>
            </article>

            <article className="plaza-board plaza-training-board">
              <span className="plaza-board-tag">{'\u8a13\u7df4\u5834'}</span>
              <h2>{'\u30ad\u30e3\u30e9\u6027\u80fd\u78ba\u8a8d'}</h2>
              <p>{'\u30d7\u30ec\u30a4\u30a2\u30d6\u30eb\u30ad\u30e3\u30e9\u306e\u5f97\u610f\u5206\u91ce\u3092\u78ba\u8a8d\u3067\u304d\u307e\u3059\u3002\u5b9f\u6226\u30c6\u30b9\u30c8\u306f\u6b21\u56de\u5b9f\u88c5\u4e88\u5b9a\u3067\u3059\u3002'}</p>
              <button className="primary-button" onClick={goToTrainingGround}>{'\u8a13\u7df4\u5834\u3078'}</button>
            </article>
          </div>

          <div className="facility-actions">
            <button className="secondary-button" onClick={goToAstoriaMap}>MAPへ戻る</button>
          </div>
        </section>
      )}

      {game.status === 'trainingGround' && (
        <section className="menu-screen facility-screen training-screen">
          <div className="facility-header-row">
            <div>
              <p className="eyebrow">TRAINING GROUND</p>
              <h1>{'\u8a13\u7df4\u5834'}</h1>
              <p>{'\u5404\u30d7\u30ec\u30a4\u30a2\u30d6\u30eb\u30ad\u30e3\u30e9\u306e\u6027\u80fd\u3092\u78ed\u304f\u78ba\u8a8d\u3067\u304d\u307e\u3059\u3002'}</p>
            </div>
            <div className="owned-coins-panel compact-coins">
              <span>{'\u6240\u6301\u30b3\u30a4\u30f3'}</span>
              <strong>{ownedCoins}</strong>
            </div>
          </div>

          <div className="training-character-grid">
            {trainingCharacters.map((character) => {
              const definition = getMainCharacter(character.id);
              const isSelected = trainingSelectedCharacterId === character.id;
              return (
                <button
                  className={`training-character-card ${isSelected ? 'is-selected' : ''}`}
                  key={character.id}
                  type="button"
                  onClick={() => setTrainingSelectedCharacterId(character.id)}
                >
                  {definition.image && <img src={definition.image} alt={character.name} />}
                  <div>
                    <h2>{character.name}</h2>
                    <strong>{character.summary}</strong>
                    <p>{definition.attackLabel}</p>
                  </div>
                  {isSelected && <em>選択中</em>}
                </button>
              );
            })}
          </div>

          <div className="facility-actions">
            <button className="primary-button" onClick={beginTraining} disabled={!trainingSelectedCharacterId}>
              {trainingSelectedCharacterId ? 'このキャラで訓練開始' : 'キャラを選択してください'}
            </button>
            <button className="secondary-button" onClick={goToAstoriaPlaza}>{'\u30a2\u30b9\u30c8\u30ea\u30a2\u5e83\u5834\u3078\u623b\u308b'}</button>
            <button className="secondary-button" onClick={goToAstoriaMap}>MAPへ戻る</button>
          </div>
        </section>
      )}

      {game.status === 'guildLobby' && (
        <section className="guild-lobby-hotspot-screen">
          <div className="guild-lobby-topbar">
            <div>
              <p className="eyebrow">GUILD LOBBY</p>
              <h1>{'G\u306e\u90e8\u5c4b\u30ed\u30d3\u30fc'}</h1>
              <p>{'7171\u304c\u53d7\u4ed8\u3067\u6848\u5185\u3057\u3066\u3044\u307e\u3059\u3002'}</p>
            </div>
            <div className="guild-coin-chip">
              <span>{'\u6240\u6301\u30b3\u30a4\u30f3'}</span>
              <strong>{ownedCoins}</strong>
            </div>
          </div>
          <div className="guild-lobby-board" aria-label="Guild lobby destinations">
            <img src="/assets/tcg/guild-lobby.png" alt="G guild lobby" />
            <button
              className={`guild-receptionist-button ${guildReceptionOpen ? 'is-open' : ''}`}
              type="button"
              onClick={() => setGuildReceptionOpen((isOpen) => !isOpen)}
              aria-expanded={guildReceptionOpen}
              aria-label="7171\u53d7\u4ed8"
            >
              <span>{'7171\u53d7\u4ed8'}</span>
            </button>
            {guildReceptionOpen && (
              <div className="guild-reception-menu" role="menu" aria-label="7171\u53d7\u4ed8\u30e1\u30cb\u30e5\u30fc">
                <button type="button" onClick={goToGuildParty} role="menuitem">{'\u7de8\u6210'}</button>
                <button type="button" onClick={goToGuildSummon} role="menuitem">{'\u30b5\u30dd\u30fc\u30c8'}</button>
                <button type="button" onClick={goToGuildEquipment} role="menuitem">{'\u88c5\u5099'}</button>
                <button type="button" onClick={goToGuildWeapons} role="menuitem">{'\u6b66\u5668\u4e00\u89a7'}</button>
              </div>
            )}
            {guildLobbyHotspots.filter((hotspot) => hotspot.id === 'map').map((hotspot) => (
              <button
                key={hotspot.id}
                className={`guild-hotspot ${hotspot.id}`}
                style={{
                  left: `${hotspot.xPercent}%`,
                  top: `${hotspot.yPercent}%`,
                }}
                onClick={() => goToGuildHotspot(hotspot.id)}
              >
                <span>{hotspot.label}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {game.status === 'guildParty' && (
        <section className="menu-screen prepare-screen guild-subscreen sortie-party-screen">
          <p className="eyebrow">Guild House</p>
          <h1>編成</h1>
          <div className="owned-coins-panel compact">
            <span>所持コイン</span>
            <strong>{ownedCoins}</strong>
          </div>
          <div className="main-character-select">
            <div className="section-heading">
              <span>メインキャラ選択</span>
              <strong>現在：{mainCharacter.name}</strong>
            </div>
            <div className="main-character-list">
              {mainCharacterList.map((character) => {
                const isActive = activeMainCharacterId === character.id;
                const isAvailable = character.status === 'available';
                return (
                  <button
                    key={character.id}
                    type="button"
                    className={`main-character-card ${isActive ? 'is-active' : ''} ${isAvailable ? 'is-available' : 'is-locked'}`}
                    onClick={() => chooseMainCharacter(character)}
                  >
                    {character.image ? (
                      <img src={character.image} alt={character.name} />
                    ) : (
                      <span className="character-silhouette">{character.name.slice(0, 1)}</span>
                    )}
                    <span className="character-status-badge">{isActive ? '選択中' : character.statusLabel}</span>
                    <strong>{character.name}</strong>
                    <em>{character.role}</em>
                    <small>{character.weaponType}</small>
                  </button>
                );
              })}
            </div>
            {lockedMainCharacterNotice && <p className="locked-character-notice">{lockedMainCharacterNotice}</p>}
          </div>
          <div className="sortie-summary">
            <article className="formation-card main-card sortie-card">
              <span className="slot-label">メインキャラ</span>
              {mainCharacter.image && <img src={mainCharacter.image} alt={mainCharacter.name} />}
              <div>
                <h2>{mainCharacter.name}</h2>
                <strong>{mainCharacter.role}</strong>
                <p>{mainCharacter.description}</p>
                <p className="formation-status">{mainCharacter.statusLabel}</p>
              </div>
            </article>
            <article className="formation-card weapon-card sortie-card">
              <span className="slot-label">装備武器</span>
              {equippedMainWeapon.imagePath && <img className="weapon-card-image featured" src={equippedMainWeapon.imagePath} alt={equippedMainWeapon.name} />}
              <div>
                <h2>{mainWeaponLabel}</h2>
                <strong>{mainCharacter.weaponType} / {mainCharacter.attackLabel}</strong>
                <p>{equippedMainWeapon.description}</p>
                <p className="weapon-effect-line">効果：{mainWeaponEffect}</p>
              </div>
            </article>
            <article className={`formation-card support-card sortie-card ${selectedSupport ? 'has-support' : ''}`}>
              <span className="slot-label">同行サポート</span>
              {selectedSupport ? (
                <>
                  <img src={selectedSupport.image} alt={selectedSupport.name} />
                  <div>
                    <h2>{selectedSupport.name} / Lv {selectedSupportLevel}</h2>
                    <strong>{selectedSupport.role}</strong>
                    <p>{selectedSupport.effectDescription}</p>
                  </div>
                </>
              ) : (
                <div className="empty-support">
                  まだ同行サポートがいません。雑貨屋で初回無料召喚をしてみよう。
                </div>
              )}
            </article>
          </div>
          <div className="prepare-actions">
            <button className="primary-button" onClick={goToGate} disabled={!selectedSupport}>出撃門へ向かう</button>
            <button className="secondary-button" onClick={goToGuildEquipment}>装備を変更する</button>
            <button className="secondary-button" onClick={goToGuildSummon}>同行サポートを変更する</button>
            <button className="secondary-button" onClick={goToGuildLobby}>ロビーへ戻る</button>
          </div>
        </section>
      )}

      {game.status === 'guildSummon' && (
        <section className="menu-screen prepare-screen guild-subscreen">
          <p className="eyebrow">Guild House</p>
          <h1>{'\u540c\u884c\u30b5\u30dd\u30fc\u30c8'}</h1>
          <div className="owned-coins-panel compact">
            <span>{'\u6240\u6301\u30b3\u30a4\u30f3'}</span>
            <strong>{ownedCoins}</strong>
          </div>
          <article className={`formation-card support-card guild-summon-card ${selectedSupport ? 'has-support' : ''}`}>
            <span className="slot-label">{'\u73fe\u5728\u540c\u884c'}</span>
            {selectedSupport ? (
              <>
                <img src={selectedSupport.image} alt={selectedSupport.name} />
                <div>
                  <h2>{selectedSupport.name}</h2>
                  <strong>{selectedSupport.role}</strong>
                  <p>{selectedSupport.effectDescription}</p>
                  <p className="summon-success">Lv {selectedSupportLevel}</p>
                </div>
              </>
            ) : (
              <div className="empty-support">
                {'\u672a\u53ec\u559a\u3067\u3059\u3002\u96d1\u8ca8\u5c4b\u3067\u521d\u56de\u7121\u6599\u306e\u30b5\u30dd\u30fc\u30c8\u53ec\u559a\u30ab\u30fc\u30c9\u3092\u5f15\u3044\u3066\u304f\u3060\u3055\u3044\u3002'}
              </div>
            )}
          </article>
          <div className="support-inventory compact-list">
            {ownedSupports.length === 0 ? (
              <p className="empty-inventory">{'\u307e\u3060\u53ec\u559a\u6e08\u307f\u30b5\u30dd\u30fc\u30c8\u306f\u3044\u307e\u305b\u3093\u3002'}</p>
            ) : (
              ownedSupports.map((ownedSupport) => {
                const support = getSupportById(ownedSupport.id);
                const isActive = selectedSupport?.id === support.id;
                return (
                  <article key={support.id} className={`support-list-card ${isActive ? 'is-active' : ''}`}>
                    <img src={support.image} alt={support.name} />
                    <div>
                      <h2>{support.name}</h2>
                      <strong>Lv {ownedSupport.level} / x{ownedSupport.count}</strong>
                      <p>{support.effectDescription}</p>
                      {isActive && <em className="equipped-badge">{'\u73fe\u5728\u540c\u884c\u4e2d'}</em>}
                    </div>
                    <button className="secondary-button" onClick={() => chooseActiveSupport(support)} disabled={isActive}>
                      {isActive ? '\u540c\u884c\u4e2d' : '\u540c\u884c\u3059\u308b'}
                    </button>
                  </article>
                );
              })
            )}
          </div>
          <div className="prepare-actions">
            <button className="primary-button" onClick={goToShopSupportSummon}>
              {'\u96d1\u8ca8\u5c4b\u3067\u8ffd\u52a0\u53ec\u559a'}
            </button>
            <button className="secondary-button" onClick={goToShopSupportList}>{'\u53ec\u559a\u6e08\u307f\u4e00\u89a7\u3092\u898b\u308b'}</button>
            <button className="secondary-button" onClick={goToGuildLobby}>{'\u30ed\u30d3\u30fc\u3078\u623b\u308b'}</button>
          </div>
        </section>
      )}

      {game.status === 'guildEquipment' && (
        <section className="menu-screen guild-subscreen equipment-screen">
          <p className="eyebrow">Guild House</p>
          <h1>{'\u88c5\u5099'}</h1>
          <div className="owned-coins-panel compact">
            <span>{'\u6240\u6301\u30b3\u30a4\u30f3'}</span>
            <strong>{ownedCoins}</strong>
          </div>
          <article className="equipped-weapon-panel">
            <span>メインキャラ：{mainCharacter.name}</span>
            <h2>現在装備中の武器：{equippedMainWeapon.name} / Lv {equippedMainWeaponLevel}</h2>
            <p>{equippedMainWeapon.owner} / {equippedMainWeapon.type} / {equippedMainWeapon.rarity}</p>
            <p>{equippedMainWeapon.description}</p>
            <p className="weapon-effect-line">効果：{equippedMainWeapon.effectDescription}</p>
          </article>
          <div className="equipment-list">
            <h2>{mainCharacter.name}が装備できる武器</h2>
            {weaponOptions.length === 0 ? (
              <p className="empty-inventory">{mainCharacter.name}用の武器を持っていません。サッグの鍛冶屋で鍛造してみよう。</p>
            ) : (
              weaponOptions.map((weapon) => {
                const isEquipped = equippedMainWeapon.id === weapon.id;
                return (
                  <article key={weapon.id} className={`weapon-card equipment-weapon-card rarity-${weapon.rarity} ${isEquipped ? 'is-equipped' : ''}`}>
                    {weapon.imagePath && <img className="weapon-card-image" src={weapon.imagePath} alt={weapon.name} />}
                    <div>
                      <h3>{weapon.name}</h3>
                      <strong>{weapon.owner} / {weapon.type} / {weapon.rarity}</strong>
                    </div>
                    <span className="weapon-count">Lv {weapon.level} / x{weapon.count}</span>
                    <p>{weapon.description}</p>
                    <p className="weapon-effect-line">効果：{weapon.effectDescription}</p>
                    <button className="secondary-button" onClick={() => equipMainWeapon(weapon.id)} disabled={isEquipped}>
                      {isEquipped ? '装備中' : '装備する'}
                    </button>
                  </article>
                );
              })
            )}
          </div>
          <button className="secondary-button" onClick={goToGuildLobby}>{'\u30ed\u30d3\u30fc\u3078\u623b\u308b'}</button>
        </section>
      )}

      {game.status === 'guildWeapons' && (
        <section className="menu-screen guild-subscreen">
          <p className="eyebrow">Guild House</p>
          <h1>{'\u6240\u6301\u6b66\u5668'}</h1>
          <div className="owned-coins-panel compact">
            <span>{'\u6240\u6301\u30b3\u30a4\u30f3'}</span>
            <strong>{ownedCoins}</strong>
          </div>
          <div className="weapon-inventory">
            {ownedWeapons.length === 0 ? (
              <p className="empty-inventory">{'\u307e\u3060\u6b66\u5668\u3092\u6240\u6301\u3057\u3066\u3044\u307e\u305b\u3093\u3002\u30b5\u30c3\u30b0\u306e\u935b\u51b6\u5c4b\u3067\u935b\u9020\u3067\u304d\u307e\u3059\u3002'}</p>
            ) : (
              ownedWeapons.map((weapon) => (
                <article key={weapon.id} className={`weapon-card rarity-${weapon.rarity}`}> 
                  {weapon.imagePath && <img className="weapon-card-image" src={weapon.imagePath} alt={weapon.name} />}
                  <div>
                    <h3>{weapon.name}</h3>
                    <strong>{weapon.owner} / {weapon.type} / {weapon.rarity}</strong>
                    {Object.values(equippedWeapons).includes(weapon.id) && <em className="equipped-badge">{'\u88c5\u5099\u4e2d'}</em>}
                  </div>
                  <span className="weapon-count">Lv {weapon.level} / x{weapon.count}</span>
                  <p>{weapon.description}</p>
                  <p className="weapon-effect-line">{'\u52b9\u679c'}：{weapon.effectDescription}</p>
                </article>
              ))
            )}
          </div>
          <button className="secondary-button" onClick={goToGuildLobby}>{'\u30ed\u30d3\u30fc\u3078\u623b\u308b'}</button>
        </section>
      )}

      {game.status === 'forge' && (
        <section className="menu-screen facility-screen forge-screen forge-dialogue-screen">
          <p className="eyebrow">Astoria Facility</p>
          <h1>{'\u30b5\u30c3\u30b0\u306e\u935b\u51b6\u5c4b'}</h1>
          <div className="owned-coins-panel compact">
            <span>{'\u6240\u6301\u30b3\u30a4\u30f3'}</span>
            <strong>{ownedCoins}</strong>
          </div>
          <div className="forge-dialogue-stage">
            <div className="forge-character">
              <img src={assetPaths.sag} alt="Sag" />
            </div>
            <article className="forge-dialogue-panel">
              <span className="speaker-name">サッグ</span>
              <p>おう、来たか。</p>
              <p>叩いて鍛えるのは鉄だけじゃねぇ。</p>
              <p>武器も、物語も、ここから強くなるんだ。</p>
            </article>
          </div>
          <div className="forge-menu-actions">
            <button className="primary-button" onClick={goToForgeDraw}>{'\u6b66\u5668\u3092\u935b\u9020'}</button>
            <button className="secondary-button" onClick={goToForgeWeapons}>{'\u6240\u6301\u6b66\u5668\u3092\u898b\u308b'}</button>
            <button className="secondary-button" onClick={goToAstoriaMap}>MAPへ戻る</button>
          </div>
        </section>
      )}

      {game.status === 'forgeDraw' && (
        <section className="menu-screen facility-screen forge-screen forge-work-screen">
          <p className="eyebrow">Sag Forge</p>
          <h1>{'\u6b66\u5668\u935b\u9020'}</h1>
          <div className="owned-coins-panel compact">
            <span>{'\u6240\u6301\u30b3\u30a4\u30f3'}</span>
            <strong>{ownedCoins}</strong>
          </div>
          <div className="forge-mini-dialogue">
            <img src={assetPaths.sag} alt="Sag" />
            <div>
              <strong>サッグ</strong>
              <p>どれが出るかは火床と星脈次第だ。準備ができたら叩くぞ。</p>
            </div>
          </div>
          <div className="forge-panel">
            <div>
              <h2>{'\u6b66\u5668\u935b\u9020'}</h2>
              <p>{'\u6240\u6301\u30b3\u30a4\u30f3\u3092\u4f7f\u3063\u3066\u3001\u30e9\u30f3\u30c0\u30e0\u306b\u6b66\u5668\u3092\u935b\u9020\u3057\u307e\u3059\u3002\u52b9\u679c\u306e\u53cd\u6620\u306f\u4eca\u5f8c\u5b9f\u88c5\u4e88\u5b9a\u3067\u3059\u3002'}</p>
              <div className="forge-cost">
                <span>{'\u935b\u9020\u8cbb\u7528'}</span>
                <strong>{FORGE_WEAPON_COST}</strong>
              </div>
              <button className="primary-button" onClick={forgeWeapon} disabled={ownedCoins < FORGE_WEAPON_COST || isForging}>
                {isForging ? '\u935b\u9020\u4e2d...' : '\u6b66\u5668\u3092\u935b\u9020'}
              </button>
              {ownedCoins < FORGE_WEAPON_COST && <p className="forge-warning">{'\u30b3\u30a4\u30f3\u304c\u8db3\u308a\u307e\u305b\u3093'}</p>}
            </div>
            <div className={`forge-anvil forge-image-stage ${isForging ? 'is-forging' : ''}`} aria-hidden="true">
              <img className="forge-anvil-base" src="/assets/tcg/forge-anvil-base.png" alt="" />
              <img className="forge-hammer forge-hammer-idle" src="/assets/tcg/forge-hammer.png" alt="" />
              <img className="forge-hammer forge-hammer-strike" src="/assets/tcg/forge-hammer-strike.png" alt="" />
              <span className="forge-heat-core" />
              <span className="forge-glow" />
              <span className="forge-flash" />
              <span className="forge-spark spark-one" />
              <span className="forge-spark spark-two" />
              <span className="forge-spark spark-three" />
              <span className="forge-spark spark-four" />
              <span className="forge-spark spark-five" />
            </div>
          </div>
          {forgeResult && (
            <article className={`forge-result forge-result-card rarity-${forgeResult.weapon.rarity}`}> 
              <p className="forge-success-title">{'\u935b\u9020\u6210\u529f\uff01'} {forgeResult.isNew ? '\u65b0\u898f\u5165\u624b' : '\u6240\u6301\u6570+1'}</p>
              {forgeResult.weapon.imagePath && <img className="weapon-card-image result-image" src={forgeResult.weapon.imagePath} alt={forgeResult.weapon.name} />}
              <h2>{forgeResult.weapon.name}</h2>
              <strong>{forgeResult.weapon.owner} / {forgeResult.weapon.type} / {forgeResult.weapon.rarity}</strong>
              <p className="summon-success">Lv {forgeResult.level} / 所持数 x{forgeResult.count}</p>
              <p>{forgeResult.weapon.description}</p>
              <p className="weapon-effect-line">{'\u52b9\u679c'}：{forgeResult.weapon.effectDescription}</p>
              <p className="sag-result-line">サッグ「{forgeResult.sagLine}」</p>
            </article>
          )}
          <p className="rarity-note">common {WEAPON_RARITY_WEIGHTS.common}% / rare {WEAPON_RARITY_WEIGHTS.rare}% / epic {WEAPON_RARITY_WEIGHTS.epic}%</p>
          <div className="forge-menu-actions">
            <button className="secondary-button" onClick={goToForge}>サッグに戻る</button>
            <button className="secondary-button" onClick={goToAstoriaMap}>MAPへ戻る</button>
          </div>
        </section>
      )}

      {game.status === 'forgeWeapons' && (
        <section className="menu-screen facility-screen forge-screen forge-work-screen">
          <p className="eyebrow">Sag Forge</p>
          <h1>{'\u6240\u6301\u6b66\u5668'}</h1>
          <div className="owned-coins-panel compact">
            <span>{'\u6240\u6301\u30b3\u30a4\u30f3'}</span>
            <strong>{ownedCoins}</strong>
          </div>
          <div className="forge-mini-dialogue">
            <img src={assetPaths.sag} alt="Sag" />
            <div>
              <strong>サッグ</strong>
              <p>今まで鍛えた武器だ。総長に持たせるなら、ギルドハウスの装備から選んでくれ。</p>
            </div>
          </div>
          <div className="weapon-inventory-header">
            <h2>{'\u6240\u6301\u6b66\u5668\u4e00\u89a7'}</h2>
            <button className="reset-coins-button" onClick={resetSavedWeapons}>{'\u6240\u6301\u6b66\u5668\u30ea\u30bb\u30c3\u30c8'}</button>
          </div>
          <div className="weapon-inventory">
            {ownedWeapons.length === 0 ? (
              <p className="empty-inventory">{'\u307e\u3060\u6b66\u5668\u3092\u6240\u6301\u3057\u3066\u3044\u307e\u305b\u3093'}</p>
            ) : (
              ownedWeapons.map((weapon) => (
                <article key={weapon.id} className={`weapon-card rarity-${weapon.rarity}`}> 
                  {weapon.imagePath && <img className="weapon-card-image" src={weapon.imagePath} alt={weapon.name} />}
                  <div>
                    <h3>{weapon.name}</h3>
                    <strong>{weapon.owner} / {weapon.type} / {weapon.rarity}</strong>
                    {Object.values(equippedWeapons).includes(weapon.id) && <em className="equipped-badge">{'\u88c5\u5099\u4e2d'}</em>}
                  </div>
                  <span className="weapon-count">Lv {weapon.level} / x{weapon.count}</span>
                  <p>{weapon.description}</p>
                  <p className="weapon-effect-line">{'\u52b9\u679c'}：{weapon.effectDescription}</p>
                </article>
              ))
            )}
          </div>
          <div className="forge-menu-actions">
            <button className="secondary-button" onClick={goToForge}>サッグに戻る</button>
            <button className="secondary-button" onClick={goToAstoriaMap}>MAPへ戻る</button>
          </div>
        </section>
      )}

      {game.status === 'shop' && (
        <section className="menu-screen facility-screen shop-screen">
          <p className="eyebrow">Astoria Facility</p>
          <h1>{'\u96d1\u8ca8\u5c4b'}</h1>
          <div className="owned-coins-panel compact">
            <span>{'\u6240\u6301\u30b3\u30a4\u30f3'}</span>
            <strong>{ownedCoins}</strong>
          </div>
          <div className="shop-dialogue-stage">
            <img className="shopkeeper-portrait" src="/assets/tcg/shopkeeper.png" alt="Shopkeeper" />
            <article className="shop-dialogue-panel">
              <span className="speaker-name">{'\u96d1\u8ca8\u5c4b\u306e\u5e97\u4e3b'}</span>
              <p>{'\u3044\u3089\u3063\u3057\u3083\u3044\u3002\u4eca\u65e5\u306f\u3069\u306e\u30ab\u30fc\u30c9\u3092\u5f15\u3044\u3066\u3044\u304f\uff1f'}</p>
              <p>{'\u3053\u306e\u30ab\u30fc\u30c9\u306b\u306f\u3001\u65c5\u3092\u52a9\u3051\u308b\u4ef2\u9593\u306e\u529b\u304c\u5bbf\u3063\u3066\u308b\u3088\u3002'}</p>
              <p>{'\u8ab0\u304c\u6765\u308b\u304b\u306f\u3001\u958b\u3044\u3066\u304b\u3089\u306e\u304a\u697d\u3057\u307f\u3055\u3002'}</p>
            </article>
          </div>
          <div className="shop-menu-actions">
            <button className="primary-button" onClick={goToShopSupportSummon}>
              {freeSupportSummonUsed
                ? '\u30b5\u30dd\u30fc\u30c8\u53ec\u559a\u30ab\u30fc\u30c9\u3092\u8cb7\u3046'
                : '\u521d\u56de\u7121\u6599\u53ec\u559a\u3078'}
            </button>
            <button className="secondary-button" onClick={goToShopSupportList}>{'\u53ec\u559a\u6e08\u307f\u30b5\u30dd\u30fc\u30c8\u3092\u898b\u308b'}</button>
            <button className="secondary-button" onClick={goToAstoriaMap}>MAPへ戻る</button>
          </div>
        </section>
      )}

      {game.status === 'shopSupportSummon' && (
        <section className="menu-screen facility-screen shop-screen">
          <p className="eyebrow">Support Card Shop</p>
          <h1>{'\u30b5\u30dd\u30fc\u30c8\u53ec\u559a'}</h1>
          <div className="owned-coins-panel compact">
            <span>{'\u6240\u6301\u30b3\u30a4\u30f3'}</span>
            <strong>{ownedCoins}</strong>
          </div>
          <div className="shop-cost-card">
            <span>{freeSupportSummonUsed ? '\u53ec\u559a\u8cbb\u7528' : '\u521d\u56de\u9650\u5b9a'}</span>
            <strong>{freeSupportSummonUsed ? SHOP_SUPPORT_SUMMON_COST : '\u7121\u6599'}</strong>
            <p>
              {freeSupportSummonUsed
                ? '\u30b2\u30fc\u30e0\u5185\u30b3\u30a4\u30f3\u3067\u3001\u65c5\u3092\u52a9\u3051\u308b\u30b5\u30dd\u30fc\u30c8\u30ab\u30fc\u30c9\u30921\u679a\u958b\u304d\u307e\u3059\u3002'
                : '\u521d\u56de\u3060\u3051\u3001\u30b3\u30a4\u30f3\u6d88\u8cbb\u306a\u3057\u3067\u30b5\u30dd\u30fc\u30c8\u53ec\u559a\u30ab\u30fc\u30c9\u3092\u958b\u3051\u3089\u308c\u307e\u3059\u3002'}
            </p>
          </div>
          <article className={`formation-card support-card guild-summon-card shop-summon-card ${shopSummonResult ? 'has-support' : ''} summon-phase-${summonPhase}`}> 
            <span className="slot-label">{'\u30b5\u30dd\u30fc\u30c8\u53ec\u559a\u30ab\u30fc\u30c9'}</span>
            {shopSummonResult && summonPhase === 'done' ? (
              <>
                <img src={shopSummonResult.image} alt={shopSummonResult.name} />
                <div>
                  <h2>{shopSummonResult.name}</h2>
                  <strong>{shopSummonResult.role}</strong>
                  <p>{shopSummonResult.effectDescription}</p>
                  <p className="summon-success">Lv {getOwnedSupportLevel(ownedSupports, shopSummonResult.id)}</p>
                  <p className="summon-success">{'\u5e97\u4e3b'}「{SHOPKEEPER_SUPPORT_LINES[shopSummonResult.id]}」</p>
                </div>
              </>
            ) : (
              <SummonCardStage
                phase={summonPhase}
                cards={summonCards}
                revealingCardId={revealingCardId}
                cardBack={assetPaths.cardBack}
                onChoose={chooseSupportCard}
              />
            )}
          </article>
          {shopSummonCost > 0 && ownedCoins < shopSummonCost && summonPhase === 'idle' && (
            <p className="forge-warning">{'\u30b3\u30a4\u30f3\u304c\u8db3\u308a\u307e\u305b\u3093'}</p>
          )}
          <div className="shop-menu-actions">
            <button className="primary-button" onClick={buySupportSummon} disabled={!canStartShopSummon}>
              {summonPhase === 'idle' || summonPhase === 'done'
                ? freeSupportSummonUsed
                  ? '\u30b5\u30dd\u30fc\u30c8\u53ec\u559a\u30ab\u30fc\u30c9\u3092\u8cb7\u3046'
                  : '\u521d\u56de\u7121\u6599\u53ec\u559a'
                : '\u53ec\u559a\u4e2d...'}
            </button>
            <button className="secondary-button" onClick={goToShop} disabled={summonPhase === 'gate' || summonPhase === 'cards' || summonPhase === 'revealing'}>
              {'\u5e97\u4e3b\u306b\u623b\u308b'}
            </button>
            <button className="secondary-button" onClick={goToAstoriaMap} disabled={summonPhase === 'gate' || summonPhase === 'cards' || summonPhase === 'revealing'}>MAPへ戻る</button>
          </div>
        </section>
      )}

      {game.status === 'shopSupportList' && (
        <section className="menu-screen facility-screen shop-screen">
          <p className="eyebrow">Support Collection</p>
          <h1>{'\u53ec\u559a\u6e08\u307f\u30b5\u30dd\u30fc\u30c8'}</h1>
          <div className="owned-coins-panel compact">
            <span>{'\u6240\u6301\u30b3\u30a4\u30f3'}</span>
            <strong>{ownedCoins}</strong>
          </div>
          <div className="support-inventory">
            {ownedSupports.length === 0 ? (
              <p className="empty-inventory">{'\u307e\u3060\u53ec\u559a\u6e08\u307f\u30b5\u30dd\u30fc\u30c8\u306f\u3044\u307e\u305b\u3093\u3002\u307e\u305a\u306f\u30b5\u30dd\u30fc\u30c8\u53ec\u559a\u30ab\u30fc\u30c9\u3092\u8cb7\u3063\u3066\u307f\u3088\u3046\u3002'}</p>
            ) : (
              ownedSupports.map((ownedSupport) => {
                const support = getSupportById(ownedSupport.id);
                const isActive = selectedSupport?.id === support.id;
                return (
                  <article key={support.id} className={`support-list-card ${isActive ? 'is-active' : ''}`}>
                    <img src={support.image} alt={support.name} />
                    <div>
                      <h2>{support.name}</h2>
                      <strong>{support.role}</strong>
                      <p>{support.effectDescription}</p>
                      {isActive && <em className="equipped-badge">{'\u73fe\u5728\u540c\u884c\u4e2d'}</em>}
                    </div>
                    <span className="weapon-count">Lv {ownedSupport.level} / x{ownedSupport.count}</span>
                  </article>
                );
              })
            )}
          </div>
          <div className="shop-menu-actions">
            <button className="secondary-button" onClick={goToShop}>{'\u5e97\u4e3b\u306b\u623b\u308b'}</button>
            <button className="secondary-button" onClick={goToAstoriaMap}>MAPへ戻る</button>
          </div>
        </section>
      )}

      {game.status === 'gate' && (
        <section className="menu-screen gate-screen">
          <p className="eyebrow">Stage Select</p>
          <h1>出撃門</h1>
          <div className="owned-coins-panel">
            <span>所持コイン</span>
            <strong>{ownedCoins}</strong>
          </div>
          <div className="stage-select-list">
            {ASTORIA_GRASSLAND_STAGES.map((stage, index) => {
              const isSelected = selectedStageId === stage.id;
              return (
                <button
                  className={`stage-select-card ${isSelected ? 'is-selected' : ''}`}
                  key={stage.id}
                  type="button"
                  onClick={() => setSelectedStageId(stage.id)}
                >
                  <span>Stage {index + 1}</span>
                  <h2>{stage.name}</h2>
                  <p>{`\u96e3\u6613\u5ea6\uff1a${stage.difficultyLabel}`}</p>
                  <p>{`BOSS\uff1a${stage.bossName}`}</p>
                  <p>{`\u30af\u30ea\u30a2\u30dc\u30fc\u30ca\u30b9\uff1a+${stage.clearBonus}`}</p>
                </button>
              );
            })}
          </div>
          <article className="stage-card selected-stage-card">
            <span>{selectedStage.difficultyLabel}</span>
            <h2>{selectedStage.name}</h2>
            <p>{`BOSS\uff1a${selectedStage.bossName}`}</p>
            <p>{`\u30e1\u30a4\u30f3\uff1a${mainCharacter.name}`}</p>
            {selectedSupport ? (
              <>
                <p>{`\u540c\u884c\uff1a${selectedSupport.name} Lv ${selectedSupportLevel}`}</p>
                <p>{`\u52b9\u679c\uff1a${selectedSupport.effectDescription}`}</p>
              </>
            ) : (
              <p>{freeSupportSummonUsed ? '\u540c\u884c\uff1a\u306a\u3057\u3002G\u306e\u90e8\u5c4b\u3067\u30b5\u30dd\u30fc\u30c8\u3092\u9078\u307c\u3046\u3002' : '\u540c\u884c\uff1a\u306a\u3057\u3002\u521d\u56de\u7121\u6599\u53ec\u559a\u306f\u96d1\u8ca8\u5c4b\u3067\u3067\u304d\u307e\u3059\u3002'}</p>
            )}
            <p className="equipped-weapon-label">{`\u6b66\u5668\uff1a${mainWeaponLabel}`}</p>
            <p className="equipped-weapon-label">{`\u653b\u6483\uff1a${mainCharacter.attackLabel}`}</p>
            <button className="primary-button" onClick={begin} disabled={!selectedSupport}>
              {`${selectedStage.name}\u3078\u51fa\u6483`}
            </button>
          </article>
          <div className="prepare-actions">
            {!selectedSupport && (
              <button className="secondary-button" onClick={freeSupportSummonUsed ? goToPrepare : goToShopSupportSummon}>
                {freeSupportSummonUsed ? 'G\u306e\u90e8\u5c4b\u3067\u9078\u3076' : '\u96d1\u8ca8\u5c4b\u3067\u521d\u56de\u7121\u6599\u53ec\u559a'}
              </button>
            )}
            <button className="secondary-button" onClick={goToAstoriaMap}>
              MAP\u3078\u623b\u308b
            </button>
          </div>
        </section>
      )}

      {(game.status === 'playing' || game.status === 'paused') && (
        <section className="game-layout">
          <div className="hud">
            <div>
              <span>HP</span>
              <div className="meter">
                <div className="meter-fill hp" style={{ width: `${hpPercent}%` }} />
              </div>
            </div>
            <div className="hud-number">コイン {game.coinsCollected}</div>
            <div className="hud-number">時間 {Math.floor(game.elapsed)}s</div>
            <div className="hud-stage">{game.stageName}</div>
            <div className="hud-main">メイン：{mainCharacter.name}</div>
            <div className="hud-support">サポート：{selectedSupport?.name ?? '未召喚'}{selectedSupport ? ` Lv ${selectedSupportLevel}` : ''}</div>
            <div className="hud-weapon">{'\u6b66\u5668'}：{mainWeaponLabel}</div>
            <div className={`hud-no-damage ${game.hasTakenDamage ? 'is-failed' : ''}`}>
              {game.hasTakenDamage ? 'ノーダメ失敗' : 'ノーダメ継続中'}
            </div>
            <button className="pause-button" onClick={pauseGame} disabled={game.status === 'paused'}>
              一時停止
            </button>
            {game.isTraining && (
              <button className="pause-button training-exit-button" onClick={returnToTrainingGround}>
                訓練終了
              </button>
            )}
          </div>

          {game.boss && (
            <div className="boss-hud">
              <div className="boss-portrait-frame" aria-hidden="true">
                <img className="boss-portrait-image" src={bossHudImage} alt="boss portrait" />
              </div>
              <div className="boss-hud-status">
                <span>{game.boss.name}</span>
                <div className="meter boss-meter">
                  <div className="meter-fill boss-hp-fill" style={{ width: `${bossHpPercent}%` }} />
                </div>
              </div>
            </div>
          )}

          {game.bossIntroTimer > 0 && (
            <div className="boss-cutin" role="status" aria-live="polite">
              <strong>BOSS APPEARS!</strong>
              <span>{getStageById(game.stageId).bossName}</span>
            </div>
          )}

          <div
            className={`field ${game.status === 'paused' ? 'is-paused' : ''}`}
            ref={fieldRef}
            onPointerDown={(event) => updateDragTarget(event, fieldRef.current, dragTarget, Boolean(game.boss), game.status === 'playing')}
            onPointerMove={(event) => updateDragTarget(event, fieldRef.current, dragTarget, Boolean(game.boss), game.status === 'playing')}
            onPointerUp={() => {
              dragTarget.current = null;
            }}
            onPointerCancel={() => {
              dragTarget.current = null;
            }}
          >
            <div className="scroll-band band-one" />
            <div className="scroll-band band-two" />
            <div className="play-limit" />

            {mainCharacter.id === 'socho' && game.player.slashTimer > 0 && (
              <div
                className="slash"
                style={{
                  left: game.player.x - SLASH_HALF_WIDTH,
                  top: game.player.y - activeSlashRadius,
                  width: SLASH_HALF_WIDTH * 2,
                  height: activeSlashRadius,
                }}
              >
                <span className="slash-core" />
                <span className="slash-line line-one" />
                <span className="slash-line line-two" />
                <span className="slash-shock" />
              </div>
            )}
            {mainCharacter.id === 'socho' && game.player.slashTimer > 0 && sochoHasSlashWave && (
              <div
                className="slash-wave"
                style={{
                  left: game.player.x - sochoWeaponTuning.starWaveHalfWidth,
                  top: game.player.y - sochoWeaponTuning.starWaveRange,
                  width: sochoWeaponTuning.starWaveHalfWidth * 2,
                  height: sochoWeaponTuning.starWaveRange,
                }}
              >
                <span className="slash-wave-core" />
                <span className="slash-wave-stars" />
              </div>
            )}
            {mainCharacter.id === 'rokudo' && game.player.slashTimer > 0 && (
              <div
                className="shadow-slash"
                style={{
                  left: game.player.x - ROKUDO_SHADOW_SLASH_HALF_WIDTH,
                  top: game.player.y - activeShadowSlashRadius,
                  width: ROKUDO_SHADOW_SLASH_HALF_WIDTH * 2,
                  height: activeShadowSlashRadius,
                }}
              >
                <span className="shadow-slash-core" />
                <span className="shadow-slash-line line-one" />
                <span className="shadow-slash-line line-two" />
                <span className="shadow-slash-smoke" />
              </div>
            )}
            {mainCharacter.id === 'nanaichi' && game.player.slashTimer > 0 && (
              <div
                className="nanaichi-ice-slash"
                style={{
                  left: game.player.x - 58,
                  top: game.player.y - 92,
                  width: 116,
                  height: 82,
                  opacity: Math.min(1, game.player.slashTimer / NANAICHI_ICE_SWORD_VISIBLE_TIME),
                }}
              >
                <span className="nanaichi-ice-slash-arc" />
                <span className="nanaichi-ice-slash-edge" />
                <span className="nanaichi-ice-slash-spark spark-one" />
                <span className="nanaichi-ice-slash-spark spark-two" />
              </div>
            )}
            {mainCharacter.id === 'myoo' && game.player.slashTimer > 0 && (
              <div
                className="myoo-flame-slash"
                style={{
                  left: game.player.x - 62,
                  top: game.player.y - 96,
                  width: 124,
                  height: 88,
                  opacity: Math.min(1, game.player.slashTimer / MYOO_FLAME_SWORD_VISIBLE_TIME),
                }}
              >
                <span className="myoo-flame-slash-arc" />
                <span className="myoo-flame-slash-edge" />
                <span className="myoo-flame-slash-ember ember-one" />
                <span className="myoo-flame-slash-ember ember-two" />
              </div>
            )}
            {mainCharacter.id === 'ushimaru' && game.player.slashTimer > 0 && (
              <div
                className="spear-thrust-set"
                style={{
                  left: game.player.x - ushimaruWeaponTuning.spearHalfWidth - 24,
                  top: game.player.y - (game.boss ? USHIMARU_SPEAR_BOSS_RANGE : ushimaruWeaponTuning.spearRange),
                  width: ushimaruWeaponTuning.spearHalfWidth * 2 + 48,
                  height: game.boss ? USHIMARU_SPEAR_BOSS_RANGE : ushimaruWeaponTuning.spearRange,
                }}
              >
                {ushimaruWeaponTuning.thrustOffsets.map((offset) => (
                  <span
                    key={offset}
                    className="spear-thrust"
                    style={{
                      left: `calc(50% + ${offset}px)`,
                      width: ushimaruWeaponTuning.spearHalfWidth * 2,
                    }}
                  >
                    <i />
                  </span>
                ))}
              </div>
            )}
            {mainCharacter.id === 'yabuko-fm' && game.player.slashTimer > 0 && (
              <div
                className="hammer-breaker"
                style={{
                  left: game.player.x - yabukoFmWeaponTuning.hammerHalfWidth,
                  top: game.player.y - (game.boss ? YABUKO_FM_HAMMER_BOSS_RANGE : yabukoFmWeaponTuning.hammerRange),
                  width: yabukoFmWeaponTuning.hammerHalfWidth * 2,
                  height: game.boss ? YABUKO_FM_HAMMER_BOSS_RANGE : yabukoFmWeaponTuning.hammerRange,
                }}
              >
                <span className="hammer-breaker-head" />
                <span className="hammer-breaker-shock" />
              </div>
            )}
            {mainCharacter.id === 'yabuko-fm' && game.player.hammerBreakTimer > 0 && (
              <div
                className="starbreaker-wave"
                style={{
                  left: game.player.x - yabukoFmWeaponTuning.starbreakerHalfWidth,
                  top: game.player.y - yabukoFmWeaponTuning.starbreakerRange,
                  width: yabukoFmWeaponTuning.starbreakerHalfWidth * 2,
                  height: yabukoFmWeaponTuning.starbreakerRange,
                  opacity: Math.min(1, game.player.hammerBreakTimer / STARBREAKER_SHOCKWAVE_VISIBLE_TIME),
                }}
              >
                <span className="starbreaker-core" />
                <span className="starbreaker-cracks" />
              </div>
            )}
            {mainCharacter.id === 'rockel' && game.player.slashTimer > 0 && (
              <div
                className="axe-swing"
                style={{
                  left: game.player.x - rockelWeaponTuning.axeHalfWidth,
                  top: game.player.y - (game.boss ? ROCKEL_AXE_BOSS_RANGE : rockelWeaponTuning.axeRange),
                  width: rockelWeaponTuning.axeHalfWidth * 2,
                  height: game.boss ? ROCKEL_AXE_BOSS_RANGE : rockelWeaponTuning.axeRange,
                }}
              >
                <span className="axe-swing-arc" />
                <span className="axe-swing-steel" />
              </div>
            )}
            {mainCharacter.id === 'rockel' && game.player.axeBreakTimer > 0 && (
              <div
                className="mountain-breaker"
                style={{
                  left: game.player.x - rockelWeaponTuning.strongHalfWidth,
                  top: game.player.y - rockelWeaponTuning.strongRange,
                  width: rockelWeaponTuning.strongHalfWidth * 2,
                  height: rockelWeaponTuning.strongRange,
                  opacity: Math.min(1, game.player.axeBreakTimer / MOUNTAIN_BREAKER_VISIBLE_TIME),
                }}
              >
                <span className="mountain-breaker-arc" />
                <span className="mountain-breaker-shock" />
              </div>
            )}
            {game.supportRockelBreak.timer > 0 && (
              <div
                className="support-rockel-break"
                style={{
                  left: game.player.x - ROCKEL_SUPPORT_BREAK_HALF_WIDTH,
                  top: game.player.y - ROCKEL_SUPPORT_BREAK_RANGE,
                  width: ROCKEL_SUPPORT_BREAK_HALF_WIDTH * 2,
                  height: ROCKEL_SUPPORT_BREAK_RANGE,
                  opacity: Math.min(1, game.supportRockelBreak.timer / ROCKEL_SUPPORT_BREAK_DURATION),
                }}
              >
                <span className="support-rockel-break-arc" />
                <span className="support-rockel-break-spark" />
              </div>
            )}
            {game.supportSochoSlash.timer > 0 && (
              <div
                className="support-socho-slash"
                style={{
                  left: game.player.x - SOCHO_SUPPORT_SLASH_HALF_WIDTH,
                  top: game.player.y - SOCHO_SUPPORT_SLASH_RANGE,
                  width: SOCHO_SUPPORT_SLASH_HALF_WIDTH * 2,
                  height: SOCHO_SUPPORT_SLASH_RANGE,
                  opacity: Math.min(1, game.supportSochoSlash.timer / SOCHO_SUPPORT_SLASH_DURATION),
                }}
              >
                <span className="support-socho-slash-core" />
                <span className="support-socho-slash-line line-one" />
                <span className="support-socho-slash-line line-two" />
              </div>
            )}

            {game.supportPoisonSmokes.map((smoke) => (
              <div
                className="support-poison-smoke"
                key={smoke.id}
                style={{
                  left: smoke.x - ROKUDO_SUPPORT_POISON_RADIUS,
                  top: smoke.y - ROKUDO_SUPPORT_POISON_RADIUS,
                  width: ROKUDO_SUPPORT_POISON_RADIUS * 2,
                  height: ROKUDO_SUPPORT_POISON_RADIUS * 2,
                  opacity: Math.min(1, smoke.timer / 0.7),
                }}
              >
                <span className="support-poison-core" />
                <span className="support-poison-ring" />
              </div>
            ))}

            {game.coins.map((coin) => (
              <div
                key={coin.id}
                className={`coin ${coin.isBonus ? 'is-bonus' : ''} ${
                  isCoinAttracted(coin.x, coin.y, game.player.x, game.player.y, supportId.current, supportLevel.current) ? 'is-attracted' : ''
                }`}
                style={place(coin.x, coin.y, 18)}
              >
                $
              </div>
            ))}

            {game.hearts.map((heart) => (
              <div
                key={heart.id}
                className={`heart-pickup heart-${heart.heartType}`}
                style={place(heart.x, heart.y, 24)}
                aria-label="healing heart"
              >
                ♥
              </div>
            ))}

            {game.enemies.map((enemy) => (
              <div
                key={enemy.id}
                className={`enemy enemy-${enemy.kind} ${(enemy.hitTimer ?? 0) > 0 ? 'is-slashed' : ''}`}
                style={place(enemy.x, enemy.y, enemy.radius * 2)}
              >
                <img src={assetPaths.enemies[enemy.kind]} alt={enemyLabels[enemy.kind]} />
              </div>
            ))}

            {game.bullets.map((bullet) => (
              <div key={bullet.id} className="enemy-bullet" style={place(bullet.x, bullet.y, bullet.radius * 2)} />
            ))}

            {game.supportBullets.map((bullet) => (
              <div key={bullet.id} className="support-bullet" style={place(bullet.x, bullet.y, bullet.radius * 2.7)} />
            ))}

            {game.turrets.map((turret) => (
              <div
                key={turret.id}
                className={`deli-turret ${turret.timer < 1.2 ? 'is-fading' : ''}`}
                style={place(turret.x, turret.y, 44)}
              />
            ))}

            {game.supportTurrets.map((turret) => (
              <div
                key={turret.id}
                className={`deli-turret support-deli-turret ${turret.timer < 1 ? 'is-fading' : ''}`}
                style={place(turret.x, turret.y, 36)}
              />
            ))}

            {game.playerArrows.map((arrow) => (
              <div
                key={arrow.id}
                className={`player-arrow ${arrow.kind === 'gun' ? 'player-gunshot' : ''} ${arrow.kind === 'spear' ? 'player-spear' : ''} ${
                  arrow.kind === 'turret' ? 'turret-shot' : ''
                } ${arrow.kind === 'ice' ? 'player-ice-shard' : ''} ${arrow.kind === 'flame' ? 'player-flame-bullet' : ''}`}
                style={place(
                  arrow.x,
                  arrow.y,
                  arrow.radius * 2.2,
                  arrow.kind === 'gun' ? 18 : arrow.kind === 'spear' ? 42 : arrow.kind === 'ice' || arrow.kind === 'flame' ? 20 : 34,
                )}
              />
            ))}

            {myououGaruda && (
              <div
                className={`garuda-sweep garuda-${myououGaruda.direction}`}
                style={place(myououGaruda.x, myououGaruda.y, myououGaruda.width, myououGaruda.height)}
              >
                <img className="garuda-frame" src={myououGaruda.frameSrc} alt="" />
                <span className="garuda-aura" />
                <span className="garuda-trail" />
              </div>
            )}

            {hibikiShield && (
              <div
                className={`hibiki-shield ${hibikiShield.isGuarding ? 'is-guarding' : ''}`}
                style={place(hibikiShield.x, hibikiShield.y, hibikiShield.width, hibikiShield.height)}
              >
                <span>{hibikiShield.blocksRemaining}</span>
              </div>
            )}

            {game.boss && (
              <div
                className={`boss ${(game.boss.hitTimer ?? 0) > 0 ? 'is-slashed' : ''}`}
                style={{
                  ...place(game.boss.x, game.boss.y, game.boss.radius * 2),
                  backgroundImage: `url(${game.boss.image})`,
                }}
              >
                {game.boss.name}
              </div>
            )}

            {game.effects.map((effect) => (
              <div
                key={effect.id}
                className={`floating-effect effect-${effect.kind}`}
                style={place(effect.x, effect.y, effect.kind === 'coin' ? 30 : 42)}
              >
                {effect.kind === 'hit' && <span className="spark" />}
                {effect.text && <strong>{effect.text}</strong>}
              </div>
            ))}

            <div
              className={`player ${game.player.invincibleTimer > 0 ? 'is-hit' : ''}`}
              style={place(game.player.x, game.player.y, game.player.radius * 2)}
            >
              {mainCharacter.image ? <img src={mainCharacter.image} alt={mainCharacter.name} /> : mainCharacter.name}
            </div>

            {game.status === 'paused' && (
              <div className="pause-overlay" role="dialog" aria-modal="true" aria-labelledby="pause-title">
                <div className="pause-panel">
                  <p className="eyebrow">Pause</p>
                  <h2 id="pause-title">一時停止</h2>
                  <div className="pause-actions">
                    <button className="primary-button" onClick={resumeGame}>
                      再開
                    </button>
                    <button className="secondary-button" onClick={retryCurrentRun}>
                      はじめからやり直す
                    </button>
                    {game.isTraining && (
                      <button className="secondary-button" onClick={returnToTrainingGround}>
                        訓練場へ戻る
                      </button>
                    )}
                    <button className="secondary-button" onClick={goToPrepare}>
                      出撃準備へ戻る
                    </button>
                    <button className="secondary-button" onClick={goToGate}>
                      Back to Gate
                    </button>
                    <button className="secondary-button" onClick={goToAstoriaMap}>
                      Back to Astoria MAP
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="instructions">
            {game.isTraining && <span>訓練中：報酬コインなし / 一時停止から訓練場へ戻れます</span>}
            <span>移動: WASD / 矢印キー / ドラッグ / スマホ左下ジョイスティック</span>
            <span>攻撃: クールタイムごとに自動斬撃</span>
          </div>

          <div className="mobile-controls in-game-controls" aria-hidden={game.status !== 'playing'}>
            <div
              className={`joystick-base ${joystick.active ? 'is-active' : ''}`}
              ref={joystickBaseRef}
              onPointerDown={startJoystick}
              onPointerMove={updateJoystick}
              onPointerUp={resetJoystick}
              onPointerCancel={resetJoystick}
            >
              <span
                className="joystick-knob"
                style={{ transform: `translate(${joystick.x}px, ${joystick.y}px)` }}
              />
            </div>
            <span className="mobile-control-label">スマホ移動</span>
          </div>
        </section>
      )}

      {(game.status === 'clear' || game.status === 'gameOver') && (
        <section className={`menu-screen result-screen ${game.status}`}>
          <p className="eyebrow">{game.stageName}</p>
          <h1>{screenTitle}</h1>
          <p className="lead">{game.message}</p>
          <div className="result-grid">
            <div>
              <span>コイン</span>
              <strong>{game.coinsCollected}</strong>
            </div>
            <div>
              <span>撃破数</span>
              <strong>{game.defeatedEnemies}</strong>
            </div>
            <div>
              <span>時間</span>
              <strong>{Math.floor(game.elapsed)}s</strong>
            </div>
            <div>
              <span>{'\u6b66\u5668'}</span>
              <strong>{mainWeaponLabel}</strong>
            </div>
            <div>
              <span>メイン</span>
              <strong>{mainCharacter.name}</strong>
            </div>
            <div>
              <span>攻撃</span>
              <strong>{mainCharacter.attackLabel}</strong>
            </div>
          </div>
          {game.isTraining && (
            <div className="reward-breakdown training-result-note">
              <div>
                <span>訓練報酬</span>
                <strong>なし</strong>
              </div>
              <div>
                <span>所持コイン</span>
                <strong>{ownedCoins}</strong>
              </div>
            </div>
          )}
          {rewardSummary && (
            <div className="reward-breakdown">
              <div>
                <span>ステージ獲得</span>
                <strong>{rewardSummary.stageCoins}</strong>
              </div>
              {rewardSummary.status === 'clear' ? (
                <div>
                  <span>クリアボーナス</span>
                  <strong>+{rewardSummary.clearBonus}</strong>
                </div>
              ) : (
                <div>
                  <span>持ち帰り率</span>
                  <strong>{Math.round(rewardSummary.keepRate * 100)}%</strong>
                </div>
              )}
              {rewardSummary.status === 'clear' && (
                <div className={rewardSummary.isNoDamageClear ? 'no-damage-reward achieved' : 'no-damage-reward'}>
                  <span>{rewardSummary.isNoDamageClear ? 'ノーダメージクリア！' : 'ノーダメージボーナス'}</span>
                  <strong>
                    {rewardSummary.isNoDamageClear
                      ? `x${rewardSummary.noDamageMultiplier} / +${rewardSummary.noDamageBonus}`
                      : '未達成'}
                  </strong>
                </div>
              )}
              {rewardSummary.status === 'clear' && (
                <div>
                  <span>通常クリア報酬</span>
                  <strong>{rewardSummary.baseClearReward}</strong>
                </div>
              )}
              <div>
                <span>今回加算</span>
                <strong>+{rewardSummary.addedCoins}</strong>
              </div>
              <div>
                <span>所持コイン</span>
                <strong>{ownedCoins}</strong>
              </div>
            </div>
          )}
          <div className="result-actions">
            <button className="primary-button" onClick={retryCurrentRun}>
              Retry
            </button>
            {game.isTraining && (
              <button className="secondary-button" onClick={returnToTrainingGround}>
                訓練場へ戻る
              </button>
            )}
            <button className="secondary-button" onClick={goToGate}>
              Back to Gate
            </button>
            <button className="secondary-button" onClick={goToAstoriaMap}>
              Back to Astoria MAP
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

function SummonCardStage({
  phase,
  cards,
  revealingCardId,
  cardBack,
  onChoose,
}: {
  phase: SummonPhase;
  cards: SupportCharacter[];
  revealingCardId: string | null;
  cardBack: string;
  onChoose: (support: SupportCharacter) => void;
}) {
  if (phase === 'idle') {
    return (
      <div className="summon-gate">
        <img src="/assets/tcg/gate-white.png" alt="" />
        <p>未召喚</p>
      </div>
    );
  }

  if (phase === 'gate') {
    return (
      <div className="summon-gate is-summoning">
        <img src="/assets/tcg/gate-white.png" alt="" />
        <p>星門起動中...</p>
      </div>
    );
  }

  return (
    <div className={`summon-card-stage is-${phase}`}>
      <p className="summon-instruction">{phase === 'cards' ? '1枚選んでください' : 'カード開示中...'}</p>
      <div className="summon-card-row">
        {cards.map((card, index) => {
          const isRevealing = revealingCardId === card.id;
          const isDimmed = phase === 'revealing' && !isRevealing;

          return (
            <button
              key={card.id}
              className={`summon-card pick-${index} ${isRevealing ? 'is-revealing' : ''} ${isDimmed ? 'is-dimmed' : ''}`}
              onClick={() => onChoose(card)}
              disabled={phase !== 'cards'}
              type="button"
            >
              <span className="card-inner">
                <span className="card-face card-back">
                  <img src={cardBack} alt="" />
                </span>
                <span className="card-face card-front">
                  <img src={card.image} alt="" />
                  <strong>{card.name}</strong>
                  <em>{card.role}</em>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function shuffleSupports(candidates: SupportCharacter[]) {
  return [...candidates]
    .map((candidate) => ({ candidate, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ candidate }) => candidate);
}

function getMoveVector(game: GameState, keys: Set<string>, target: Vector | null, joystick: Vector | null): Vector {
  if (joystick && game.status === 'playing') {
    return joystick;
  }

  if (target && game.status === 'playing') {
    const dx = target.x - game.player.x;
    const dy = target.y - game.player.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 8) return { x: 0, y: 0 };
    return { x: dx / distance, y: dy / distance };
  }

  const move = { x: 0, y: 0 };
  keys.forEach((key) => {
    const vector = keyMap[key];
    if (!vector) return;
    move.x += vector.x;
    move.y += vector.y;
  });
  return move;
}

function updateDragTarget(
  event: React.PointerEvent<HTMLDivElement>,
  field: HTMLDivElement | null,
  targetRef: React.MutableRefObject<Vector | null>,
  isBossBattle: boolean,
  isEnabled: boolean,
) {
  if (!isEnabled || !field || event.pointerType === 'mouse') return;
  const rect = field.getBoundingClientRect();
  const scaleX = FIELD_WIDTH / rect.width;
  const scaleY = FIELD_HEIGHT / rect.height;
  const limits = isBossBattle ? BOSS_PLAYER_LIMITS : PLAYER_LIMITS;
  targetRef.current = {
    x: clamp((event.clientX - rect.left) * scaleX, limits.minX, limits.maxX),
    y: clamp((event.clientY - rect.top) * scaleY, limits.minY, limits.maxY),
  };
}

function place(x: number, y: number, width: number, height = width) {
  return {
    width,
    height,
    transform: `translate(${x - width / 2}px, ${y - height / 2}px)`,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function isCoinAttracted(
  coinX: number,
  coinY: number,
  playerX: number,
  playerY: number,
  supportId: SupportId | null,
  supportLevel: number,
) {
  return Math.hypot(playerX - coinX, playerY - coinY) < getCoinMagnetRadius(supportId, supportLevel);
}

export default App;
