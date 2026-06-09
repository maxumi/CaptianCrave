import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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
export class OrderApiService {
  private readonly http = inject(HttpClient);
  private readonly ordersUrl = `${environment.apiUrl}/Orders`;

  createOrder(payload: CreateOrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(this.ordersUrl, payload);
  }

  // WIP
  getOrdersByRestaurant(restaurantId: number): Observable<OrderDto[]> {
    return this.http.get<OrderDto[]>(`${this.ordersUrl}/restaurant/${restaurantId}`);
  }

  updateOrderStatus(orderId: number, payload: UpdateOrderStatusRequest): Observable<OrderDto> {
    return this.http.put<OrderDto>(`${this.ordersUrl}/${orderId}`, payload);
  }

  getOrderById(orderId: number): Observable<OrderDto> {
    return this.http.get<OrderDto>(`${this.ordersUrl}/${orderId}`);
  }

  getActiveOrder(): Observable<OrderDto | null> {
    return this.http.get<OrderDto>(`${this.ordersUrl}/active`).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          return of(null);
        }
        return throwError(() => error);
      })
    );
  }
}
