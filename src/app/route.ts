import type { NextRequest } from 'next/server';
import { defaultLocale, isLocale, localeCookie, localePath } from '@/i18n/config';

export function GET(request: NextRequest) {
  const preferred = request.cookies.get(localeCookie)?.value;
  const locale = isLocale(preferred) ? preferred : defaultLocale;

  return new Response(null, {
    status: 307,
    headers: { Location: localePath(locale), 'Cache-Control': 'private, no-store', Vary: 'Cookie' },
  });
}
