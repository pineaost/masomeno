import type { MetadataRoute } from 'next';
import { brandIcons } from '@/lib/brand';
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
      { ...brandIcons.small, type: 'image/png' },
      { ...brandIcons.large, type: 'image/png', purpose: 'any' },
      { ...brandIcons.maskable, type: 'image/png', purpose: 'maskable' },
    ],
  };
}
