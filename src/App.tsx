import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BOSS_PLAYER_LIMITS,
  FIELD_HEIGHT,
  FIELD_WIDTH,
  PLAYER_LIMITS,
  SLASH_BOSS_RADIUS,
  SLASH_HALF_WIDTH,
  SLASH_RADIUS,
  STAGE_NAME,
  FORGE_ANIMATION_DURATION,
  FORGE_WEAPON_COST,
  SHOP_SUPPORT_SUMMON_COST,
  STAR_SLASH_WAVE_HALF_WIDTH,
  STAR_SLASH_WAVE_RANGE,
} from './game/constants';
import { createInitialGameState, startGame, updateGame } from './game/logic';
import { calculateCoinReward } from './game/rewards';
import {
  loadOwnedCoins,
  loadOwnedWeapons,
  loadEquippedWeapons,
  loadOwnedSupports,
  resetOwnedCoins,
  resetOwnedWeapons,
  saveOwnedCoins,
  saveEquippedWeapons,
  saveOwnedSupports,
  saveOwnedWeapons,
} from './game/storage';
import {
  addOwnedSupport,
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
  getEquippedSochoWeapon,
  getSochoWeaponOptions,
  hasSochoSlashWave,
  WEAPON_RARITY_WEIGHTS,
} from './game/weapons';
import type { EquippedWeaponsByCharacter, OwnedWeapon, WeaponDefinition } from './game/weapons';

type SummonPhase = 'idle' | 'gate' | 'cards' | 'revealing' | 'done';
type SummonContext = 'guildFree' | 'shopPaid';

type JoystickState = {
  x: number;
  y: number;
  active: boolean;
};

type ForgeResult = {
  weapon: WeaponDefinition;
  isNew: boolean;
  sagLine: string;
};

type MapFacilityId = 'guildHouse' | 'forge' | 'shop' | 'gate';
type GuildHotspotId = 'party' | 'summon' | 'equipment' | 'weapons' | 'map';

const astoriaFacilities: Array<{
  id: MapFacilityId;
  label: string;
  xPercent: number;
  yPercent: number;
}> = [
  { id: 'guildHouse', label: 'Gの部屋', xPercent: 75, yPercent: 22 },
  { id: 'forge', label: '鍛冶屋', xPercent: 13, yPercent: 31 },
  { id: 'shop', label: '雑貨屋', xPercent: 13, yPercent: 47 },
  { id: 'gate', label: '門', xPercent: 50, yPercent: 76 },
];

