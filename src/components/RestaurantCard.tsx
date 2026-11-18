import Link from 'next/link';
import { RestaurantImage } from '@/components/RestaurantImage';
import { Stars } from '@/components/Stars';
import { FavoriteButton } from '@/components/FavoriteButton';
import { formatRating, priceLabel } from '@/lib/utils';
import type { FavMode } from '@/lib/mode';
import type { Restaurant } from '@/lib/types';

export function RestaurantCard({ r, favMode, favorite = false }: { r: Restaurant; favMode: FavMode; favorite?: boolean }) {
  return (
    <article className="card">
      <Link href={`/restaurants/${r.slug}`} className="card-media" aria-label={r.nameAr}>
        <RestaurantImage img={r.images[0]} />
        <span className="badge badge-kind">{r.kind === 'cafe' ? 'كافيه' : 'مطعم'}</span>
        {r.isDemo && <span className="badge badge-demo">بيانات تجريبية</span>}
      </Link>
      <FavoriteButton restaurantId={r.id} mode={favMode} initial={favorite} />
      <div className="card-body">
        <h3 className="card-title"><Link href={`/restaurants/${r.slug}`}>{r.nameAr}</Link></h3>
        <div className="card-meta">
          <Stars value={r.avgRating} size={15} />
          <span className="rating-num">{formatRating(r.avgRating)}</span>
          <span className="muted">({r.reviewsCount})</span>
          <span className="dot" aria-hidden="true">•</span>
          <span className="price" aria-label={`مستوى السعر ${r.priceLevel} من 4`}>
            <b>{priceLabel(r.priceLevel)}</b><i>{'$'.repeat(4 - r.priceLevel)}</i>
          </span>
        </div>
        <p className="card-area">{r.areaName}</p>
        <div className="tags">
          {r.cuisines.slice(0, 3).map((c) => (
            <span className="tag" key={c.slug}>{c.icon} {c.name}</span>
          ))}
        </div>
      </div>
    </article>
  );
}
