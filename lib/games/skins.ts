// Sistema global de skins. Fuente única de ids, paletas de canvas y claves
// de persistencia. El estado vive en <html data-skin="..."> y los engines
// consumen PALETTES para no dispersar hex en cada juego.

export type SkinId = 'clasico' | 'neon' | 'retro';

export const SKIN_IDS: readonly SkinId[] = ['clasico', 'neon', 'retro'];
export const DEFAULT_SKIN: SkinId = 'clasico';
export const SKIN_STORAGE_KEY = 'arcade-vault-skin';

export const SKIN_LABELS: Record<SkinId, string> = {
  clasico: 'Clásico',
  neon: 'Neón',
  retro: 'Retro',
};

// Tokens comunes que cada engine puede mapear a sus entidades. Solo se añade
// un token cuando un juego lo necesita; hoy Asteroids cubre los siete y CAÍDA
// añade blocks (colores de tetrominós, índice 1..8: I, O, T, S, Z, J, L, N).
export interface SkinPalette {
  background: string;
  player: string;
  enemy: string;
  bullet: string;
  hudText: string;
  accent: string;
  particle: string;
  thrust: string;
  blocks: readonly string[];
}

export const PALETTES: Record<SkinId, SkinPalette> = {
  // Apariencia original de Asteroids (blanco sobre negro, power-up cyan).
  clasico: {
    background: '#000000',
    player: '#ffffff',
    enemy: '#ffffff',
    bullet: '#ffffff',
    hudText: '#ffffff',
    accent: '#00ffff',
    particle: '#ffffff',
    thrust: '#ff8200',
    // Mismos colores clásicos del tetris original sobre negro.
    blocks: [
      '',
      '#4dd0e1', // I
      '#ffd54f', // O
      '#ba68c8', // T
      '#81c784', // S
      '#e57373', // Z
      '#90caf9', // J
      '#ffb74d', // L
      '#9e9e9e', // N
    ],
  },
  // Colores saturados arcade: cyan/magenta/amarillo sobre fondo azul-negro.
  neon: {
    background: '#05060f',
    player: '#00f5ff',
    enemy: '#ff006e',
    bullet: '#f5ff00',
    hudText: '#e6e9ff',
    accent: '#00ff88',
    particle: '#00f5ff',
    thrust: '#ff7700',
    // Tetrominós saturados en la familia del neon: cyan/magenta/amarillo/verde.
    blocks: [
      '',
      '#00f5ff', // I
      '#f5ff00', // O
      '#ff006e', // T
      '#00ff88', // S
      '#ff4d4d', // Z
      '#4d79ff', // J
      '#ffa500', // L
      '#8f95b0', // N
    ],
  },
  // CRT verde fósforo con acento ámbar, paleta limitada.
  retro: {
    background: '#060906',
    player: '#7dff9b',
    enemy: '#3fae5c',
    bullet: '#eaffea',
    hudText: '#b9ffc8',
    accent: '#ffd166',
    particle: '#7dff9b',
    thrust: '#ffb000',
    // Paleta CRT limitada: verdes fósforo + ámbares.
    blocks: [
      '',
      '#7dff9b', // I
      '#ffd166', // O
      '#eaffea', // T
      '#3fae5c', // S
      '#ff9e3d', // Z
      '#54e08a', // J
      '#ff8f3d', // L
      '#6b7d6f', // N
    ],
  },
};

export function isSkinId(value: unknown): value is SkinId {
  return (
    typeof value === 'string' && (SKIN_IDS as readonly string[]).includes(value)
  );
}

export function readStoredSkin(): SkinId {
  if (typeof window === 'undefined') return DEFAULT_SKIN;
  try {
    const stored = window.localStorage.getItem(SKIN_STORAGE_KEY);
    return isSkinId(stored) ? stored : DEFAULT_SKIN;
  } catch {
    return DEFAULT_SKIN;
  }
}
