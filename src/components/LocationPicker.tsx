'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { OSM_ATTRIBUTION, OSM_TILES, pinIcon } from '@/components/MapView';
import { Icon } from '@/components/Icons';

/** اختيار موقع المطعم بالنقر على الخريطة. يضع lat/lng كحقول مخفية داخل النموذج. */
export default function LocationPicker({ center, zoom = 12 }: { center: [number, number]; zoom?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const placeRef = useRef<(lat: number, lng: number, pan?: boolean) => void>(() => {});
  const [pos, setPos] = useState<[number, number] | null>(null);
  const [geoError, setGeoError] = useState('');

  useEffect(() => {
    if (!ref.current) return;
    const map = L.map(ref.current, { scrollWheelZoom: false }).setView(center, zoom);
    L.tileLayer(OSM_TILES, { maxZoom: 19, attribution: OSM_ATTRIBUTION }).addTo(map);
    let marker: L.Marker | null = null;
    const icon = pinIcon();

    const place = (lat: number, lng: number, pan = false) => {
      if (marker) marker.setLatLng([lat, lng]);
      else marker = L.marker([lat, lng], { icon }).addTo(map);
      setPos([lat, lng]);
      if (pan) map.setView([lat, lng], 16);
    };
    placeRef.current = place;
    map.on('click', (e: L.LeafletMouseEvent) => place(e.latlng.lat, e.latlng.lng));
    return () => { map.remove(); };
  }, [center[0], center[1], zoom]);

  function locate() {
    setGeoError('');
    if (!navigator.geolocation) return setGeoError('المتصفح لا يدعم تحديد الموقع.');
    navigator.geolocation.getCurrentPosition(
      (p) => placeRef.current(p.coords.latitude, p.coords.longitude, true),
      () => setGeoError('تعذّر تحديد موقعك. اضغط على الخريطة لاختيار الموقع.'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div className="picker">
      <div ref={ref} className="map-box map-picker" role="region" aria-label="اختر موقع المطعم على الخريطة" />
      <input type="hidden" name="lat" value={pos ? pos[0].toFixed(6) : ''} />
      <input type="hidden" name="lng" value={pos ? pos[1].toFixed(6) : ''} />
      <div className="picker-bar">
        <button type="button" className="btn btn-ghost btn-sm" onClick={locate}>
          <Icon name="locate" size={16} /> استخدم موقعي
        </button>
        <span className="muted small">
          {pos ? `تم اختيار الموقع (${pos[0].toFixed(4)}, ${pos[1].toFixed(4)})` : 'اضغط على الخريطة لتحديد موقع المطعم'}
        </span>
      </div>
      {geoError && <p className="form-error" role="alert">{geoError}</p>}
    </div>
  );
}
