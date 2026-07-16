---
state: Implemented
date: 2026-07-16
dependencies: 02-home-page
---

# About Page con envío de correo vía Resend

**Objetivo en una frase:** Implementar la página `/about` con formulario de contacto que envía correos reales mediante Resend, integrada en la navegación global y validada con Zod en el servidor.

---

## Scope

### Incluye

1. **Ruta `/about`** — Página estática/acerca con hero, misión, highlights y sección de contacto, basada en `resources/templates/home-about/about.jsx`.
2. **Formulario de contacto** — Campos: nombre, email, mensaje; validación en cliente (HTML5 + estados) y servidor (Zod).
3. **Server Action para envío de correo** — `app/about/actions.ts` con `"use server"` que recibe `FormData`, valida con Zod y llama a la API de Resend.
4. **Variables de entorno** — `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CONTACT_EMAIL`. Documentar cuáles son obligatorias y en qué archivo van (`.env.local`).
5. **Integración con Nav** — Añadir enlace "Acerca de" en `components/nav.tsx` junto a los enlaces existentes.
6. **UI de estados** — Pantalla de éxito tipo terminal del prototipo, estado de error visible para el usuario, estado de carga en el botón de envío.
7. **Animaciones de scroll** — Reveal por `IntersectionObserver` al hacer scroll, igual que en `about.jsx`.
8. **Tests E2E** — Al menos un test de Playwright que navegue a `/about`, llene el formulario y verifique el feedback de éxito (con Resend mockeado o con una validación de UI en entorno controlado).
9. **Actualización de `CLAUDE.md`** — Añadir el comando de tests si se configura Playwright.
10. **Actualización del grafo de conocimiento** — Ejecutar `graphify update .` al finalizar para reflejar los nuevos archivos.

### No incluye

- Página de privacidad, términos o FAQ adicionales.
- Base de datos para guardar mensajes enviados.
- Rate limiting real por IP ni CAPTCHA (se puede dejar preparado para otra spec).
- Cambios de idioma a español del resto de la aplicación (eso es otra spec).
- Subida de archivos adjuntos en el formulario.
- Integración con otro proveedor de email distinto a Resend.

---

## Data model

```typescript
// === app/about/types.ts ===

export interface ContactFormInput {
  name: string;
  email: string;
  message: string;
}

export interface ContactFormState {
  success: boolean;
  error?: string;
}
```

```typescript
// === app/about/schema.ts ===

import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100, "Máximo 100 caracteres"),
  email: z.string().email("Email inválido").max(254, "Email demasiado largo"),
  message: z.string().min(1, "El mensaje es obligatorio").max(2000, "Máximo 2000 caracteres"),
});

export type ContactFormData = z.infer<typeof contactSchema>;
```

**Variables de entorno (servidor):**

| Variable            | Descripción                    | Ejemplo                |
| ------------------- | ------------------------------ | ---------------------- |
| `RESEND_API_KEY`    | API key de Resend              | `re_xxxxxxxx`          |
| `RESEND_FROM_EMAIL` | Remitente verificado en Resend | `hola@arcade-vault.gg` |
| `CONTACT_EMAIL`     | Destinatario del mensaje       | tu email de GitHub     |

**Notas:**
- No se añade persistencia de mensajes; solo envío vía Resend.
- El estado del formulario se maneja con `useActionState` (React 19) o la API equivalente que Next.js 16 exponga.

---

## Implementation plan

1. **Añadir dependencias** — Instalar `resend` y `zod` en el proyecto.
2. **Crear variables de entorno** — Añadir `.env.local.example` con `RESEND_API_KEY`, `RESEND_FROM_EMAIL` y `CONTACT_EMAIL`; documentar en `CLAUDE.md`.
3. **Crear tipos y schema** — `app/about/types.ts` e `app/about/schema.ts`.
4. **Crear Server Action** — `app/about/actions.ts` que valide con Zod, llame a Resend y devuelva estado de éxito/error.
5. **Crear componente de iconos** — `app/about/highlight-icon.tsx` con los 3 SVG del prototipo (HEART, BROWSER, PLANT).
6. **Crear página `/about`** — `app/about/page.tsx` con:
   - Hero de about.
   - Divider animado.
   - Sección de contacto con formulario controlado.
   - Estado de éxito tipo terminal.
   - Estado de error.
   - Reveal en scroll con `IntersectionObserver`.
