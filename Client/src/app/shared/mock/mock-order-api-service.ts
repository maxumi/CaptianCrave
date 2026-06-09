import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export enum OrderStatus {
  Pending = 'Pending',
  Preparing = 'Preparing',
  OnTheWay = 'On the way',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled',
}

export enum DeliveryType {
  Delivery = 0,
  Pickup = 1,
}

export interface CreateOrderItemRequest {
  menuItemId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  userId: number;
  restaurantId: number;
  deliveryType: DeliveryType;
  deliveryAddress?: string;
  items: CreateOrderItemRequest[];
}

export interface OrderResponse {
  id: number;
  userId: number;
  restaurantId: number;
  totalPrice: number;
}

export interface OrderItemDto {
  id: number;
  menuItemId: number;
  menuItemName: string;
  quantity: number;
  price: number;
}

export interface OrderDto {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  restaurantId: number;
  restaurantName: string;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItemDto[];
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

@Injectable({
  providedIn: 'root',
})
export class MockOrderApiService {
  private readonly mockOrders: OrderDto[] = [
    {
      id: 1,
      userId: 2,
      userName: 'John Doe',
      userEmail: 'john@example.com',
      restaurantId: 1,
      restaurantName: 'Captain Crave',
      totalPrice: 159.5,
      status: OrderStatus.Pending,
      createdAt: new Date().toISOString(),
      items: [
        {
          id: 1,
          menuItemId: 10,
          menuItemName: 'Burger',
          quantity: 2,
          price: 59.75,
        },
        {
          id: 2,
          menuItemId: 11,
          menuItemName: 'Fries',
          quantity: 1,
          price: 40,
        },
      ],
    },
    {
      id: 2,
      userId: 3,
      userName: 'Jane Smith',
      userEmail: 'jane@example.com',
      restaurantId: 1,
      restaurantName: 'Captain Crave',
      totalPrice: 89,
      status: OrderStatus.Preparing,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      items: [
        {
          id: 3,
          menuItemId: 12,
          menuItemName: 'Pizza',
          quantity: 1,
          price: 89,
        },
      ],
    },
    {
      id: 3,
      userId: 4,
      userName: 'Alex Jensen',
      userEmail: 'alex@example.com',
      restaurantId: 1,
      restaurantName: 'Captain Crave',
      totalPrice: 120,
      status: OrderStatus.OnTheWay,
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      items: [
        {
          id: 4,
          menuItemId: 13,
          menuItemName: 'Chicken Wrap',
          quantity: 2,
          price: 60,
        },
      ],
    },
  ];

  createOrder(payload: CreateOrderRequest): Observable<OrderResponse> {
    const totalPrice = payload.items.reduce(
      (sum, item) => sum + item.quantity * 50,
      0
    );

    return of({
      id: this.mockOrders.length + 1,
      userId: payload.userId,
      restaurantId: payload.restaurantId,
      totalPrice,
    });
  }

  getOrdersByRestaurant(restaurantId: number): Observable<OrderDto[]> {
    return of(
      this.mockOrders.filter(order => order.restaurantId === restaurantId)
    );
  }

  updateOrderStatus(
    orderId: number,
    payload: UpdateOrderStatusRequest
  ): Observable<OrderDto> {
    const order = this.mockOrders.find(order => order.id === orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    order.status = payload.status;

    return of(order);
  }
}