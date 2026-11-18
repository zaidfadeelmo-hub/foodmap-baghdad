'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/Icons';

const items = [
  { href: '/', label: 'الرئيسية', icon: 'home' },
  { href: '/restaurants', label: 'استكشف', icon: 'list' },
  { href: '/map', label: 'الخريطة', icon: 'map' },
  { href: '/favorites', label: 'المفضلة', icon: 'heart' },
];

export function BottomNav({ loggedIn }: { loggedIn: boolean }) {
  const path = usePathname();
  const all = [...items, { href: loggedIn ? '/add' : '/login', label: loggedIn ? 'أضف' : 'دخول', icon: loggedIn ? 'plus' : 'user' }];
  return (
    <nav className="bottom-nav" aria-label="التنقل السريع">
      {all.map((i) => {
        const active = i.href === '/' ? path === '/' : path.startsWith(i.href);
        return (
          <Link key={i.href} href={i.href} className={active ? 'active' : ''} aria-current={active ? 'page' : undefined}>
            <Icon name={i.icon} size={22} />
            <span>{i.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