const guildLobbyHotspots: Array<{
  id: GuildHotspotId;
  label: string;
  xPercent: number;
  yPercent: number;
}> = [
  { id: 'party', label: '\u7de8\u6210', xPercent: 23, yPercent: 72 },
  { id: 'summon', label: '\u30b5\u30dd\u30fc\u30c8\u53ec\u559a', xPercent: 51, yPercent: 47 },
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
  const [selectedSupport, setSelectedSupport] = useState<SupportCharacter | null>(null);
  const [summonPhase, setSummonPhase] = useState<SummonPhase>('idle');
  const [summonCards, setSummonCards] = useState<SupportCharacter[]>([]);
  const [revealingCardId, setRevealingCardId] = useState<string | null>(null);
  const [joystick, setJoystick] = useState<JoystickState>({ x: 0, y: 0, active: false });
  const [ownedCoins, setOwnedCoins] = useState(() => loadOwnedCoins());
  const [ownedWeapons, setOwnedWeapons] = useState<OwnedWeapon[]>(() => loadOwnedWeapons());
  const [ownedSupports, setOwnedSupports] = useState<OwnedSupport[]>(() => loadOwnedSupports());
  const [equippedWeapons, setEquippedWeapons] = useState<EquippedWeaponsByCharacter>(() => loadEquippedWeapons());
  const [forgeResult, setForgeResult] = useState<ForgeResult | null>(null);
  const [isForging, setIsForging] = useState(false);
  const [summonContext, setSummonContext] = useState<SummonContext>('guildFree');
  const [shopSummonResult, setShopSummonResult] = useState<SupportCharacter | null>(null);
  const supportId = useRef<SupportId | null>(null);
  const equippedWeaponId = useRef('iron-tachi');
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
          equippedWeaponId.current,
        ),
      );
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const hpPercent = Math.max(0, (game.player.hp / game.player.maxHp) * 100);
  const bossHpPercent = game.boss ? Math.max(0, (game.boss.hp / game.boss.maxHp) * 100) : 0;
  const activeSlashRadius = game.boss ? SLASH_BOSS_RADIUS : SLASH_RADIUS;
  const hibikiShield = getHibikiShieldView(game);
  const myououGaruda = getMyououGarudaView(game);
  const equippedSochoWeapon = useMemo(() => getEquippedSochoWeapon(equippedWeapons), [equippedWeapons]);
  const sochoWeaponOptions = useMemo(() => getSochoWeaponOptions(ownedWeapons), [ownedWeapons]);
  const sochoHasSlashWave = hasSochoSlashWave(equippedSochoWeapon.id);
  const screenTitle = useMemo(() => {
    if (game.status === 'clear') return '星門、沈黙。';
    if (game.status === 'gameOver') return '撤退。';
    return 'Gの部屋：星門シューティング';
  }, [game.status]);
  const rewardSummary = useMemo(() => calculateCoinReward(game.status, game.coinsCollected), [game.status, game.coinsCollected]);

  useEffect(() => {
    if (!rewardSummary) return;

    const resultKey = `${rewardSummary.status}:${Math.floor(game.elapsed * 1000)}:${game.defeatedEnemies}:${rewardSummary.stageCoins}`;
    if (rewardedResultKey.current === resultKey) return;
    rewardedResultKey.current = resultKey;

    setOwnedCoins((current) => {
      const nextCoins = current + rewardSummary.addedCoins;
      saveOwnedCoins(nextCoins);
      return nextCoins;
    });
  }, [game.defeatedEnemies, game.elapsed, rewardSummary]);

  useEffect(() => {
    equippedWeaponId.current = equippedSochoWeapon.id;
  }, [equippedSochoWeapon.id]);

  const begin = () => {
    if (!selectedSupport) return;
    pressedKeys.current.clear();
    dragTarget.current = null;
    resetJoystick();
    rewardedResultKey.current = null;
    lastFrame.current = null;
    setGame(startGame());
  };

  const goToAstoriaMap = () => {
    pressedKeys.current.clear();
    dragTarget.current = null;
    resetJoystick();
    lastFrame.current = null;
    setGame((current) => ({ ...current, status: 'astoriaMap' }));
  };

  const goToPrepare = () => {
    pressedKeys.current.clear();
    dragTarget.current = null;
    resetJoystick();
    lastFrame.current = null;
    setGame((current) => ({ ...current, status: 'guildLobby' }));
  };

  const goToGuildLobby = () => {
    goToPrepare();
  };

  const goToGuildParty = () => {
    setGame((current) => ({ ...current, status: 'guildParty' }));
  };

  const goToGuildSummon = () => {
    setGame((current) => ({ ...current, status: 'guildSummon' }));
  };

  const goToGuildEquipment = () => {
    setGame((current) => ({ ...current, status: 'guildEquipment' }));
  };

  const goToGuildWeapons = () => {
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
    setSummonContext('shopPaid');
    setSummonPhase('idle');
    setSummonCards([]);
    setRevealingCardId(null);
    setShopSummonResult(null);
    setGame((current) => ({ ...current, status: 'shopSupportSummon' }));
  };

  const goToShopSupportList = () => {
    setGame((current) => ({ ...current, status: 'shopSupportList' }));
  };

  const goToGate = () => {
    pressedKeys.current.clear();
    dragTarget.current = null;
    resetJoystick();
    lastFrame.current = null;
    setGame((current) => ({ ...current, status: 'gate' }));
  };

  const goToMapFacility = (facilityId: MapFacilityId) => {
    if (facilityId === 'guildHouse') goToPrepare();
    if (facilityId === 'forge') goToForge();
    if (facilityId === 'shop') goToShop();
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

  const summonSupport = () => {
    if (selectedSupport || summonPhase !== 'idle') return;

    setSummonContext('guildFree');
    setSummonPhase('gate');
    window.setTimeout(() => {
      setSummonCards(shuffleSupports(supportCandidates));
      setSummonPhase('cards');
    }, 650);
  };

  const buySupportSummon = () => {
    if (ownedCoins < SHOP_SUPPORT_SUMMON_COST || (summonPhase !== 'idle' && summonPhase !== 'done')) return;

    const nextCoins = ownedCoins - SHOP_SUPPORT_SUMMON_COST;
    setOwnedCoins(nextCoins);
    saveOwnedCoins(nextCoins);
    setShopSummonResult(null);
    setSummonContext('shopPaid');
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
      setOwnedSupports((current) => {
        const nextSupports = addOwnedSupport(current, support.id);
        saveOwnedSupports(nextSupports);
        return nextSupports;
      });
      if (summonContext === 'shopPaid') {
        setShopSummonResult(support);
      }
      setSummonPhase('done');
    }, 760);
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

      setOwnedWeapons(nextWeapons);
      saveOwnedWeapons(nextWeapons);
      setForgeResult({ weapon, isNew, sagLine: FORGE_RESULT_LINES[weapon.rarity] });
      setIsForging(false);
    }, FORGE_ANIMATION_DURATION);
  };

  const resetSavedWeapons = () => {
    if (!window.confirm('所持武器をリセットしますか？')) return;
    resetOwnedWeapons();
    setOwnedWeapons([]);
    setForgeResult(null);
  };

  const equipSochoWeapon = (weaponId: string) => {
    const nextEquippedWeapons = { ...equippedWeapons, socho: weaponId };
    setEquippedWeapons(nextEquippedWeapons);
    saveEquippedWeapons(nextEquippedWeapons);
  };

  return (
    <main className="app-shell">
      {game.status === 'title' && (
        <section className="menu-screen title-screen">
          <div>
            <p className="eyebrow">MVP / アストリア草原</p>
            <h1>Gの部屋：星門シューティング</h1>
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
            <img className="guild-lobby-7171" src="/assets/tcg/support-7171.png" alt="7171" />
            {guildLobbyHotspots.map((hotspot) => (
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
        <section className="menu-screen prepare-screen guild-subscreen">
          <p className="eyebrow">Guild House</p>
          <h1>{'\u7de8\u6210'}</h1>
          <div className="owned-coins-panel compact">
            <span>{'\u6240\u6301\u30b3\u30a4\u30f3'}</span>
            <strong>{ownedCoins}</strong>
          </div>
          <div className="formation-grid">
            <article className="formation-card main-card">
              <span className="slot-label">{'\u30e1\u30a4\u30f3'}</span>
              <img src={assetPaths.player} alt="Socho" />
              <div>
                <h2>{'\u7dcf\u9577'}</h2>
                <p>{'\u524d\u65b9\u534a\u5186\u65ac\u6483\u3067\u524d\u7dda\u3092\u5207\u308a\u958b\u304f\u30e1\u30a4\u30f3\u30ad\u30e3\u30e9\u3002'}</p>
                <p className="equipped-weapon-label">{'\u6b66\u5668'}：{equippedSochoWeapon.name}</p>
              </div>
            </article>
            <article className={`formation-card support-card ${selectedSupport ? 'has-support' : ''}`}> 
              <span className="slot-label">{'\u30b5\u30dd\u30fc\u30c8'}</span>
              {selectedSupport ? (
                <>
                  <img src={selectedSupport.image} alt={selectedSupport.name} />
                  <div>
                    <h2>{selectedSupport.name}</h2>
                    <strong>{selectedSupport.role}</strong>
                    <p>{selectedSupport.description}</p>
                  </div>
                </>
              ) : (
                <div className="empty-support">{'\u672a\u53ec\u559a\u3067\u3059\u3002\u30b5\u30dd\u30fc\u30c8\u53ec\u559a\u3067\u4ef2\u9593\u3092\u8fce\u3048\u3066\u304f\u3060\u3055\u3044\u3002'}</div>
              )}
            </article>
          </div>
          <div className="prepare-actions">
            <button className="primary-button" onClick={goToGate} disabled={!selectedSupport}>Go to Gate</button>
            <button className="secondary-button" onClick={goToGuildLobby}>{'\u30ed\u30d3\u30fc\u3078\u623b\u308b'}</button>
          </div>
        </section>
      )}

      {game.status === 'guildSummon' && (
        <section className="menu-screen prepare-screen guild-subscreen">
          <p className="eyebrow">Guild House</p>
          <h1>{'\u30b5\u30dd\u30fc\u30c8\u53ec\u559a'}</h1>
          <div className="owned-coins-panel compact">
            <span>{'\u6240\u6301\u30b3\u30a4\u30f3'}</span>
            <strong>{ownedCoins}</strong>
          </div>
          <article className={`formation-card support-card guild-summon-card ${selectedSupport ? 'has-support' : ''} summon-phase-${summonPhase}`}> 
            <span className="slot-label">{'\u30b5\u30dd\u30fc\u30c8'}</span>
            {selectedSupport ? (
              <>
                <img src={selectedSupport.image} alt={selectedSupport.name} />
                <div>
                  <h2>{selectedSupport.name}</h2>
                  <strong>{selectedSupport.role}</strong>
                  <p>{selectedSupport.description}</p>
                  <p className="summon-success">{'\u53ec\u559a\u6e08\u307f'}</p>
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
          <div className="prepare-actions">
            <button className="secondary-button" onClick={summonSupport} disabled={Boolean(selectedSupport) || summonPhase !== 'idle'}>
              {selectedSupport ? '\u53ec\u559a\u6e08\u307f' : summonPhase === 'idle' ? '\u521d\u56de\u7121\u6599\u30b5\u30dd\u30fc\u30c8\u53ec\u559a' : '\u30ab\u30fc\u30c9\u3092\u9078\u629e\u4e2d'}
            </button>
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
            <span>{'\u30e1\u30a4\u30f3\u30ad\u30e3\u30e9\uff1a\u7dcf\u9577'}</span>
            <h2>{'\u73fe\u5728\u88c5\u5099\u4e2d\u306e\u6b66\u5668'}：{equippedSochoWeapon.name}</h2>
            <p>{equippedSochoWeapon.owner} / {equippedSochoWeapon.type} / {equippedSochoWeapon.rarity}</p>
            <p>{equippedSochoWeapon.description}</p>
            <p className="weapon-effect-line">{'\u52b9\u679c'}：{equippedSochoWeapon.effectDescription}</p>
          </article>
          <div className="equipment-list">
            <h2>{'\u7dcf\u9577\u304c\u88c5\u5099\u3067\u304d\u308b\u6240\u6301\u6b66\u5668'}</h2>
            {sochoWeaponOptions.length === 0 ? (
              <p className="empty-inventory">{'\u7dcf\u9577\u7528\u306e\u6b66\u5668\u3092\u6301\u3063\u3066\u3044\u307e\u305b\u3093\u3002\u30b5\u30c3\u30b0\u306e\u935b\u51b6\u5c4b\u3067\u935b\u9020\u3057\u3066\u307f\u3088\u3046\u3002'}</p>
            ) : (
              sochoWeaponOptions.map((weapon) => {
                const isEquipped = equippedSochoWeapon.id === weapon.id;
                return (
                  <article key={weapon.id} className={`weapon-card equipment-weapon-card rarity-${weapon.rarity} ${isEquipped ? 'is-equipped' : ''}`}> 
                    <div>
                      <h3>{weapon.name}</h3>
                      <strong>{weapon.owner} / {weapon.type} / {weapon.rarity}</strong>
                    </div>
                    <span className="weapon-count">x{weapon.count}</span>
                    <p>{weapon.description}</p>
                    <p className="weapon-effect-line">{'\u52b9\u679c'}：{weapon.effectDescription}</p>
                    <button className="secondary-button" onClick={() => equipSochoWeapon(weapon.id)} disabled={isEquipped}>
                      {isEquipped ? '\u88c5\u5099\u4e2d' : '\u88c5\u5099\u3059\u308b'}
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
                  <div>
                    <h3>{weapon.name}</h3>
                    <strong>{weapon.owner} / {weapon.type} / {weapon.rarity}</strong>
                    {equippedSochoWeapon.id === weapon.id && <em className="equipped-badge">{'\u88c5\u5099\u4e2d'}</em>}
                  </div>
                  <span className="weapon-count">x{weapon.count}</span>
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
            <div className={`forge-anvil ${isForging ? 'is-forging' : ''}`} aria-hidden="true">
              <span className="forge-glow" />
              <span className="forge-flash" />
              <span className="forge-hammer">Hammer</span>
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
              <h2>{forgeResult.weapon.name}</h2>
              <strong>{forgeResult.weapon.owner} / {forgeResult.weapon.type} / {forgeResult.weapon.rarity}</strong>
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
                  <div>
                    <h3>{weapon.name}</h3>
                    <strong>{weapon.owner} / {weapon.type} / {weapon.rarity}</strong>
                    {equippedSochoWeapon.id === weapon.id && <em className="equipped-badge">{'\u88c5\u5099\u4e2d'}</em>}
                  </div>
                  <span className="weapon-count">x{weapon.count}</span>
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
            <button className="primary-button" onClick={goToShopSupportSummon}>{'\u30b5\u30dd\u30fc\u30c8\u53ec\u559a\u30ab\u30fc\u30c9\u3092\u8cb7\u3046'}</button>
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
            <span>{'\u53ec\u559a\u8cbb\u7528'}</span>
            <strong>{SHOP_SUPPORT_SUMMON_COST}</strong>
            <p>{'\u30b2\u30fc\u30e0\u5185\u30b3\u30a4\u30f3\u3067\u3001\u65c5\u3092\u52a9\u3051\u308b\u30b5\u30dd\u30fc\u30c8\u30ab\u30fc\u30c9\u30921\u679a\u958b\u304d\u307e\u3059\u3002'}</p>
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
          {ownedCoins < SHOP_SUPPORT_SUMMON_COST && summonPhase === 'idle' && (
            <p className="forge-warning">{'\u30b3\u30a4\u30f3\u304c\u8db3\u308a\u307e\u305b\u3093'}</p>
          )}
          <div className="shop-menu-actions">
            <button className="primary-button" onClick={buySupportSummon} disabled={ownedCoins < SHOP_SUPPORT_SUMMON_COST || (summonPhase !== 'idle' && summonPhase !== 'done')}>
              {summonPhase === 'idle' || summonPhase === 'done' ? '\u30b5\u30dd\u30fc\u30c8\u53ec\u559a\u30ab\u30fc\u30c9\u3092\u8cb7\u3046' : '\u53ec\u559a\u4e2d...'}
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
                    <span className="weapon-count">x{ownedSupport.count}</span>
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
          <article className="stage-card">
            <span>Stage 1</span>
            <h2>アストリア草原</h2>
            <p>{selectedSupport ? `サポート：${selectedSupport.name}` : 'ギルドハウスで初回無料サポート召喚を行うと出撃できます。'}</p>
            <p className="equipped-weapon-label">{'\u6b66\u5668'}：{equippedSochoWeapon.name}</p>
            <button className="primary-button" onClick={begin} disabled={!selectedSupport}>
              アストリア草原へ出撃
            </button>
          </article>
          <div className="prepare-actions">
            {!selectedSupport && (
              <button className="secondary-button" onClick={goToPrepare}>
                ギルドハウスへ
              </button>
            )}
            <button className="secondary-button" onClick={goToAstoriaMap}>
              MAPへ戻る
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
            <div className="hud-stage">{STAGE_NAME}</div>
            <div className="hud-support">サポート：{selectedSupport?.name ?? '未召喚'}</div>
            <div className="hud-weapon">{'\u6b66\u5668'}：{equippedSochoWeapon.name}</div>
            <button className="pause-button" onClick={pauseGame} disabled={game.status === 'paused'}>
              一時停止
            </button>
          </div>

          {game.boss && (
            <div className="boss-hud">
              <span>大型魔獣</span>
              <div className="meter boss-meter">
                <div className="meter-fill boss" style={{ width: `${bossHpPercent}%` }} />
              </div>
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

            {game.player.slashTimer > 0 && (
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
            {game.player.slashTimer > 0 && sochoHasSlashWave && (
              <div
                className="slash-wave"
                style={{
                  left: game.player.x - STAR_SLASH_WAVE_HALF_WIDTH,
                  top: game.player.y - STAR_SLASH_WAVE_RANGE,
                  width: STAR_SLASH_WAVE_HALF_WIDTH * 2,
                  height: STAR_SLASH_WAVE_RANGE,
                }}
              >
                <span className="slash-wave-core" />
                <span className="slash-wave-stars" />
              </div>
            )}

            {game.coins.map((coin) => (
              <div
                key={coin.id}
                className={`coin ${coin.isBonus ? 'is-bonus' : ''} ${
                  isCoinAttracted(coin.x, coin.y, game.player.x, game.player.y, supportId.current) ? 'is-attracted' : ''
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
                style={place(game.boss.x, game.boss.y, game.boss.radius * 2)}
              >
                大型魔獣
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
              総長
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
                    <button className="secondary-button" onClick={begin}>
                      はじめからやり直す
                    </button>
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
          <p className="eyebrow">{STAGE_NAME}</p>
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
              <strong>{equippedSochoWeapon.name}</strong>
            </div>
          </div>
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
            <button className="primary-button" onClick={begin}>
              Retry
            </button>
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

function isCoinAttracted(coinX: number, coinY: number, playerX: number, playerY: number, supportId: SupportId | null) {
  return Math.hypot(playerX - coinX, playerY - coinY) < getCoinMagnetRadius(supportId);
}

export default App;
