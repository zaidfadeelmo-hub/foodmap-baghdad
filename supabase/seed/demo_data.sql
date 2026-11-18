-- ⚠️ بيانات تجريبية فقط (is_demo = true). أسماء وتقييمات وصور وإحداثيات غير حقيقية.
-- لحذفها قبل الإطلاق شغّل remove_demo_data.sql

delete from public.restaurants where is_demo = true;

-- ضفاف دجلة
insert into public.restaurants (slug, name_ar, name_en, description, kind, city_id, area_id, address, lat, lng, price_level, opening_hours, status, is_demo)
select 'demo-dijla-banks', 'ضفاف دجلة', 'Dijla Banks', 'مطعم تجريبي لعرض شكل الصفحة: مسكوف ومقبلات عراقية وجلسات مطلة على النهر. هذه البيانات للتصميم فقط وليست لمطعم حقيقي.', 'restaurant', c.id, a.id, 'الجادرية — موقع تقريبي (بيانات تجريبية)', 33.2812, 44.3815, 3, 'يومياً ١٢ ظهراً – ١٢ ليلاً (تجريبي)', 'approved', true
from public.cities c join public.areas a on a.city_id = c.id and a.slug = 'jadriyah'
where c.slug = 'baghdad';
insert into public.restaurant_cuisines (restaurant_id, cuisine_id)
select r.id, cu.id from public.restaurants r, public.cuisines cu
where r.slug = 'demo-dijla-banks' and cu.slug in ('masgouf', 'iraqi');
insert into public.restaurant_images (restaurant_id, url, alt, is_cover, is_placeholder, sort_order)
select id, '/placeholders/masgouf.svg', 'صورة تجريبية — ليست صورة المطعم', true, true, 0
from public.restaurants where slug = 'demo-dijla-banks';
insert into public.reviews (restaurant_id, author_name, is_demo, rating, comment)
select id, 'مراجع تجريبي', true, 5, 'مراجعة تجريبية: أجواء جميلة وخدمة سريعة.' from public.restaurants where slug = 'demo-dijla-banks';
insert into public.reviews (restaurant_id, author_name, is_demo, rating, comment)
select id, 'مراجع تجريبي', true, 4, 'مراجعة تجريبية: الأسعار مناسبة للجودة.' from public.restaurants where slug = 'demo-dijla-banks';

-- مشاوي الأصيل
insert into public.restaurants (slug, name_ar, name_en, description, kind, city_id, area_id, address, lat, lng, price_level, opening_hours, status, is_demo)
select 'demo-asil-grills', 'مشاوي الأصيل', 'Al-Aseel Grills', 'مطعم مشاوي تجريبي: كباب وتكة ولحم مشوي مع خبز تنور. بيانات تجريبية لعرض التصميم.', 'restaurant', c.id, a.id, 'الكرادة — موقع تقريبي (بيانات تجريبية)', 33.3032, 44.4262, 2, 'يومياً ١٢ ظهراً – ١١ ليلاً (تجريبي)', 'approved', true
from public.cities c join public.areas a on a.city_id = c.id and a.slug = 'karrada'
where c.slug = 'baghdad';
insert into public.restaurant_cuisines (restaurant_id, cuisine_id)
select r.id, cu.id from public.restaurants r, public.cuisines cu
where r.slug = 'demo-asil-grills' and cu.slug in ('grills', 'iraqi');
insert into public.restaurant_images (restaurant_id, url, alt, is_cover, is_placeholder, sort_order)
select id, '/placeholders/grills.svg', 'صورة تجريبية — ليست صورة المطعم', true, true, 0
from public.restaurants where slug = 'demo-asil-grills';
insert into public.reviews (restaurant_id, author_name, is_demo, rating, comment)
select id, 'مراجع تجريبي', true, 5, 'مراجعة تجريبية: كباب مميز.' from public.restaurants where slug = 'demo-asil-grills';
insert into public.reviews (restaurant_id, author_name, is_demo, rating, comment)
select id, 'مراجع تجريبي', true, 4, 'مراجعة تجريبية: يستحق التجربة.' from public.restaurants where slug = 'demo-asil-grills';
insert into public.reviews (restaurant_id, author_name, is_demo, rating, comment)
select id, 'مراجع تجريبي', true, 4, 'مراجعة تجريبية: ازدحام وقت الغداء.' from public.restaurants where slug = 'demo-asil-grills';