7. **Añadir enlace en Nav** — Actualizar `components/nav.tsx` para incluir "Acerca de" entre los enlaces existentes, responsive incluido.
8. **Añadir estilos** — Extender `app/globals.css` con las clases específicas de About si no están ya cubiertas por Tailwind.
9. **Configurar Playwright** — Instalar y configurar Playwright; añadir script `test:e2e` en `package.json`.
10. **Escribir tests E2E** — `e2e/about.spec.ts` que verifique carga de página, envío de formulario y feedback de éxito.
11. **Verificación final** — `npm run build`, `npm run lint` y `npm run test:e2e` pasen correctamente.
12. **Actualizar grafo** — Ejecutar `graphify update .` para reflejar los nuevos archivos y relaciones.

---

## Acceptance criteria

- [ ] `npm run build` produce build exitoso sin errores ni warnings.
- [ ] `npm run lint` no reporta errores en archivos de producción.
- [ ] Navegar a `/about` muestra el hero, misión, highlights y formulario de contacto.
- [ ] El enlace "Acerca de" aparece en el Nav y es navegable en desktop y mobile.
- [ ] El formulario valida que nombre, email y mensaje no estén vacíos antes de enviar.
- [ ] El formulario muestra error si el email no tiene formato válido.
- [ ] Al enviar, el botón entra en estado de carga.
- [ ] Si Resend responde correctamente, se muestra la terminal de éxito con el nombre del usuario.
- [ ] Si Resend falla, se muestra un mensaje de error claro y se permite reintentar.
- [ ] La Server Action valida los datos con Zod antes de llamar a Resend.
- [ ] Las variables `RESEND_API_KEY`, `RESEND_FROM_EMAIL` y `CONTACT_EMAIL` se leen desde el servidor, no del cliente.
- [ ] Las animaciones de reveal al hacer scroll funcionan en la sección de contacto y el divider.
- [ ] El test E2E de Playwright pasa: carga `/about`, envía el formulario y verifica el estado de éxito.
- [ ] El grafo de conocimiento se actualiza con `graphify update .` al finalizar.

---

## Decisions taken and discarded

| Decisión                 | Elegida                                                   | Descartada                          | Justificación                                                                    |
| ------------------------ | --------------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------- |
| Proveedor de email       | Resend                                                    | SendGrid, AWS SES, Nodemailer SMTP  | El usuario lo especificó; Resend tiene buena DX con React/Next.js.               |
| Arquitectura del envío   | Server Action de Next.js                                  | Route Handler API                   | Server Action es más simple para un formulario; el secret nunca toca el cliente. |
| Estado del formulario    | `useActionState` / `useFormState` de React 19             | `useState` manual + `useEffect`     | React 19 y Next.js 16 ya lo soportan; reduce lógica boilerplate.                 |
| Validación               | Zod en Server Action + validación HTML5 básica en cliente | Solo cliente / solo servidor        | Doble validación da mejor UX y seguridad.                                        |
| Feedback de éxito        | Terminal animada del prototipo                            | Toast genérico                      | Mantiene la estética retro y la intención del diseño original.                   |
| Tests                    | Playwright CLI                                            | Vitest unitarios para el formulario | El usuario prefirió Playwright; el flujo crítico es E2E.                         |
| Persistencia de mensajes | Ninguna                                                   | Guardar en localStorage o DB        | Fuera de scope; solo envío puntual.                                              |
| Rate limiting            | Ninguno en esta spec                                      | Límites por IP / CAPTCHA            | Complejidad adicional; se puede añadir en spec de seguridad posterior.           |

---

## Identified risks

1. **Exposición de secretos.** Si `RESEND_API_KEY` se lee accidentalmente en un Client Component o se expone a través de `process.env.NEXT_PUBLIC_*`, la key quedaría en el bundle. Mitigación: usar `"use server"`, leer solo en la Server Action, y auditar con `security-reviewer`.

2. **Resend from email no verificado.** Si `RESEND_FROM_EMAIL` no está verificado en el dashboard de Resend, el envío fallará. Mitigación: documentar en la spec que el remitente debe estar verificado; usar `onboarding@resend.dev` solo como fallback de desarrollo si se acuerda.

3. **Next.js 16 breaking changes.** Las APIs de Server Actions, `useActionState` y formularios pueden tener cambios respecto a versiones anteriores. Mitigación: consultar la documentación real de `node_modules/next/dist/docs/` antes de implementar.

4. **Feedback E2E con envío real.** Si el test de Playwright envía un email real en cada ejecución, se puede agotar la cuota de Resend o generar spam. Mitigación: mockear la Server Action en el entorno de test o verificar solo el estado de UI sin envío real.

5. **Nav responsive.** Añadir un nuevo enlace puede romper el layout del menú hamburguesa en mobile. Mitigación: probar en 320px y 768px durante la implementación.
