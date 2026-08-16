// Sistema global de skins. Fuente única de ids, paletas de canvas y claves
// de persistencia. El estado vive en <html data-skin="..."> y los engines
// consumen PALETTES para no dispersar hex en cada juego.

export type SkinId = "clasico" | "neon" | "retro";

export const SKIN_IDS: readonly SkinId[] = ["clasico", "neon", "retro"];
export const DEFAULT_SKIN: SkinId = "clasico";
export const SKIN_STORAGE_KEY = "arcade-vault-skin";

export const SKIN_LABELS: Record<SkinId, string> = {
  clasico: "Clásico",
  neon: "Neón",
  retro: "Retro",
};

// Tokens comunes que cada engine puede mapear a sus entidades. Solo se añade
// un token cuando un juego lo necesita; hoy Asteroids cubre los siete.
export interface SkinPalette {
  background: string;
  player: string;
  enemy: string;
  bullet: string;
  hudText: string;
  accent: string;
  particle: string;
  thrust: string;
}

export const PALETTES: Record<SkinId, SkinPalette> = {
  // Apariencia original de Asteroids (blanco sobre negro, power-up cyan).
  clasico: {
    background: "#000000",
    player: "#ffffff",
    enemy: "#ffffff",
    bullet: "#ffffff",
    hudText: "#ffffff",
    accent: "#00ffff",
    particle: "#ffffff",
    thrust: "#ff8200",
  },
  // Colores saturados arcade: cyan/magenta/amarillo sobre fondo azul-negro.
  neon: {
    background: "#05060f",
    player: "#00f5ff",
    enemy: "#ff006e",
    bullet: "#f5ff00",
    hudText: "#e6e9ff",
    accent: "#00ff88",
    particle: "#00f5ff",
    thrust: "#ff7700",
  },
  // CRT verde fósforo con acento ámbar, paleta limitada.
  retro: {
    background: "#060906",
    player: "#7dff9b",
    enemy: "#3fae5c",
    bullet: "#eaffea",
    hudText: "#b9ffc8",
    accent: "#ffd166",
    particle: "#7dff9b",
    thrust: "#ffb000",
  },
};

export function isSkinId(value: unknown): value is SkinId {
  return (
    typeof value === "string" && (SKIN_IDS as readonly string[]).includes(value)
  );
}

export function readStoredSkin(): SkinId {
  if (typeof window === "undefined") return DEFAULT_SKIN;
  try {
    const stored = window.localStorage.getItem(SKIN_STORAGE_KEY);
    return isSkinId(stored) ? stored : DEFAULT_SKIN;
  } catch {
    return DEFAULT_SKIN;
  }
}
