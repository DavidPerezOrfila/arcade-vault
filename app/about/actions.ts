"use server";

import { Resend } from "resend";
import { contactSchema } from "./schema";
import type { ContactFormState } from "./types";

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

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const contactEmail = process.env.CONTACT_EMAIL;

  if (!apiKey || !fromEmail || !contactEmail) {
    return { success: false, error: "Servicio de correo no configurado correctamente en el servidor." };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: contactEmail,
      subject: `Nuevo mensaje de ${name}`,
      text: `De: ${name} <${email}>\n\n${message}`,
      replyTo: email,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "No se pudo enviar el mensaje. Inténtalo de nuevo.";
    return { success: false, error: errorMessage };
  }
}
