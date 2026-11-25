import type { MetadataRoute } from 'next';
import { brandIcons, brandName } from '@/lib/brand';
import { palette } from '@/lib/palette';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: brandName,
    short_name: brandName,
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
