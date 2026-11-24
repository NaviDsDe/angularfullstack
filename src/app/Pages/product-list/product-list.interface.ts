export interface Category {
  id: number;
  name: string;
  image: string;
}

export interface Product {
  id: number;
  name: string;
  image: string;
  color: string;
  price: number;
  currency: string;
  releaseDate: string;
  categoryId: number;
  rating: number;
}

export interface ProductData {
  categories: Category[];
  products: Product[];
}

export interface SiteInfo {
  title: string;
  tagline: string;
  announcement: string;
  supportEmail: string;
  year: number;
}

export interface HomeFeature {
  id: number;
  icon: string;
  title: string;
  description: string;
}

export interface HomeData {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
  };
  features: HomeFeature[];
  stats: { label: string; value: string }[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  message: string;
}
