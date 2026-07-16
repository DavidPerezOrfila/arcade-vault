"use client";

import { useActionState, useEffect, useState } from "react";
import { sendContactEmail } from "./actions";
import { HighlightIcon } from "./highlight-icon";
import type { ContactFormState } from "./types";

const initialState: ContactFormState = { success: false };

const HIGHLIGHTS = [
  {
    kind: "HEART" as const,
    title: "HECHO CON ❤️ PARA JUGADORES",
    color: "magenta",
  },
  {
    kind: "BROWSER" as const,
    title: "JUEGOS EN HTML — CORREN EN CUALQUIER NAVEGADOR",
    color: "cyan",
  },
  {
    kind: "PLANT" as const,
    title: "PROYECTO EN CONSTANTE CRECIMIENTO",
    color: "green",
  },
];

export default function AboutPage() {
  const [state, submitAction, isPending] = useActionState(
    sendContactEmail,
    initialState,
  );
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const handleChange =
    (field: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleReset = () => {
    setFormKey((key) => key + 1);
  };

  return (
    <div key={formKey} className="about fade-in">
      <section className="about-hero">
        <div className="kicker pixel neon-yellow">▸ ACERCA DE</div>
        <h1 className="about-title">ACERCA DE ARCADE VAULT</h1>
        <p className="about-mission">
          Creamos una sala de juegos retro en la web: partidas rápidas, tablas
          de clasificación y esa estética arcade que nunca pasa de moda.
        </p>

        <div className="highlight-row">
          {HIGHLIGHTS.map((highlight, index) => (
            <div
              key={highlight.kind}
              className={`highlight ${highlight.color}`}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <HighlightIcon kind={highlight.kind} />
              <div className="hl-text pixel">{highlight.title}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="about-divider reveal" aria-hidden="true">
        <div className="div-bar" />
        <div className="div-pixels">
          {Array.from({ length: 24 }).map((_, index) => (
            <span key={index} style={{ animationDelay: `${index * 80}ms` }} />
          ))}
        </div>
        <div className="div-bar" />
      </div>

      <section className="about-contact reveal">
        <div className="contact-grid">
          <div className="contact-intro">
            <div className="kicker pixel neon-cyan">▸ CONTACTO</div>
            <h2 className="contact-title">CONTÁCTANOS</h2>
            <p className="contact-sub">
              ¿Ideas para nuevos juegos, sugerencias o colaboraciones? Escríbenos
              y te responderemos cuanto antes.
            </p>

            <div className="contact-tips">
              <div className="tip">
                <span className="tip-led" />
                RESPUESTA EN 24-48H
              </div>
              <div className="tip">
                <span className="tip-led y" />
                SUGERENCIAS BIENVENIDAS
              </div>
              <div className="tip">
                <span className="tip-led m" />
                SIN SPAM, JAMÁS
              </div>
            </div>
          </div>

          <form action={submitAction} className="contact-form" noValidate>
            {!state.success ? (
              <>
                <div className="field">
                  <label htmlFor="name">NOMBRE</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange("name")}
                    placeholder="px_kai"
                    required
                    maxLength={100}
                  />
                </div>

                <div className="field">
                  <label htmlFor="email">CORREO ELECTRÓNICO</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange("email")}
                    placeholder="jugador@vault.gg"
                    required
                    maxLength={254}
                  />
                </div>

                <div className="field">
                  <label htmlFor="message">MENSAJE</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={form.message}
                    onChange={handleChange("message")}
                    placeholder="¿Qué te gustaría ver en Arcade Vault?"
                    required
                    maxLength={2000}
                  />
                </div>

                {state.error && !isPending && (
                  <div className="form-error" role="alert" aria-live="polite">
                    {state.error}
                  </div>
                )}

                <button
                  className="btn xl press"
                  type="submit"
                  disabled={isPending}
                >
                  {isPending ? "▶ ENVIANDO..." : "▶ ENVIAR MENSAJE"}
                </button>
              </>
            ) : (
              <div className="terminal-success" aria-live="polite">
                <div className="term-bar">
                  <span className="dot r" />
                  <span className="dot y" />
                  <span className="dot g" />
                  <span className="term-title">VAULT-OS // TERMINAL</span>
                </div>
                <div className="term-body">
                  <div className="line">
                    <span className="prompt">vault@arcade:~$</span>{" "}
                    ./send_message --to=team
                  </div>
                  <div className="line dim">[OK] Conectando con servidor…</div>
                  <div className="line dim">[OK] Validando contenido…</div>
                  <div className="line dim">[OK] Transmitiendo paquete…</div>
                  <div className="line success">
                    &gt; MENSAJE RECIBIDO. TE RESPONDEREMOS PRONTO. GRACIAS,{" "}
                    {form.name.toUpperCase()}.
                    <span className="caret">_</span>
                  </div>
                  <div className="term-actions">
                    <button
                      className="btn ghost"
                      type="button"
                      onClick={handleReset}
                    >
                      ENVIAR OTRO MENSAJE
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}