-- كافيه الفجر
insert into public.restaurants (slug, name_ar, name_en, description, kind, city_id, area_id, address, lat, lng, price_level, opening_hours, status, is_demo)
select 'demo-fajr-cafe', 'كافيه الفجر', 'Fajr Cafe', 'كافيه تجريبي للقهوة المختصة والحلويات، مناسب للدراسة والعمل. بيانات تجريبية.', 'cafe', c.id, a.id, 'المنصور — موقع تقريبي (بيانات تجريبية)', 33.3141, 44.3512, 2, 'يومياً ٨ صباحاً – ١٢ ليلاً (تجريبي)', 'approved', true
from public.cities c join public.areas a on a.city_id = c.id and a.slug = 'mansour'
where c.slug = 'baghdad';
insert into public.restaurant_cuisines (restaurant_id, cuisine_id)
select r.id, cu.id from public.restaurants r, public.cuisines cu
where r.slug = 'demo-fajr-cafe' and cu.slug in ('coffee', 'dessert');
insert into public.restaurant_images (restaurant_id, url, alt, is_cover, is_placeholder, sort_order)
select id, '/placeholders/coffee.svg', 'صورة تجريبية — ليست صورة المطعم', true, true, 0
from public.restaurants where slug = 'demo-fajr-cafe';
insert into public.reviews (restaurant_id, author_name, is_demo, rating, comment)
select id, 'مراجع تجريبي', true, 5, 'مراجعة تجريبية: قهوة ممتازة وجلسة هادئة.' from public.restaurants where slug = 'demo-fajr-cafe';
insert into public.reviews (restaurant_id, author_name, is_demo, rating, comment)
select id, 'مراجع تجريبي', true, 5, 'مراجعة تجريبية: حلويات طازجة.' from public.restaurants where slug = 'demo-fajr-cafe';

-- برغر ستيشن
insert into public.restaurants (slug, name_ar, name_en, description, kind, city_id, area_id, address, lat, lng, price_level, opening_hours, status, is_demo)
select 'demo-burger-station', 'برغر ستيشن', 'Burger Station', 'مطعم برغر تجريبي بوجبات سريعة وصوصات خاصة. بيانات تجريبية لعرض التصميم.', 'restaurant', c.id, a.id, 'زيونة — موقع تقريبي (بيانات تجريبية)', 33.336, 44.461, 2, 'يومياً ١ ظهراً – ٢ ليلاً (تجريبي)', 'approved', true
from public.cities c join public.areas a on a.city_id = c.id and a.slug = 'zayouna'
where c.slug = 'baghdad';
insert into public.restaurant_cuisines (restaurant_id, cuisine_id)
select r.id, cu.id from public.restaurants r, public.cuisines cu
where r.slug = 'demo-burger-station' and cu.slug in ('burger');
insert into public.restaurant_images (restaurant_id, url, alt, is_cover, is_placeholder, sort_order)
select id, '/placeholders/burger.svg', 'صورة تجريبية — ليست صورة المطعم', true, true, 0
from public.restaurants where slug = 'demo-burger-station';
insert into public.reviews (restaurant_id, author_name, is_demo, rating, comment)
select id, 'مراجع تجريبي', true, 4, 'مراجعة تجريبية: برغر لذيذ وحجم جيد.' from public.restaurants where slug = 'demo-burger-station';
insert into public.reviews (restaurant_id, author_name, is_demo, rating, comment)
select id, 'مراجع تجريبي', true, 3, 'مراجعة تجريبية: التوصيل تأخر قليلاً.' from public.restaurants where slug = 'demo-burger-station';

