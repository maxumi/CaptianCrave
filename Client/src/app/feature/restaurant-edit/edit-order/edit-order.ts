import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { catchError, EMPTY, finalize, firstValueFrom, map, of, switchMap, tap } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { RestaurantApiService } from '../../../shared/restaurant-api.service';
import {
  OrderApiService,
  OrderDto,
  OrderStatus,
  UpdateOrderStatusRequest,
} from '../../../shared/order-api.service';
import { MockOrderApiService } from '../../../shared/mock/mock-order-api-service';

interface OrderDraft {
  status: OrderStatus;
}
/**
 * CURRENTLY USES MOCK SERVICE. REPLACE WITH REAL SERVICE WHEN BACKEND IS READY.
 */
@Component({
  selector: 'app-edit-order',
  imports: [DatePipe, FormField, FormRoot],
  templateUrl: './edit-order.html',
  styleUrl: './edit-order.css',
})
export class EditOrder implements OnInit {
  private readonly restaurantApiService = inject(RestaurantApiService);
  private readonly orderApiService = inject(MockOrderApiService);

  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly saveError = signal<string | null>(null);
  readonly saveSuccess = signal<string | null>(null);
  readonly orders = signal<OrderDto[]>([]);
  readonly selectedOrder = signal<OrderDto | null>(null);

  readonly orderModel = signal<OrderDraft>({
    status: OrderStatus.Pending,
  });

  readonly orderForm = form(this.orderModel, {
    submission: {
      action: () => this.saveOrder(),
    },
  });

  ngOnInit() {
    this.loadOrders();
  }

  private loadOrders(): void {
    this.isLoading.set(true);
    this.loadError.set(null);
    this.saveError.set(null);
    this.saveSuccess.set(null);

    this.restaurantApiService.getMyRestaurant().pipe(
      switchMap(restaurant =>
        this.orderApiService.getOrdersByRestaurant(restaurant.id)
      ),

      catchError((error: { status?: number }) => {
        if (error.status === 401 || error.status === 403) {
          this.loadError.set('You are not allowed to manage orders.');
        } else if (error.status === 404) {
          this.loadError.set('No restaurant or orders were found for this account.');
        } else {
          this.loadError.set('Unable to load orders right now.');
        }

        this.orders.set([]);
        this.selectedOrder.set(null);

        return EMPTY;
      }),

      finalize(() => {
        this.isLoading.set(false);
      }),
    ).subscribe(orders => {
      this.orders.set(orders);

      if (orders.length > 0) {
        this.selectOrder(orders[0]);
      } else {
        this.selectedOrder.set(null);
        this.orderModel.set({
          status: OrderStatus.Pending,
        });
      }
    });
  }

saveOrder(): Promise<null | { kind: 'serverError'; message: string }> {
  const selectedOrder = this.selectedOrder();

  if (!selectedOrder) {
    return Promise.resolve(null);
  }

  this.saveError.set(null);
  this.saveSuccess.set(null);

  return firstValueFrom(
    this.orderApiService.updateOrderStatus(selectedOrder.id, {
      status: this.orderModel().status,
    } satisfies UpdateOrderStatusRequest).pipe(
      tap(updated => {
        this.selectedOrder.set(updated);
        this.orders.set(
          this.orders().map(order => (order.id === updated.id ? updated : order))
        );
        this.saveSuccess.set('Order updated successfully.');
      }),

      map(() => null),

      catchError(() => {
        const message = 'Unable to update the order right now.';
        this.saveError.set(message);

        return of({
          kind: 'serverError' as const,
          message,
        });
      }),
    ),
  );
}

selectOrder(order: OrderDto): void {
  const currentOrder = this.selectedOrder();

  if (currentOrder?.id === order.id) {
    this.selectedOrder.set(null);
    this.orderModel.set({
      status: OrderStatus.Pending,
    });
  } else {
    this.selectedOrder.set(order);
    this.orderModel.set({
      status: order.status as OrderStatus,
    });
  }

  this.saveError.set(null);
  this.saveSuccess.set(null);
}

}