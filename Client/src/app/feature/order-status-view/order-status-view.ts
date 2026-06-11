import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderApiService, OrderDto } from '../../shared/order-api.service';
import { MatIconModule } from '@angular/material/icon';
import { switchMap } from 'rxjs/operators';
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
  private readonly route = inject(ActivatedRoute);
  readonly OrderStatus = OrderStatus;


  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly order = signal<OrderDetails | null>(null);

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (!id) {
          this.loadError.set('Order ID not found.');
          this.isLoading.set(false);
          throw new Error('Order ID not found');
        }
        return this.orderApiService.getOrderById(Number(id));
      })
    ).subscribe({
      next: (order) => {
        this.order.set(order);
        this.isLoading.set(false);
      },
      error: () => {
        this.loadError.set('Failed to load order details.');
        this.isLoading.set(false);
      }
    });
  }

  readonly steps: OrderStep[] = [
    { label: 'Placed', status: OrderStatus.Pending, icon: 'check' },
    { label: 'Preparing', status: OrderStatus.Preparing, icon: 'restaurant' },
    { label: 'On the way', status: OrderStatus.OnTheWay, icon: 'two_wheeler' },
    { label: 'Delivered', status: OrderStatus.Delivered, icon: 'home' },
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
    switch (this.order()?.status) {
      case OrderStatus.Pending:
        return 'Pending';
      case OrderStatus.Preparing:
        return 'Preparing';
      case OrderStatus.OnTheWay:
        return 'On the way';
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
      case OrderStatus.Delivered:
        return 'Your order has been delivered.';
      case OrderStatus.Cancelled:
        return 'Your order was cancelled.';
      default:
        return 'Waiting for order status.';
    }
  }
}