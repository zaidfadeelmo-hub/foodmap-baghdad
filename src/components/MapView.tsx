'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { escapeHtml } from '@/lib/utils';

export type MapPoint = {
  slug: string; name: string; lat: number; lng: number;
  area: string; rating: number; count: number; demo: boolean;
};

export const OSM_TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">مساهمو OpenStreetMap</a>';

export function pinIcon() {
  return L.divIcon({
    className: 'pin-wrap',
    html: '<span class="pin"></span>',
    iconSize: [30, 38],
    iconAnchor: [15, 38],
    popupAnchor: [0, -34],
  });
}

function popup(p: MapPoint): string {
  const rating = p.count > 0 ? `★ ${p.rating.toFixed(1)} (${p.count})` : 'لا توجد تقييمات بعد';
  return `<div class="map-popup" dir="rtl">
    <strong>${escapeHtml(p.name)}</strong>
    <span>${escapeHtml(p.area)} · ${rating}</span>
    ${p.demo ? '<em>بيانات تجريبية</em>' : ''}
    <a href="/restaurants/${encodeURIComponent(p.slug)}">عرض التفاصيل</a>
  </div>`;
}

export default function MapView({
  points, center, zoom = 12, fit = true, className = 'map-box',
}: {
  points: MapPoint[]; center: [number, number]; zoom?: number; fit?: boolean; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const map = L.map(ref.current, { scrollWheelZoom: false }).setView(center, zoom);
    L.tileLayer(OSM_TILES, { maxZoom: 19, attribution: OSM_ATTRIBUTION }).addTo(map);

    const icon = pinIcon();
    points.forEach((p) => L.marker([p.lat, p.lng], { icon, title: p.name }).addTo(map).bindPopup(popup(p)));

    if (fit && points.length > 1) {
      map.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number])), { padding: [36, 36] });
    }
    return () => { map.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(points), center[0], center[1], zoom, fit]);

  return <div ref={ref} className={className} role="region" aria-label="خريطة المطاعم" />;
}
