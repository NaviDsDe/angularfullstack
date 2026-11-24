import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../Services/products-services';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  protected productService = inject(ProductService);
  private router = inject(Router);

  email = signal<string>('user@example.com');
  password = signal<string>('password123');
  loading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  onSubmit(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.loading.set(true);

    this.productService
      .login({ email: this.email(), password: this.password() })
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          this.successMessage.set(`Welcome back, ${res.user.name}!`);
          setTimeout(() => {
            this.router.navigate(['/products']);
          }, 1500);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(
            err.error?.error || 'Invalid credentials or server not reachable.'
          );
        },
      });
  }

  fillDemo(type: 'user' | 'admin'): void {
    if (type === 'user') {
      this.email.set('user@example.com');
      this.password.set('password123');
    } else {
      this.email.set('admin@eshop.com');
      this.password.set('admin123');
    }
  }

  logout(): void {
    this.productService.logout();
  }
}
