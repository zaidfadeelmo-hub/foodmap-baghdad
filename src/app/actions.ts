'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { DEMO_MESSAGE, SITE_URL, STORAGE_BUCKET, isSupabaseConfigured } from '@/lib/config';
import { getRefs, getSessionUser } from '@/lib/data';
import { randomSuffix, safeNext, slugify } from '@/lib/utils';
import type { ActionState } from '@/lib/types';

const str = (fd: FormData, key: string, max = 500): string => String(fd.get(key) ?? '').trim().slice(0, max);

// ============================================================ المصادقة
export async function signInAction(_: ActionState, fd: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured) return { error: DEMO_MESSAGE };
  const email = str(fd, 'email', 200);
  const password = String(fd.get('password') ?? '');
  if (!email || !password) return { error: 'أدخل البريد الإلكتروني وكلمة المرور.' };

  const sb = await createClient();
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return { error: 'بيانات الدخول غير صحيحة.' };
  redirect(safeNext(fd.get('next')));
}

export async function signUpAction(_: ActionState, fd: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured) return { error: DEMO_MESSAGE };
  const email = str(fd, 'email', 200);
  const password = String(fd.get('password') ?? '');
  const displayName = str(fd, 'displayName', 60);
  if (!email || !displayName) return { error: 'أكمل جميع الحقول.' };
  if (password.length < 8) return { error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.' };

  const sb = await createClient();
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName }, emailRedirectTo: `${SITE_URL}/auth/callback` },
  });
  if (error) return { error: 'تعذّر إنشاء الحساب. تأكد من البريد أو جرّب كلمة مرور أقوى.' };
  if (data.session) redirect(safeNext(fd.get('next')));
  return { ok: true, message: 'تم إنشاء الحساب. افتح بريدك الإلكتروني واضغط رابط التأكيد لإكمال التسجيل.' };
}

export async function signOutAction(): Promise<void> {
  if (isSupabaseConfigured) {
    const sb = await createClient();
    await sb.auth.signOut();
  }
  redirect('/');
}

// ============================================================ التقييمات
export async function submitReviewAction(_: ActionState, fd: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured) return { error: DEMO_MESSAGE };
  const user = await getSessionUser();
  if (!user) return { error: 'سجّل الدخول أولاً لإضافة تقييم.' };

  const restaurantId = str(fd, 'restaurantId', 64);
  const slug = str(fd, 'slug', 120);
  const rating = Number(fd.get('rating'));
  const comment = str(fd, 'comment', 1000);
  if (!restaurantId) return { error: 'طلب غير صالح.' };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: 'اختر تقييماً من 1 إلى 5 نجوم.' };

  const sb = await createClient();
  const { error } = await sb.from('reviews').upsert(
    { restaurant_id: restaurantId, user_id: user.id, rating, comment: comment || null },
    { onConflict: 'restaurant_id,user_id' },
  );
  if (error) return { error: 'تعذّر حفظ التقييم. حاول مرة أخرى.' };
  revalidatePath(`/restaurants/${slug}`);
  revalidatePath('/restaurants');
  revalidatePath('/');
  return { ok: true, message: 'شكراً لك! تم حفظ تقييمك.' };
}

// ============================================================ المفضلة
export async function toggleFavoriteAction(restaurantId: string): Promise<{ favorited: boolean; error?: string }> {
  const user = await getSessionUser();
  if (!isSupabaseConfigured || !user) return { favorited: false, error: 'سجّل الدخول أولاً.' };
  const sb = await createClient();

  const { data: existing } = await sb.from('favorites').select('restaurant_id')
    .eq('user_id', user.id).eq('restaurant_id', restaurantId).maybeSingle();

  if (existing) {
    const { error } = await sb.from('favorites').delete().eq('user_id', user.id).eq('restaurant_id', restaurantId);
    if (error) return { favorited: true, error: 'تعذّر الحذف.' };
    revalidatePath('/favorites');
    return { favorited: false };
  }
  const { error } = await sb.from('favorites').insert({ user_id: user.id, restaurant_id: restaurantId });
  if (error) return { favorited: false, error: 'تعذّر الحفظ.' };
  revalidatePath('/favorites');
  return { favorited: true };
}

