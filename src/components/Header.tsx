import Link from 'next/link';
import { signOutAction } from '@/app/actions';
import { isSupabaseConfigured } from '@/lib/config';
import { Icon } from '@/components/Icons';
import type { SessionUser } from '@/lib/types';

export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="FoodMap Baghdad — الصفحة الرئيسية">
      <svg viewBox="0 0 64 64" width="36" height="36" aria-hidden="true">
        <rect width="64" height="64" rx="16" fill="#0d3b2c" />
        <path d="M32 12c-7.700 0-14 6-14 13.600 0 9.900 14 25.400 14 25.400s14-15.500 14-25.400C46 18 39.700 12 32 12z" fill="#f28c3a" />
        <circle cx="32" cy="25.500" r="5.500" fill="#fbf8f1" />
      </svg>
      <span className="logo-text"><b>FoodMap</b> <span>Baghdad</span></span>
    </Link>
  );
}

export function Header({ user }: { user: SessionUser | null }) {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Logo />
        <nav className="nav-desktop" aria-label="التنقل الرئيسي">
          <Link href="/restaurants">المطاعم والكافيهات</Link>
          <Link href="/map">الخريطة</Link>
          <Link href="/favorites">المفضلة</Link>
          <Link href="/add">أضف مطعماً</Link>
          {user?.role === 'admin' && <Link href="/admin">الإدارة</Link>}
        </nav>
        <div className="header-actions">
          <Link href="/restaurants" className="icon-btn" aria-label="بحث"><Icon name="search" /></Link>
          {user ? (
            <form action={signOutAction} className="user-chip">
              <span className="user-name">{user.displayName}</span>
              <button className="btn btn-ghost btn-sm" type="submit">خروج</button>
            </form>
          ) : (
            isSupabaseConfigured && <Link href="/login" className="btn btn-primary btn-sm">دخول</Link>
          )}
        </div>
      </div>
    </header>
  );
}
