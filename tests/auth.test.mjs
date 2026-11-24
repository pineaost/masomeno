import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parsePreferences, parseProfile } from '../src/lib/account-fields.ts';
import { emailReturnUrl, loginPath, readLocale, readLoginMode, readLoginNotice } from '../src/lib/auth-paths.ts';
import { authFormError, parseEmailLink, validateAuthForm } from '../src/lib/password-auth.ts';
import { verifyAccess } from '../src/lib/supabase/access.ts';
import { isAuthCookie, isRecoveryCookie, isSessionCookie } from '../src/lib/supabase/config.ts';

const claims = { claims: { sub: 'authenticated-user', email: 'fixture@example.invalid' } };

test('una sesión ausente o inválida se distingue de una sesión expirada', async () => {
  const client = {
    auth: { getClaims: async () => ({ data: claims, error: { name: 'AuthInvalidJwtError' } }) },
  };
  assert.deepEqual(await verifyAccess(client), { kind: 'anonymous' });
  assert.deepEqual(await verifyAccess(client, true), { kind: 'expired' });
  assert.deepEqual(await verifyAccess(null), { kind: 'unconfigured' });
});

test('la sesión de Supabase verifica identidad con Google o correo y excluye la sesión anónima', async () => {
  for (const provider of ['google', 'email']) {
    const client = { auth: { getClaims: async () => ({ data: { claims: { ...claims.claims, app_metadata: { provider } } } }) } };
    assert.deepEqual(await verifyAccess(client), {
      kind: 'authenticated', id: claims.claims.sub, email: claims.claims.email,
    });
  }
  assert.deepEqual(await verifyAccess({ auth: { getClaims: async () => ({
    data: { claims: { ...claims.claims, is_anonymous: true } },
  }) } }), { kind: 'anonymous' });
  const client = { auth: { getClaims: async () => { throw new Error('network'); } } };
  assert.deepEqual(await verifyAccess(client), { kind: 'unavailable' });
});

test('las rutas son locales y la cookie de recuperación no es una sesión de la aplicación', () => {
  assert.equal(loginPath(readLocale('//host.invalid'), 'anonymous'), '/es/login');
  assert.equal(loginPath(readLocale('it'), 'expired'), '/it/login?estado=expired');
  assert.equal(loginPath('en', 'invalidLink', 'recover'), '/en/login?modo=recover&estado=invalidLink');
  assert.equal(readLoginMode('https://host.invalid'), 'login');
  assert.equal(readLoginNotice('https://host.invalid'), undefined);
  assert.ok(isAuthCookie('masomeno_auth.2'));
  assert.ok(isAuthCookie('masomeno_auth-code-verifier'));
  assert.ok(isAuthCookie('masomeno_auth-flow-foo-code-verifier.1'));
  assert.ok(isAuthCookie('masomeno_auth-flows-code-verifier'));
  assert.ok(isRecoveryCookie('masomeno_recovery.0'));
  assert.equal(isSessionCookie('masomeno_recovery.0'), false);
  assert.equal(isSessionCookie('masomeno_auth-code-verifier'), false);
  assert.equal(isAuthCookie('masomeno_locale'), false);
});

test('los enlaces de correo usan el origen HTTPS correcto según el entorno', () => {
  assert.equal(emailReturnUrl('it', {
    MASOMENO_SITE_URL: 'https://example.com/', VERCEL_ENV: 'production', VERCEL_PROJECT_PRODUCTION_URL: 'project.vercel.app',
  }), 'https://example.com/auth/confirm/it');
  assert.equal(emailReturnUrl('en', {
    VERCEL_ENV: 'production', VERCEL_PROJECT_PRODUCTION_URL: 'project.vercel.app', VERCEL_URL: 'deploy.vercel.app',
  }), 'https://project.vercel.app/auth/confirm/en');
  assert.equal(emailReturnUrl('es', {
    VERCEL_ENV: 'preview', VERCEL_PROJECT_PRODUCTION_URL: 'project.vercel.app', VERCEL_URL: 'deploy.vercel.app',
  }), 'https://deploy.vercel.app/auth/confirm/es');
  assert.equal(emailReturnUrl('es', { NODE_ENV: 'development' }), 'http://localhost:3000/auth/confirm/es');
  assert.equal(emailReturnUrl('en', { NODE_ENV: 'development', MASOMENO_SITE_URL: 'http://localhost:3115' }),
    'http://localhost:3115/auth/confirm/en');
  assert.equal(emailReturnUrl('es', { NODE_ENV: 'production' }), null);
  assert.equal(emailReturnUrl('es', { VERCEL_ENV: 'preview', VERCEL_PROJECT_PRODUCTION_URL: 'project.vercel.app' }), null);
  assert.equal(emailReturnUrl('es', {
    NODE_ENV: 'development', VERCEL_ENV: 'production', MASOMENO_SITE_URL: 'https://localhost:3000',
  }), null);
  for (const origin of ['https://example.com/path', 'https://user:pass@example.com', 'http://example.com', 'https://example.com?x=1']) {
    assert.equal(emailReturnUrl('es', { MASOMENO_SITE_URL: origin }), null);
  }
});

