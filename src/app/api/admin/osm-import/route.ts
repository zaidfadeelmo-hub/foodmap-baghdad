import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionUser, getRefs } from '@/lib/data';

export const runtime = 'nodejs';
export const maxDuration = 60;

const BBOX = '33.0,44.1,33.7,44.8'; // جنوب, غرب, شمال, شرق — نطاق بغداد التقريبي
const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

type OsmElement = {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

async function fetchOsm(): Promise<OsmElement[]> {
  const query = `[out:json][timeout:45];(nwr["amenity"~"^(restaurant|cafe|fast_food|food_court|ice_cream)$"](${BBOX}););out center tags;`;
  let lastError = 'تعذّر الاتصال بمصدر OpenStreetMap.';
  for (const endpoint of ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', 'User-Agent': 'FoodMapBaghdad/1.0 (restaurant directory)' },
        body: new URLSearchParams({ data: query }),
        signal: AbortSignal.timeout(50000),
        cache: 'no-store',
      });
      if (!response.ok) { lastError = `مصدر الخرائط أعاد الحالة ${response.status}.`; continue; }
      const json = await response.json();
      return Array.isArray(json.elements) ? json.elements : [];
    } catch (error) {
      lastError = error instanceof Error && error.name === 'TimeoutError'
        ? 'انتهت مهلة الاتصال بمصدر الخرائط. حاول بعد قليل.'
        : 'تعذّر الاتصال بمصدر OpenStreetMap. حاول بعد قليل.';
    }
  }
  throw new Error(lastError);
}

function clean(value?: string, max = 500): string | null {
  const v = value?.trim();
  return v ? v.slice(0, max) : null;
}

function cuisineSlugs(tags: Record<string, string>, available: Set<string>): string[] {
  const raw = (tags.cuisine ?? '').toLowerCase().split(/[;,]/).map(x => x.trim());
  const map: Record<string, string> = {
    burger: 'burger', burgers: 'burger', pizza: 'pizza', italian: 'italian',
    sushi: 'asian', japanese: 'asian', chinese: 'asian', asian: 'asian',
    iraqi: 'iraqi', kebab: 'grills', barbecue: 'grills', bbq: 'grills',
    coffee: 'coffee', breakfast: 'breakfast', dessert: 'dessert', ice_cream: 'dessert',
    regional: 'levantine', levantine: 'levantine', middle_eastern: 'levantine',
    chicken: 'grills', sandwich: 'burger', healthy: 'healthy',
  };
  const result = [...new Set(raw.map(x => map[x]).filter((x): x is string => Boolean(x && available.has(x))))];
  return result.slice(0, 4);
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'غير مصرّح.' }, { status: 403 });

  let mode: string;
  try { ({ mode } = await request.json()); } catch { return NextResponse.json({ error: 'طلب غير صالح.' }, { status: 400 }); }
  if (mode !== 'preview' && mode !== 'import') return NextResponse.json({ error: 'وضع غير صالح.' }, { status: 400 });

  try {
    const elements = await fetchOsm();
    const candidates = elements.filter(e => {
      const t = e.tags ?? {};
      const name = clean(t['name:ar']) ?? clean(t.name) ?? clean(t['name:en']);
      const lat = e.lat ?? e.center?.lat;
      const lon = e.lon ?? e.center?.lon;
      return Boolean(name && Number.isFinite(lat) && Number.isFinite(lon));
    });

    if (mode === 'preview') {
      return NextResponse.json({
        total: candidates.length,
        categories: candidates.reduce((acc, e) => {
          const key = e.tags?.amenity ?? 'other'; acc[key] = (acc[key] ?? 0) + 1; return acc;
        }, {} as Record<string, number>),
        sample: candidates.slice(0, 8).map(e => ({
          name: e.tags?.['name:ar'] ?? e.tags?.name ?? e.tags?.['name:en'],
          type: e.tags?.amenity,
          address: [e.tags?.['addr:street'], e.tags?.['addr:suburb'], e.tags?.['addr:city']].filter(Boolean).join('، '),
        })),
      });
    }

    const sb = await createClient();
    const { city, cuisines } = await getRefs();
    const availableCuisines = new Set(cuisines.map(c => c.slug));
    const ids = candidates.map(e => `${e.type}/${e.id}`);
    const existing = new Set<string>();
    for (let i = 0; i < ids.length; i += 150) {
      const slice = ids.slice(i, i + 150);
      const { data, error } = await sb.from('restaurants').select('osm_type,osm_id')
        .in('osm_id', slice.map(x => Number(x.split('/')[1])));
      if (error) throw new Error('تعذّر فحص المطاعم الموجودة. تأكد من تشغيل تحديث قاعدة البيانات.');
      for (const row of data ?? []) existing.add(`${row.osm_type}/${row.osm_id}`);
    }

    const fresh = candidates.filter(e => !existing.has(`${e.type}/${e.id}`));
    let insertedCount = 0;
    const cuisineIds = new Map<string, string>();
    for (const cuisine of cuisines) if (cuisine.id) cuisineIds.set(cuisine.slug, cuisine.id);
    for (let i = 0; i < fresh.length; i += 50) {
      const batch = fresh.slice(i, i + 50);
      const rows = batch.map(e => {
        const t = e.tags ?? {};
        const name = clean(t['name:ar'], 120) ?? clean(t.name, 120) ?? clean(t['name:en'], 120)!;
        const lat = e.lat ?? e.center!.lat;
        const lng = e.lon ?? e.center!.lon;
        const kind = t.amenity === 'cafe' ? 'cafe' : 'restaurant';
        return {
          slug: `osm-${e.type}-${e.id}`, name_ar: name,
          name_en: clean(t['name:en'], 120), kind, city_id: city.id,
          area_id: null, address: clean([t['addr:street'], t['addr:housenumber'], t['addr:suburb'], t['addr:city']].filter(Boolean).join('، '), 250),
          lat, lng, phone: clean(t.phone ?? t['contact:phone'], 30),
          instagram: clean(t['contact:instagram'] ?? t.instagram, 80)?.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, ''),
          price_level: null, opening_hours: clean(t.opening_hours, 120),
          status: 'pending', is_demo: false, created_by: user.id,
          osm_type: e.type, osm_id: e.id,
        };
      });
      const { data, error } = await sb.from('restaurants').insert(rows).select('id,osm_type,osm_id');
      if (error) throw new Error(`تعذّر حفظ دفعة من المطاعم: ${error.message}`);
      insertedCount += data?.length ?? 0;
      const links: { restaurant_id: string; cuisine_id: string }[] = [];
      for (let j = 0; j < batch.length; j++) {
        const slugs = cuisineSlugs(batch[j].tags ?? {}, availableCuisines);
        for (const slug of slugs) {
          const cuisineId = cuisineIds.get(slug);
          const restaurantId = data?.[j]?.id;
          if (cuisineId && restaurantId) links.push({ restaurant_id: restaurantId, cuisine_id: cuisineId });
        }
      }
      if (links.length) {
        const { error: linkError } = await sb.from('restaurant_cuisines').insert(links);
        if (linkError) console.error('OSM cuisine link error', linkError.message);
      }
    }

    return NextResponse.json({ imported: insertedCount, duplicates: candidates.length - fresh.length, found: candidates.length });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'حدث خطأ أثناء الاستيراد.' }, { status: 502 });
  }
}
