import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from './Services/products-services';
import { SiteInfo } from './Pages/product-list/product-list.interface';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
})
export class App implements OnInit {
  protected productService = inject(ProductService);

  siteInfo = signal<SiteInfo>({
    title: 'E-Shop',
    tagline: 'Modern E-Commerce Store',
    announcement: 'Special Offer: Free express delivery on all orders over $50!',
    supportEmail: 'support@eshop.com',
    year: 2026,
  });

  ngOnInit(): void {
    this.productService.getSiteInfo().subscribe({
      next: (info) => {
        if (info && info.title) {
          this.siteInfo.set(info);
        }
      },
    });
  }

  logout(): void {
    this.productService.logout();
  }
}
