import type { MetadataRoute } from 'next';
import { palette } from '@/lib/palette';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'MASOMENO',
    short_name: 'masomeno.',
    lang: 'es',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: palette.bone,
    theme_color: palette.petrol,
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
