import type { Metadata, Viewport } from 'next';
import { Tajawal } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BottomNav } from '@/components/BottomNav';
import { getSessionUser } from '@/lib/data';
import { SITE_URL, isSupabaseConfigured } from '@/lib/config';

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700', '800'],
  display: 'swap',
  variable: '--font-tajawal',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'FoodMap Baghdad — دليلك لأطيب لقمة ببغداد', template: '%s | FoodMap Baghdad' },
  description: 'اكتشف أفضل المطاعم والكافيهات في بغداد حسب الموقع والتقييمات وآراء الزوار.',
  openGraph: {
    title: 'FoodMap Baghdad',
    description: 'دليلك لأطيب لقمة ببغداد.',
    locale: 'ar_IQ',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0d3b2c',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable}>
      <body>
        <a className="skip" href="#main">تخطي إلى المحتوى</a>
        {!isSupabaseConfigured && (
          <div className="demo-bar" role="note">
            وضع العرض التجريبي — بيانات المطاعم والتقييمات والصور في هذه النسخة تجريبية وليست حقيقية.
          </div>
        )}
        <Header user={user} />
        <main id="main">{children}</main>
        <Footer />
        <BottomNav loggedIn={Boolean(user) || !isSupabaseConfigured} />
      </body>
    </html>
  );
}
