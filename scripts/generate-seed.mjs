// يولّد ملفات SQL من src/data/demo.json:
//   supabase/seed/reference_data.sql  → مدن/مناطق/تصنيفات (تُستخدم في الإنتاج أيضاً)
//   supabase/seed/demo_data.sql       → مطاعم ومراجعات تجريبية (is_demo = true) فقط للتجربة
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const demo = JSON.parse(readFileSync(join(root, 'src/data/demo.json'), 'utf8'));
const outDir = join(root, 'supabase', 'seed');
mkdirSync(outDir, { recursive: true });

const q = (v) => (v === null || v === undefined ? 'null' : `'${String(v).replace(/'/g, "''")}'`);
const n = (v) => (v === null || v === undefined ? 'null' : String(Number(v)));
const city = demo.city.slug;

// ---------- reference_data.sql ----------
let ref = `-- بيانات مرجعية (آمنة للإنتاج). شغّلها بعد ملف المخطط.\n\n`;
ref += `insert into public.cities (slug, name_ar, name_en, lat, lng, zoom, is_active) values\n`;
ref += [
  `  (${q(demo.city.slug)}, ${q(demo.city.name_ar)}, ${q(demo.city.name_en)}, ${n(demo.city.lat)}, ${n(demo.city.lng)}, ${n(demo.city.zoom)}, true)`,
  ...demo.otherCities.map((c) => `  (${q(c.slug)}, ${q(c.name_ar)}, ${q(c.name_en)}, ${n(c.lat)}, ${n(c.lng)}, 12, false)`),
].join(',\n');
ref += `\non conflict (slug) do update set name_ar = excluded.name_ar, name_en = excluded.name_en,\n  lat = excluded.lat, lng = excluded.lng, zoom = excluded.zoom;\n\n`;

ref += `insert into public.areas (city_id, slug, name_ar, lat, lng)\nselect c.id, v.slug, v.name_ar, v.lat, v.lng\nfrom public.cities c,\n(values\n`;
ref += demo.areas.map((a) => `  (${q(a.slug)}, ${q(a.name_ar)}, ${n(a.lat)}::double precision, ${n(a.lng)}::double precision)`).join(',\n');
ref += `\n) as v(slug, name_ar, lat, lng)\nwhere c.slug = ${q(city)}\non conflict (city_id, slug) do update set name_ar = excluded.name_ar, lat = excluded.lat, lng = excluded.lng;\n\n`;

ref += `insert into public.cuisines (slug, name_ar, icon) values\n`;
ref += demo.cuisines.map((c) => `  (${q(c.slug)}, ${q(c.name_ar)}, ${q(c.icon)})`).join(',\n');
ref += `\non conflict (slug) do update set name_ar = excluded.name_ar, icon = excluded.icon;\n`;
writeFileSync(join(outDir, 'reference_data.sql'), ref);

// ---------- demo_data.sql ----------
let d = `-- ⚠️ بيانات تجريبية فقط (is_demo = true). أسماء وتقييمات وصور وإحداثيات غير حقيقية.\n`;
d += `-- لحذفها قبل الإطلاق شغّل remove_demo_data.sql\n\n`;
d += `delete from public.restaurants where is_demo = true;\n\n`;

for (const r of demo.restaurants) {
  d += `-- ${r.name_ar}\n`;
  d += `insert into public.restaurants (slug, name_ar, name_en, description, kind, city_id, area_id, address, lat, lng, price_level, opening_hours, status, is_demo)\n`;
  d += `select ${q(r.slug)}, ${q(r.name_ar)}, ${q(r.name_en)}, ${q(r.description)}, ${q(r.kind)}, c.id, a.id, ${q(r.address)}, ${n(r.lat)}, ${n(r.lng)}, ${n(r.price)}, ${q(r.hours)}, 'approved', true\n`;
  d += `from public.cities c join public.areas a on a.city_id = c.id and a.slug = ${q(r.area)}\nwhere c.slug = ${q(city)};\n`;
  d += `insert into public.restaurant_cuisines (restaurant_id, cuisine_id)\nselect r.id, cu.id from public.restaurants r, public.cuisines cu\nwhere r.slug = ${q(r.slug)} and cu.slug in (${r.cuisines.map(q).join(', ')});\n`;
  d += `insert into public.restaurant_images (restaurant_id, url, alt, is_cover, is_placeholder, sort_order)\nselect id, ${q(`/placeholders/${r.cuisines[0]}.svg`)}, 'صورة تجريبية — ليست صورة المطعم', true, true, 0\nfrom public.restaurants where slug = ${q(r.slug)};\n`;
  for (const rv of r.reviews) {
    d += `insert into public.reviews (restaurant_id, author_name, is_demo, rating, comment)\nselect id, 'مراجع تجريبي', true, ${n(rv.rating)}, ${q(rv.comment)} from public.restaurants where slug = ${q(r.slug)};\n`;
  }
  d += `\n`;
}
writeFileSync(join(outDir, 'demo_data.sql'), d);

writeFileSync(
  join(outDir, 'remove_demo_data.sql'),
  `-- يحذف كل البيانات التجريبية (المطاعم والصور والمراجعات والمفضلة المرتبطة بها). شغّله قبل الإطلاق.\ndelete from public.restaurants where is_demo = true;\n`
);

console.log('تم توليد: reference_data.sql, demo_data.sql, remove_demo_data.sql');
