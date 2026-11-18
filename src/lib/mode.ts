import { isSupabaseConfigured } from '@/lib/config';
import type { SessionUser } from '@/lib/types';

/** كيف تُدار المفضلة: demo = متصفح المستخدم فقط، user = قاعدة البيانات، guest = يحتاج تسجيل دخول */
export type FavMode = 'demo' | 'user' | 'guest';

export function favMode(user: SessionUser | null): FavMode {
  if (!isSupabaseConfigured) return 'demo';
  return user ? 'user' : 'guest';
}
