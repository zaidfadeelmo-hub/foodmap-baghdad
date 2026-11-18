import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/AuthForm';
import { DEMO_MESSAGE, isSupabaseConfigured } from '@/lib/config';
import { getSessionUser } from '@/lib/data';
import { safeNext } from '@/lib/utils';

export const metadata: Metadata = { title: 'تسجيل الدخول' };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  if (await getSessionUser()) redirect(next);

  return (
    <div className="container section auth-wrap">
      {!isSupabaseConfigured && <div className="notice">{DEMO_MESSAGE}</div>}
      {sp.error === 'confirm' && <div className="notice">تعذّر تأكيد البريد. جرّب تسجيل الدخول أو أعد إنشاء الحساب.</div>}
      <AuthForm mode="login" next={next} />
    </div>
  );
}
