'use client';

import dynamic from 'next/dynamic';

// Leaflet يحتاج window، لذلك يُحمَّل في المتصفح فقط
const loading = () => <div className="map-box map-loading">جارٍ تحميل الخريطة…</div>;

export const MapView = dynamic(() => import('@/components/MapView'), { ssr: false, loading });
export const LocationPicker = dynamic(() => import('@/components/LocationPicker'), { ssr: false, loading });
