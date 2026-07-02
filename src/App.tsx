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
import type { EnemyKind, GameState, Vector } from './game/types';

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
  small: '小',
  flying: '飛',
  charger: '突',
};

const assetPaths = {
  player: '/assets/tcg/chibi-socho.png',
  boss: '/assets/tcg/boss-bear.png',
  enemies: {
    small: '/assets/tcg/enemy-goblin.png',
    flying: '/assets/tcg/enemy-lesser-wyvern.png',
    charger: '/assets/tcg/enemy-boar.png',
  },
};

function App() {
  const [game, setGame] = useState<GameState>(() => createInitialGameState());
  const pressedKeys = useRef(new Set<string>());
  const dragTarget = useRef<Vector | null>(null);
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const lastFrame = useRef<number | null>(null);
  const gameRef = useRef(game);

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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

      setGame((current) => updateGame(current, dt, getMoveVector(current, pressedKeys.current, dragTarget.current)));
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
    pressedKeys.current.clear();
    dragTarget.current = null;
    lastFrame.current = null;
    setGame(startGame());
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
          <button className="primary-button" onClick={begin}>
            出撃
          </button>
          <p className="control-note">PC: WASD / 矢印キー　スマホ: 画面ドラッグ　攻撃: 自動</p>
        </section>
      )}

      {game.status === 'playing' && (
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
            className="field"
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
                className={`coin ${isCoinAttracted(coin.x, coin.y, game.player.x, game.player.y) ? 'is-attracted' : ''}`}
                style={place(coin.x, coin.y, 18)}
              >
                $
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

            {game.boss && (
              <div
                className={`boss ${(game.boss.hitTimer ?? 0) > 0 ? 'is-slashed' : ''}`}
                style={place(game.boss.x, game.boss.y, game.boss.radius * 2)}
              >
                魔獣
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
              総
            </div>
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
          <button className="primary-button" onClick={begin}>
            もう一度出撃
          </button>
        </section>
      )}
    </main>
  );
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

function isCoinAttracted(coinX: number, coinY: number, playerX: number, playerY: number) {
  return Math.hypot(playerX - coinX, playerY - coinY) < 104;
}

export default App;
