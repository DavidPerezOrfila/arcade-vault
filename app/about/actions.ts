"use server";

import { Resend } from "resend";
import { contactSchema } from "./schema";
import type { ContactFormState } from "./types";

const resend = new Resend(process.env.RESEND_API_KEY);

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export async function sendContactEmail(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { success: false, error: issue?.message ?? "Datos inválidos" };
  }

  const { name, email, message } = parsed.data;

  if (process.env.RESEND_API_KEY === "test") {
    return { success: true };
  }

  try {
    const { error } = await resend.emails.send({
      from: getRequiredEnv("RESEND_FROM_EMAIL"),
      to: getRequiredEnv("CONTACT_EMAIL"),
      subject: `Nuevo mensaje de ${name}`,
      text: `De: ${name} <${email}>\n\n${message}`,
      replyTo: email,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "No se pudo enviar el mensaje. Inténtalo de nuevo.";
    return { success: false, error: message };
  }
}
