'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { signInAction, signUpAction } from '@/app/actions';
import type { ActionState } from '@/lib/types';

export function AuthForm({ mode, next }: { mode: 'login' | 'signup'; next: string }) {
  const [state, action, pending] = useActionState(mode === 'login' ? signInAction : signUpAction, {} as ActionState);
  const isLogin = mode === 'login';

  return (
    <form action={action} className="form auth-card">
      <h1>{isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}</h1>
      <p className="muted">{isLogin ? 'مرحباً بعودتك إلى FoodMap Baghdad.' : 'احفظ مفضلتك وشارك تقييماتك مجاناً.'}</p>
      <input type="hidden" name="next" value={next} />
      {!isLogin && (
        <div className="field">
          <label htmlFor="displayName">الاسم الظاهر</label>
          <input id="displayName" name="displayName" required maxLength={60} autoComplete="nickname" />
        </div>
      )}
      <div className="field">
        <label htmlFor="email">البريد الإلكتروني</label>
        <input id="email" name="email" type="email" required autoComplete="email" dir="ltr" />
      </div>
      <div className="field">
        <label htmlFor="password">كلمة المرور</label>
        <input
          id="password" name="password" type="password" required minLength={isLogin ? undefined : 8}
          autoComplete={isLogin ? 'current-password' : 'new-password'} dir="ltr"
        />
        {!isLogin && <small className="muted">8 أحرف على الأقل.</small>}
      </div>
      <button className="btn btn-primary btn-block" type="submit" disabled={pending}>
        {pending ? 'لحظة…' : isLogin ? 'دخول' : 'إنشاء الحساب'}
      </button>
      {state.error && <p className="form-error" role="alert">{state.error}</p>}
      {state.ok && <p className="form-ok" role="status">{state.message}</p>}
      <p className="auth-switch">
        {isLogin ? (
          <>ليس لديك حساب؟ <Link href={`/signup?next=${encodeURIComponent(next)}`}>أنشئ حساباً</Link></>
        ) : (
          <>لديك حساب؟ <Link href={`/login?next=${encodeURIComponent(next)}`}>سجّل الدخول</Link></>
        )}
      </p>
    </form>
  );
}
