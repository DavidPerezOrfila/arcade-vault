"use client";

import { useEffect } from "react";
import { saveScoreAction } from "@/app/data/actions";
import { setUser } from "@/app/data/storage";
import type { ScoreEntry, User } from "@/app/data/types";

const MIGRATION_FLAG = "av_migrated_v1";
// ponytail: alineados con app/data/storage.ts (USER_KEY/SCORES_KEY).
const USER_KEY = "av_user";
const SCORES_KEY = "av_scores";

function readScores(): ScoreEntry[] {
  try {
    const raw = window.localStorage.getItem(SCORES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ScoreEntry[]) : [];
  } catch {
    return [];
  }
}

function readUser(): User | null {
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export default function MigrateLocalStorage() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(MIGRATION_FLAG) === "true") return;

    const scores = readScores();
    const user = readUser();

    if (scores.length === 0 && !user) return;

    // ponytail: flag antes del bucle → segunda pestaña sale en silencio
    // sin duplicar la subida (sin necesidad de carrera con bloqueos).
    window.localStorage.setItem(MIGRATION_FLAG, "true");

    void (async () => {
      for (const entry of scores) {
        const fd = new FormData();
        fd.set("game", entry.game);
        fd.set("score", String(entry.score));
        fd.set("name", entry.name);
        fd.set("at", String(entry.at));
        try {
          const r = await saveScoreAction(null, fd);
          if (!r.ok) {
            console.warn("[av:migrate] score rejected", entry, r.error);
          }
        } catch (e) {
          console.warn("[av:migrate] score threw", entry, e);
        }
      }
      if (user) setUser(user);

      window.localStorage.removeItem(SCORES_KEY);
      window.localStorage.removeItem(USER_KEY);
    })();
  }, []);

  return null;
}
