'use client';

import { useState } from 'react';

type OsmCandidate = {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags: Record<string, string>;
};
type Preview = {
  total: number;
  categories: Record<string, number>;
  sample: { name: string; type: string; address: string }[];
  candidates: OsmCandidate[];
};
type Result = { imported: number; duplicates: number; found: number };

const BATCH_SIZE = 50;

async function readResponse(response: Response): Promise<any> {
  const raw = await response.text();
  let data: any = null;
  try { data = raw ? JSON.parse(raw) : null; } catch {
    const contentType = response.headers.get('content-type') ?? 'unknown';
    throw new Error(`HTTP ${response.status}: الخادم لم يُرجع JSON (نوع الرد: ${contentType}).`);
  }
  if (!response.ok) {
    const detail = data?.error ?? (raw.trim() ? raw.trim().slice(0, 800) : 'الخادم أرسل رداً فارغاً.');
    const stage = data?.stage ? ` — المرحلة: ${data.stage}` : '';
    throw new Error(`HTTP ${response.status}: ${detail}${stage}`);
  }
  if (!data) throw new Error('الخادم أرسل رداً فارغاً.');
  return data;
}

export function OsmImportPanel() {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);

  async function loadPreview() {
    setBusy(true); setError(''); setResult(null); setProgress(0);
    try {
      const response = await fetch('/api/admin/osm-import', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'preview' }),
      });
      const data = await readResponse(response) as Preview;
      if (!Array.isArray(data.candidates)) throw new Error('النسخة المستلمة لا تحتوي على قائمة المطاعم. أعد الفحص.');
      setPreview(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'حدث خطأ غير متوقع.');
    } finally { setBusy(false); }
  }

  async function importAll() {
    if (!preview?.candidates.length) return;
    setBusy(true); setError(''); setResult(null); setProgress(0);
    let imported = 0;
    let duplicates = 0;
    const chunks = Math.ceil(preview.candidates.length / BATCH_SIZE);
    try {
      for (let index = 0; index < chunks; index++) {
        const elements = preview.candidates.slice(index * BATCH_SIZE, (index + 1) * BATCH_SIZE);
        const response = await fetch('/api/admin/osm-import', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'import', elements }),
        });
        let data: Result;
        try { data = await readResponse(response) as Result; }
        catch (e) {
          const reason = e instanceof Error ? e.message : 'حدث خطأ غير متوقع.';
          throw new Error(`توقف الاستيراد عند الدفعة ${index + 1} من ${chunks}. أُضيف حتى الآن ${imported} مكاناً في هذه المحاولة. ${reason} يمكنك إعادة المحاولة؛ ستُتخطى السجلات الموجودة.`);
        }
        imported += data.imported ?? 0;
        duplicates += data.duplicates ?? 0;
        setProgress(index + 1);
      }
      setResult({ imported, duplicates, found: preview.total });
      setPreview(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'حدث خطأ غير متوقع.');
    } finally { setBusy(false); }
  }

  const batchCount = preview ? Math.ceil(preview.candidates.length / BATCH_SIZE) : 0;

  return (
    <section className="panel">
      <h2>استيراد مطاعم بغداد من OpenStreetMap</h2>
      <p className="muted">يجلب الأماكن المسجلة على الخريطة ضمن نطاق بغداد. البيانات المستوردة تبقى قيد المراجعة ولا تظهر للزوار قبل اعتمادها.</p>
      <button className="btn btn-primary" type="button" disabled={busy} onClick={loadPreview}>
        {busy ? 'جارٍ الاتصال…' : 'فحص المطاعم المتاحة'}
      </button>
      {error && <p className="form-error" role="alert">{error}</p>}
      {preview && (
        <div className="admin-body">
          <p><strong>{preview.total.toLocaleString('ar-IQ')}</strong> مكاناً مرشحاً وجدناه. هذا لا يعني أن كل مطاعم بغداد موجودة في OpenStreetMap.</p>
          <p className="muted small">{Object.entries(preview.categories).map(([k,v]) => `${k}: ${v}`).join(' · ')}</p>
          <ul>{preview.sample.map((x,i) => <li key={i}>{x.name} — {x.type}{x.address ? ` — ${x.address}` : ''}</li>)}</ul>
          {busy && batchCount > 0 && (
            <p role="status" aria-live="polite">
              جارٍ الاستيراد: الدفعة {progress.toLocaleString('ar-IQ')} من {batchCount.toLocaleString('ar-IQ')}
              {' '}({Math.round((progress / batchCount) * 100)}٪)
            </p>
          )}
          <button className="btn btn-primary" type="button" disabled={busy || preview.candidates.length === 0} onClick={importAll}>
            {busy ? 'جارٍ استيراد الدفعات…' : `استيراد الكل على دفعات (${batchCount.toLocaleString('ar-IQ')} دفعة)`}
          </button>
          <p className="muted small">كل طلب يحفظ 50 مكاناً فقط. إذا توقفت العملية، أعد المحاولة؛ السجلات التي حُفظت سابقاً ستُتخطى تلقائياً.</p>
        </div>
      )}
      {result && <p className="success-panel" role="status">اكتمل الاستيراد: أُضيف {result.imported.toLocaleString('ar-IQ')}، وتُخطّي {result.duplicates.toLocaleString('ar-IQ')} مكرراً، من أصل {result.found.toLocaleString('ar-IQ')} مكاناً مرشحاً.</p>}
      <p className="muted small">المصدر: OpenStreetMap contributors. قد تكون بعض الأسماء أو التفاصيل ناقصة أو قديمة؛ راجع كل سجل قبل اعتماده. لا تُستورد الأسعار أو الصور أو أوصاف غير موثقة.</p>
    </section>
  );
}
