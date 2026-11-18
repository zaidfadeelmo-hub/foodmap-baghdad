import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FavoriteButton } from '@/components/FavoriteButton';
import { Icon } from '@/components/Icons';
import { MapView } from '@/components/MapLoader';
import { RestaurantImage } from '@/components/RestaurantImage';
import { ReviewForm } from '@/components/ReviewForm';
import { Stars } from '@/components/Stars';
import { isSupabaseConfigured, SITE_URL } from '@/lib/config';
import { getFavoriteIds, getMyReview, getRestaurantBySlug, getReviews, getSessionUser } from '@/lib/data';
import { favMode } from '@/lib/mode';
import { formatDate, formatRating, priceLabel } from '@/lib/utils';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const r = await getRestaurantBySlug(slug);
  if (!r) return { title: 'غير موجود' };
  return {
    title: r.nameAr,
    description: r.description.slice(0, 160) || `${r.nameAr} — ${r.areaName}، بغداد`,
    robots: r.isDemo ? { index: false, follow: false } : undefined,
  };
}

export default async function RestaurantPage({ params }: Props) {
  const { slug } = await params;
  const r = await getRestaurantBySlug(slug);
  if (!r) notFound();

  const [reviews, user] = await Promise.all([getReviews(r.id), getSessionUser()]);
  const favs = user ? await getFavoriteIds(user.id) : new Set<string>();
  const mine = user ? await getMyReview(r.id, user.id) : null;
  const mode = favMode(user);
  const ig = r.instagram?.replace(/^@/, '') ?? '';
  const igValid = /^[A-Za-z0-9._]{1,30}$/.test(ig);

  const jsonLd = !r.isDemo && r.status === 'approved' ? {
    '@context': 'https://schema.org',
    '@type': r.kind === 'cafe' ? 'CafeOrCoffeeShop' : 'Restaurant',
    name: r.nameAr,
    url: `${SITE_URL}/restaurants/${r.slug}`,
    address: r.address || r.areaName,
    geo: { '@type': 'GeoCoordinates', latitude: r.lat, longitude: r.lng },
    ...(r.reviewsCount > 0 ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: r.avgRating, reviewCount: r.reviewsCount } } : {}),
  } : null;

  return (
    <div className="container section detail">
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      )}
      <nav className="breadcrumb" aria-label="مسار التنقل">
        <Link href="/">الرئيسية</Link> / <Link href="/restaurants">المطاعم</Link> / <span>{r.nameAr}</span>
      </nav>

      {r.status !== 'approved' && (
        <div className="notice" role="status">هذا المطعم {r.status === 'pending' ? 'قيد المراجعة ولا يظهر للزوار بعد.' : 'غير معتمد.'}</div>
      )}
      {r.isDemo && (
        <div className="notice" role="note">بيانات تجريبية: الاسم والتقييمات والصور والموقع لعرض التصميم فقط وليست لمطعم حقيقي.</div>
      )}

      <div className="gallery">
        <div className="gallery-main"><RestaurantImage img={r.images[0]} priority /></div>
        {r.images.length > 1 && (
          <div className="gallery-thumbs">
            {r.images.slice(1, 5).map((img) => <RestaurantImage key={img.id} img={img} />)}
          </div>
        )}
      </div>

      <div className="detail-head">
        <div>
          <h1>{r.nameAr}</h1>
          {r.nameEn && <p className="muted" dir="ltr">{r.nameEn}</p>}
          <div className="card-meta big">
            <Stars value={r.avgRating} size={20} />
            <span className="rating-num">{formatRating(r.avgRating)}</span>
            <span className="muted">({r.reviewsCount} تقييم)</span>
            <span className="dot" aria-hidden="true">•</span>
            <span className="price"><b>{priceLabel(r.priceLevel)}</b><i>{'$'.repeat(4 - r.priceLevel)}</i></span>
            <span className="dot" aria-hidden="true">•</span>
            <span>{r.kind === 'cafe' ? 'كافيه' : 'مطعم'} · {r.areaName}</span>
          </div>
          <div className="tags">
            {r.cuisines.map((c) => (
              <Link key={c.slug} className="tag" href={`/restaurants?cuisine=${c.slug}`}>{c.icon} {c.name}</Link>
            ))}
          </div>
        </div>
        <FavoriteButton restaurantId={r.id} mode={mode} initial={favs.has(r.id)} variant="full" />
      </div>

      <div className="detail-grid">
        <div>
          {r.description && (
            <section className="panel">
              <h2>نبذة</h2>
              <p>{r.description}</p>
            </section>
          )}

          <section className="panel reviews" id="reviews">
            <h2>التقييمات ({reviews.length})</h2>
            {reviews.length ? (
              <ul className="review-list">
                {reviews.map((rv) => (
                  <li key={rv.id} className="review">
                    <div className="review-head">
                      <strong>{rv.author}</strong>
                      {rv.isDemo && <span className="badge badge-demo static">تجريبي</span>}
                      <Stars value={rv.rating} size={14} />
                      <span className="muted small">{formatDate(rv.createdAt)}</span>
                    </div>
                    {rv.comment && <p>{rv.comment}</p>}
                  </li>
                ))}
              </ul>
            ) : <p className="muted">لا توجد تقييمات بعد. كن أول من يقيّم!</p>}

            <div className="review-compose">
              {!isSupabaseConfigured ? (
                <p className="muted">إضافة التقييمات تتفعّل بعد ربط قاعدة البيانات (Supabase).</p>
              ) : !user ? (
                <p><Link className="btn btn-primary" href={`/login?next=/restaurants/${r.slug}`}>سجّل الدخول</Link> لإضافة تقييمك.</p>
              ) : r.status !== 'approved' ? (
                <p className="muted">يمكن التقييم بعد اعتماد المطعم.</p>
              ) : (
                <ReviewForm restaurantId={r.id} slug={r.slug} initialRating={mine?.rating ?? 0} initialComment={mine?.comment ?? ''} />
              )}
            </div>
          </section>
        </div>

        <aside>
          <section className="panel">
            <h2>معلومات</h2>
            <ul className="info-list">
              {r.address && <li><Icon name="pin" size={18} /><span>{r.address}</span></li>}
              {r.openingHours && <li><Icon name="clock" size={18} /><span>{r.openingHours}</span></li>}
              {r.phone && <li><Icon name="phone" size={18} /><a href={`tel:${r.phone.replace(/[^\d+]/g, '')}`} dir="ltr">{r.phone}</a></li>}
              {igValid && <li><span aria-hidden="true">@</span><a href={`https://instagram.com/${ig}`} target="_blank" rel="noopener noreferrer nofollow" dir="ltr">{ig}</a></li>}
            </ul>
            {r.isDemo && <p className="muted small">الموقع على الخريطة تقريبي لمنطقة {r.areaName}.</p>}
          </section>
          <section className="panel">
            <h2>الموقع</h2>
            <MapView
              points={[{ slug: r.slug, name: r.nameAr, lat: r.lat, lng: r.lng, area: r.areaName, rating: r.avgRating, count: r.reviewsCount, demo: r.isDemo }]}
              center={[r.lat, r.lng]} zoom={15} fit={false}
            />
            <a className="btn btn-ghost btn-block" target="_blank" rel="noopener noreferrer"
               href={`https://www.openstreetmap.org/?mlat=${r.lat}&mlon=${r.lng}#map=17/${r.lat}/${r.lng}`}>
              فتح في OpenStreetMap
            </a>
          </section>
        </aside>
      </div>
    </div>
  );
}
