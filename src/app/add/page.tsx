import Link from 'next/link';
import type { Metadata } from 'next';
import { SuggestForm } from '@/components/SuggestForm';
import { DEMO_MESSAGE, isSupabaseConfigured } from '@/lib/config';
import { getRefs, getSessionUser } from '@/lib/data';

export const metadata: Metadata = { title: 'أضف مطعماً' };

export default async function AddPage() {
  const [{ areas, cuisines, city }, user] = await Promise.all([getRefs(), getSessionUser()]);

  return (
    <div className="container section">
      <div className="page-head">
        <h1>أضف مطعماً أو كافيه</h1>
        <p className="muted">مجاني بالكامل. يظهر المطعم في الدليل بعد مراجعة الإدارة.</p>
      </div>

      {!isSupabaseConfigured ? (
        <div className="notice">{DEMO_MESSAGE}</div>
      ) : !user ? (
        <div className="panel">
          <p>سجّل الدخول لإضافة مطعم إلى الدليل.</p>
          <Link className="btn btn-primary" href="/login?next=/add">تسجيل الدخول</Link>
        </div>
      ) : (
        <SuggestForm areas={areas} cuisines={cuisines} center={[city.lat, city.lng]} zoom={city.zoom} />
      )}
    </div>
  );
}