-- بيت الطبخ العراقي
insert into public.restaurants (slug, name_ar, name_en, description, kind, city_id, area_id, address, lat, lng, price_level, opening_hours, status, is_demo)
select 'demo-iraqi-kitchen', 'بيت الطبخ العراقي', 'Iraqi Home Kitchen', 'مطبخ بيتي تجريبي: تمن ومرق ودولمة وباجة. بيانات تجريبية.', 'restaurant', c.id, a.id, 'الأعظمية — موقع تقريبي (بيانات تجريبية)', 33.3702, 44.3722, 1, 'يومياً ١٢ ظهراً – ١٠ ليلاً (تجريبي)', 'approved', true
from public.cities c join public.areas a on a.city_id = c.id and a.slug = 'adhamiyah'
where c.slug = 'baghdad';
insert into public.restaurant_cuisines (restaurant_id, cuisine_id)
select r.id, cu.id from public.restaurants r, public.cuisines cu
where r.slug = 'demo-iraqi-kitchen' and cu.slug in ('iraqi');
insert into public.restaurant_images (restaurant_id, url, alt, is_cover, is_placeholder, sort_order)
select id, '/placeholders/iraqi.svg', 'صورة تجريبية — ليست صورة المطعم', true, true, 0
from public.restaurants where slug = 'demo-iraqi-kitchen';
insert into public.reviews (restaurant_id, author_name, is_demo, rating, comment)
select id, 'مراجع تجريبي', true, 5, 'مراجعة تجريبية: طعم بيتي أصيل.' from public.restaurants where slug = 'demo-iraqi-kitchen';
insert into public.reviews (restaurant_id, author_name, is_demo, rating, comment)
select id, 'مراجع تجريبي', true, 5, 'مراجعة تجريبية: سعر ممتاز.' from public.restaurants where slug = 'demo-iraqi-kitchen';

-- بيتزا الحارثية
insert into public.restaurants (slug, name_ar, name_en, description, kind, city_id, area_id, address, lat, lng, price_level, opening_hours, status, is_demo)
select 'demo-harthiya-pizza', 'بيتزا الحارثية', 'Harthiya Pizza', 'بيتزا تجريبية على الحطب مع عجينة مخمّرة. بيانات تجريبية لعرض التصميم.', 'restaurant', c.id, a.id, 'الحارثية — موقع تقريبي (بيانات تجريبية)', 33.3231, 44.3588, 2, 'يومياً ١٢ ظهراً – ١٢ ليلاً (تجريبي)', 'approved', true
from public.cities c join public.areas a on a.city_id = c.id and a.slug = 'harthiya'
where c.slug = 'baghdad';
insert into public.restaurant_cuisines (restaurant_id, cuisine_id)
select r.id, cu.id from public.restaurants r, public.cuisines cu
where r.slug = 'demo-harthiya-pizza' and cu.slug in ('pizza', 'italian');
insert into public.restaurant_images (restaurant_id, url, alt, is_cover, is_placeholder, sort_order)
select id, '/placeholders/pizza.svg', 'صورة تجريبية — ليست صورة المطعم', true, true, 0
from public.restaurants where slug = 'demo-harthiya-pizza';
insert into public.reviews (restaurant_id, author_name, is_demo, rating, comment)
select id, 'مراجع تجريبي', true, 4, 'مراجعة تجريبية: عجينة خفيفة.' from public.restaurants where slug = 'demo-harthiya-pizza';
insert into public.reviews (restaurant_id, author_name, is_demo, rating, comment)
select id, 'مراجع تجريبي', true, 4, 'مراجعة تجريبية: خيارات كثيرة.' from public.restaurants where slug = 'demo-harthiya-pizza';

-- كافيه الوراقين
insert into public.restaurants (slug, name_ar, name_en, description, kind, city_id, area_id, address, lat, lng, price_level, opening_hours, status, is_demo)
select 'demo-warraqeen-cafe', 'كافيه الوراقين', 'Warraqeen Cafe', 'كافيه تجريبي بمكتبة صغيرة وفطور صباحي. بيانات تجريبية.', 'cafe', c.id, a.id, 'العرصات — موقع تقريبي (بيانات تجريبية)', 33.3079, 44.3987, 2, 'يومياً ٧ صباحاً – ١١ ليلاً (تجريبي)', 'approved', true
from public.cities c join public.areas a on a.city_id = c.id and a.slug = 'arasat'
where c.slug = 'baghdad';
insert into public.restaurant_cuisines (restaurant_id, cuisine_id)
select r.id, cu.id from public.restaurants r, public.cuisines cu
where r.slug = 'demo-warraqeen-cafe' and cu.slug in ('coffee', 'breakfast');
insert into public.restaurant_images (restaurant_id, url, alt, is_cover, is_placeholder, sort_order)
select id, '/placeholders/coffee.svg', 'صورة تجريبية — ليست صورة المطعم', true, true, 0
from public.restaurants where slug = 'demo-warraqeen-cafe';
insert into public.reviews (restaurant_id, author_name, is_demo, rating, comment)
select id, 'مراجع تجريبي', true, 5, 'مراجعة تجريبية: مكان رائع للقراءة.' from public.restaurants where slug = 'demo-warraqeen-cafe';
insert into public.reviews (restaurant_id, author_name, is_demo, rating, comment)
select id, 'مراجع تجريبي', true, 4, 'مراجعة تجريبية: فطور جيد.' from public.restaurants where slug = 'demo-warraqeen-cafe';

