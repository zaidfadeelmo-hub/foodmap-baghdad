'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { RestaurantCard } from '@/components/RestaurantCard';
import { readLocalFavs } from '@/components/FavoriteButton';
import type { Restaurant } from '@/lib/types';

/** المفضلة في وضع العرض التجريبي: تُحفظ في متصفحك فقط */
export function DemoFavorites({ restaurants }: { restaurants: Restaurant[] }) {
  const [ids, setIds] = useState<string[] | null>(null);
  useEffect(() => setIds(readLocalFavs()), []);

  if (ids === null) return <p className="muted">جارٍ التحميل…</p>;
  const list = restaurants.filter((r) => ids.includes(r.id));
  if (!list.length) {
    return (
      <div className="empty">
        <p>لم تحفظ أي مطعم بعد.</p>
        <Link className="btn btn-primary" href="/restaurants">استكشف المطاعم</Link>
      </div>
    );
  }
  return (
    <div className="grid">
      {list.map((r) => <RestaurantCard key={r.id} r={r} favMode="demo" />)}
    </div>
  );
}
