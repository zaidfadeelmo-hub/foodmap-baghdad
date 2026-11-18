import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/AuthForm';
import { DEMO_MESSAGE, isSupabaseConfigured } from '@/lib/config';
import { getSessionUser } from '@/lib/data';
import { safeNext } from '@/lib/utils';

export const metadata: Metadata = { title: 'إنشاء حساب' };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  if (await getSessionUser()) redirect(next);

  return (
    <div className="container section auth-wrap">
      {!isSupabaseConfigured && <div className="notice">{DEMO_MESSAGE}</div>}
      <AuthForm mode="signup" next={next} />
    </div>
  );
}