-- الشام الجديد
insert into public.restaurants (slug, name_ar, name_en, description, kind, city_id, area_id, address, lat, lng, price_level, opening_hours, status, is_demo)
select 'demo-new-sham', 'الشام الجديد', 'New Sham', 'مطعم شرقي تجريبي: شاورما ومقبلات وحمص. بيانات تجريبية لعرض التصميم.', 'restaurant', c.id, a.id, 'اليرموك — موقع تقريبي (بيانات تجريبية)', 33.2988, 44.3451, 2, 'يومياً ١٢ ظهراً – ١٢ ليلاً (تجريبي)', 'approved', true
from public.cities c join public.areas a on a.city_id = c.id and a.slug = 'yarmouk'
where c.slug = 'baghdad';
insert into public.restaurant_cuisines (restaurant_id, cuisine_id)
select r.id, cu.id from public.restaurants r, public.cuisines cu
where r.slug = 'demo-new-sham' and cu.slug in ('levantine', 'grills');
insert into public.restaurant_images (restaurant_id, url, alt, is_cover, is_placeholder, sort_order)
select id, '/placeholders/levantine.svg', 'صورة تجريبية — ليست صورة المطعم', true, true, 0
from public.restaurants where slug = 'demo-new-sham';
insert into public.reviews (restaurant_id, author_name, is_demo, rating, comment)
select id, 'مراجع تجريبي', true, 4, 'مراجعة تجريبية: شاورما طيبة.' from public.restaurants where slug = 'demo-new-sham';
insert into public.reviews (restaurant_id, author_name, is_demo, rating, comment)
select id, 'مراجع تجريبي', true, 3, 'مراجعة تجريبية: الخدمة متوسطة.' from public.restaurants where slug = 'demo-new-sham';

-- نودلز بغداد
insert into public.restaurants (slug, name_ar, name_en, description, kind, city_id, area_id, address, lat, lng, price_level, opening_hours, status, is_demo)
select 'demo-noodles-baghdad', 'نودلز بغداد', 'Baghdad Noodles', 'مطعم آسيوي تجريبي: نودلز وأرز مقلي وسوشي بسيط. بيانات تجريبية.', 'restaurant', c.id, a.id, 'المنصور — موقع تقريبي (بيانات تجريبية)', 33.3189, 44.3441, 2, 'يومياً ١٢ ظهراً – ١١ ليلاً (تجريبي)', 'approved', true
from public.cities c join public.areas a on a.city_id = c.id and a.slug = 'mansour'
where c.slug = 'baghdad';
insert into public.restaurant_cuisines (restaurant_id, cuisine_id)
select r.id, cu.id from public.restaurants r, public.cuisines cu
where r.slug = 'demo-noodles-baghdad' and cu.slug in ('asian');
insert into public.restaurant_images (restaurant_id, url, alt, is_cover, is_placeholder, sort_order)
select id, '/placeholders/asian.svg', 'صورة تجريبية — ليست صورة المطعم', true, true, 0
from public.restaurants where slug = 'demo-noodles-baghdad';
insert into public.reviews (restaurant_id, author_name, is_demo, rating, comment)
select id, 'مراجع تجريبي', true, 4, 'مراجعة تجريبية: نكهات جيدة.' from public.restaurants where slug = 'demo-noodles-baghdad';
insert into public.reviews (restaurant_id, author_name, is_demo, rating, comment)
select id, 'مراجع تجريبي', true, 5, 'مراجعة تجريبية: نودلز حار ولذيذ.' from public.restaurants where slug = 'demo-noodles-baghdad';

