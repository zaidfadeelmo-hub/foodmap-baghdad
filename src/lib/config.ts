export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** false = وضع العرض التجريبي (بيانات محلية، بدون تسجيل دخول) */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON);

export const DEFAULT_CITY = process.env.NEXT_PUBLIC_DEFAULT_CITY ?? 'baghdad';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
export const STORAGE_BUCKET = 'restaurant-images';

export const DEMO_MESSAGE =
  'هذه النسخة تعمل بوضع العرض التجريبي. اربط مشروع Supabase (انظر README) لتفعيل التسجيل والتقييمات.';
