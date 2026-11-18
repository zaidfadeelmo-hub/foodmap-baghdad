import Link from 'next/link';
import type { Metadata } from 'next';
import { FilterForm } from '@/components/FilterForm';
import { RestaurantCard } from '@/components/RestaurantCard';
import { getFavoriteIds, getRefs, getSessionUser, searchRestaurants } from '@/lib/data';
import { favMode } from '@/lib/mode';
import type { SearchParams } from '@/lib/types';

export const metadata: Metadata = { title: 'المطاعم والكافيهات' };

export default async function RestaurantsPage({
  searchParams,
}: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = await searchParams;
  const sp: SearchParams = {};
  for (const key of ['q', 'area', 'cuisine', 'price', 'rating', 'kind', 'sort', 'page'] as const) {
    const v = raw[key];
    const s = Array.isArray(v) ? v[0] : v;
    if (s) sp[key] = s;
  }

  const [{ areas, cuisines }, result, user] = await Promise.all([getRefs(), searchRestaurants(sp), getSessionUser()]);
  const favs = user ? await getFavoriteIds(user.id) : new Set<string>();
  const mode = favMode(user);
  const pages = Math.max(1, Math.ceil(result.total / result.pageSize));

  const hrefFor = (page: number) => {
    const q = new URLSearchParams();
    Object.entries(sp).forEach(([k, v]) => { if (v && k !== 'page') q.set(k, v); });
    if (page > 1) q.set('page', String(page));
    const s = q.toString();
    return s ? `/restaurants?${s}` : '/restaurants';
  };

  return (
    <div className="container section">
      <div className="page-head">
        <h1>المطاعم والكافيهات</h1>
        <p className="muted">{result.total} نتيجة في بغداد</p>
      </div>
      <FilterForm areas={areas} cuisines={cuisines} values={sp} />

      {result.items.length ? (
        <div className="grid">
          {result.items.map((r) => <RestaurantCard key={r.id} r={r} favMode={mode} favorite={favs.has(r.id)} />)}
        </div>
      ) : (
        <div className="empty">
          <p>لا توجد نتائج مطابقة. جرّب تغيير الفلاتر.</p>
          <Link className="btn btn-primary" href="/restaurants">مسح الفلاتر</Link>
        </div>
      )}

      {pages > 1 && (
        <nav className="pagination" aria-label="الصفحات">
          {result.page > 1 && <Link className="btn btn-ghost" href={hrefFor(result.page - 1)}>→ السابق</Link>}
          <span>صفحة {result.page} من {pages}</span>
          {result.page < pages && <Link className="btn btn-ghost" href={hrefFor(result.page + 1)}>التالي ←</Link>}
        </nav>
      )}
    </div>
  );
}
