'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { LeaderboardEntry } from '@/lib/games/types';
import type { SubmitScoreResult } from '@/lib/games/leaderboard';

// Nombres de parámetros en firmas de tipos documentan el contrato — no son
// vars reales; el lint de base los marca como no usados.
/* eslint-disable no-unused-vars */
export interface ArcadeGameModule {
  // Firma varía por juego (Caida: refs + options; Asteroids: canvas). El
  // caller hace el cast concreto en su propio useEffect.
  initGame: (...args: unknown[]) => void;
  destroy: () => void;
  setOnGameOver: (callback: (finalScore: number) => void) => void;
}

export interface UseArcadeGameParams {
  loadModule: () => Promise<unknown>;
  apiUrl: string;
  submitScore: (score: number) => Promise<SubmitScoreResult>;
  initialLeaderboard?: LeaderboardEntry[];
}

export interface UseArcadeGameResult {
  gameRef: React.MutableRefObject<ArcadeGameModule | null>;
  isLoading: boolean;
  leaderboard: LeaderboardEntry[];
  showAuthPrompt: boolean;
  setShowAuthPrompt: (show: boolean) => void;
  handleGameOver: (score: number) => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
}
/* eslint-enable no-unused-vars */

export function useArcadeGame({
  loadModule,
  apiUrl,
  submitScore,
  initialLeaderboard = [],
}: UseArcadeGameParams): UseArcadeGameResult {
  const gameRef = useRef<ArcadeGameModule | null>(null);
  const [leaderboard, setLeaderboard] =
    useState<LeaderboardEntry[]>(initialLeaderboard);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    loadModule().then((mod) => {
      if (mounted) {
        gameRef.current = mod as unknown as ArcadeGameModule;
        setIsLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [loadModule]);

  const refreshLeaderboard = useCallback(async () => {
    const response = await fetch(apiUrl);
    if (response.ok) {
      const data = (await response.json()) as LeaderboardEntry[];
      setLeaderboard(data);
    }
  }, [apiUrl]);

  const handleGameOver = useCallback(
    async (score: number) => {
      const result = await submitScore(score);
      if (!result.ok) {
        setShowAuthPrompt(true);
        return;
      }
      await refreshLeaderboard();
    },
    [submitScore, refreshLeaderboard]
  );

  // Test hook (solo con ?e2e=1): permite forzar el game over desde los
  // tests E2E de Playwright. Magic 1000 = score seguro, dentro de bounds
  // del schema y del fixture del test.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const isE2E =
      new URLSearchParams(window.location.search).get('e2e') === '1';
    if (!isE2E) return undefined;

    const win = window as unknown as {
      // Firma del hook E2E — el nombre del parámetro es parte del contrato.
      // eslint-disable-next-line no-unused-vars
      __forceGameOver?: (score?: number) => void;
    };
    win.__forceGameOver = (score = 1000) => {
      void handleGameOver(score);
    };

    return () => {
      delete win.__forceGameOver;
    };
  }, [handleGameOver]);

  return {
    gameRef,
    isLoading,
    leaderboard,
    showAuthPrompt,
    setShowAuthPrompt,
    handleGameOver,
    refreshLeaderboard,
  };
}
