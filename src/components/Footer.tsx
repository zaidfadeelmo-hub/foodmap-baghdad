import Link from 'next/link';
import { Logo } from '@/components/Header';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Logo />
          <p className="footer-tag">دليلك لأطيب لقمة ببغداد.</p>
          <p className="muted small">منصة مجانية بالكامل للمستخدمين والمطاعم.</p>
        </div>
        <div>
          <h4>استكشف</h4>
          <ul>
            <li><Link href="/restaurants">كل المطاعم والكافيهات</Link></li>
            <li><Link href="/restaurants?kind=cafe">الكافيهات</Link></li>
            <li><Link href="/map">الخريطة</Link></li>
          </ul>
        </div>
        <div>
          <h4>شارك</h4>
          <ul>
            <li><Link href="/add">أضف مطعماً</Link></li>
            <li><Link href="/favorites">مفضلتي</Link></li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} FoodMap Baghdad</span>
        <span>
          الخرائط © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">مساهمو OpenStreetMap</a>
        </span>
      </div>
    </footer>
  );
}
