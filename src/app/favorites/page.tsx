import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { DemoFavorites } from '@/components/DemoFavorites';
import { RestaurantCard } from '@/components/RestaurantCard';
import { isSupabaseConfigured } from '@/lib/config';
import { getAllForMap, getFavoriteRestaurants, getSessionUser } from '@/lib/data';

export const metadata: Metadata = { title: 'مفضلتي' };

export default async function FavoritesPage() {
  if (!isSupabaseConfigured) {
    const all = await getAllForMap();
    return (
      <div className="container section">
        <div className="page-head"><h1>مفضلتي</h1></div>
        <div className="notice">في وضع العرض التجريبي تُحفظ المفضلة داخل متصفحك فقط.</div>
        <DemoFavorites restaurants={all} />
      </div>
    );
  }

  const user = await getSessionUser();
  if (!user) redirect('/login?next=/favorites');
  const list = await getFavoriteRestaurants(user.id);

  return (
    <div className="container section">
      <div className="page-head"><h1>مفضلتي</h1></div>
      {list.length ? (
        <div className="grid">
          {list.map((r) => <RestaurantCard key={r.id} r={r} favMode="user" favorite />)}
        </div>
      ) : (
        <div className="empty">
          <p>لم تحفظ أي مطعم بعد.</p>
          <Link className="btn btn-primary" href="/restaurants">استكشف المطاعم</Link>
        </div>
      )}
    </div>
  );
}
