import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface RestaurantDto {
  id: number;
  userId: number;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
}

export interface MenuItemDto {
  id: number;
  restaurantId: number;
  categoryId: number | null;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
}

export interface UpdateMenuItemRequest {
  restaurantId: number;
  categoryId: number | null;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
}

@Injectable({ providedIn: 'root' })
export class MenuApiService {
  private readonly http = inject(HttpClient);
  private readonly restaurantsUrl = `${environment.apiUrl}/Restaurants`;
  private readonly menuItemsUrl = `${environment.apiUrl}/MenuItems`;

  getMyRestaurant(): Observable<RestaurantDto> {
    return this.http.get<RestaurantDto>(`${this.restaurantsUrl}/me`);
  }

  getByRestaurant(restaurantId: number): Observable<MenuItemDto[]> {
    return this.http.get<MenuItemDto[]>(`${this.menuItemsUrl}/restaurant/${restaurantId}`);
  }

  create(payload: UpdateMenuItemRequest): Observable<MenuItemDto> {
    return this.http.post<MenuItemDto>(this.menuItemsUrl, payload);
  }

  update(itemId: number, payload: UpdateMenuItemRequest): Observable<MenuItemDto> {
    return this.http.put<MenuItemDto>(`${this.menuItemsUrl}/${itemId}`, payload);
  }

  delete(itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.menuItemsUrl}/${itemId}`);
  }
}