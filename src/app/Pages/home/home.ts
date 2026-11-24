import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../Services/products-services';
import { HomeData, Product } from '../product-list/product-list.interface';
import { ProductCardComponent } from '../../components/product-card/product-card';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, ProductCardComponent],
  templateUrl: './home.html',
})
export class Home implements OnInit {
  private productService = inject(ProductService);

  homeData = signal<HomeData | null>(null);
  featuredProducts = signal<Product[]>([]);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    this.productService.getHomeData().subscribe({
      next: (data) => {
        this.homeData.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.productService.getFeaturedProducts(4).subscribe({
      next: (products) => {
        this.featuredProducts.set(products);
      },
    });
  }
}
