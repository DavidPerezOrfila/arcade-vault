"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { scoreEntrySchema } from "./schema";
import { saveScore } from "./scores";

export type SaveScoreResult = { ok: true } | { ok: false; error: string };

function parseFormData(formData: FormData) {
  const raw = {
    game: String(formData.get("game") ?? ""),
    score: Number(formData.get("score") ?? 0),
    name: String(formData.get("name") ?? ""),
    at: Number(formData.get("at") ?? 0),
  };
  return scoreEntrySchema.safeParse(raw);
}

export async function saveScoreAction(
  _prev: SaveScoreResult | null,
  formData: FormData,
): Promise<SaveScoreResult> {
  const parsed = parseFormData(formData);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT" };

  try {
    await saveScore(parsed.data);
  } catch {
    return { ok: false, error: "DB_ERROR" };
  }

  revalidatePath("/salon");
  revalidatePath("/games");
  revalidatePath("/detalle/[id]", "page");
  revalidateTag("leaderboard", "default");

  return { ok: true };
}
