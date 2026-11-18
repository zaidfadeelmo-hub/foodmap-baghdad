-- بيانات مرجعية (آمنة للإنتاج). شغّلها بعد ملف المخطط.

insert into public.cities (slug, name_ar, name_en, lat, lng, zoom, is_active) values
  ('baghdad', 'بغداد', 'Baghdad', 33.3152, 44.3661, 12, true),
  ('basra', 'البصرة', 'Basra', 30.5085, 47.7804, 12, false),
  ('mosul', 'الموصل', 'Mosul', 36.335, 43.1189, 12, false),
  ('erbil', 'أربيل', 'Erbil', 36.1911, 44.0092, 12, false),
  ('najaf', 'النجف', 'Najaf', 32, 44.335, 12, false),
  ('karbala', 'كربلاء', 'Karbala', 32.616, 44.0249, 12, false),
  ('sulaymaniyah', 'السليمانية', 'Sulaymaniyah', 35.5558, 45.4351, 12, false),
  ('kirkuk', 'كركوك', 'Kirkuk', 35.4681, 44.3922, 12, false),
  ('duhok', 'دهوك', 'Duhok', 36.8679, 42.9503, 12, false)
on conflict (slug) do update set name_ar = excluded.name_ar, name_en = excluded.name_en,
  lat = excluded.lat, lng = excluded.lng, zoom = excluded.zoom;

insert into public.areas (city_id, slug, name_ar, lat, lng)
select c.id, v.slug, v.name_ar, v.lat, v.lng
from public.cities c,
(values
  ('karrada', 'الكرادة', 33.301::double precision, 44.429::double precision),
  ('mansour', 'المنصور', 33.317::double precision, 44.348::double precision),
  ('jadriyah', 'الجادرية', 33.279::double precision, 44.378::double precision),
  ('adhamiyah', 'الأعظمية', 33.368::double precision, 44.375::double precision),
  ('kadhimiya', 'الكاظمية', 33.379::double precision, 44.34::double precision),
  ('zayouna', 'زيونة', 33.333::double precision, 44.458::double precision),
  ('harthiya', 'الحارثية', 33.325::double precision, 44.356::double precision),
  ('arasat', 'العرصات', 33.305::double precision, 44.401::double precision),
  ('yarmouk', 'اليرموك', 33.301::double precision, 44.342::double precision),
  ('dora', 'الدورة', 33.242::double precision, 44.372::double precision)
) as v(slug, name_ar, lat, lng)
where c.slug = 'baghdad'
on conflict (city_id, slug) do update set name_ar = excluded.name_ar, lat = excluded.lat, lng = excluded.lng;

insert into public.cuisines (slug, name_ar, icon) values
  ('iraqi', 'عراقي', '🍛'),
  ('grills', 'مشاوي', '🍢'),
  ('masgouf', 'سمك مسكوف', '🐟'),
  ('burger', 'برغر', '🍔'),
  ('pizza', 'بيتزا', '🍕'),
  ('italian', 'إيطالي', '🍝'),
  ('levantine', 'شرقي', '🥙'),
  ('asian', 'آسيوي', '🍜'),
  ('breakfast', 'فطور', '🍳'),
  ('dessert', 'حلويات', '🍰'),
  ('coffee', 'قهوة مختصة', '☕'),
  ('healthy', 'صحي', '🥗')
on conflict (slug) do update set name_ar = excluded.name_ar, icon = excluded.icon;
