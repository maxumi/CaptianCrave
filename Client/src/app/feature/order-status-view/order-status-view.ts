import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { DeliveryType, OrderApiService, OrderDto } from '../../shared/order-api.service';
import { MatIconModule } from '@angular/material/icon';
import { OrderStatus } from '../../shared/models/status';

interface OrderDetails extends OrderDto {}

interface OrderStep {
  label: string;
  status: OrderStatus;
  icon: string;
}

@Component({
  selector: 'app-order-status-view',
  imports: [DatePipe, DecimalPipe, MatIconModule],
  templateUrl: './order-status-view.html',
  styleUrl: './order-status-view.css',
})
export class OrderStatusView implements OnInit {
  private readonly orderApiService = inject(OrderApiService);
  readonly OrderStatus = OrderStatus;
  readonly DeliveryType = DeliveryType;


  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly order = signal<OrderDetails | null>(null);
  readonly noActiveOrder = signal(false);

  ngOnInit(): void {
    this.orderApiService.getCustomerActiveOrder().subscribe({
      next: (activeOrder) => {
        this.order.set(activeOrder);
        this.noActiveOrder.set(activeOrder === null);
        this.isLoading.set(false);
      },
      error: () => {
        this.loadError.set('Failed to load order details.');
        this.isLoading.set(false);
      }
    });
  }

  get steps(): OrderStep[] {
    const isPickup = this.order()?.deliveryType === DeliveryType.Pickup;

    if (isPickup) {
      return [
        { label: 'Placed', status: OrderStatus.Pending, icon: 'check' },
        { label: 'Preparing', status: OrderStatus.Preparing, icon: 'restaurant' },
        { label: 'Ready for pickup', status: OrderStatus.ReadyForPickup, icon: 'store' },
        { label: 'Completed', status: OrderStatus.Delivered, icon: 'task_alt' },
      ];
    }

    return [
      { label: 'Placed', status: OrderStatus.Pending, icon: 'check' },
      { label: 'Preparing', status: OrderStatus.Preparing, icon: 'restaurant' },
      { label: 'On the way', status: OrderStatus.OnTheWay, icon: 'two_wheeler' },
      { label: 'Delivered', status: OrderStatus.Delivered, icon: 'home' },
    ];
  }

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
    switch (this.order()?.status) {
      case OrderStatus.Pending:
        return 'Pending';
      case OrderStatus.Preparing:
        return 'Preparing';
      case OrderStatus.OnTheWay:
        return 'On the way';
      case OrderStatus.ReadyForPickup:
        return 'Ready for pickup';
      case OrderStatus.Delivered:
        return 'Delivered';
      case OrderStatus.Cancelled:
        return 'Cancelled';
      default:
        return 'Pending';
    }
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
      case OrderStatus.ReadyForPickup:
        return 'Your order is ready for pickup at the restaurant.';
      case OrderStatus.Delivered:
        return 'Your order has been delivered.';
      case OrderStatus.Cancelled:
        return 'Your order was cancelled.';
      default:
        return 'Waiting for order status.';
    }
  }
}