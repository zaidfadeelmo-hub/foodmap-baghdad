import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container section empty">
      <h1>الصفحة غير موجودة</h1>
      <p className="muted">ربما انتقل المطعم أو تغيّر الرابط.</p>
      <Link className="btn btn-primary" href="/restaurants">تصفح المطاعم</Link>
    </div>
  );
}
