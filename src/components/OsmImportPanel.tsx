'use client';

import { useState } from 'react';

type Preview = { total: number; categories: Record<string, number>; sample: { name: string; type: string; address: string }[] };
type Result = { imported: number; duplicates: number; found: number };

export function OsmImportPanel() {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function send(mode: 'preview' | 'import') {
    setBusy(true); setError(''); setResult(null);
    try {
      const response = await fetch('/api/admin/osm-import', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      const raw = await response.text();
      let data: (Preview & Partial<Result> & { error?: string; stage?: string }) | null = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        const contentType = response.headers.get('content-type') ?? 'unknown';
        throw new Error(
          `الخادم رد بحالة HTTP ${response.status} ولم يُرجع JSON (نوع الرد: ${contentType}).`
        );
      }
      if (!response.ok) {
        const detail = data?.error ?? (raw.trim() ? `رد الخادم: ${raw.trim().slice(0, 1200)}` : 'الخادم أرسل رداً فارغاً.');
        const stage = data?.stage ? ` — المرحلة: ${data.stage}` : '';
        throw new Error(`HTTP ${response.status}: ${detail}${stage}`);
      }
      if (!data) throw new Error('الخادم أرسل رداً فارغاً.');
      if (mode === 'preview') setPreview(data as Preview);
      else { setResult(data as Result); setPreview(null); }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'حدث خطأ غير متوقع.');
    } finally { setBusy(false); }
  }

  return (
    <section className="panel">
      <h2>استيراد مطاعم بغداد من OpenStreetMap</h2>
      <p className="muted">يجلب الأماكن المسجلة على الخريطة ضمن نطاق بغداد. البيانات المستوردة تبقى قيد المراجعة ولا تظهر للزوار قبل اعتمادها.</p>
      <button className="btn btn-primary" type="button" disabled={busy} onClick={() => send('preview')}>
        {busy ? 'جارٍ الاتصال…' : 'فحص المطاعم المتاحة'}
      </button>
      {error && <p className="form-error" role="alert">{error}</p>}
      {preview && (
        <div className="admin-body">
          <p><strong>{preview.total.toLocaleString('ar-IQ')}</strong> مكاناً مرشحاً وجدناه. هذا لا يعني أن كل مطاعم بغداد موجودة في OpenStreetMap.</p>
          <p className="muted small">{Object.entries(preview.categories).map(([k,v]) => `${k}: ${v}`).join(' · ')}</p>
          <ul>{preview.sample.map((x,i) => <li key={i}>{x.name} — {x.type}{x.address ? ` — ${x.address}` : ''}</li>)}</ul>
          <button className="btn btn-primary" type="button" disabled={busy || preview.total === 0} onClick={() => send('import')}>
            استيراد الكل كاقتراحات للمراجعة
          </button>
        </div>
      )}
      {result && <p className="success-panel" role="status">اكتمل الاستيراد: أُضيف {result.imported}، وتُخطّي {result.duplicates} مكرراً، من أصل {result.found} مكاناً مرشحاً.</p>}
      <p className="muted small">المصدر: OpenStreetMap contributors. قد تكون بعض الأسماء أو التفاصيل ناقصة أو قديمة؛ راجع كل سجل قبل اعتماده. لا تُستورد الأسعار أو الصور أو أوصاف غير موثقة.</p>
    </section>
  );
}
