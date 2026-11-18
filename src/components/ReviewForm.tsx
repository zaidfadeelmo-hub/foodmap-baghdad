'use client';

import { useActionState, useState } from 'react';
import { submitReviewAction } from '@/app/actions';
import type { ActionState } from '@/lib/types';

export function ReviewForm({
  restaurantId, slug, initialRating = 0, initialComment = '',
}: { restaurantId: string; slug: string; initialRating?: number; initialComment?: string }) {
  const [state, action, pending] = useActionState(submitReviewAction, {} as ActionState);
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);

  return (
    <form action={action} className="review-form">
      <input type="hidden" name="restaurantId" value={restaurantId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="rating" value={rating || ''} />
      <p className="form-label">{initialRating ? 'عدّل تقييمك' : 'قيّم تجربتك'}</p>
      <div className="star-input" role="radiogroup" aria-label="التقييم">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n} type="button" role="radio" aria-checked={rating === n}
            aria-label={`${n} من 5`} className={n <= rating ? 'on' : ''} onClick={() => setRating(n)}
          >★</button>
        ))}
      </div>
      <textarea
        name="comment" rows={4} maxLength={1000} value={comment}
        onChange={(e) => setComment(e.target.value)} placeholder="شاركنا تجربتك (اختياري)"
      />
      <button className="btn btn-primary" type="submit" disabled={pending || !rating}>
        {pending ? 'جارٍ الحفظ…' : 'نشر التقييم'}
      </button>
      {state.error && <p className="form-error" role="alert">{state.error}</p>}
      {state.ok && <p className="form-ok" role="status">{state.message}</p>}
    </form>
  );
}
