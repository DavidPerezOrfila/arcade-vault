"use client";

import { useCallback, useEffect, useRef } from "react";
import { submitRanariaScore } from "@/app/games/ranaria/actions";
import { AuthPrompt } from "@/components/games/AuthPrompt";
import { LeaderboardList } from "@/components/games/LeaderboardList";
import { TouchControls, dispatchKey } from "@/components/games/TouchControls";
import type { TouchControlsProps } from "@/components/games/TouchControls";
import { useArcadeGame } from "@/components/games/useArcadeGame";
import { useSkin } from "@/components/skin/SkinProvider";
import { SkinSelect } from "@/components/skin/SkinSelect";
import { LEADERBOARD_TOP_N } from "@/lib/games/constants";
import type {
  RanariaGameProps,
  RanariaRefs,
} from "@/lib/games/ranaria/types";
import "./ranaria.css";

const CANVAS_W = 640;
const CANVAS_H = 560;
const API_URL = "/api/leaderboard/ranaria";

// Mando NES: cruceta para saltar (tap); A/B sin uso (atenuados).
const D_PAD = {
  up: { action: "up", mode: "tap" },
  down: { action: "down", mode: "tap" },
  left: { action: "left", mode: "tap" },
  right: { action: "right", mode: "tap" },
} satisfies TouchControlsProps["dPad"];

const BUTTONS = [
  { label: "B", disabled: true },
  { label: "A", disabled: true },
] satisfies TouchControlsProps["buttons"];

export function RanariaGame({ initialLeaderboard = [] }: RanariaGameProps) {
  const boardRef = useRef<HTMLCanvasElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const livesRef = useRef<HTMLSpanElement>(null);
  const levelRef = useRef<HTMLSpanElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const overlayTitleRef = useRef<HTMLHeadingElement>(null);
  const overlayScoreRef = useRef<HTMLParagraphElement>(null);
  const { skin } = useSkin();

  const {
    gameRef,
    isLoading,
    leaderboard,
    showAuthPrompt,
    setShowAuthPrompt,
    handleGameOver,
  } = useArcadeGame({
    loadModule: () => import("@/lib/games/ranaria/game.esm.js"),
    apiUrl: API_URL,
    submitScore: submitRanariaScore,
    initialLeaderboard,
  });

  // Recoge refs y arranca el módulo. setOnGameOver antes de initGame — el
  // módulo dispara game over al iniciar, ese callback debe estar bindeado.
  // skin en deps: cambiar de skin reinicia la partida (igual que Asteroids).
  const startGame = useCallback(() => {
    const game = gameRef.current;
    if (!game) return;
    const refs: RanariaRefs | null =
      boardRef.current &&
      scoreRef.current &&
      livesRef.current &&
      levelRef.current &&
      timeRef.current &&
      overlayRef.current &&
      overlayTitleRef.current &&
      overlayScoreRef.current
        ? {
            board: boardRef.current,
            scoreEl: scoreRef.current,
            livesEl: livesRef.current,
            levelEl: levelRef.current,
            timeEl: timeRef.current,
            overlay: overlayRef.current,
            overlayTitle: overlayTitleRef.current,
            overlayScore: overlayScoreRef.current,
          }
        : null;
    if (!refs) return;

    setShowAuthPrompt(false);
    game.setOnGameOver(handleGameOver);
    game.initGame(refs, { onGameOver: handleGameOver, skin });
  }, [gameRef, handleGameOver, setShowAuthPrompt, skin]);

  useEffect(() => {
    if (isLoading) return undefined;
    startGame();
    return () => {
      gameRef.current?.destroy();
    };
  }, [isLoading, startGame, gameRef]);

  const handleDown = useCallback((action: string) => {
    if (action === "pause") {
      dispatchKey("KeyP", "keydown", "p");
      return;
    }
    const key: Record<string, string> = {
      up: "ArrowUp",
      down: "ArrowDown",
      left: "ArrowLeft",
      right: "ArrowRight",
    };
    dispatchKey(key[action] ?? action, "keydown");
  }, []);

  const handleUp = useCallback(() => undefined, []);

  if (isLoading) {
    return (
      <div className="ranaria-game-container">
        <div className="ranaria-loading-overlay">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="ranaria-game-layout">
      <div className="ranaria-game-container">
        <div className="ranaria-board-wrap">
          <canvas
            ref={boardRef}
            width={CANVAS_W}
            height={CANVAS_H}
            aria-label="Juego RANARIA"
          />

          {/* Overlay compartido: GAME OVER / PAUSA. El wrapper togglea 'hidden'. */}
          <div className="ranaria-overlay hidden" ref={overlayRef}>
            <h3 className="ranaria-overlay-title" ref={overlayTitleRef}>
              GAME OVER
            </h3>
            <p className="ranaria-overlay-score" ref={overlayScoreRef}></p>
            <button onClick={startGame} className="ranaria-overlay-button">
              Jugar de nuevo
            </button>
          </div>

          {showAuthPrompt && (
            <AuthPrompt
              classPrefix="ranaria"
              gamePath="/games/ranaria"
              title="¡Partida terminada!"
              message="Inicia sesión para guardar tu puntuación en el ranking global."
              onDismiss={() => setShowAuthPrompt(false)}
            />
          )}
        </div>

        <div className="ranaria-panel">
          <SkinSelect classPrefix="ranaria" />

          <div className="ranaria-hud">
            <div className="ranaria-hud-item">
              <span>PUNTOS</span>
              <span ref={scoreRef}>0</span>
            </div>
            <div className="ranaria-hud-item">
              <span>VIDAS</span>
              <span ref={livesRef}>3</span>
            </div>
            <div className="ranaria-hud-item">
              <span>NIVEL</span>
              <span ref={levelRef}>1</span>
            </div>
            <div className="ranaria-hud-item">
              <span>TIEMPO</span>
              <span ref={timeRef}>15s</span>
            </div>
          </div>

          <div className="ranaria-leaderboard">
            <div className="ranaria-leaderboard-title">
              TOP {LEADERBOARD_TOP_N}
            </div>
            <LeaderboardList
              classPrefix="ranaria"
              entries={leaderboard}
              maxRows={LEADERBOARD_TOP_N}
              emptyText="Sin puntuaciones aún"
            />
          </div>
        </div>
      </div>

      <TouchControls
        dPad={D_PAD}
        buttons={BUTTONS}
        pause={{ label: "PAUSA", action: "pause" }}
        gameAreaRef={boardRef}
        onDown={handleDown}
        onUp={handleUp}
      />
    </div>
  );
}
