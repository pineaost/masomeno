import { temporaryAuthError } from './supabase/access.ts';
import type { LoginMode } from './auth-paths';

export type FormResult = 'idle' | 'invalidEmail' | 'invalidPassword' | 'weakPassword' | 'passwordMismatch'
  | 'unavailable' | 'unconfigured' | 'invalidCredentials' | 'emailNotConfirmed' | 'rateLimited'
  | 'samePassword' | 'invalidLink' | 'confirmationSent' | 'recoveryRequested';

function textField(fields: FormData, field: string) {
  const value = fields.get(field);
  return typeof value === 'string' ? value : '';
}

export function validateAuthForm(mode: LoginMode, fields: FormData) {
  const email = textField(fields, 'email').trim();
  const password = textField(fields, 'password');
  if (mode !== 'reset' && (email.length > 254 || !/^[^\s@]+@[^\s@]+$/.test(email))) {
    return { error: 'invalidEmail' } as const;
  }
  if (mode === 'login' && (!password || password.length > 1024)) return { error: 'invalidPassword' } as const;
  if (mode === 'signup' || mode === 'reset') {
    if (password.length < 8 || new TextEncoder().encode(password).length > 72) return { error: 'weakPassword' } as const;
    if (password !== textField(fields, 'confirm_password')) return { error: 'passwordMismatch' } as const;
  }
  return { email, password } as const;
}

export function authFormError(mode: LoginMode, error: { name?: string; code?: string; status?: number }): FormResult {
  if (mode === 'recover') return 'recoveryRequested';
  if (temporaryAuthError(error)) return 'unavailable';
  if (mode === 'signup' && ['email_exists', 'user_already_exists'].includes(error.code ?? '')) return 'confirmationSent';
  if (mode === 'login' && error.code === 'email_not_confirmed') return 'emailNotConfirmed';
  if (mode === 'login' && ['invalid_credentials', 'user_not_found'].includes(error.code ?? '')) return 'invalidCredentials';
  if (error.code === 'weak_password') return 'weakPassword';
  if (error.code === 'same_password') return 'samePassword';
  if (mode === 'reset' && (error.status === 401 || ['session_not_found', 'refresh_token_not_found'].includes(error.code ?? ''))) {
    return 'invalidLink';
  }
  if (error.status === 429) return 'rateLimited';
  return 'unavailable';
}

export function parseEmailLink(query: URLSearchParams) {
  const tokenHash = query.get('token_hash');
  const type = query.get('type');
  if (!tokenHash || !/^[a-zA-Z0-9_-]{1,256}$/.test(tokenHash) || (type !== 'signup' && type !== 'recovery')) return null;
  return { tokenHash, type };
}
