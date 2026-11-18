'use client';

import { useActionState } from 'react';
import { suggestRestaurantAction } from '@/app/actions';
import { LocationPicker } from '@/components/MapLoader';
import type { ActionState, Area, Cuisine } from '@/lib/types';

export function SuggestForm({
  areas, cuisines, center, zoom,
}: { areas: Area[]; cuisines: Cuisine[]; center: [number, number]; zoom: number }) {
  const [state, action, pending] = useActionState(suggestRestaurantAction, {} as ActionState);

  if (state.ok) {
    return (
      <div className="panel success-panel" role="status">
        <h2>شكراً لك!</h2>
        <p>{state.message}</p>
        <a className="btn btn-primary" href="/restaurants">تصفح الدليل</a>
      </div>
    );
  }

  return (
    <form action={action} className="form form-wide">
      <div className="form-row">
        <div className="field">
          <label htmlFor="nameAr">اسم المطعم بالعربية *</label>
          <input id="nameAr" name="nameAr" required minLength={2} maxLength={120} />
        </div>
        <div className="field">
          <label htmlFor="nameEn">الاسم بالإنكليزية</label>
          <input id="nameEn" name="nameEn" maxLength={120} dir="ltr" />
        </div>
      </div>
      <div className="form-row">
        <div className="field">
          <label htmlFor="kind">النوع</label>
          <select id="kind" name="kind" defaultValue="restaurant">
            <option value="restaurant">مطعم</option>
            <option value="cafe">كافيه</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="area">المنطقة *</label>
          <select id="area" name="area" required defaultValue="">
            <option value="" disabled>اختر المنطقة</option>
            {areas.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="price">مستوى السعر</label>
          <select id="price" name="price" defaultValue="2">
            <option value="1">$ اقتصادي</option>
            <option value="2">$$ متوسط</option>
            <option value="3">$$$ مرتفع</option>
            <option value="4">$$$$ فاخر</option>
          </select>
        </div>
      </div>

      <fieldset className="field">
        <legend>نوع الأكل (حتى 4)</legend>
        <div className="check-grid">
          {cuisines.map((c) => (
            <label key={c.slug} className="check"><input type="checkbox" name="cuisines" value={c.slug} /> {c.icon} {c.name}</label>
          ))}
        </div>
      </fieldset>

      <div className="field">
        <label>موقع المطعم على الخريطة *</label>
        <LocationPicker center={center} zoom={zoom} />
      </div>

      <div className="form-row">
        <div className="field">
          <label htmlFor="address">العنوان / أقرب نقطة دالة</label>
          <input id="address" name="address" maxLength={250} />
        </div>
        <div className="field">
          <label htmlFor="hours">أوقات الدوام</label>
          <input id="hours" name="hours" maxLength={120} placeholder="مثال: يومياً 12 ظهراً – 12 ليلاً" />
        </div>
      </div>
      <div className="form-row">
        <div className="field">
          <label htmlFor="phone">الهاتف</label>
          <input id="phone" name="phone" maxLength={30} dir="ltr" inputMode="tel" />
        </div>
        <div className="field">
          <label htmlFor="instagram">حساب إنستغرام</label>
          <input id="instagram" name="instagram" maxLength={80} dir="ltr" placeholder="@username" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="description">وصف مختصر</label>
        <textarea id="description" name="description" rows={4} maxLength={1200} />
      </div>

      <p className="muted small">سيُراجع فريق الإدارة الطلب قبل ظهوره في الدليل. يمكن للإدارة إضافة الصور لاحقاً.</p>
      <button className="btn btn-primary" type="submit" disabled={pending}>{pending ? 'جارٍ الإرسال…' : 'إرسال للمراجعة'}</button>
      {state.error && <p className="form-error" role="alert">{state.error}</p>}
    </form>
  );
}
