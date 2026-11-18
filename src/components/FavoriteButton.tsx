'use client';

import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { toggleFavoriteAction } from '@/app/actions';
import { Icon } from '@/components/Icons';
import type { FavMode } from '@/lib/mode';

export const FAV_KEY = 'fm_favs';
export function readLocalFavs(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(FAV_KEY) ?? '[]');
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

type Props = { restaurantId: string; mode: FavMode; initial?: boolean; variant?: 'card' | 'full' };

export function FavoriteButton({ restaurantId, mode, initial = false, variant = 'card' }: Props) {
  const [fav, setFav] = useState(initial);
  const [, start] = useTransition();

  useEffect(() => {
    if (mode === 'demo') setFav(readLocalFavs().includes(restaurantId));
  }, [mode, restaurantId]);

  if (mode === 'guest') {
    return (
      <Link className={`fav fav-${variant}`} href="/login?next=/favorites" aria-label="سجّل الدخول لحفظ المطعم في المفضلة">
        <Icon name="heart" />
        {variant === 'full' && <span>احفظ في المفضلة</span>}
      </Link>
    );
  }

  function toggle() {
    if (mode === 'demo') {
      const cur = readLocalFavs();
      const next = cur.includes(restaurantId) ? cur.filter((x) => x !== restaurantId) : [...cur, restaurantId];
      try { localStorage.setItem(FAV_KEY, JSON.stringify(next)); } catch { /* تجاهل */ }
      setFav(next.includes(restaurantId));
      return;
    }
    const prev = fav;
    setFav(!prev);
    start(async () => {
      const res = await toggleFavoriteAction(restaurantId);
      if (res.error) setFav(prev);
      else setFav(res.favorited);
    });
  }

  return (
    <button
      type="button" onClick={toggle} aria-pressed={fav}
      aria-label={fav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
      className={`fav fav-${variant}${fav ? ' on' : ''}`}
    >
      <Icon name="heart" filled={fav} />
      {variant === 'full' && <span>{fav ? 'في المفضلة' : 'احفظ في المفضلة'}</span>}
    </button>
  );
}
