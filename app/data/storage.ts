import type { ScoreEntry, User } from "./types";

const USER_KEY = "av_user";
const SCORES_KEY = "av_scores";

// ponytail: guard SSR — App Router renderiza en servidor donde localStorage no
// existe. Los componentes cliente se hidratan y releen en el navegador; los
// getters devuelven null/[] durante el pase del servidor (sin flash de datos).

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function setUser(user: User): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(USER_KEY);
}

export function getScores(): ScoreEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SCORES_KEY);
    return raw ? (JSON.parse(raw) as ScoreEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveScore(entry: ScoreEntry): void {
  if (typeof window === "undefined") return;
  const scores = getScores();
  scores.push(entry);
  window.localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
}
