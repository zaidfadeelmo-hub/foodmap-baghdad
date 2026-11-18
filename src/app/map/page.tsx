import type { Metadata } from 'next';
import { MapView } from '@/components/MapLoader';
import { getAllForMap, getRefs } from '@/lib/data';

export const metadata: Metadata = { title: 'خريطة المطاعم' };

export default async function MapPage() {
  const [{ city }, list] = await Promise.all([getRefs(), getAllForMap()]);
  const points = list.map((r) => ({
    slug: r.slug, name: r.nameAr, lat: r.lat, lng: r.lng, area: r.areaName,
    rating: r.avgRating, count: r.reviewsCount, demo: r.isDemo,
  }));
  return (
    <div className="container section">
      <div className="page-head">
        <h1>خريطة المطاعم</h1>
        <p className="muted">{points.length} موقع في {city.name}. اضغط على أي دبوس لعرض التفاصيل.</p>
      </div>
      <MapView points={points} center={[city.lat, city.lng]} zoom={city.zoom} className="map-box map-full" />
    </div>
  );
}
