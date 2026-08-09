'use client';

import { useState } from 'react';
import type { ContactFormState } from './types';
import { SuccessTerminal } from './SuccessTerminal';

interface ContactFormProps {
  state: ContactFormState;
  isPending: boolean;
}

interface FormFields {
  name: string;
  email: string;
  message: string;
}

const EMPTY_FORM: FormFields = { name: '', email: '', message: '' };

export function ContactForm({ state, isPending }: ContactFormProps) {
  const [form, setForm] = useState<FormFields>(EMPTY_FORM);

  const handleChange =
    (field: keyof FormFields) =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((current) => ({ ...current, [field]: event.target.value }));
      };

  const handleReset = () => {
    setForm(EMPTY_FORM);
  };

  if (state.success) {
    return <SuccessTerminal userName={form.name} onReset={handleReset} />;
  }

  return (
    <>
      <div className='field'>
        <label htmlFor='name'>NOMBRE</label>
        <input
          id='name'
          name='name'
          type='text'
          value={form.name}
          onChange={handleChange('name')}
          placeholder='px_kai'
          required
          maxLength={100}
        />
      </div>

      <div className='field'>
        <label htmlFor='email'>CORREO ELECTRÓNICO</label>
        <input
          id='email'
          name='email'
          type='email'
          value={form.email}
          onChange={handleChange('email')}
          placeholder='jugador@vault.gg'
          required
          maxLength={254}
        />
      </div>

      <div className='field'>
        <label htmlFor='message'>MENSAJE</label>
        <textarea
          id='message'
          name='message'
          rows={5}
          value={form.message}
          onChange={handleChange('message')}
          placeholder='¿Qué te gustaría ver en Arcade Vault?'
          required
          maxLength={2000}
        />
      </div>

      {state.error && !isPending && (
        <div className='form-error' role='alert' aria-live='polite'>
          {state.error}
        </div>
      )}

      <button className='btn xl press' type='submit' disabled={isPending}>
        {isPending ? '▶ ENVIANDO...' : '▶ ENVIAR MENSAJE'}
      </button>
    </>
  );
}