-- فطور الصباح
insert into public.restaurants (slug, name_ar, name_en, description, kind, city_id, area_id, address, lat, lng, price_level, opening_hours, status, is_demo)
select 'demo-morning-breakfast', 'فطور الصباح', 'Morning Breakfast', 'فطور عراقي تجريبي: كاهي وقيمر وبيض ومعجنات. بيانات تجريبية.', 'restaurant', c.id, a.id, 'الكرادة — موقع تقريبي (بيانات تجريبية)', 33.2989, 44.4331, 1, 'يومياً ٦ صباحاً – ٣ عصراً (تجريبي)', 'approved', true
from public.cities c join public.areas a on a.city_id = c.id and a.slug = 'karrada'
where c.slug = 'baghdad';
insert into public.restaurant_cuisines (restaurant_id, cuisine_id)
select r.id, cu.id from public.restaurants r, public.cuisines cu
where r.slug = 'demo-morning-breakfast' and cu.slug in ('breakfast', 'iraqi');
insert into public.restaurant_images (restaurant_id, url, alt, is_cover, is_placeholder, sort_order)
select id, '/placeholders/breakfast.svg', 'صورة تجريبية — ليست صورة المطعم', true, true, 0
from public.restaurants where slug = 'demo-morning-breakfast';
insert into public.reviews (restaurant_id, author_name, is_demo, rating, comment)
select id, 'مراجع تجريبي', true, 5, 'مراجعة تجريبية: أفضل بداية ليوم الجمعة.' from public.restaurants where slug = 'demo-morning-breakfast';
insert into public.reviews (restaurant_id, author_name, is_demo, rating, comment)
select id, 'مراجع تجريبي', true, 4, 'مراجعة تجريبية: كاهي طازج.' from public.restaurants where slug = 'demo-morning-breakfast';

-- حلويات الرافدين
insert into public.restaurants (slug, name_ar, name_en, description, kind, city_id, area_id, address, lat, lng, price_level, opening_hours, status, is_demo)
select 'demo-rafidain-sweets', 'حلويات الرافدين', 'Rafidain Sweets', 'محل حلويات تجريبي: كليجة وبقلاوة وكنافة. بيانات تجريبية لعرض التصميم.', 'cafe', c.id, a.id, 'الأعظمية — موقع تقريبي (بيانات تجريبية)', 33.3651, 44.3779, 1, 'يومياً ١٠ صباحاً – ١١ ليلاً (تجريبي)', 'approved', true
from public.cities c join public.areas a on a.city_id = c.id and a.slug = 'adhamiyah'
where c.slug = 'baghdad';
insert into public.restaurant_cuisines (restaurant_id, cuisine_id)
select r.id, cu.id from public.restaurants r, public.cuisines cu
where r.slug = 'demo-rafidain-sweets' and cu.slug in ('dessert');
insert into public.restaurant_images (restaurant_id, url, alt, is_cover, is_placeholder, sort_order)
select id, '/placeholders/dessert.svg', 'صورة تجريبية — ليست صورة المطعم', true, true, 0
from public.restaurants where slug = 'demo-rafidain-sweets';
insert into public.reviews (restaurant_id, author_name, is_demo, rating, comment)
select id, 'مراجع تجريبي', true, 5, 'مراجعة تجريبية: كنافة ممتازة.' from public.restaurants where slug = 'demo-rafidain-sweets';
insert into public.reviews (restaurant_id, author_name, is_demo, rating, comment)
select id, 'مراجع تجريبي', true, 4, 'مراجعة تجريبية: حلويات طازجة.' from public.restaurants where slug = 'demo-rafidain-sweets';

