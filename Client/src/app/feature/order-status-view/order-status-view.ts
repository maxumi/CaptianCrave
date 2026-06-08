import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { OrderApiService, OrderStatus } from '../../shared/order-api.service';
import { MockOrderApiService } from '../../shared/mock/mock-order-api-service';
import { MatIconModule } from '@angular/material/icon';

interface OrderDetails {
  id: number;
  restaurantName: string;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  estimatedDelivery: string;
  items: {
    menuItemName: string;
    quantity: number;
    price: number;
  }[];
}

interface OrderStep {
  label: string;
  status: OrderStatus;
  time: string | null;
  icon: string;
}

@Component({
  selector: 'app-order-status-view',
  imports: [DatePipe, DecimalPipe, MatIconModule],
  templateUrl: './order-status-view.html',
  styleUrl: './order-status-view.css',
})
export class OrderStatusView {
  orderApiService = inject(OrderApiService);

  // add when real API is ready
  readonly isLoading = signal(false);
  readonly loadError = signal<string | null>(null);

  readonly order = signal<OrderDetails | null>({
    id: 524,
    restaurantName: 'Captain Crave',
    totalPrice: 159.5,
    status: OrderStatus.OnTheWay,
    createdAt: new Date(2026, 4, 21, 12, 30).toISOString(),
    estimatedDelivery: new Date(2026, 4, 21, 12, 55).toISOString(),
    items: [
      {
        menuItemName: 'Burger',
        quantity: 2,
        price: 59.75,
      },
      {
        menuItemName: 'Fries',
        quantity: 1,
        price: 40,
      },
    ],
  });

readonly steps: OrderStep[] = [
  { label: 'Placed', status: OrderStatus.Pending, time: '12:30 PM', icon: 'check' },
  { label: 'Preparing', status: OrderStatus.Preparing, time: '12:35 PM', icon: 'restaurant' },
  { label: 'On the way', status: OrderStatus.OnTheWay, time: '12:45 PM', icon: 'two_wheeler' },
  { label: 'Delivered', status: OrderStatus.Delivered, time: null, icon: 'home' },
];

  get currentStepIndex(): number {
    const currentOrder = this.order();

    if (!currentOrder) {
      return -1;
    }

    return this.steps.findIndex(step => step.status === currentOrder.status);
  }

  isCompleted(index: number): boolean {
    return index < this.currentStepIndex;
  }

  isActive(index: number): boolean {
    return index === this.currentStepIndex;
  }
  
  isPending(index: number): boolean {
    return index > this.currentStepIndex;
  }

  get statusTitle(): string {
    return this.order()?.status ?? OrderStatus.Pending;
  }

  get statusMessage(): string {
    const status = this.order()?.status;

    switch (status) {
      case OrderStatus.Pending:
        return 'Your order has been placed and is waiting for the restaurant.';
      case OrderStatus.Preparing:
        return 'Your food is being prepared.';
      case OrderStatus.OnTheWay:
        return 'Your order is on the way. Almost there!';
      case OrderStatus.Delivered:
        return 'Your order has been delivered.';
      case OrderStatus.Cancelled:
        return 'Your order was cancelled.';
      default:
        return 'Waiting for order status.';
    }
  }
}