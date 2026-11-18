import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { adminDeleteImageAction, adminSetStatusAction } from '@/app/actions';
import { ImageUploadForm } from '@/components/ImageUploadForm';
import { DEMO_MESSAGE, isSupabaseConfigured } from '@/lib/config';
import { getSessionUser, listForAdmin } from '@/lib/data';
import type { Restaurant } from '@/lib/types';

export const metadata: Metadata = { title: 'لوحة الإدارة', robots: { index: false, follow: false } };

const STATUS_LABEL = { pending: 'قيد المراجعة', approved: 'معتمد', rejected: 'مرفوض' } as const;

function StatusForm({ id, status, label, tone }: { id: string; status: string; label: string; tone: 'primary' | 'ghost' }) {
  return (
    <form action={adminSetStatusAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button className={`btn btn-${tone} btn-sm`} type="submit">{label}</button>
    </form>
  );
}

export default async function AdminPage() {
  if (!isSupabaseConfigured) {
    return <div className="container section"><div className="notice">{DEMO_MESSAGE}</div></div>;
  }
  const user = await getSessionUser();
  if (!user) redirect('/login?next=/admin');
  if (user.role !== 'admin') {
    return (
      <div className="container section">
        <div className="notice">ليست لديك صلاحية الوصول إلى لوحة الإدارة.</div>
      </div>
    );
  }

  const all = await listForAdmin();
  const pending = all.filter((r) => r.status === 'pending');

  const Item = ({ r }: { r: Restaurant }) => (
    <details className="admin-item">
      <summary>
        <span>{r.nameAr}{r.isDemo && <span className="badge badge-demo static">تجريبي</span>}</span>
        <span className={`status status-${r.status}`}>{STATUS_LABEL[r.status]}</span>
      </summary>
      <div className="admin-body">
        <p className="muted small">{r.areaName} · {r.cuisines.map((c) => c.name).join('، ') || 'بدون تصنيف'} · {r.lat.toFixed(4)}, {r.lng.toFixed(4)}</p>
        <div className="admin-actions">
          {r.status !== 'approved' && <StatusForm id={r.id} status="approved" label="اعتماد" tone="primary" />}
          {r.status !== 'rejected' && <StatusForm id={r.id} status="rejected" label="رفض / إخفاء" tone="ghost" />}
        </div>

        <h3>الصور</h3>
        <div className="admin-images">
          {r.images.filter((i) => i.id !== 'default').map((img) => (
            <figure key={img.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.alt} loading="lazy" />
              <figcaption>
                {img.isPlaceholder ? 'تجريبية' : img.isCover ? 'غلاف' : 'صورة'}
                <form action={adminDeleteImageAction}>
                  <input type="hidden" name="id" value={img.id} />
                  <button className="link-danger" type="submit">حذف</button>
                </form>
              </figcaption>
            </figure>
          ))}
          {r.images.every((i) => i.id === 'default') && <p className="muted small">لا توجد صور بعد.</p>}
        </div>
        <ImageUploadForm restaurantId={r.id} />
      </div>
    </details>
  );

  return (
    <div className="container section">
      <div className="page-head">
        <h1>لوحة الإدارة</h1>
        <p className="muted">مرحباً {user.displayName}. راجع الاقتراحات وارفع الصور الحقيقية للمطاعم.</p>
      </div>

      <section className="panel">
        <h2>اقتراحات بانتظار المراجعة ({pending.length})</h2>
        {pending.length ? pending.map((r) => <Item key={r.id} r={r} />) : <p className="muted">لا توجد اقتراحات معلّقة.</p>}
      </section>

      <section className="panel">
        <h2>كل المطاعم ({all.length - pending.length})</h2>
        {all.filter((r) => r.status !== 'pending').map((r) => <Item key={r.id} r={r} />)}
      </section>
    </div>
  );
}
