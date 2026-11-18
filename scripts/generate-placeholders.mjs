// يولّد صور SVG تجريبية (بدون أي صور حقيقية) في public/placeholders
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'placeholders');
mkdirSync(outDir, { recursive: true });

const palettes = {
  default:   ['#0d3b2c', '#1a5f48', '🍽️'],
  iraqi:     ['#6b2f0e', '#e8772e', '🍛'],
  grills:    ['#5a1d12', '#d9542b', '🍢'],
  masgouf:   ['#0b3b4a', '#1f8a9c', '🐟'],
  burger:    ['#5b3a0b', '#f0a02c', '🍔'],
  pizza:     ['#7a1f16', '#e8772e', '🍕'],
  italian:   ['#1d4a2a', '#c8452f', '🍝'],
  levantine: ['#4a3a12', '#c9962b', '🥙'],
  asian:     ['#3a1230', '#d4506a', '🍜'],
  breakfast: ['#7a4a0e', '#f2b441', '🍳'],
  dessert:   ['#5b1f3a', '#e87aa0', '🍰'],
  coffee:    ['#2e1b10', '#8a5a36', '☕'],
  healthy:   ['#12402a', '#5fae3f', '🥗'],
};

for (const [name, [a, b, emoji]] of Object.entries(palettes)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="صورة تجريبية">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
  <rect width="1200" height="800" fill="url(#g)"/>
  <g fill="#ffffff" opacity=".08"><circle cx="1000" cy="140" r="270"/><circle cx="150" cy="700" r="230"/><circle cx="640" cy="430" r="130"/></g>
  <text x="600" y="470" font-size="240" text-anchor="middle">${emoji}</text>
</svg>
`;
  writeFileSync(join(outDir, `${name}.svg`), svg);
}
console.log(`تم توليد ${Object.keys(palettes).length} صورة تجريبية في public/placeholders`);
