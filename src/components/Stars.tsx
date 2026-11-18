import type { CSSProperties } from 'react';

export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  const pct = Math.max(0, Math.min(5, value)) / 5 * 100;
  return (
    <span
      className="stars" role="img" aria-label={`${value.toFixed(1)} من 5`}
      style={{ '--pct': `${pct}%`, fontSize: size } as CSSProperties}
    >
      ★★★★★
    </span>
  );
}
