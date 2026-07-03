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
} from './game/constants';
import { createInitialGameState, startGame, updateGame } from './game/logic';
import { getCoinMagnetRadius } from './game/support';
import type { EnemyKind, GameState, SupportId, Vector } from './game/types';

type SupportCharacter = {
  id: SupportId;
  name: string;
  role: string;
  description: string;
  image: string;
};

type SummonPhase = 'idle' | 'gate' | 'cards' | 'revealing' | 'done';

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
  enemies: {
    small: '/assets/tcg/enemy-goblin.png',
    flying: '/assets/tcg/enemy-lesser-wyvern.png',
    charger: '/assets/tcg/enemy-boar.png',
  },
};

const supportCandidates: SupportCharacter[] = [
  {
    id: '7171',
    name: '7171',
    role: '収集＆金策',
    description: 'コインやドロップを集める周回向きサポート。',
    image: '/assets/tcg/support-card-7171.png',
  },
  {
    id: 'yabuko',
    name: 'やぶこ',
    role: '回復',
    description: '回復で総長の継戦を支えるサポート。',
    image: '/assets/tcg/support-card-yabuko.png',
  },
  {
    id: 'player',
    name: 'Player',
    role: '2丁拳銃で援護射撃',
    description: '弾幕と援護射撃で前線を支えるサポート。',
    image: '/assets/tcg/support-card-player.png',
  },
  {
    id: 'hibiki',
    name: 'hibiki',
    role: '大盾で被弾軽減',
    description: '大盾で被弾を抑える防御型サポート。',
    image: '/assets/tcg/support-card-hibiki.png',
  },
  {
    id: 'myouou',
    name: '明王',
    role: '迦楼羅で敵を一掃',
    description: '神聖な範囲攻撃で戦場を切り開くサポート。',
    image: '/assets/tcg/support-card-myouou.png',
  },
];

function App() {
  const [game, setGame] = useState<GameState>(() => createInitialGameState());
  const [selectedSupport, setSelectedSupport] = useState<SupportCharacter | null>(null);
  const [summonPhase, setSummonPhase] = useState<SummonPhase>('idle');
  const [summonCards, setSummonCards] = useState<SupportCharacter[]>([]);
  const [revealingCardId, setRevealingCardId] = useState<string | null>(null);
  const supportId = useRef<SupportId | null>(null);
  const pressedKeys = useRef(new Set<string>());
  const dragTarget = useRef<Vector | null>(null);
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const lastFrame = useRef<number | null>(null);

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
        updateGame(current, dt, getMoveVector(current, pressedKeys.current, dragTarget.current), supportId.current),
      );
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const hpPercent = Math.max(0, (game.player.hp / game.player.maxHp) * 100);
  const bossHpPercent = game.boss ? Math.max(0, (game.boss.hp / game.boss.maxHp) * 100) : 0;
  const activeSlashRadius = game.boss ? SLASH_BOSS_RADIUS : SLASH_RADIUS;
  const screenTitle = useMemo(() => {
    if (game.status === 'clear') return '星門、沈黙。';
    if (game.status === 'gameOver') return '撤退。';
    return 'Gの部屋：星門シューティング';
  }, [game.status]);

  const begin = () => {
    if (!selectedSupport) return;
    pressedKeys.current.clear();
    dragTarget.current = null;
    lastFrame.current = null;
    setGame(startGame());
  };

  const goToPrepare = () => {
    pressedKeys.current.clear();
    dragTarget.current = null;
    lastFrame.current = null;
    setGame((current) => ({ ...current, status: 'prepare' }));
  };

  const pauseGame = () => {
    pressedKeys.current.clear();
    dragTarget.current = null;
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
    lastFrame.current = null;
    setGame((current) => {
      if (current.status === 'playing') return { ...current, status: 'paused' };
      if (current.status === 'paused') return { ...current, status: 'playing' };
      return current;
    });
  };

  const summonSupport = () => {
    if (selectedSupport || summonPhase !== 'idle') return;

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
      setSummonPhase('done');
    }, 760);
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
          <button className="primary-button" onClick={goToPrepare}>
            出撃準備
          </button>
          <p className="control-note">PC: WASD / 矢印キー　スマホ: 画面ドラッグ　攻撃: 自動</p>
        </section>
      )}

      {game.status === 'prepare' && (
        <section className="menu-screen prepare-screen">
          <div>
            <p className="eyebrow">星門出撃準備</p>
            <h1>編成確認</h1>
            <p className="lead">初回無料サポート召喚で仲間を1人迎えてから、アストリア草原へ出撃します。</p>
          </div>

          <div className="formation-grid">
            <article className="formation-card main-card">
              <span className="slot-label">メイン</span>
              <img src={assetPaths.player} alt="総長" />
              <div>
                <h2>総長</h2>
                <p>前方半円斬撃で前線を切り開く近接メイン。</p>
              </div>
            </article>

            <article className={`formation-card support-card ${selectedSupport ? 'has-support' : ''} summon-phase-${summonPhase}`}>
              <span className="slot-label">サポート</span>
              {selectedSupport ? (
                <>
                  <img src={selectedSupport.image} alt={selectedSupport.name} />
                  <div>
                    <h2>{selectedSupport.name}</h2>
                    <strong>{selectedSupport.role}</strong>
                    <p>{selectedSupport.description}</p>
                    <p className="summon-success">召喚成功</p>
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
          </div>

          <div className="prepare-actions">
            <button className="secondary-button" onClick={summonSupport} disabled={Boolean(selectedSupport) || summonPhase !== 'idle'}>
              {selectedSupport ? '召喚済み' : summonPhase === 'idle' ? '初回無料サポート召喚' : 'カードを選択中'}
            </button>
            <button className="primary-button" onClick={begin} disabled={!selectedSupport || summonPhase === 'gate' || summonPhase === 'revealing'}>
              出撃
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
            onPointerDown={(event) => updateDragTarget(event, fieldRef.current, dragTarget, Boolean(game.boss))}
            onPointerMove={(event) => updateDragTarget(event, fieldRef.current, dragTarget, Boolean(game.boss))}
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
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="instructions">
            <span>移動: WASD / 矢印キー / ドラッグ</span>
            <span>攻撃: クールタイムごとに自動斬撃</span>
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
          </div>
          <div className="result-actions">
            <button className="primary-button" onClick={begin}>
              もう一度出撃
            </button>
            <button className="secondary-button" onClick={goToPrepare}>
              出撃準備へ戻る
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

function getMoveVector(game: GameState, keys: Set<string>, target: Vector | null): Vector {
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
) {
  if (!field || event.pointerType === 'mouse') return;
  const rect = field.getBoundingClientRect();
  const scaleX = FIELD_WIDTH / rect.width;
  const scaleY = FIELD_HEIGHT / rect.height;
  const limits = isBossBattle ? BOSS_PLAYER_LIMITS : PLAYER_LIMITS;
  targetRef.current = {
    x: clamp((event.clientX - rect.left) * scaleX, limits.minX, limits.maxX),
    y: clamp((event.clientY - rect.top) * scaleY, limits.minY, limits.maxY),
  };
}

function place(x: number, y: number, size: number) {
  return {
    width: size,
    height: size,
    transform: `translate(${x - size / 2}px, ${y - size / 2}px)`,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function isCoinAttracted(coinX: number, coinY: number, playerX: number, playerY: number, supportId: SupportId | null) {
  return Math.hypot(playerX - coinX, playerY - coinY) < getCoinMagnetRadius(supportId);
}

export default App;
