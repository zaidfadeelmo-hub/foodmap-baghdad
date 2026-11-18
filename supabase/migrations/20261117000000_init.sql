-- ============================================================
-- FoodMap Baghdad — المخطط الأساسي (Schema + RLS + Storage)
-- شغّل هذا الملف أولاً في Supabase → SQL Editor
-- ============================================================

create extension if not exists pgcrypto;
create extension if not exists pg_trgm with schema extensions;

-- ---------- جداول مرجعية (قابلة للتوسع لمحافظات أخرى) ----------
create table public.cities (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name_ar     text not null,
  name_en     text,
  lat         double precision not null,
  lng         double precision not null,
  zoom        smallint not null default 12,
  is_active   boolean not null default false,   -- فعّل المدينة عند الجاهزية للإطلاق
  created_at  timestamptz not null default now()
);

create table public.areas (
  id        uuid primary key default gen_random_uuid(),
  city_id   uuid not null references public.cities(id) on delete cascade,
  slug      text not null,
  name_ar   text not null,
  lat       double precision,
  lng       double precision,
  unique (city_id, slug)
);

create table public.cuisines (
  id       uuid primary key default gen_random_uuid(),
  slug     text not null unique,
  name_ar  text not null,
  icon     text not null default '🍽️'
);

-- ---------- المستخدمون ----------
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text not null default 'مستخدم',
  role          text not null default 'user' check (role in ('user','admin')),
  created_at    timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), split_part(new.email, '@', 1), 'مستخدم'), 60)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- المطاعم ----------
