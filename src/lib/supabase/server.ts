import { createServerClient, type SetAllCookies } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SUPABASE_ANON, SUPABASE_URL } from '@/lib/config';

/** عميل Supabase للخادم (Server Components / Server Actions / Route Handlers) */
export async function createClient() {
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(list: Parameters<SetAllCookies>[0]) {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // يُستدعى من Server Component؛ التحديث يتولاه middleware
        }
      },
    },
  });
}
