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
const BATCH_SIZE = 50;
const PREVIEW_TAGS = [
  'amenity', 'cuisine', 'name', 'name:ar', 'name:en',
  'addr:street', 'addr:housenumber', 'addr:suburb', 'addr:city',
  'phone', 'contact:phone', 'contact:instagram', 'instagram', 'opening_hours',
] as const;

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

function isOsmElement(value: unknown): value is OsmElement {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<OsmElement>;
  return (item.type === 'node' || item.type === 'way' || item.type === 'relation')
    && Number.isSafeInteger(item.id) && (item.id ?? 0) > 0
    && Boolean(item.tags && typeof item.tags === 'object');
}

export async function POST(request: Request) {
  let stage = 'التحقق من جلسة المدير';
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      console.warn('[osm-import] request rejected: admin session missing');
      return NextResponse.json({ error: 'غير مصرّح.' }, { status: 403 });
    }

    stage = 'قراءة الطلب';
    let body: { mode?: string; elements?: unknown[] };
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: 'طلب غير صالح.' }, { status: 400 });
    }
    const mode = body.mode;
    if (mode !== 'preview' && mode !== 'import') {
      return NextResponse.json({ error: 'وضع غير صالح.' }, { status: 400 });
    }

    let elements: OsmElement[];
    if (mode === 'preview') {
      stage = 'الاتصال بمصدر OpenStreetMap';
      elements = await fetchOsm();
    } else {
      if (!Array.isArray(body.elements) || body.elements.length === 0 || body.elements.length > BATCH_SIZE) {
        return NextResponse.json({ error: `يجب إرسال دفعة بين 1 و${BATCH_SIZE} مكاناً.` }, { status: 400 });
      }
      if (!body.elements.every(isOsmElement)) {
        return NextResponse.json({ error: 'تحتوي الدفعة على بيانات مكان غير صالحة.' }, { status: 400 });
      }
      elements = body.elements;
    }

    console.info('[osm-import] source/batch received', { mode, elementCount: elements.length });
    const candidates = elements.filter(e => {
      const t = e.tags ?? {};
      const name = clean(t['name:ar']) ?? clean(t.name) ?? clean(t['name:en']);
      const lat = e.lat ?? e.center?.lat;
      const lon = e.lon ?? e.center?.lon;
      return Boolean(name && Number.isFinite(lat) && Number.isFinite(lon));
    });

    if (mode === 'preview') {
      const compact = candidates.map(e => ({
        type: e.type,
        id: e.id,
        ...(e.lat !== undefined ? { lat: e.lat } : {}),
        ...(e.lon !== undefined ? { lon: e.lon } : {}),
        ...(e.center ? { center: e.center } : {}),
        tags: Object.fromEntries(PREVIEW_TAGS.filter(key => e.tags?.[key]).map(key => [key, e.tags![key]])),
      }));
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
        candidates: compact,
      });
    }

    stage = 'الاتصال بقاعدة البيانات';
    const sb = await createClient();
    const { city, cuisines } = await getRefs();
    const availableCuisines = new Set(cuisines.map(c => c.slug));
    const existing = new Set<string>();
    const { data: existingRows, error: existingError } = await sb.from('restaurants')
      .select('osm_type,osm_id').in('osm_id', candidates.map(e => e.id));
    if (existingError) throw new Error('تعذّر فحص المطاعم الموجودة. تأكد من تشغيل تحديث قاعدة البيانات.');
    for (const row of existingRows ?? []) existing.add(`${row.osm_type}/${row.osm_id}`);

    const fresh = candidates.filter(e => !existing.has(`${e.type}/${e.id}`));
    let insertedCount = 0;
    const cuisineIds = new Map<string, string>();
    for (const cuisine of cuisines) if (cuisine.id) cuisineIds.set(cuisine.slug, cuisine.id);

    if (fresh.length) {
      const rows = fresh.map(e => {
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
      insertedCount = data?.length ?? 0;
      const links: { restaurant_id: string; cuisine_id: string }[] = [];
      const insertedByIdentity = new Map((data ?? []).map(row => [`${row.osm_type}/${row.osm_id}`, row.id]));
      for (const element of fresh) {
        const restaurantId = insertedByIdentity.get(`${element.type}/${element.id}`);
        if (!restaurantId) continue;
        for (const slug of cuisineSlugs(element.tags ?? {}, availableCuisines)) {
          const cuisineId = cuisineIds.get(slug);
          if (cuisineId) links.push({ restaurant_id: restaurantId, cuisine_id: cuisineId });
        }
      }
      if (links.length) {
        const { error: linkError } = await sb.from('restaurant_cuisines').insert(links);
        if (linkError) console.error('[osm-import] cuisine link error', linkError.message);
      }
    }

    return NextResponse.json({
      imported: insertedCount,
      duplicates: candidates.length - fresh.length,
      found: candidates.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'حدث خطأ غير معروف.';
    console.error('[osm-import] request failed', { stage, message });
    return NextResponse.json({ error: message, stage }, { status: 502 });
  }
}