create table public.restaurants (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  name_ar        text not null check (char_length(name_ar) between 2 and 120),
  name_en        text,
  description    text,
  kind           text not null default 'restaurant' check (kind in ('restaurant','cafe')),
  city_id        uuid not null references public.cities(id),
  area_id        uuid references public.areas(id),
  address        text,
  lat            double precision not null,
  lng            double precision not null,
  phone          text,
  instagram      text,
  price_level    smallint check (price_level between 1 and 4),
  opening_hours  text,
  status         text not null default 'pending' check (status in ('pending','approved','rejected')),
  is_demo        boolean not null default false,   -- بيانات تجريبية: تُحذف قبل الإطلاق
  avg_rating     numeric(3,2) not null default 0,
  reviews_count  integer not null default 0,
  created_by     uuid references public.profiles(id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index restaurants_city_status_idx on public.restaurants (city_id, status);
create index restaurants_area_idx        on public.restaurants (area_id);
create index restaurants_rating_idx      on public.restaurants (avg_rating desc, reviews_count desc);
create index restaurants_demo_idx        on public.restaurants (is_demo) where is_demo;
create index restaurants_name_trgm_idx   on public.restaurants using gin (name_ar extensions.gin_trgm_ops);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger restaurants_set_updated_at
  before update on public.restaurants
  for each row execute function public.set_updated_at();

create table public.restaurant_cuisines (
  restaurant_id  uuid not null references public.restaurants(id) on delete cascade,
  cuisine_id     uuid not null references public.cuisines(id) on delete cascade,
  primary key (restaurant_id, cuisine_id)
);
create index restaurant_cuisines_cuisine_idx on public.restaurant_cuisines (cuisine_id);

create table public.restaurant_images (
  id             uuid primary key default gen_random_uuid(),
  restaurant_id  uuid not null references public.restaurants(id) on delete cascade,
  storage_path   text,           -- مسار الصورة داخل bucket (صور حقيقية مرفوعة من الإدارة)
  url            text,           -- رابط مباشر (للصور التجريبية فقط)
  alt            text,
  is_cover       boolean not null default false,
  is_placeholder boolean not null default false,  -- true = صورة تجريبية وليست صورة موثقة للمطعم
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now(),
  check (storage_path is not null or url is not null)
);
create index restaurant_images_restaurant_idx on public.restaurant_images (restaurant_id);

-- ---------- التقييمات ----------
create table public.reviews (
  id             uuid primary key default gen_random_uuid(),
  restaurant_id  uuid not null references public.restaurants(id) on delete cascade,
  user_id        uuid references public.profiles(id) on delete cascade,
  author_name    text,                       -- للمراجعات التجريبية فقط
  is_demo        boolean not null default false,
  rating         smallint not null check (rating between 1 and 5),
  comment        text check (comment is null or char_length(comment) <= 1000),
  created_at     timestamptz not null default now(),
  unique (restaurant_id, user_id),
  check (user_id is not null or is_demo)
);
create index reviews_restaurant_idx on public.reviews (restaurant_id, created_at desc);

create or replace function public.refresh_restaurant_rating()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare rid uuid;
begin
  rid := case when tg_op = 'DELETE' then old.restaurant_id else new.restaurant_id end;
  update public.restaurants r
     set avg_rating    = coalesce((select round(avg(rating)::numeric, 2) from public.reviews where restaurant_id = rid), 0),
         reviews_count = (select count(*) from public.reviews where restaurant_id = rid)
   where r.id = rid;
  return null;
end;
$$;

create trigger reviews_refresh_rating
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_restaurant_rating();

-- ---------- المفضلة ----------
create table public.favorites (
  user_id        uuid not null references public.profiles(id) on delete cascade,
  restaurant_id  uuid not null references public.restaurants(id) on delete cascade,
  created_at     timestamptz not null default now(),
  primary key (user_id, restaurant_id)
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.cities              enable row level security;
alter table public.areas               enable row level security;
alter table public.cuisines            enable row level security;
alter table public.profiles            enable row level security;
alter table public.restaurants         enable row level security;
alter table public.restaurant_cuisines enable row level security;
alter table public.restaurant_images   enable row level security;
alter table public.reviews             enable row level security;
alter table public.favorites           enable row level security;

-- مرجعيات: قراءة للجميع، كتابة للإدارة
create policy cities_read   on public.cities   for select using (true);
create policy areas_read    on public.areas    for select using (true);
create policy cuisines_read on public.cuisines for select using (true);
create policy cities_admin   on public.cities   for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy areas_admin    on public.areas    for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy cuisines_admin on public.cuisines for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- الملفات الشخصية: الاسم يظهر مع المراجعات، والمستخدم يعدّل اسمه فقط (لا دوره)
create policy profiles_read   on public.profiles for select using (true);
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.profiles from anon, authenticated;
grant  update (display_name) on public.profiles to authenticated;

-- المطاعم
create policy restaurants_read on public.restaurants for select using (
  status = 'approved' or created_by = auth.uid() or public.is_admin()
);
create policy restaurants_suggest on public.restaurants for insert to authenticated with check (
  created_by = auth.uid() and status = 'pending' and is_demo = false
  and avg_rating = 0 and reviews_count = 0
);
create policy restaurants_admin on public.restaurants for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- تصنيفات المطعم
create policy rc_read on public.restaurant_cuisines for select using (true);
create policy rc_owner_insert on public.restaurant_cuisines for insert to authenticated with check (
  exists (select 1 from public.restaurants r
          where r.id = restaurant_id and r.created_by = auth.uid() and r.status = 'pending')
);
create policy rc_admin on public.restaurant_cuisines for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- الصور: قراءة لصور المطاعم المرئية، الكتابة للإدارة فقط
create policy images_read on public.restaurant_images for select using (
  exists (select 1 from public.restaurants r
          where r.id = restaurant_id
            and (r.status = 'approved' or r.created_by = auth.uid() or public.is_admin()))
);
create policy images_admin on public.restaurant_images for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- التقييمات
create policy reviews_read on public.reviews for select using (
  exists (select 1 from public.restaurants r
          where r.id = restaurant_id
            and (r.status = 'approved' or r.created_by = auth.uid() or public.is_admin()))
);
create policy reviews_insert on public.reviews for insert to authenticated with check (
  user_id = auth.uid() and is_demo = false
  and exists (select 1 from public.restaurants r where r.id = restaurant_id and r.status = 'approved')
);
create policy reviews_update_own on public.reviews for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid() and is_demo = false);
create policy reviews_delete on public.reviews for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- المفضلة: خاصة بصاحبها
create policy favorites_own on public.favorites for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- Storage: صور المطاعم (قراءة عامة، رفع/حذف للإدارة فقط)
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('restaurant-images', 'restaurant-images', true, 5242880,
        array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "restaurant images public read" on storage.objects
  for select using (bucket_id = 'restaurant-images');
create policy "restaurant images admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'restaurant-images' and public.is_admin());
create policy "restaurant images admin update" on storage.objects
  for update to authenticated using (bucket_id = 'restaurant-images' and public.is_admin());
create policy "restaurant images admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'restaurant-images' and public.is_admin());