// ============================================================ اقتراح مطعم
export async function suggestRestaurantAction(_: ActionState, fd: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured) return { error: DEMO_MESSAGE };
  const user = await getSessionUser();
  if (!user) return { error: 'سجّل الدخول أولاً لإضافة مطعم.' };

  const nameAr = str(fd, 'nameAr', 120);
  const nameEn = str(fd, 'nameEn', 120);
  const kind = str(fd, 'kind', 20) === 'cafe' ? 'cafe' : 'restaurant';
  const areaSlug = str(fd, 'area', 60);
  const price = Math.min(4, Math.max(1, Number(fd.get('price')) || 2));
  const lat = Number(fd.get('lat'));
  const lng = Number(fd.get('lng'));
  const cuisineSlugs = fd.getAll('cuisines').map(String).slice(0, 4);

  if (nameAr.length < 2) return { error: 'اكتب اسم المطعم بالعربية.' };
  if (!areaSlug) return { error: 'اختر المنطقة.' };
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return { error: 'حدّد موقع المطعم على الخريطة.' };

  const { city, areas, cuisines } = await getRefs();
  if (Math.abs(lat - city.lat) > 0.5 || Math.abs(lng - city.lng) > 0.5) {
    return { error: `الموقع خارج نطاق ${city.name}. حدّد موقعاً داخل المدينة.` };
  }
  const area = areas.find((a) => a.slug === areaSlug);
  if (!area) return { error: 'منطقة غير صالحة.' };

  const sb = await createClient();
  const { count } = await sb.from('restaurants').select('id', { count: 'exact', head: true })
    .eq('created_by', user.id).eq('status', 'pending');
  if ((count ?? 0) >= 5) return { error: 'لديك 5 اقتراحات قيد المراجعة. انتظر اعتمادها قبل إضافة المزيد.' };

  const slug = `${slugify(nameEn) || 'place'}-${randomSuffix()}`;
  const { data: inserted, error } = await sb.from('restaurants').insert({
    slug,
    name_ar: nameAr,
    name_en: nameEn || null,
    description: str(fd, 'description', 1200) || null,
    kind,
    city_id: city.id,
    area_id: area.id,
    address: str(fd, 'address', 250) || null,
    lat,
    lng,
    phone: str(fd, 'phone', 30) || null,
    instagram: str(fd, 'instagram', 80) || null,
    price_level: price,
    opening_hours: str(fd, 'hours', 120) || null,
    status: 'pending',
    is_demo: false,
    created_by: user.id,
  }).select('id').single();
  if (error || !inserted) return { error: 'تعذّر حفظ المطعم. تحقق من البيانات وحاول مجدداً.' };

  const rows = cuisines.filter((c) => cuisineSlugs.includes(c.slug) && c.id)
    .map((c) => ({ restaurant_id: inserted.id, cuisine_id: c.id! }));
  if (rows.length) await sb.from('restaurant_cuisines').insert(rows);

  revalidatePath('/admin');
  return { ok: true, message: 'تم إرسال المطعم للمراجعة. سيظهر في الدليل بعد اعتماد الإدارة. شكراً لمساهمتك!' };
}

// ============================================================ الإدارة
async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') throw new Error('غير مصرّح');
  return user;
}

export async function adminSetStatusAction(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = str(fd, 'id', 64);
  const status = str(fd, 'status', 20);
  if (!id || !['approved', 'rejected', 'pending'].includes(status)) return;
  const sb = await createClient();
  await sb.from('restaurants').update({ status }).eq('id', id);
  revalidatePath('/admin');
  revalidatePath('/restaurants');
  revalidatePath('/');
}

export async function adminUploadImageAction(_: ActionState, fd: FormData): Promise<ActionState> {
  try { await requireAdmin(); } catch { return { error: 'غير مصرّح.' }; }

  const restaurantId = str(fd, 'restaurantId', 64);
  const alt = str(fd, 'alt', 200);
  const isCover = fd.get('isCover') === 'on';
  const file = fd.get('file');
  if (!restaurantId) return { error: 'اختر المطعم.' };
  if (!(file instanceof File) || file.size === 0) return { error: 'اختر ملف صورة.' };
  if (file.size > 5 * 1024 * 1024) return { error: 'الحد الأقصى لحجم الصورة 5MB.' };
  const ext = ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' } as Record<string, string>)[file.type];
  if (!ext) return { error: 'الصيغ المسموحة: JPG, PNG, WEBP.' };

  const sb = await createClient();
  const path = `${restaurantId}/${crypto.randomUUID()}.${ext}`;
  const { error: upErr } = await sb.storage.from(STORAGE_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
  if (upErr) return { error: 'فشل رفع الصورة. تأكد من تشغيل ملف المخطط (bucket + policies).' };

  if (isCover) await sb.from('restaurant_images').update({ is_cover: false }).eq('restaurant_id', restaurantId);
  const { error } = await sb.from('restaurant_images').insert({
    restaurant_id: restaurantId, storage_path: path, alt: alt || null,
    is_cover: isCover, is_placeholder: false, sort_order: Date.now() % 100000,
  });
  if (error) {
    await sb.storage.from(STORAGE_BUCKET).remove([path]);
    return { error: 'تعذّر حفظ بيانات الصورة.' };
  }
  revalidatePath('/admin');
  revalidatePath('/restaurants');
  revalidatePath('/');
  return { ok: true, message: 'تم رفع الصورة.' };
}

export async function adminDeleteImageAction(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = str(fd, 'id', 64);
  if (!id) return;
  const sb = await createClient();
  const { data } = await sb.from('restaurant_images').select('storage_path').eq('id', id).maybeSingle();
  if (data?.storage_path) await sb.storage.from(STORAGE_BUCKET).remove([data.storage_path]);
  await sb.from('restaurant_images').delete().eq('id', id);
  revalidatePath('/admin');
  revalidatePath('/restaurants');
}