test('registro, recuperación e ingreso validan lo necesario sin alterar las contraseñas', () => {
  const fields = new FormData();
  fields.set('email', ' user@example.invalid ');
  fields.set('password', ' UnClave_3 ');
  fields.set('confirm_password', ' UnClave_3 ');
  assert.deepEqual(validateAuthForm('signup', fields), { email: 'user@example.invalid', password: ' UnClave_3 ' });
  fields.set('confirm_password', 'OtroValor');
  assert.equal(validateAuthForm('reset', fields).error, 'passwordMismatch');
  fields.set('password', 'short');
  assert.equal(validateAuthForm('signup', fields).error, 'weakPassword');
  assert.equal(validateAuthForm('login', fields).password, 'short');
  fields.set('email', 'invalid address');
  assert.equal(validateAuthForm('recover', fields).error, 'invalidEmail');
});

test('la recuperación da la misma respuesta y cada enlace exige su tipo de token', () => {
  for (const code of ['user_not_found', 'email_address_not_authorized', 'unexpected_failure']) {
    assert.equal(authFormError('recover', { code }), 'recoveryRequested');
  }
  assert.equal(authFormError('signup', { code: 'user_already_exists' }), 'confirmationSent');
  assert.equal(authFormError('login', { code: 'email_not_confirmed' }), 'emailNotConfirmed');
  assert.equal(authFormError('login', { code: 'invalid_credentials' }), 'invalidCredentials');
  assert.equal(authFormError('reset', { code: 'session_not_found' }), 'invalidLink');
  assert.deepEqual(parseEmailLink(new URLSearchParams('type=signup&token_hash=pkce_abc123&next=https://host.invalid')),
    { type: 'signup', tokenHash: 'pkce_abc123' });
  assert.deepEqual(parseEmailLink(new URLSearchParams('type=recovery&token_hash=abc123')),
    { type: 'recovery', tokenHash: 'abc123' });
  assert.equal(parseEmailLink(new URLSearchParams('type=email&token_hash=abc123')), null);
  assert.equal(parseEmailLink(new URLSearchParams('type=recovery&token_hash=abc%20test')), null);
});

test('la escritura de preferencias acepta solo idiomas y unidades disponibles', () => {
  const fields = new FormData();
  for (const [key, value] of Object.entries({
    locale: 'it', weight_unit: 'lb', height_unit: 'feet', distance_unit: 'mi',
  })) fields.set(key, value);
  fields.set('user_id', 'other-user');
  assert.deepEqual(parsePreferences(fields), { locale: 'it', weight_unit: 'lb', height_unit: 'feet', distance_unit: 'mi' });
  fields.set('locale', '//host.invalid');
  assert.equal(parsePreferences(fields), null);
  fields.set('locale', 'es');
  fields.set('weight_unit', 'stone');
  assert.equal(parsePreferences(fields), null);
});

test('el perfil conserva unidades canónicas y valida fecha y zona horaria', () => {
  const fields = new FormData();
  for (const [key, value] of Object.entries({
    display_name: ' Nombre ', birth_date: '', height_cm: '173.50', time_zone: 'America/Argentina/Buenos_Aires',
  })) fields.set(key, value);
  assert.deepEqual(parseProfile(fields), {
    display_name: 'Nombre', birth_date: null, height_cm: 173.5, time_zone: 'America/Argentina/Buenos_Aires',
  });
  fields.set('birth_date', '1995-02-29');
  assert.equal(parseProfile(fields), null);
  fields.set('birth_date', '1996-02-29');
  fields.set('time_zone', 'Nowhere/Test');
  assert.equal(parseProfile(fields), null);
  fields.set('time_zone', 'UTC');
  fields.set('height_cm', '301');
  assert.equal(parseProfile(fields), null);
});