-- سلطة وصحة
insert into public.restaurants (slug, name_ar, name_en, description, kind, city_id, area_id, address, lat, lng, price_level, opening_hours, status, is_demo)
select 'demo-salad-health', 'سلطة وصحة', 'Salad & Health', 'مطعم صحي تجريبي: سلطات ووجبات خفيفة وعصائر طبيعية. بيانات تجريبية.', 'restaurant', c.id, a.id, 'الحارثية — موقع تقريبي (بيانات تجريبية)', 33.3278, 44.3529, 2, 'يومياً ١١ صباحاً – ١٠ ليلاً (تجريبي)', 'approved', true
from public.cities c join public.areas a on a.city_id = c.id and a.slug = 'harthiya'
where c.slug = 'baghdad';
insert into public.restaurant_cuisines (restaurant_id, cuisine_id)
select r.id, cu.id from public.restaurants r, public.cuisines cu
where r.slug = 'demo-salad-health' and cu.slug in ('healthy');
insert into public.restaurant_images (restaurant_id, url, alt, is_cover, is_placeholder, sort_order)
select id, '/placeholders/healthy.svg', 'صورة تجريبية — ليست صورة المطعم', true, true, 0
from public.restaurants where slug = 'demo-salad-health';
insert into public.reviews (restaurant_id, author_name, is_demo, rating, comment)
select id, 'مراجع تجريبي', true, 4, 'مراجعة تجريبية: خيارات صحية متنوعة.' from public.restaurants where slug = 'demo-salad-health';
insert into public.reviews (restaurant_id, author_name, is_demo, rating, comment)
select id, 'مراجع تجريبي', true, 4, 'مراجعة تجريبية: العصائر منعشة.' from public.restaurants where slug = 'demo-salad-health';

-- مسكوف الدورة
insert into public.restaurants (slug, name_ar, name_en, description, kind, city_id, area_id, address, lat, lng, price_level, opening_hours, status, is_demo)
select 'demo-dora-masgouf', 'مسكوف الدورة', 'Dora Masgouf', 'مطعم مسكوف تجريبي مشوي على الحطب مع سلطات. بيانات تجريبية.', 'restaurant', c.id, a.id, 'الدورة — موقع تقريبي (بيانات تجريبية)', 33.2447, 44.3741, 2, 'يومياً ٤ عصراً – ١٢ ليلاً (تجريبي)', 'approved', true
from public.cities c join public.areas a on a.city_id = c.id and a.slug = 'dora'
where c.slug = 'baghdad';
insert into public.restaurant_cuisines (restaurant_id, cuisine_id)
select r.id, cu.id from public.restaurants r, public.cuisines cu
where r.slug = 'demo-dora-masgouf' and cu.slug in ('masgouf');
insert into public.restaurant_images (restaurant_id, url, alt, is_cover, is_placeholder, sort_order)
select id, '/placeholders/masgouf.svg', 'صورة تجريبية — ليست صورة المطعم', true, true, 0
from public.restaurants where slug = 'demo-dora-masgouf';
insert into public.reviews (restaurant_id, author_name, is_demo, rating, comment)
select id, 'مراجع تجريبي', true, 5, 'مراجعة تجريبية: مسكوف طازج.' from public.restaurants where slug = 'demo-dora-masgouf';
insert into public.reviews (restaurant_id, author_name, is_demo, rating, comment)
select id, 'مراجع تجريبي', true, 4, 'مراجعة تجريبية: الانتظار طويل أحياناً.' from public.restaurants where slug = 'demo-dora-masgouf';

-- محمصة الكاظمية
insert into public.restaurants (slug, name_ar, name_en, description, kind, city_id, area_id, address, lat, lng, price_level, opening_hours, status, is_demo)
select 'demo-kadhimiya-roastery', 'محمصة الكاظمية', 'Kadhimiya Roastery', 'محمصة تجريبية للقهوة وحبوب البن المحمصة طازجاً. بيانات تجريبية.', 'cafe', c.id, a.id, 'الكاظمية — موقع تقريبي (بيانات تجريبية)', 33.3811, 44.3377, 1, 'يومياً ٨ صباحاً – ١٠ ليلاً (تجريبي)', 'approved', true
from public.cities c join public.areas a on a.city_id = c.id and a.slug = 'kadhimiya'
where c.slug = 'baghdad';
insert into public.restaurant_cuisines (restaurant_id, cuisine_id)
select r.id, cu.id from public.restaurants r, public.cuisines cu
where r.slug = 'demo-kadhimiya-roastery' and cu.slug in ('coffee');
insert into public.restaurant_images (restaurant_id, url, alt, is_cover, is_placeholder, sort_order)
select id, '/placeholders/coffee.svg', 'صورة تجريبية — ليست صورة المطعم', true, true, 0
from public.restaurants where slug = 'demo-kadhimiya-roastery';
insert into public.reviews (restaurant_id, author_name, is_demo, rating, comment)
select id, 'مراجع تجريبي', true, 4, 'مراجعة تجريبية: رائحة القهوة تجذبك.' from public.restaurants where slug = 'demo-kadhimiya-roastery';
insert into public.reviews (restaurant_id, author_name, is_demo, rating, comment)
select id, 'مراجع تجريبي', true, 5, 'مراجعة تجريبية: بن عالي الجودة.' from public.restaurants where slug = 'demo-kadhimiya-roastery';

