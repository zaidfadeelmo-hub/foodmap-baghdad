import { cache } from 'react';
import demo from '@/data/demo.json';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_CITY, STORAGE_BUCKET, SUPABASE_URL, isSupabaseConfigured } from '@/lib/config';
import type {
  Area, City, Cuisine, Img, Restaurant, Review, SearchParams, SessionUser,
} from '@/lib/types';

export const PAGE_SIZE = 12;
const IMG_BASE = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/`;
const DEFAULT_PLACEHOLDER: Img = {
  id: 'default', url: '/placeholders/default.svg', alt: 'صورة تجريبية', isPlaceholder: true, isCover: true,
};

const SELECT = `id,slug,name_ar,name_en,description,kind,address,lat,lng,phone,instagram,price_level,opening_hours,status,is_demo,avg_rating,reviews_count,created_at,
area:areas(slug,name_ar),
cuisines:restaurant_cuisines(cuisine:cuisines(id,slug,name_ar,icon)),
images:restaurant_images(id,storage_path,url,alt,is_cover,is_placeholder,sort_order)`;

// ---------------------------------------------------------------- مرجعيات
export const getRefs = cache(async (): Promise<{ city: City; areas: Area[]; cuisines: Cuisine[] }> => {
  if (!isSupabaseConfigured) {
    return {
      city: { id: demo.city.slug, slug: demo.city.slug, name: demo.city.name_ar, lat: demo.city.lat, lng: demo.city.lng, zoom: demo.city.zoom },
      areas: demo.areas.map((a) => ({ id: a.slug, slug: a.slug, name: a.name_ar, lat: a.lat, lng: a.lng })),
      cuisines: demo.cuisines.map((c) => ({ id: c.slug, slug: c.slug, name: c.name_ar, icon: c.icon })),
    };
  }
  const sb = await createClient();
  const { data: city } = await sb
    .from('cities').select('id,slug,name_ar,lat,lng,zoom').eq('slug', DEFAULT_CITY).maybeSingle();
  if (!city) {
    throw new Error(`المدينة "${DEFAULT_CITY}" غير موجودة في قاعدة البيانات. شغّل supabase/seed/reference_data.sql أولاً.`);
  }
  const [{ data: areas }, { data: cuisines }] = await Promise.all([
    sb.from('areas').select('id,slug,name_ar,lat,lng').eq('city_id', city.id).order('name_ar'),
    sb.from('cuisines').select('id,slug,name_ar,icon').order('name_ar'),
  ]);
  return {
    city: { id: city.id, slug: city.slug, name: city.name_ar, lat: city.lat, lng: city.lng, zoom: city.zoom },
    areas: (areas ?? []).map((a: any) => ({ id: a.id, slug: a.slug, name: a.name_ar, lat: a.lat, lng: a.lng })),
    cuisines: (cuisines ?? []).map((c: any) => ({ id: c.id, slug: c.slug, name: c.name_ar, icon: c.icon })),
  };
});

// ---------------------------------------------------------------- المستخدم
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  if (!isSupabaseConfigured) return null;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data: profile } = await sb.from('profiles').select('display_name, role').eq('id', user.id).maybeSingle();
  return {
    id: user.id,
    email: user.email ?? '',
    displayName: profile?.display_name ?? user.email?.split('@')[0] ?? 'مستخدم',
    role: profile?.role === 'admin' ? 'admin' : 'user',
  };
});

// ---------------------------------------------------------------- تحويل الصفوف
function mapRow(r: any): Restaurant {
  const images: Img[] = (r.images ?? [])
    .map((i: any): Img & { order: number } => ({
      id: i.id,
      url: i.url ?? `${IMG_BASE}${i.storage_path}`,
      alt: i.alt ?? r.name_ar,
      isPlaceholder: Boolean(i.is_placeholder),
      isCover: Boolean(i.is_cover),
      order: i.sort_order ?? 0,
    }))
    // الصور الحقيقية أولاً، ثم الغلاف، ثم الترتيب
    .sort((a: any, b: any) =>
      Number(a.isPlaceholder) - Number(b.isPlaceholder) || Number(b.isCover) - Number(a.isCover) || a.order - b.order)
    .map(({ order: _o, ...rest }: any) => rest);

  return {
    id: r.id,
    slug: r.slug,
    nameAr: r.name_ar,
    nameEn: r.name_en ?? null,
    description: r.description ?? '',
    kind: r.kind === 'cafe' ? 'cafe' : 'restaurant',
    areaSlug: r.area?.slug ?? '',
    areaName: r.area?.name_ar ?? '',
    address: r.address ?? '',
    lat: Number(r.lat),
    lng: Number(r.lng),
    phone: r.phone ?? null,
    instagram: r.instagram ?? null,
    priceLevel: r.price_level ?? 2,
    openingHours: r.opening_hours ?? null,
    status: r.status,
    isDemo: Boolean(r.is_demo),
    avgRating: Number(r.avg_rating ?? 0),
    reviewsCount: Number(r.reviews_count ?? 0),
    createdAt: r.created_at,
    cuisines: (r.cuisines ?? []).map((x: any) => x.cuisine).filter(Boolean)
      .map((c: any) => ({ id: c.id, slug: c.slug, name: c.name_ar, icon: c.icon })),
    images: images.length ? images : [DEFAULT_PLACEHOLDER],
  };
}

// ---------------------------------------------------------------- وضع العرض التجريبي
function demoRestaurants(): Restaurant[] {
  return demo.restaurants.map((r, i) => {
    const area = demo.areas.find((a) => a.slug === r.area)!;
    const avg = r.reviews.length ? r.reviews.reduce((s, x) => s + x.rating, 0) / r.reviews.length : 0;
    return {
      id: r.slug,
      slug: r.slug,
      nameAr: r.name_ar,
      nameEn: r.name_en,
      description: r.description,
      kind: r.kind === 'cafe' ? 'cafe' : 'restaurant',
      areaSlug: area.slug,
      areaName: area.name_ar,
      address: r.address,
      lat: r.lat,
      lng: r.lng,
      phone: null,
      instagram: null,
      priceLevel: r.price,
      openingHours: r.hours,
      status: 'approved',
      isDemo: true,
      avgRating: Math.round(avg * 100) / 100,
      reviewsCount: r.reviews.length,
      createdAt: new Date(2026, 0, 1 + i).toISOString(),
      cuisines: r.cuisines.map((s) => {
        const c = demo.cuisines.find((x) => x.slug === s)!;
        return { id: c.slug, slug: c.slug, name: c.name_ar, icon: c.icon };
      }),
      images: [{
        id: `${r.slug}-cover`, url: `/placeholders/${r.cuisines[0]}.svg`,
        alt: 'صورة تجريبية — ليست صورة المطعم', isPlaceholder: true, isCover: true,
      }],
    } satisfies Restaurant;
  });
}

function sortList(list: Restaurant[], sort: string | undefined): Restaurant[] {
  const out = [...list];
  switch (sort) {
    case 'reviews': return out.sort((a, b) => b.reviewsCount - a.reviewsCount);
    case 'newest': return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case 'name': return out.sort((a, b) => a.nameAr.localeCompare(b.nameAr, 'ar'));
    default: return out.sort((a, b) => b.avgRating - a.avgRating || b.reviewsCount - a.reviewsCount);
  }
}

function filterDemo(list: Restaurant[], p: SearchParams): Restaurant[] {
  const q = (p.q ?? '').trim().toLowerCase();
  return list.filter((r) =>
    (!q || r.nameAr.toLowerCase().includes(q) || (r.nameEn ?? '').toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) || r.cuisines.some((c) => c.name.includes(q)) || r.areaName.includes(q)) &&
    (!p.area || r.areaSlug === p.area) &&
    (!p.cuisine || r.cuisines.some((c) => c.slug === p.cuisine)) &&
    (!p.price || r.priceLevel === Number(p.price)) &&
    (!p.rating || r.avgRating >= Number(p.rating)) &&
    (!p.kind || r.kind === p.kind),
  );
}

// ---------------------------------------------------------------- الاستعلامات
export type SearchResult = { items: Restaurant[]; total: number; page: number; pageSize: number };

export async function searchRestaurants(p: SearchParams): Promise<SearchResult> {
  const page = Math.max(1, Number(p.page) || 1);

  if (!isSupabaseConfigured) {
    const all = sortList(filterDemo(demoRestaurants(), p), p.sort);
    return { items: all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), total: all.length, page, pageSize: PAGE_SIZE };
  }

  const sb = await createClient();
  const { city, areas, cuisines } = await getRefs();
  let query = sb.from('restaurants').select(SELECT, { count: 'exact' }).eq('status', 'approved').eq('city_id', city.id);

  if (p.area) {
    const area = areas.find((a) => a.slug === p.area);
    if (!area) return { items: [], total: 0, page, pageSize: PAGE_SIZE };
    query = query.eq('area_id', area.id);
  }
  if (p.cuisine) {
    const cuisine = cuisines.find((c) => c.slug === p.cuisine);
    if (!cuisine) return { items: [], total: 0, page, pageSize: PAGE_SIZE };
    const { data: links } = await sb.from('restaurant_cuisines').select('restaurant_id').eq('cuisine_id', cuisine.id);
    const ids = (links ?? []).map((l: any) => l.restaurant_id);
    if (!ids.length) return { items: [], total: 0, page, pageSize: PAGE_SIZE };
    query = query.in('id', ids);
  }
  if (p.kind === 'restaurant' || p.kind === 'cafe') query = query.eq('kind', p.kind);
  if (p.price && Number(p.price) >= 1 && Number(p.price) <= 4) query = query.eq('price_level', Number(p.price));
  if (p.rating && Number(p.rating) > 0) query = query.gte('avg_rating', Number(p.rating));
  const q = (p.q ?? '').trim().replace(/[%,()*\\]/g, ' ').slice(0, 60);
  if (q) query = query.or(`name_ar.ilike.%${q}%,name_en.ilike.%${q}%,description.ilike.%${q}%`);

  switch (p.sort) {
    case 'reviews': query = query.order('reviews_count', { ascending: false }); break;
    case 'newest': query = query.order('created_at', { ascending: false }); break;
    case 'name': query = query.order('name_ar', { ascending: true }); break;
    default: query = query.order('avg_rating', { ascending: false }).order('reviews_count', { ascending: false });
  }

  const from = (page - 1) * PAGE_SIZE;
  const { data, count, error } = await query.range(from, from + PAGE_SIZE - 1);
  if (error) throw new Error(error.message);
  return { items: (data ?? []).map(mapRow), total: count ?? 0, page, pageSize: PAGE_SIZE };
}

/** كل المطاعم المعتمدة في المدينة (للخريطة) */
export async function getAllForMap(): Promise<Restaurant[]> {
  if (!isSupabaseConfigured) return demoRestaurants();
  const sb = await createClient();
  const { city } = await getRefs();
  const { data, error } = await sb.from('restaurants').select(SELECT)
    .eq('status', 'approved').eq('city_id', city.id).limit(1000);
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
}

export async function getTopRated(limit = 6): Promise<Restaurant[]> {
  const { items } = await searchRestaurants({ sort: 'rating' });
  return items.slice(0, limit);
}

export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  if (!isSupabaseConfigured) return demoRestaurants().find((r) => r.slug === slug) ?? null;
  const sb = await createClient();
  const { data } = await sb.from('restaurants').select(SELECT).eq('slug', slug).maybeSingle();
  return data ? mapRow(data) : null;
}

export async function getReviews(restaurantId: string): Promise<Review[]> {
  if (!isSupabaseConfigured) {
    const r = demo.restaurants.find((x) => x.slug === restaurantId);
    return (r?.reviews ?? []).map((rv, i) => ({
      id: `${restaurantId}-${i}`, rating: rv.rating, comment: rv.comment, author: 'مراجع تجريبي',
      createdAt: new Date(2026, 0, 10 + i).toISOString(), isDemo: true, userId: null,
    }));
  }
  const sb = await createClient();
  const { data } = await sb.from('reviews')
    .select('id,rating,comment,created_at,user_id,author_name,is_demo,profile:profiles(display_name)')
    .eq('restaurant_id', restaurantId).order('created_at', { ascending: false }).limit(50);
  return (data ?? []).map((r: any) => ({
    id: r.id, rating: r.rating, comment: r.comment,
    author: r.author_name ?? r.profile?.display_name ?? 'مستخدم',
    createdAt: r.created_at, isDemo: Boolean(r.is_demo), userId: r.user_id,
  }));
}

export async function getFavoriteIds(userId: string): Promise<Set<string>> {
  if (!isSupabaseConfigured) return new Set();
  const sb = await createClient();
  const { data } = await sb.from('favorites').select('restaurant_id').eq('user_id', userId);
  return new Set((data ?? []).map((f: any) => f.restaurant_id as string));
}

export async function getFavoriteRestaurants(userId: string): Promise<Restaurant[]> {
  const ids = [...(await getFavoriteIds(userId))];
  if (!ids.length) return [];
  const sb = await createClient();
  const { data } = await sb.from('restaurants').select(SELECT).in('id', ids).eq('status', 'approved');
  return (data ?? []).map(mapRow);
}

export async function getMyReview(restaurantId: string, userId: string): Promise<{ rating: number; comment: string | null } | null> {
  if (!isSupabaseConfigured) return null;
  const sb = await createClient();
  const { data } = await sb.from('reviews').select('rating,comment')
    .eq('restaurant_id', restaurantId).eq('user_id', userId).maybeSingle();
  return data ? { rating: data.rating, comment: data.comment } : null;
}

/** للوحة الإدارة: كل الحالات */
export async function listForAdmin(): Promise<Restaurant[]> {
  if (!isSupabaseConfigured) return [];
  const sb = await createClient();
  const { data } = await sb.from('restaurants').select(SELECT).order('created_at', { ascending: false }).limit(300);
  return (data ?? []).map(mapRow);
}
