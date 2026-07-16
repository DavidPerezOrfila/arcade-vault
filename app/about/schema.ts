import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100, "Máximo 100 caracteres"),
  email: z.string().email("Email inválido").max(254, "Email demasiado largo"),
  message: z.string().min(1, "El mensaje es obligatorio").max(2000, "Máximo 2000 caracteres"),
});

export type ContactFormData = z.infer<typeof contactSchema>;