-- مشويات الجادرية الراقية
insert into public.restaurants (slug, name_ar, name_en, description, kind, city_id, area_id, address, lat, lng, price_level, opening_hours, status, is_demo)
select 'demo-jadriyah-prime-grills', 'مشويات الجادرية الراقية', 'Jadriyah Prime Grills', 'مطعم مشاوي فاخر تجريبي بتجربة عشاء راقية. بيانات تجريبية لعرض التصميم.', 'restaurant', c.id, a.id, 'الجادرية — موقع تقريبي (بيانات تجريبية)', 33.2771, 44.3742, 4, 'يومياً ١ ظهراً – ١٢ ليلاً (تجريبي)', 'approved', true
from public.cities c join public.areas a on a.city_id = c.id and a.slug = 'jadriyah'
where c.slug = 'baghdad';
insert into public.restaurant_cuisines (restaurant_id, cuisine_id)
select r.id, cu.id from public.restaurants r, public.cuisines cu
where r.slug = 'demo-jadriyah-prime-grills' and cu.slug in ('grills', 'levantine');
insert into public.restaurant_images (restaurant_id, url, alt, is_cover, is_placeholder, sort_order)
select id, '/placeholders/grills.svg', 'صورة تجريبية — ليست صورة المطعم', true, true, 0
from public.restaurants where slug = 'demo-jadriyah-prime-grills';
insert into public.reviews (restaurant_id, author_name, is_demo, rating, comment)
select id, 'مراجع تجريبي', true, 5, 'مراجعة تجريبية: تجربة فاخرة.' from public.restaurants where slug = 'demo-jadriyah-prime-grills';
insert into public.reviews (restaurant_id, author_name, is_demo, rating, comment)
select id, 'مراجع تجريبي', true, 4, 'مراجعة تجريبية: الأسعار مرتفعة لكن الجودة عالية.' from public.restaurants where slug = 'demo-jadriyah-prime-grills';

-- باستا زيونة
insert into public.restaurants (slug, name_ar, name_en, description, kind, city_id, area_id, address, lat, lng, price_level, opening_hours, status, is_demo)
select 'demo-zayouna-pasta', 'باستا زيونة', 'Zayouna Pasta', 'مطعم إيطالي تجريبي: باستا طازجة وريزوتو وتيراميسو. بيانات تجريبية.', 'restaurant', c.id, a.id, 'زيونة — موقع تقريبي (بيانات تجريبية)', 33.3311, 44.4549, 3, 'يومياً ١٢ ظهراً – ١١ ليلاً (تجريبي)', 'approved', true
from public.cities c join public.areas a on a.city_id = c.id and a.slug = 'zayouna'
where c.slug = 'baghdad';
insert into public.restaurant_cuisines (restaurant_id, cuisine_id)
select r.id, cu.id from public.restaurants r, public.cuisines cu
where r.slug = 'demo-zayouna-pasta' and cu.slug in ('italian', 'pizza');
insert into public.restaurant_images (restaurant_id, url, alt, is_cover, is_placeholder, sort_order)
select id, '/placeholders/italian.svg', 'صورة تجريبية — ليست صورة المطعم', true, true, 0
from public.restaurants where slug = 'demo-zayouna-pasta';
insert into public.reviews (restaurant_id, author_name, is_demo, rating, comment)
select id, 'مراجع تجريبي', true, 4, 'مراجعة تجريبية: باستا بصلصة رائعة.' from public.restaurants where slug = 'demo-zayouna-pasta';
insert into public.reviews (restaurant_id, author_name, is_demo, rating, comment)
select id, 'مراجع تجريبي', true, 5, 'مراجعة تجريبية: تيراميسو لا يُنسى.' from public.restaurants where slug = 'demo-zayouna-pasta';

