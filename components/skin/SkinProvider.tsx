'use client';

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode
} from 'react';
import {
  DEFAULT_SKIN,
  SKIN_STORAGE_KEY,
  isSkinId,
  readStoredSkin,
  type SkinId
} from '@/lib/games/skins';

type Listener = () => void;

const listeners = new Set<Listener>();

function getSnapshot(): SkinId {
  if (typeof document === 'undefined') return DEFAULT_SKIN;
  const value = document.documentElement.dataset.skin;
  return isSkinId(value) ? value : readStoredSkin();
}

function getServerSnapshot(): SkinId {
  return DEFAULT_SKIN;
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function applySkin(skin: SkinId): void {
  document.documentElement.dataset.skin = skin;
  try {
    window.localStorage.setItem(SKIN_STORAGE_KEY, skin);
  } catch {
    // localStorage no disponible (modo incógnito): el skin sigue en <html>.
  }
  listeners.forEach((listener) => listener());
}

// El nombre del parámetro documenta la firma; el lint de base lo marca
// como no usado en firmas de tipo (mismo patrón que useArcadeGame).
/* eslint-disable no-unused-vars */
interface SkinContextValue {
  skin: SkinId;
  setSkin: (skin: SkinId) => void;
}
/* eslint-enable no-unused-vars */

const SkinContext = createContext<SkinContextValue | null>(null);

export function SkinProvider({ children }: { children: ReactNode }) {
  const skin = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setSkin = useCallback((next: SkinId) => {
    applySkin(next);
  }, []);

  return (
    <SkinContext.Provider value={{ skin, setSkin }}>
      {children}
    </SkinContext.Provider>
  );
}

export function useSkin(): SkinContextValue {
  const value = useContext(SkinContext);
  if (!value) {
    throw new Error('useSkin debe usarse dentro de <SkinProvider>');
  }
  return value;
}
