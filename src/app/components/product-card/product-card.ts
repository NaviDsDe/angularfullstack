import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../Pages/product-list/product-list.interface';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    // Fallback if the image URL from the JSON fails to load
    target.src =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="%23f0f2f5" width="400" height="300"/><path fill="%238c98a4" d="M160 110a20 20 0 1 0 0-40 20 20 0 0 0 0 40zm80 20l-45 60-35-45-50 65h180l-50-80z"/><text fill="%238c98a4" font-family="sans-serif" font-size="16" font-weight="600" x="50%" y="75%" text-anchor="middle">Image Not Available</text></svg>';
  }
}
