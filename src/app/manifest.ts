import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FoodMap Baghdad',
    short_name: 'FoodMap',
    description: 'دليلك لأطيب لقمة ببغداد.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fbf8f1',
    theme_color: '#0d3b2c',
    lang: 'ar',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
