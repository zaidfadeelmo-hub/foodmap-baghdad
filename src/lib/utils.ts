export function priceLabel(level: number): string {
  return '$'.repeat(Math.max(1, Math.min(4, level || 1)));
}

export function formatRating(v: number): string {
  return v > 0 ? v.toFixed(1) : '—';
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

export function randomSuffix(len = 5): string {
  return Math.random().toString(36).slice(2, 2 + len);
}

/** يمنع إعادة التوجيه إلى مواقع خارجية */
export function safeNext(value: FormDataEntryValue | string | null | undefined, fallback = '/'): string {
  const v = typeof value === 'string' ? value : '';
  return v.startsWith('/') && !v.startsWith('//') && !v.includes('\\') ? v : fallback;
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('ar-IQ', { year: 'numeric', month: 'long', day: 'numeric', numberingSystem: 'latn' }).format(new Date(iso));
  } catch {
    return '';
  }
}
