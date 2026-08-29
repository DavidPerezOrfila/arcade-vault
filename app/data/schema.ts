import { z } from 'zod';

export const scoreEntrySchema = z.object({
  game: z.string().min(1).max(64),
  score: z.number().int().nonnegative().max(1_000_000_000),
  name: z.string().min(1).max(40),
  at: z.number().int().positive(),
  // Opcional: la capa server la rellena con la sesión; los clientes
  // legacy (formulario spec-06) no la envían.
  userId: z.string().uuid().nullable().optional(),
});

export type ScoreEntryInputParsed = z.infer<typeof scoreEntrySchema>;

export const usernameSchema = z
  .string()
  .min(3)
  .max(20)
  .regex(/^[a-zA-Z0-9_]+$/);

export const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  username: usernameSchema,
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8).max(72),
});
