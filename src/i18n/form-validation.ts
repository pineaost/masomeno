'use client';

import { useTranslations } from 'next-intl';
import type { FormEvent } from 'react';

function fieldFrom(event: FormEvent<HTMLFormElement>) {
  const field = event.target;
  return field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement
    ? field : null;
}

export function useLocalizedValidation() {
  const t = useTranslations('validation');
  return {
    onInvalid(event: FormEvent<HTMLFormElement>) {
      const field = fieldFrom(event);
      if (!field) return;
      const validity = field.validity;
      const key = validity.valueMissing ? 'required'
        : validity.typeMismatch && field instanceof HTMLInputElement && field.type === 'email' ? 'email'
          : validity.badInput && field instanceof HTMLInputElement && field.type === 'number' ? 'number'
            : validity.rangeUnderflow || validity.rangeOverflow ? 'range'
              : validity.tooShort ? 'tooShort' : 'invalid';
      field.setCustomValidity(key === 'tooShort' ? t(key, { count: 'minLength' in field ? field.minLength : 0 }) : t(key));
    },
    onInput(event: FormEvent<HTMLFormElement>) {
      fieldFrom(event)?.setCustomValidity('');
    },
  };
}
