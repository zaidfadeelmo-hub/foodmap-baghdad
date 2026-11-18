import type { Img } from '@/lib/types';

/** يعرض صورة المطعم، ويضع شارة "صورة تجريبية" على أي صورة غير موثقة */
export function RestaurantImage({ img, priority = false }: { img?: Img; priority?: boolean }) {
  const src = img?.url ?? '/placeholders/default.svg';
  const isPlaceholder = !img || img.isPlaceholder;
  return (
    <span className="img-wrap">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={img?.alt ?? 'صورة تجريبية'}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        width={1200}
        height={800}
      />
      {isPlaceholder && <span className="badge badge-ph">صورة تجريبية</span>}
    </span>
  );
}
