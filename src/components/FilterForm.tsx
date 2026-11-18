'use client';

import { useRouter } from 'next/navigation';
import type { ChangeEvent, FormEvent } from 'react';
import type { Area, Cuisine, SearchParams } from '@/lib/types';

export function FilterForm({ areas, cuisines, values }: { areas: Area[]; cuisines: Cuisine[]; values: SearchParams }) {
  const router = useRouter();

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const sp = new URLSearchParams();
    for (const [k, v] of new FormData(e.currentTarget).entries()) {
      if (typeof v === 'string' && v.trim()) sp.set(k, v.trim());
    }
    const qs = sp.toString();
    router.push(qs ? `/restaurants?${qs}` : '/restaurants');
  }
  const auto = (e: ChangeEvent<HTMLSelectElement>) => e.currentTarget.form?.requestSubmit();

  return (
    <form className="filters" onSubmit={submit} role="search">
      <div className="field field-search">
        <label htmlFor="f-q">ابحث</label>
        <input id="f-q" name="q" type="search" defaultValue={values.q ?? ''} placeholder="اسم مطعم، نوع أكل، منطقة…" />
      </div>
      <div className="field">
        <label htmlFor="f-area">المنطقة</label>
        <select id="f-area" name="area" defaultValue={values.area ?? ''} onChange={auto}>
          <option value="">كل مناطق بغداد</option>
          {areas.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
        </select>
      </div>
      <div className="field">
        <label htmlFor="f-cuisine">نوع الأكل</label>
        <select id="f-cuisine" name="cuisine" defaultValue={values.cuisine ?? ''} onChange={auto}>
          <option value="">الكل</option>
          {cuisines.map((c) => <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>)}
        </select>
      </div>
      <div className="field">
        <label htmlFor="f-kind">النوع</label>
        <select id="f-kind" name="kind" defaultValue={values.kind ?? ''} onChange={auto}>
          <option value="">مطاعم وكافيهات</option>
          <option value="restaurant">مطاعم</option>
          <option value="cafe">كافيهات</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="f-price">السعر</label>
        <select id="f-price" name="price" defaultValue={values.price ?? ''} onChange={auto}>
          <option value="">أي سعر</option>
          <option value="1">$ اقتصادي</option>
          <option value="2">$$ متوسط</option>
          <option value="3">$$$ مرتفع</option>
          <option value="4">$$$$ فاخر</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="f-rating">التقييم</label>
        <select id="f-rating" name="rating" defaultValue={values.rating ?? ''} onChange={auto}>
          <option value="">أي تقييم</option>
          <option value="4.5">4.5 فأكثر</option>
          <option value="4">4 فأكثر</option>
          <option value="3">3 فأكثر</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="f-sort">الترتيب</label>
        <select id="f-sort" name="sort" defaultValue={values.sort ?? ''} onChange={auto}>
          <option value="">الأعلى تقييماً</option>
          <option value="reviews">الأكثر تقييماً</option>
          <option value="newest">الأحدث</option>
          <option value="name">الاسم</option>
        </select>
      </div>
      <div className="field field-actions">
        <button className="btn btn-primary" type="submit">تطبيق</button>
        <a className="btn btn-ghost" href="/restaurants">مسح</a>
      </div>
    </form>
  );
}
