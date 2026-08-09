'use client';

import { useActionState, useRef } from 'react';
import { sendContactEmail } from './actions';
import { ContactForm } from './ContactForm';
import { HeroSection } from './HeroSection';
import { RevealDivider } from './RevealDivider';
import { useReveal } from './useReveal';
import type { ContactFormState } from './types';

const initialState: ContactFormState = { success: false };

export default function AboutPage() {
  const [state, submitAction, isPending] = useActionState(
    sendContactEmail,
    initialState
  );
  const rootRef = useRef<HTMLDivElement>(null);
  useReveal(rootRef);

  return (
    <div ref={rootRef} className='about fade-in'>
      <HeroSection />
      <RevealDivider />

      <section className='about-contact reveal'>
        <div className='contact-grid'>
          <div className='contact-intro'>
            <div className='kicker pixel neon-cyan'>▸ CONTACTO</div>
            <h2 className='contact-title'>CONTÁCTANOS</h2>
            <p className='contact-sub'>
              ¿Ideas para nuevos juegos, sugerencias o colaboraciones?
              Escríbenos y te responderemos cuanto antes.
            </p>

            <div className='contact-tips'>
              <div className='tip'>
                <span className='tip-led' />
                RESPUESTA EN 24-48H
              </div>
              <div className='tip'>
                <span className='tip-led y' />
                SUGERENCIAS BIENVENIDAS
              </div>
              <div className='tip'>
                <span className='tip-led m' />
                SIN SPAM, JAMÁS
              </div>
            </div>
          </div>

          <form action={submitAction} className='contact-form' noValidate>
            <ContactForm state={state} isPending={isPending} />
          </form>
        </div>
      </section>
    </div>
  );
}
