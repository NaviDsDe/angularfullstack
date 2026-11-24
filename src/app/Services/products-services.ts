import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, catchError, tap } from 'rxjs';
import {
  Category,
  Product,
  ProductData,
  SiteInfo,
  HomeData,
  User,
  LoginResponse,
} from '../Pages/product-list/product-list.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000';

  // Global authentication state
  currentUser = signal<User | null>(null);

  /**
   * 1. App Root: Fetch site metadata (announcement, title, tagline)
   */
  getSiteInfo(): Observable<SiteInfo> {
    return this.http.get<SiteInfo>(`${this.apiUrl}/siteInfo`).pipe(
      catchError(() =>
        of({
          title: 'E-Shop',
          tagline: 'Modern E-Commerce Store',
          announcement: 'Special Offer: Free express delivery on all orders over $50!',
          supportEmail: 'support@eshop.com',
          year: 2026,
        })
      )
    );
  }

  /**
   * 2. Home Component: Fetch hero banner, stats, and feature cards
   */
  getHomeData(): Observable<HomeData> {
    return this.http.get<HomeData>(`${this.apiUrl}/homeData`).pipe(
      catchError(() =>
        of({
          hero: {
            badge: 'New Season Arrivals',
            title: 'Smart Shopping, Delivered Fast',
            subtitle:
              'Explore our curated marketplace featuring over 250 quality products across Books, Home, Kids, Health, and Fashion with verified customer reviews.',
            ctaText: 'Explore All 250 Products',
            ctaLink: '/products',
          },
          features: [
            {
              id: 1,
              icon: 'fa-solid fa-bolt',
              title: 'Fast Delivery',
              description: 'Free express shipping on all orders over $50 with real-time tracking.',
            },
            {
              id: 2,
              icon: 'fa-solid fa-shield-halved',
              title: 'Quality Guaranteed',
              description: '100% genuine products with manufacturer warranty and hassle-free returns.',
            },
            {
              id: 3,
              icon: 'fa-solid fa-credit-card',
              title: 'Secure Checkout',
              description: 'Encrypted payment gateway supporting major credit cards and digital wallets.',
            },
          ],
          stats: [
            { label: 'Active Products', value: '250+' },
            { label: 'Departments', value: '5' },
            { label: 'Customer Rating', value: '4.8 / 5' },
          ],
        })
      )
    );
  }

  /**
   * 3. ProductList Component: Fetch categories and products from server
   */
  getProducts(): Observable<ProductData> {
    return forkJoin({
      categories: this.http.get<Category[]>(`${this.apiUrl}/categories`),
      products: this.http.get<Product[]>(`${this.apiUrl}/products`),
    }).pipe(
      catchError((err) => {
        console.warn('Backend server unavailable, using fallback assets/products.json', err);
        return this.http.get<ProductData>('assets/products.json');
      })
    );
  }

  /**
   * 4. Fetch featured products (used by Home component)
   */
  getFeaturedProducts(limit = 4): Observable<Product[]> {
    return this.http
      .get<Product[]>(`${this.apiUrl}/products?_limit=${limit}`)
      .pipe(catchError(() => of([])));
  }

  /**
   * 5. Login Component: Live server authentication call
   */
  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((res) => {
          this.currentUser.set(res.user);
        })
      );
  }

  logout(): void {
    this.currentUser.set(null);
  }
}
