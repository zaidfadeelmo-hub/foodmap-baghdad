'use client';

import { useActionState } from 'react';
import { adminUploadImageAction } from '@/app/actions';
import type { ActionState } from '@/lib/types';

export function ImageUploadForm({ restaurantId }: { restaurantId: string }) {
  const [state, action, pending] = useActionState(adminUploadImageAction, {} as ActionState);
  return (
    <form action={action} className="upload-form">
      <input type="hidden" name="restaurantId" value={restaurantId} />
      <input type="file" name="file" accept="image/jpeg,image/png,image/webp" required aria-label="ملف الصورة" />
      <input type="text" name="alt" maxLength={200} placeholder="وصف الصورة (اختياري)" aria-label="وصف الصورة" />
      <label className="check"><input type="checkbox" name="isCover" /> اجعلها صورة الغلاف</label>
      <button className="btn btn-primary btn-sm" type="submit" disabled={pending}>{pending ? 'جارٍ الرفع…' : 'رفع الصورة'}</button>
      {state.error && <p className="form-error" role="alert">{state.error}</p>}
      {state.ok && <p className="form-ok" role="status">{state.message}</p>}
    </form>
  );
}
