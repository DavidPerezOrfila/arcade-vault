import type { User } from "./types";

const USER_KEY = "av_user";

// ponytail: guard SSR — App Router renderiza en servidor donde localStorage no
// existe. Los componentes cliente se hidratan y releen en el navegador; los
// getters devuelven null durante el pase del servidor (sin flash de datos).
// Las puntuaciones viven en Supabase (app/data/scores.ts); aquí queda solo la
// identidad por nombre — Supabase Auth se integra por partes (nav ya hace
// supabase.auth.signOut en handleSignOut).

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
