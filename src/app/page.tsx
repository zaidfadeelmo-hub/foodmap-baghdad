import Link from 'next/link';
import { RestaurantCard } from '@/components/RestaurantCard';
import { Icon } from '@/components/Icons';
import { getFavoriteIds, getRefs, getSessionUser, getTopRated } from '@/lib/data';
import { favMode } from '@/lib/mode';

export default async function HomePage() {
  const [{ areas, cuisines, city }, top, user] = await Promise.all([getRefs(), getTopRated(6), getSessionUser()]);
  const favs = user ? await getFavoriteIds(user.id) : new Set<string>();
  const mode = favMode(user);

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <p className="eyebrow">FoodMap {city.name === 'بغداد' ? 'Baghdad' : city.name}</p>
          <h1 className="hero-title">دليلك لأطيب لقمة ببغداد</h1>
          <p className="hero-sub">اكتشف أفضل المطاعم والكافيهات حسب موقعك وتقييمات الزوار الحقيقية.</p>
          <form action="/restaurants" method="get" className="search-box" role="search">
            <Icon name="search" />
            <input name="q" type="search" placeholder="ابحث عن مطعم أو نوع أكل أو منطقة…" aria-label="ابحث" />
            <button className="btn btn-orange" type="submit">ابحث</button>
          </form>
          <div className="chips" aria-label="مناطق شائعة">
            {areas.slice(0, 6).map((a) => (
              <Link key={a.slug} className="chip" href={`/restaurants?area=${a.slug}`}>{a.name}</Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="section-head"><h2>ماذا تشتهي اليوم؟</h2></div>
        <div className="cuisine-scroll">
          {cuisines.map((c) => (
            <Link key={c.slug} href={`/restaurants?cuisine=${c.slug}`} className="cuisine-item">
              <span className="cuisine-icon" aria-hidden="true">{c.icon}</span>
              <span>{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>الأعلى تقييماً</h2>
          <Link href="/restaurants" className="link-more">عرض الكل ←</Link>
        </div>
        {top.length ? (
          <div className="grid">
            {top.map((r) => <RestaurantCard key={r.id} r={r} favMode={mode} favorite={favs.has(r.id)} />)}
          </div>
        ) : (
          <div className="empty">
            <p>لا توجد مطاعم معتمدة بعد. كن أول من يضيف مطعماً!</p>
            <Link className="btn btn-primary" href="/add">أضف مطعماً</Link>
          </div>
        )}
      </section>

      <section className="container section">
        <div className="section-head"><h2>تصفح حسب المنطقة</h2></div>
        <div className="area-grid">
          {areas.map((a) => (
            <Link key={a.slug} href={`/restaurants?area=${a.slug}`} className="area-tile">
              <Icon name="pin" size={18} /> {a.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="cta-band">
          <div>
            <h2>عندك مطعم أو كافيه؟</h2>
            <p>أضفه إلى الدليل مجاناً ليصل إلى آلاف الباحثين عن أطيب لقمة في بغداد.</p>
          </div>
          <Link href="/add" className="btn btn-orange">أضف مطعمك مجاناً</Link>
        </div>
      </section>
    </>
  );
}
