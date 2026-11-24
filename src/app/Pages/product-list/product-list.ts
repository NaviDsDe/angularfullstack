import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../Services/products-services';
import { Category, Product } from './product-list.interface';
import { ProductCardComponent } from '../../components/product-card/product-card';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, FormsModule, ProductCardComponent],
  templateUrl: './product-list.html',
})
export class ProductList implements OnInit {
  private productService = inject(ProductService);

  categories = signal<Category[]>([]);
  products = signal<Product[]>([]);
  selectedCategoryId = signal<number | null>(null);
  searchQuery = signal<string>('');
  sortBy = signal<string>('featured');
  currentPage = signal<number>(1);
  pageSize = signal<number>(20);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  cartMessage = signal<string | null>(null);

  // Precomputed category product counts
  categoryCounts = computed(() => {
    const counts = new Map<number, number>();
    for (const p of this.products()) {
      counts.set(p.categoryId, (counts.get(p.categoryId) || 0) + 1);
    }
    return counts;
  });

  filteredProducts = computed(() => {
    const categoryId = this.selectedCategoryId();
    const query = this.searchQuery().toLowerCase().trim();
    const sort = this.sortBy();

    let list = this.products().filter((product) => {
      const matchesCategory = categoryId === null || product.categoryId === categoryId;
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.color.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });

    // Sorting
    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating-desc':
          return b.rating - a.rating;
        case 'date-desc':
          return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
        default:
          return a.id - b.id;
      }
    });

    return list;
  });

  totalPages = computed(() => {
    const total = this.filteredProducts().length;
    return Math.ceil(total / this.pageSize()) || 1;
  });

  paginatedProducts = computed(() => {
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return this.filteredProducts().slice(start, start + size);
  });

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    // Window around current page
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  });

  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.categories.set(data.categories || []);
        this.products.set(data.products || []);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        console.error('Unable to load products', err);
        this.error.set('Unable to load products data. Please check public/assets/products.json.');
        this.loading.set(false);
      },
    });
  }

  selectCategory(categoryId: number | null): void {
    this.selectedCategoryId.set(categoryId);
    this.currentPage.set(1);
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.currentPage.set(1);
  }

  onSortChange(value: string): void {
    this.sortBy.set(value);
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  addToCart(product: Product): void {
    this.cartMessage.set(`"${product.name}" added to cart!`);
    setTimeout(() => {
      this.cartMessage.set(null);
    }, 3000);
  }
}
