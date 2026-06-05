import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { MenuItemApiService, MenuItemDto } from '../../shared/menu-item-api.service';
import { CartService } from '../../shared/cart.service';
import { AuthService } from '../../core/auth/auth.service';
import { Role } from '../../shared/models/user';

@Component({
  selector: 'app-restaurant-info',
  imports: [TranslocoModule],
  templateUrl: './restaurant-info.html',
  styleUrl: './restaurant-info.css',
})
export class RestaurantInfo implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly menuItemApiService = inject(MenuItemApiService);
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);

  readonly menuItems = signal<MenuItemDto[]>([]);
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly addMessage = signal<string | null>(null);
  readonly canAddToCart = computed(() => this.authService.user()?.role === Role.Customer);

  private restaurantId = 0;

  ngOnInit(): void {
    const restaurantId = Number(this.route.snapshot.queryParamMap.get('restaurantId'));

    if (!Number.isFinite(restaurantId) || restaurantId <= 0) {
      this.loadError.set('Missing restaurant id.');
      this.isLoading.set(false);
      return;
    }

    this.restaurantId = restaurantId;

    this.menuItemApiService.getByRestaurantId(restaurantId).subscribe({
      next: (items) => {
        this.menuItems.set(items);
        this.isLoading.set(false);
      },
      error: () => {
        this.loadError.set('Unable to load menu right now.');
        this.isLoading.set(false);
      },
    });
  }

  addToCart(item: MenuItemDto): void {
    if (!this.canAddToCart()) {
      this.addMessage.set('Only customer accounts can add items to cart.');
      return;
    }

    const wasAdded = this.cartService.addItem(item, this.restaurantId);

    if (!wasAdded) {
      this.addMessage.set('You can only add items from one restaurant. Clear your cart first.');
      return;
    }

    this.addMessage.set(`${item.name} added to cart.`);
  }

}
