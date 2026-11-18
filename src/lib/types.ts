export type Img = {
  id: string;
  url: string;
  alt: string;
  /** true = صورة تجريبية وليست صورة موثقة للمطعم */
  isPlaceholder: boolean;
  isCover: boolean;
};

export type Cuisine = { id?: string; slug: string; name: string; icon: string };
export type Area = { id: string; slug: string; name: string; lat: number; lng: number };
export type City = { id: string; slug: string; name: string; lat: number; lng: number; zoom: number };

export type RestaurantStatus = 'pending' | 'approved' | 'rejected';

export type Restaurant = {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string | null;
  description: string;
  kind: 'restaurant' | 'cafe';
  areaSlug: string;
  areaName: string;
  address: string;
  lat: number;
  lng: number;
  phone: string | null;
  instagram: string | null;
  priceLevel: number;
  openingHours: string | null;
  status: RestaurantStatus;
  isDemo: boolean;
  avgRating: number;
  reviewsCount: number;
  createdAt: string;
  cuisines: Cuisine[];
  images: Img[];
};

export type Review = {
  id: string;
  rating: number;
  comment: string | null;
  author: string;
  createdAt: string;
  isDemo: boolean;
  userId: string | null;
};

export type SearchParams = {
  q?: string;
  area?: string;
  cuisine?: string;
  price?: string;
  rating?: string;
  kind?: string;
  sort?: string;
  page?: string;
};

export type SessionUser = {
  id: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
};

export type ActionState = { ok?: boolean; error?: string; message?: string };
