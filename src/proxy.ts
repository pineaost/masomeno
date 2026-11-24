import { NextResponse, type NextRequest } from 'next/server';
import { authHeaders, isAuthCookie } from '@/lib/supabase/config';
import { createServerSupabase } from '@/lib/supabase/server';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  for (const [key, value] of Object.entries(authHeaders)) response.headers.set(key, value);
  if (!request.cookies.getAll().some((cookie) => isAuthCookie(cookie.name))) return response;

  const supabase = createServerSupabase({
    getAll: () => request.cookies.getAll(),
    setAll: (updates, headers) => {
      for (const { name, value } of updates) request.cookies.set(name, value);
      const refreshed = NextResponse.next({ request });
      for (const cookie of response.cookies.getAll()) refreshed.cookies.set(cookie);
      for (const { name, value, options } of updates) refreshed.cookies.set(name, value, options);
      for (const [key, value] of Object.entries({ ...headers, ...authHeaders })) refreshed.headers.set(key, value);
      response = refreshed;
    },
  });
  await supabase?.auth.getClaims();
  return response;
}

export const config = {
  matcher: ['/es/:path*', '/en/:path*', '/it/:path*'],
};
