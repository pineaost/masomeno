import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database';

type AccessClient = { auth: Pick<SupabaseClient<Database>['auth'], 'getClaims'> };

export type Access =
  | { kind: 'authenticated'; id: string; email: string | null }
  | { kind: 'anonymous' | 'expired' | 'unavailable' | 'unconfigured' };

export function temporaryAuthError(error: { name?: string; status?: number }) {
  return error.name === 'AuthRetryableFetchError' || (error.status ?? 0) >= 500;
}

export async function verifyAccess(client: AccessClient | null, expectedSession = false): Promise<Access> {
  if (!client) return { kind: 'unconfigured' };

  try {
    const { data, error } = await client.auth.getClaims();
    if (error && temporaryAuthError(error)) {
      return { kind: 'unavailable' };
    }
    const claims = data?.claims;
    if (error || typeof claims?.sub !== 'string' || !claims.sub || claims.is_anonymous === true) {
      return { kind: expectedSession ? 'expired' : 'anonymous' };
    }

    return { kind: 'authenticated', id: claims.sub, email: typeof claims.email === 'string' ? claims.email : null };
  } catch {
    return { kind: 'unavailable' };
  }
}
