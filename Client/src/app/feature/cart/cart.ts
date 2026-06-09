import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../shared/cart.service';
import { AuthService } from '../../core/auth/auth.service';
import { DeliveryType, OrderApiService } from '../../shared/order-api.service';
import { RestaurantApiService } from '../../shared/restaurant-api.service';
import { firstValueFrom } from 'rxjs';
import { Role } from '../../shared/models/user';

@Component({
  selector: 'app-cart',
  imports: [],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly orderApiService = inject(OrderApiService);
  private readonly restaurantApiService = inject(RestaurantApiService);
  private readonly router = inject(Router);

  readonly cartItems = this.cartService.items;
  readonly total = this.cartService.total;
  readonly isSubmittingOrder = signal(false);
  readonly checkoutError = signal<string | null>(null);
  readonly checkoutSuccess = signal<string | null>(null);
  readonly canCheckout = computed(() => this.authService.user()?.role === Role.Customer);

  ngOnInit(): void {
    this.orderApiService.getActiveOrder().subscribe(order => {
      if (order) {
        this.router.navigate(['/order-status', order.id]);
      }
    });
  }

  onQuantityInput(item: CartItem, event: Event): void {
    const input = event.target as HTMLInputElement;
    const quantity = Number(input.value);

    if (!Number.isFinite(quantity)) {
      return;
    }

    this.cartService.updateQuantity(item.menuItemId, Math.floor(quantity));
  }

  removeItem(item: CartItem): void {
    this.cartService.removeItem(item.menuItemId);
  }

  clearCart(): void {
    this.cartService.clear();
  }

  async checkout(): Promise<void> {
    const user = this.authService.user();
    const items = this.cartItems();

    this.checkoutError.set(null);
    this.checkoutSuccess.set(null);

    if (!user) {
      this.checkoutError.set('You must be logged in to place an order.');
      return;
    }

    if (user.role !== Role.Customer) {
      this.checkoutError.set('Only customer accounts can place orders.');
      return;
    }

    if (!items.length) {
      this.checkoutError.set('Your cart is empty.');
      return;
    }

    if (!user.address || user.latitude == null || user.longitude == null) {
      this.checkoutError.set('Please update your profile address before checkout.');
      return;
    }

    const restaurantId = items[0].restaurantId;

    this.isSubmittingOrder.set(true);

    try {
      const order = await firstValueFrom(
        this.orderApiService.createOrder({
          userId: user.userId,
          restaurantId,
          deliveryType: DeliveryType.Delivery,
          deliveryAddress: user.address,
          items: items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
          })),
        })
      );

      this.cartService.clear();
      this.router.navigate(['/order-status', order.id]);
    } catch (error) {
      const httpError = error as HttpErrorResponse;
      const backendMessage =
        typeof httpError.error?.message === 'string' ? httpError.error.message : null;

      this.checkoutError.set(backendMessage ?? 'Unable to place order right now.');
    } finally {
      this.isSubmittingOrder.set(false);
    }
  }

}
