import { z } from "zod";

export const scoreEntrySchema = z.object({
  game: z.string().min(1).max(64),
  score: z.number().int().nonnegative().max(1_000_000_000),
  name: z.string().min(1).max(40),
  at: z.number().int().positive(),
});

export type ScoreEntryInputParsed = z.infer<typeof scoreEntrySchema>;
